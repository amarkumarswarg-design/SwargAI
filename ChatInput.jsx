import { useState, useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";

export default function ChatInput({ onSend, isLoading, onStop }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      padding: "16px 20px 20px",
      background: "linear-gradient(to top, #080b14 80%, transparent)",
    }}>
      <div style={{
        maxWidth: "760px", margin: "0 auto",
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        display: "flex", alignItems: "flex-end", gap: "10px",
        padding: "12px 14px",
        boxShadow: "0 0 40px rgba(56,189,248,0.05)",
        transition: "border-color 0.2s",
      }}
        onFocus={() => {}}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message Swarg AI... (Shift+Enter for new line)"
          rows={1}
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            color: "#f0f4ff", fontSize: "0.93rem", fontFamily: "Outfit",
            lineHeight: 1.6, resize: "none", overflowY: "auto",
            maxHeight: "160px",
          }}
        />

        <button
          onClick={isLoading ? onStop : handleSend}
          disabled={!isLoading && !text.trim()}
          style={{
            width: "38px", height: "38px", borderRadius: "10px", border: "none",
            background: isLoading
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : text.trim()
              ? "linear-gradient(135deg, #38bdf8, #818cf8)"
              : "rgba(255,255,255,0.06)",
            color: text.trim() || isLoading ? "#fff" : "#4a5568",
            cursor: text.trim() || isLoading ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.2s",
            boxShadow: text.trim() ? "0 0 20px rgba(56,189,248,0.3)" : "none",
          }}
        >
          {isLoading ? <Square size={15} fill="white" /> : <Send size={15} />}
        </button>
      </div>

      <p style={{
        textAlign: "center", fontSize: "0.68rem", color: "#2d3748",
        marginTop: "8px", letterSpacing: "0.3px",
      }}>
        Swarg AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
