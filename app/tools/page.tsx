"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import NavBar from "@/components/NavBar";

interface ToolDef {
  name: string;
  envKey: string;
  command: string;
  description: string;
  color: string;
}

const TOOLS: ToolDef[] = [
  {
    name: "Claude (Opus 4.6)",
    envKey: "TOOL_KEY_CLAUDE",
    command: "Use API key at console.anthropic.com or in Claude Code / Cursor",
    description: "Best-in-class AI for writing & reasoning",
    color: "#d97706",
  },
  {
    name: "Codex (OpenAI)",
    envKey: "TOOL_KEY_OPENAI",
    command: "Use API key at platform.openai.com or in Codex CLI",
    description: "AI coding agent — pair with Opus for max output",
    color: "#10a37f",
  },
  {
    name: "ElevenLabs",
    envKey: "TOOL_KEY_ELEVENLABS",
    command: "Use API key at elevenlabs.io/docs or in voice apps",
    description: "Voice synthesis & cloning — best quality TTS",
    color: "#6366f1",
  },
  {
    name: "DataForSEO",
    envKey: "TOOL_KEY_DATAFORSEO",
    command: "API docs at dataforseo.com — SERP, keyword, backlink data",
    description: "SEO data API — rankings, keywords, competitors",
    color: "#2563eb",
  },
  {
    name: "Postiz",
    envKey: "TOOL_KEY_POSTIZ",
    command: "Use API key at postiz.com — social media scheduling",
    description: "Social media automation & scheduling",
    color: "#ec4899",
  },
  {
    name: "fal.ai",
    envKey: "TOOL_KEY_FALAI",
    command: "Use API key at fal.ai — image/video generation",
    description: "Fast AI content generation — images, video, audio",
    color: "#f97316",
  },
  {
    name: "Gamma",
    envKey: "TOOL_KEY_GAMMA",
    command: "Use at gamma.app — AI-powered presentations",
    description: "AI slide deck & presentation generator",
    color: "#8b5cf6",
  },
  {
    name: "Perplexity",
    envKey: "TOOL_KEY_PERPLEXITY",
    command: "Use API at perplexity.ai — AI search & research",
    description: "AI-powered search & research assistant",
    color: "#ef4444",
  },
  {
    name: "Seedance 2.0",
    envKey: "TOOL_KEY_SEEDANCE",
    command: "ByteDance video generation API",
    description: "AI video generation — best quality 2026",
    color: "#06b6d4",
  },
  {
    name: "Nano Banana 2",
    envKey: "TOOL_KEY_NANOBANANA",
    command: "Google image generation model",
    description: "Google's best image generation model",
    color: "#16a34a",
  },
];

export default function ToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [requestReason, setRequestReason] = useState("");
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [showKey, setShowKey] = useState<Set<string>>(new Set());
  const [requestingNew, setRequestingNew] = useState(false);
  const [newToolName, setNewToolName] = useState("");
  const [newToolReason, setNewToolReason] = useState("");
  const [requestNewSubmitted, setRequestNewSubmitted] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = session && (session as any).isAdmin === true;

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/tools");
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys || {});
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchKeys();
    }
  }, [status, router, fetchKeys]);

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg, #f7f6f3)",
          fontFamily: "'Space Grotesk', sans-serif",
          color: "var(--ink-3, #888)",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!session) return null;

  const handleCopy = (tool: ToolDef) => {
    const key = keys[tool.envKey] || "";
    const cmd = tool.command.replace("KEY", key || "<YOUR_KEY>");
    navigator.clipboard.writeText(cmd);
    setCopied(tool.envKey);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = async (envKey: string, val?: string) => {
    const saveValue = val ?? editValue;
    if (!saveValue.trim()) return;
    setSaving(true);
    await fetch("/api/tools", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: envKey, value: saveValue.trim() }),
    });
    setKeys((prev) => ({ ...prev, [envKey]: saveValue.trim() }));
    setEditing(null);
    setEditValue("");
    setSaving(false);
  };

  // Auto-save on paste
  const handleKeyPaste = (envKey: string) => (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (pasted) {
      setEditValue(pasted);
      // Save immediately after paste
      setTimeout(() => handleSave(envKey, pasted), 100);
    }
  };

  const handleRequestAccess = async (toolName: string) => {
    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolName, reason: requestReason }),
    });
    if (res.ok) {
      setRequested((prev) => new Set([...prev, toolName]));
      setRequesting(null);
      setRequestReason("");
    }
  };

  return (
    <>
      <NavBar />
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "3rem 2rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: ".65rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".1em",
              color: "#7c3aed",
              marginBottom: ".5rem",
            }}
          >
            AI Stack 2026
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 700,
              letterSpacing: "-1px",
              lineHeight: 1.1,
              marginBottom: ".8rem",
            }}
          >
            AI Stack — API Keys
          </h1>
          <p
            style={{
              fontSize: ".95rem",
              color: "var(--ink-2, #3a3a3a)",
              maxWidth: 560,
              lineHeight: 1.6,
            }}
          >
            Best tool per category. Shared API keys for academy students. 
            No affiliate links — just the best tools for 2026.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: "1rem",
          }}
        >
          {TOOLS.map((tool) => (
            <div
              key={tool.envKey}
              style={{
                background: "var(--surface, #fff)",
                border: "1px solid var(--border, #e6e4df)",
                borderRadius: 14,
                padding: "1.5rem",
                transition: "all .2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".6rem",
                  marginBottom: ".6rem",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: tool.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    letterSpacing: "-.3px",
                  }}
                >
                  {tool.name}
                </span>
              </div>
              <p
                style={{
                  fontSize: ".85rem",
                  color: "var(--ink-2, #3a3a3a)",
                  marginBottom: ".8rem",
                }}
              >
                {tool.description}
              </p>

              {/* Usage hint */}
              <p style={{ fontSize: ".75rem", color: "var(--ink-3, #888)", marginBottom: ".6rem", fontStyle: "italic" }}>
                {tool.command}
              </p>

              {/* API Key display */}
              {keys[tool.envKey] ? (
                <div style={{ marginBottom: ".8rem" }}>
                  <div style={{ fontSize: ".65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--ink-3, #888)", marginBottom: ".3rem" }}>
                    API Key
                  </div>
                  <div style={{
                    background: "#0f0f0f",
                    borderRadius: 8,
                    padding: ".6rem .8rem",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: ".75rem",
                    color: "#a3e635",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: ".5rem",
                  }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {showKey.has(tool.envKey) ? keys[tool.envKey] : "•".repeat(Math.min(keys[tool.envKey].length, 32))}
                    </span>
                    <div style={{ display: "flex", gap: ".3rem", flexShrink: 0 }}>
                      <button
                        onClick={() => setShowKey(prev => {
                          const next = new Set(prev);
                          if (next.has(tool.envKey)) next.delete(tool.envKey);
                          else next.add(tool.envKey);
                          return next;
                        })}
                        style={{ fontSize: ".65rem", padding: "3px 8px", borderRadius: 6, background: "#1a1a1a", color: "#888", border: "1px solid #333", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {showKey.has(tool.envKey) ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(keys[tool.envKey]);
                          setCopied(tool.envKey);
                          setTimeout(() => setCopied(null), 2000);
                        }}
                        style={{ fontSize: ".65rem", padding: "3px 8px", borderRadius: 6, background: copied === tool.envKey ? "#16a34a" : "#1a1a1a", color: copied === tool.envKey ? "#fff" : "#888", border: "1px solid #333", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "all .2s" }}
                      >
                        {copied === tool.envKey ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: ".6rem .8rem",
                  borderRadius: 8,
                  background: "var(--ink, #0f0f0f)08",
                  border: "1px dashed var(--border, #e6e4df)",
                  fontSize: ".78rem",
                  color: "var(--ink-3, #888)",
                  marginBottom: ".8rem",
                }}>
                  🔒 Key not set yet
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: ".5rem",
                  alignItems: "center",
                }}
              >
                {isAdmin && editing !== tool.envKey && (
                  <button
                    onClick={() => {
                      setEditing(tool.envKey);
                      setEditValue(keys[tool.envKey] || "");
                    }}
                    style={{
                      fontSize: ".78rem",
                      fontWeight: 600,
                      padding: "6px 14px",
                      borderRadius: 100,
                      background: "transparent",
                      color: "var(--ink-2, #3a3a3a)",
                      border: "1px solid var(--border, #e6e4df)",
                      cursor: "pointer",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Edit Key
                  </button>
                )}
              </div>

              {/* Request Access — shown when no key is set and user is not admin */}
              {!keys[tool.envKey] && !isAdmin && requesting !== tool.name && !requested.has(tool.name) && (
                <button
                  onClick={() => setRequesting(tool.name)}
                  style={{
                    marginTop: ".8rem",
                    width: "100%",
                    fontSize: ".82rem",
                    fontWeight: 600,
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, " + tool.color + "15, " + tool.color + "08)",
                    color: tool.color,
                    border: "1px solid " + tool.color + "30",
                    cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                    transition: "all .2s",
                  }}
                >
                  🔑 Request Access
                </button>
              )}

              {/* Request form */}
              {requesting === tool.name && (
                <div style={{ marginTop: ".8rem" }}>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Why do you need this tool? (optional)"
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border, #e6e4df)",
                      fontSize: ".82rem",
                      fontFamily: "'Space Grotesk', sans-serif",
                      marginBottom: ".5rem",
                      outline: "none",
                      resize: "none",
                    }}
                  />
                  <div style={{ display: "flex", gap: ".4rem" }}>
                    <button
                      onClick={() => handleRequestAccess(tool.name)}
                      style={{
                        fontSize: ".75rem",
                        fontWeight: 600,
                        padding: "5px 12px",
                        borderRadius: 100,
                        background: tool.color,
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      Submit Request
                    </button>
                    <button
                      onClick={() => { setRequesting(null); setRequestReason(""); }}
                      style={{
                        fontSize: ".75rem",
                        fontWeight: 600,
                        padding: "5px 12px",
                        borderRadius: 100,
                        background: "transparent",
                        color: "var(--ink-3, #888)",
                        border: "1px solid var(--border, #e6e4df)",
                        cursor: "pointer",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Requested confirmation */}
              {requested.has(tool.name) && !keys[tool.envKey] && (
                <div
                  style={{
                    marginTop: ".8rem",
                    padding: "8px 14px",
                    borderRadius: 8,
                    background: "#16a34a12",
                    border: "1px solid #16a34a30",
                    fontSize: ".78rem",
                    color: "#16a34a",
                    fontWeight: 500,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  ✓ Request submitted — an admin will set up your access
                </div>
              )}

              {editing === tool.envKey && (
                <div style={{ marginTop: ".8rem" }}>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onPaste={handleKeyPaste(tool.envKey)}
                    placeholder="Paste API key — saves automatically"
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border, #e6e4df)",
                      fontSize: ".82rem",
                      fontFamily: "'JetBrains Mono', monospace",
                      marginBottom: ".5rem",
                      outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", gap: ".4rem" }}>
                    <button
                      onClick={() => handleSave(tool.envKey)}
                      disabled={saving}
                      style={{
                        fontSize: ".75rem",
                        fontWeight: 600,
                        padding: "5px 12px",
                        borderRadius: 100,
                        background: "#16a34a",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(null);
                        setEditValue("");
                      }}
                      style={{
                        fontSize: ".75rem",
                        fontWeight: 600,
                        padding: "5px 12px",
                        borderRadius: 100,
                        background: "transparent",
                        color: "var(--ink-3, #888)",
                        border: "1px solid var(--border, #e6e4df)",
                        cursor: "pointer",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Request New Tool/Service Section */}
        <div style={{
          marginTop: "2.5rem",
          padding: "1.5rem",
          borderRadius: 14,
          border: "1px dashed var(--border, #e6e4df)",
          background: "var(--surface, #fff)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".6rem" }}>
            <span style={{ fontSize: "1.1rem" }}>💡</span>
            <span style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-.3px" }}>
              Need a different tool?
            </span>
          </div>
          <p style={{ fontSize: ".85rem", color: "var(--ink-2, #3a3a3a)", marginBottom: "1rem", lineHeight: 1.6 }}>
            Request API access to any AI tool or paid service. Admins will review and add it to the stack.
          </p>
          {!requestingNew ? (
            <button
              onClick={() => setRequestingNew(true)}
              style={{
                fontSize: ".82rem",
                fontWeight: 600,
                padding: "10px 20px",
                borderRadius: 100,
                background: "var(--ink, #0f0f0f)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Request a Tool
            </button>
          ) : requestNewSubmitted ? (
            <div style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "#16a34a12",
              border: "1px solid #16a34a30",
              fontSize: ".82rem",
              color: "#16a34a",
              fontWeight: 500,
            }}>
              ✓ Request submitted! An admin will review it.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
              <input
                type="text"
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
                placeholder="Tool name (e.g. Midjourney, Runway, Replicate)"
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border, #e6e4df)",
                  fontSize: ".82rem",
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: "none",
                }}
              />
              <textarea
                value={newToolReason}
                onChange={(e) => setNewToolReason(e.target.value)}
                placeholder="What would you use it for?"
                rows={2}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border, #e6e4df)",
                  fontSize: ".82rem",
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: "none",
                  resize: "none",
                }}
              />
              <div style={{ display: "flex", gap: ".4rem" }}>
                <button
                  onClick={async () => {
                    if (!newToolName.trim()) return;
                    await fetch("/api/tools", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ toolName: newToolName, reason: newToolReason, type: "new_tool_request" }),
                    });
                    setRequestNewSubmitted(true);
                    setNewToolName("");
                    setNewToolReason("");
                  }}
                  disabled={!newToolName.trim()}
                  style={{
                    fontSize: ".78rem",
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: 100,
                    background: newToolName.trim() ? "var(--ink, #0f0f0f)" : "#ccc",
                    color: "#fff",
                    border: "none",
                    cursor: newToolName.trim() ? "pointer" : "not-allowed",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Submit
                </button>
                <button
                  onClick={() => { setRequestingNew(false); setNewToolName(""); setNewToolReason(""); }}
                  style={{
                    fontSize: ".78rem",
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: 100,
                    background: "transparent",
                    color: "var(--ink-3, #888)",
                    border: "1px solid var(--border, #e6e4df)",
                    cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
