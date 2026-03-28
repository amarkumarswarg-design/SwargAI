import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Message from "./components/Message";
import ChatInput from "./components/ChatInput";
import { getChats, saveChats, createNewChat, generateTitle } from "./utils/storage";
import { sendMessage } from "./utils/api";
import { Menu, Zap } from "lucide-react";

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a Python script to sort a list",
  "Mujhe ek kahani sunao",
  "What are the best practices in React?",
];

export default function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const saved = getChats();
    setChats(saved);
    if (saved.length > 0) {
      setActiveChatId(saved.sort((a, b) => b.updatedAt - a.updatedAt)[0].id);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, streamingContent]);

  const activeChat = chats.find(c => c.id === activeChatId);

  const updateChats = (updated) => {
    setChats(updated);
    saveChats(updated);
  };

  const handleNewChat = () => {
    const chat = createNewChat();
    const updated = [...chats, chat];
    updateChats(updated);
    setActiveChatId(chat.id);
    setSidebarOpen(false);
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setSidebarOpen(false);
  };

  const handleDeleteChat = (id) => {
    const updated = chats.filter(c => c.id !== id);
    updateChats(updated);
    if (activeChatId === id) {
      setActiveChatId(updated.length > 0 ? updated[updated.length - 1].id : null);
    }
  };

  const handleRenameChat = (id, title) => {
    const updated = chats.map(c => c.id === id ? { ...c, title } : c);
    updateChats(updated);
  };

  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;

    let chatId = activeChatId;
    let currentChats = [...chats];

    if (!chatId) {
      const newChat = createNewChat(generateTitle(text));
      currentChats = [...currentChats, newChat];
      chatId = newChat.id;
      setActiveChatId(chatId);
    }

    const userMsg = { role: "user", content: text };

    currentChats = currentChats.map(c => {
      if (c.id !== chatId) return c;
      const isFirst = c.messages.length === 0;
      return {
        ...c,
        title: isFirst ? generateTitle(text) : c.title,
        messages: [...c.messages, userMsg],
        updatedAt: Date.now(),
      };
    });
    updateChats(currentChats);

    const chat = currentChats.find(c => c.id === chatId);
    const messages = chat.messages;

    setIsLoading(true);
    setStreamingContent("");

    let fullContent = "";

    try {
      await sendMessage(
        messages,
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        },
        () => {
          setStreamingContent("");
          setIsLoading(false);
          const aiMsg = { role: "assistant", content: fullContent };
          const final = currentChats.map(c =>
            c.id === chatId
              ? { ...c, messages: [...c.messages, aiMsg], updatedAt: Date.now() }
              : c
          );
          updateChats(final);
        }
      );
    } catch (err) {
      setIsLoading(false);
      setStreamingContent("");
      const errMsg = { role: "assistant", content: `⚠️ Error: ${err.message}` };
      const final = currentChats.map(c =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, errMsg] }
          : c
      );
      updateChats(final);
    }
  };

  const handleStop = () => {
    setIsLoading(false);
    if (streamingContent) {
      const aiMsg = { role: "assistant", content: streamingContent };
      const updated = chats.map(c =>
        c.id === activeChatId
          ? { ...c, messages: [...c.messages, aiMsg] }
          : c
      );
      updateChats(updated);
      setStreamingContent("");
    }
  };

  const messages = activeChat?.messages || [];
  const showWelcome = messages.length === 0 && !isLoading;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#080b14", position: "relative" }}>
      <style>{`
        @keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .ai-content p:last-child { margin-bottom: 0; }
        .suggestion-btn:hover { background: rgba(56,189,248,0.15) !important; border-color: rgba(56,189,248,0.4) !important; }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar - slide in on mobile */}
      <div style={{
        position: "fixed", top: 0, left: 0, height: "100%",
        zIndex: 50,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
      }}>
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", width: "100%" }}>
        {/* Header */}
        <header style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: "12px",
          background: "rgba(8,11,20,0.95)", backdropFilter: "blur(10px)",
          zIndex: 10,
        }}>
          <button onClick={() => setSidebarOpen(v => !v)} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px", padding: "8px", cursor: "pointer", color: "#8899aa",
            display: "flex", alignItems: "center",
          }}>
            <Menu size={18} />
          </button>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <span style={{ fontWeight: 600, fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
              {activeChat?.title || "Swarg AI"}
            </span>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: "20px", padding: "4px 10px", flexShrink: 0,
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "0.68rem", color: "#34d399", fontWeight: 500 }}>Llama 3.3</span>
          </div>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>

            {showWelcome && (
              <div style={{ textAlign: "center", paddingTop: "40px", animation: "fadeIn 0.5s ease" }}>
                <div style={{
                  width: "60px", height: "60px", borderRadius: "18px",
                  background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", fontSize: "26px",
                  boxShadow: "0 0 40px rgba(56,189,248,0.3)",
                }}>✦</div>
                <h1 style={{ fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "6px" }}>
                  Swarg AI
                </h1>
                <p style={{ color: "#8899aa", fontSize: "0.85rem", marginBottom: "32px" }}>
                  Powered by Llama 3.3 · Created by Amar Kumar
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => handleSend(s)} className="suggestion-btn" style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px", padding: "12px",
                      color: "#8899aa", fontSize: "0.78rem",
                      fontFamily: "Outfit", cursor: "pointer",
                      textAlign: "left", lineHeight: 1.5,
                      transition: "all 0.2s",
                    }}>
                      <Zap size={11} style={{ marginRight: "5px", color: "#38bdf8" }} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <Message key={i} message={msg} isStreaming={false} />
            ))}

            {isLoading && streamingContent && (
              <Message message={{ role: "assistant", content: streamingContent }} isStreaming={true} />
            )}

            {isLoading && !streamingContent && (
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", flexShrink: 0,
                }}>✦</div>
                <div style={{
                  background: "#111827", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "4px 18px 18px 18px", padding: "14px 18px",
                  display: "flex", gap: "5px", alignItems: "center",
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: "7px", height: "7px", borderRadius: "50%",
                      background: "#38bdf8", animation: `pulse 1.2s ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <ChatInput onSend={handleSend} isLoading={isLoading} onStop={handleStop} />
      </main>
    </div>
  );
                                       }
