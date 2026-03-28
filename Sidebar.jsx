import { useState } from "react";
import { MessageSquare, Plus, Trash2, Edit2, Check, X, Sparkles } from "lucide-react";

export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat, isOpen, onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const startEdit = (chat, e) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const saveEdit = (id, e) => {
    e.stopPropagation();
    if (editTitle.trim()) onRenameChat(id, editTitle.trim());
    setEditingId(null);
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            zIndex: 40, display: "none",
          }}
          className="mobile-overlay"
        />
      )}

      <aside style={{
        width: "260px", minWidth: "260px",
        background: "#0d1117",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        height: "100%", overflow: "hidden",
        position: "relative", zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "linear-gradient(135deg, #38bdf8, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(56,189,248,0.3)",
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.3px" }}>Swarg AI</div>
              <div style={{ fontSize: "0.65rem", color: "#4a5568", letterSpacing: "1.5px", textTransform: "uppercase" }}>by Amar Kumar</div>
            </div>
          </div>

          <button onClick={onNewChat} style={{
            width: "100%", padding: "10px 14px",
            background: "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(129,140,248,0.15))",
            border: "1px solid rgba(56,189,248,0.25)",
            borderRadius: "10px", color: "#38bdf8",
            display: "flex", alignItems: "center", gap: "8px",
            cursor: "pointer", fontSize: "0.88rem", fontFamily: "Outfit",
            fontWeight: 500, transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(135deg, rgba(56,189,248,0.25), rgba(129,140,248,0.25))"}
            onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(129,140,248,0.15))"}
          >
            <Plus size={16} /> New Chat
          </button>
        </div>

        {/* Chat list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {chats.length === 0 ? (
            <div style={{ textAlign: "center", color: "#4a5568", fontSize: "0.8rem", padding: "40px 20px" }}>
              No chats yet.<br />Start a new conversation!
            </div>
          ) : (
            [...chats].sort((a, b) => b.updatedAt - a.updatedAt).map(chat => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 10px", borderRadius: "10px", cursor: "pointer",
                  marginBottom: "2px",
                  background: activeChatId === chat.id ? "rgba(56,189,248,0.1)" : "transparent",
                  border: activeChatId === chat.id ? "1px solid rgba(56,189,248,0.2)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (activeChatId !== chat.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (activeChatId !== chat.id) e.currentTarget.style.background = "transparent"; }}
              >
                <MessageSquare size={14} color={activeChatId === chat.id ? "#38bdf8" : "#4a5568"} style={{ flexShrink: 0 }} />

                {editingId === chat.id ? (
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => { if (e.key === "Enter") saveEdit(chat.id, e); if (e.key === "Escape") cancelEdit(e); }}
                    autoFocus
                    style={{
                      flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(56,189,248,0.4)",
                      borderRadius: "6px", color: "#f0f4ff", padding: "2px 6px",
                      fontSize: "0.82rem", fontFamily: "Outfit", outline: "none",
                    }}
                  />
                ) : (
                  <span style={{
                    flex: 1, fontSize: "0.82rem", color: activeChatId === chat.id ? "#e2e8f0" : "#8899aa",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {chat.title}
                  </span>
                )}

                <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                  {editingId === chat.id ? (
                    <>
                      <button onClick={(e) => saveEdit(chat.id, e)} style={iconBtn("#34d399")}><Check size={12} /></button>
                      <button onClick={cancelEdit} style={iconBtn("#f87171")}><X size={12} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => startEdit(chat, e)} style={iconBtn("#8899aa")} className="action-btn"><Edit2 size={12} /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }} style={iconBtn("#8899aa")} className="action-btn"><Trash2 size={12} /></button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontSize: "0.7rem", color: "#4a5568", textAlign: "center",
        }}>
          {chats.length} chat{chats.length !== 1 ? "s" : ""} saved locally
        </div>
      </aside>
    </>
  );
}

const iconBtn = (color) => ({
  background: "none", border: "none", cursor: "pointer",
  color, padding: "3px", borderRadius: "4px", display: "flex",
  alignItems: "center", justifyContent: "center",
  opacity: 0.6, transition: "opacity 0.15s",
});
