import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Message from "./components/Message";
import ChatInput from "./components/ChatInput";
import { getChats, saveChats, createNewChat, generateTitle } from "./utils/storage";
import { sendMessage } from "./utils/api";
import { Menu, X, Sparkles, Zap } from "lucide-react";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const abortRef = useRef(null);

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
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleDeleteChat = (id) => {
    const updated = chats.filter(c => c.id !== id);
    updateChats(updated);
    if (activeChatId === id) {
      setActiveChatId(updated.length > 0 ? updated[0].id : null);
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

    // Create new chat if none active
    if (!chatId) {
      const newChat = createNewChat(generateTitle(text));
      currentChats = [...currentChats, newChat];
      chatId = newChat.id;
      setActiveChatId(chatId);
    }

    const userMsg = { role: "user", content: text };

    // Add user message
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

    // Get full message history for API
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
          // On done - save AI message
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
    // Stop streaming (best effort)
    setIsLoading(false);
    if (streamingContent) {
      const aiMsg = { role: "assistant", content: streamingContent + " _(stopped)_" };
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
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#080b14" }}>
      <style>{`
        @keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .ai-content p:last-child { margin-bottom: 0; }
        .suggestion-btn:hover { background: rgba(56,189,248,0.15) !important; border-color: rgba(56,189,248,0.4) !important; }
      `}</style>

      {/* Sidebar */}
      {sidebarOpen && (
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
      )}

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {/* Header */}
        <header style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: "12px",
          background: "rgba(8,11,20,0.8)", backdropFilter: "blur(10px)",
          zIndex: 10,
        }}>
          <button onClick={() => setSidebarOpen(v => !v)} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px", padding: "7px", cursor: "pointer", color: "#8899aa",
            display: "flex", alignItems: "center",
          }}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              {activeChat?.title || "Swarg AI"}
            </span>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: "20px", padding: "4px 12px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: 500 }}>Gemini 2.0 Flash</span>
          </div>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>

            {/* Welcome screen */}
            {showWelcome && (
              <div style={{ textAlign: "center", paddingTop: "60px", animation: "fadeIn 0.5s ease" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "20px",
                  background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", fontSize: "28px",
                  boxShadow: "0 0 40px rgba(56,189,248,0.3)",
                }}>✦</div>
                <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "8px" }}>
                  Swarg AI
                </h1>
                <p style={{ color: "#8899aa", fontSize: "0.95rem", marginBottom: "40px" }}>
                  Powered by Gemini 2.0 Flash · Created by Amar Kumar
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: "500px", margin: "0 auto" }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => handleSend(s)} className="suggestion-btn" style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px", padding: "14px",
                      color: "#8899aa", fontSize: "0.82rem",
                      fontFamily: "Outfit", cursor: "pointer",
                      textAlign: "left", lineHeight: 1.5,
                      transition: "all 0.2s",
                    }}>
                      <Zap size={12} style={{ marginRight: "6px", color: "#38bdf8" }} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <Message key={i} message={msg} isStreaming={false} />
            ))}

            {/* Streaming message */}
            {isLoading && streamingContent && (
              <Message
                message={{ role: "assistant", content: streamingContent }}
                isStreaming={true}
              />
            )}

            {/* Thinking indicator */}
            {isLoading && !streamingContent && (
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px", animation: "fadeIn 0.3s" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", flexShrink: 0,
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

        {/* Input */}
        <ChatInput onSend={handleSend} isLoading={isLoading} onStop={handleStop} />
      </main>
    </div>
  );
}
