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
    name: "Pinata",
    envKey: "TOOL_KEY_PINATA",
    command: "npx pinata-security-cli analyze . --verify --api-key KEY",
    description: "AI-powered SAST scanner",
    color: "#7c3aed",
  },
  {
    name: "Crowbar",
    envKey: "TOOL_KEY_CROWBAR",
    command: "npx crowbar-security scan URL --anthropic-key KEY",
    description: "Autonomous penetration testing",
    color: "#2563eb",
  },
  {
    name: "Whackamole",
    envKey: "TOOL_KEY_WHACKAMOLE",
    command: "npx whackamole agent --url URL",
    description: "Attack + verified fix generation",
    color: "#ea580c",
  },
  {
    name: "Slopometer",
    envKey: "TOOL_KEY_SLOPOMETER",
    command: "npx slopometer scan .",
    description: "Code quality / slop detector",
    color: "#16a34a",
  },
  {
    name: "Padlock",
    envKey: "TOOL_KEY_PADLOCK",
    command: "npx padlock-cli audit .",
    description: "Database security auditor",
    color: "#0891b2",
  },
  {
    name: "Pitchfork",
    envKey: "TOOL_KEY_PITCHFORK",
    command: "npx pitchfork-load storm URL",
    description: "Load testing",
    color: "#db2777",
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

  const handleSave = async (envKey: string) => {
    setSaving(true);
    await fetch("/api/tools", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: envKey, value: editValue }),
    });
    setKeys((prev) => ({ ...prev, [envKey]: editValue }));
    setEditing(null);
    setEditValue("");
    setSaving(false);
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
            Security Toolkit
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
            Security & Quality Tools
          </h1>
          <p
            style={{
              fontSize: ".95rem",
              color: "var(--ink-2, #3a3a3a)",
              maxWidth: 560,
              lineHeight: 1.6,
            }}
          >
            Copy the command, paste into your terminal, and run. Each tool has a
            shared API key pre-configured for the academy.
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

              <div
                style={{
                  background: "#0f0f0f",
                  borderRadius: 8,
                  padding: ".8rem 1rem",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: ".72rem",
                  color: "#a3e635",
                  overflowX: "auto",
                  marginBottom: ".8rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {tool.command.replace(
                  "KEY",
                  keys[tool.envKey]
                    ? keys[tool.envKey].slice(0, 8) + "..."
                    : "<KEY>"
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: ".5rem",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => handleCopy(tool)}
                  style={{
                    fontSize: ".78rem",
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: 100,
                    background:
                      copied === tool.envKey ? "#16a34a" : "var(--ink, #0f0f0f)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                    transition: "all .2s",
                  }}
                >
                  {copied === tool.envKey ? "Copied!" : "Copy Command"}
                </button>

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
                    placeholder="Enter API key..."
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
      </div>
    </>
  );
}
