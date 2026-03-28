import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{
      position: "absolute", top: "10px", right: "10px",
      background: "rgba(255,255,255,0.1)", border: "none",
      borderRadius: "6px", padding: "4px 8px", cursor: "pointer",
      color: copied ? "#34d399" : "#8899aa", display: "flex",
      alignItems: "center", gap: "4px", fontSize: "0.7rem",
    }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function Message({ message, isStreaming }) {
  const isUser = message.role === "user";

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "20px",
      animation: "msgIn 0.25s ease",
    }}>
      {/* AI Avatar */}
      {!isUser && (
        <div style={{
          width: "32px", height: "32px", borderRadius: "10px",
          background: "linear-gradient(135deg, #38bdf8, #818cf8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", marginRight: "10px", flexShrink: 0,
          boxShadow: "0 0 15px rgba(56,189,248,0.2)",
          alignSelf: "flex-start", marginTop: "2px",
        }}>✦</div>
      )}

      <div style={{
        maxWidth: "75%",
        background: isUser
          ? "linear-gradient(135deg, #1d4ed8, #4338ca)"
          : "#111827",
        borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
        padding: "12px 16px",
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.07)",
        boxShadow: isUser ? "0 4px 20px rgba(29,78,216,0.3)" : "0 4px 20px rgba(0,0,0,0.3)",
        position: "relative",
      }}>
        {isUser ? (
          <p style={{ fontSize: "0.92rem", lineHeight: 1.6, color: "#e0e7ff" }}>
            {message.content}
          </p>
        ) : (
          <div className="ai-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeText = String(children).replace(/\n$/, "");
                  return !inline && match ? (
                    <div style={{ position: "relative", marginTop: "12px", marginBottom: "4px" }}>
                      <CopyButton text={codeText} />
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          borderRadius: "10px", fontSize: "0.82rem",
                          padding: "16px", margin: 0,
                          background: "#0d1117",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        {...props}
                      >
                        {codeText}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code style={{
                      background: "rgba(56,189,248,0.1)", color: "#38bdf8",
                      padding: "2px 6px", borderRadius: "4px",
                      fontSize: "0.85em", fontFamily: "JetBrains Mono",
                    }} {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p style={{ marginBottom: "10px", lineHeight: 1.75, fontSize: "0.92rem" }}>{children}</p>,
                ul: ({ children }) => <ul style={{ paddingLeft: "20px", marginBottom: "10px" }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ paddingLeft: "20px", marginBottom: "10px" }}>{children}</ol>,
                li: ({ children }) => <li style={{ marginBottom: "4px", lineHeight: 1.6, fontSize: "0.92rem" }}>{children}</li>,
                h1: ({ children }) => <h1 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", color: "#38bdf8" }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "10px", color: "#818cf8" }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "8px" }}>{children}</h3>,
                strong: ({ children }) => <strong style={{ color: "#e2e8f0", fontWeight: 600 }}>{children}</strong>,
                blockquote: ({ children }) => (
                  <blockquote style={{
                    borderLeft: "3px solid #38bdf8", paddingLeft: "14px",
                    margin: "12px 0", color: "#8899aa", fontStyle: "italic",
                  }}>{children}</blockquote>
                ),
                table: ({ children }) => (
                  <div style={{ overflowX: "auto", marginBottom: "10px" }}>
                    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.85rem" }}>{children}</table>
                  </div>
                ),
                th: ({ children }) => <th style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "8px 12px", background: "rgba(56,189,248,0.1)", color: "#38bdf8" }}>{children}</th>,
                td: ({ children }) => <td style={{ border: "1px solid rgba(255,255,255,0.07)", padding: "8px 12px" }}>{children}</td>,
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && (
              <span style={{
                display: "inline-block", width: "8px", height: "16px",
                background: "#38bdf8", borderRadius: "2px",
                animation: "blink 1s infinite", verticalAlign: "middle", marginLeft: "2px",
              }} />
            )}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width: "32px", height: "32px", borderRadius: "10px",
          background: "linear-gradient(135deg, #4338ca, #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "13px", marginLeft: "10px", flexShrink: 0,
          alignSelf: "flex-start", marginTop: "2px",
        }}>👤</div>
      )}
    </div>
  );
}
