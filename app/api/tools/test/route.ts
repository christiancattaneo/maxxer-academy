import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = [
  "christian.cattaneo@superbuilders.school",
  "nat.eliason@alpha.school",
  "cameron.sorsby@alpha.school",
  "nclawson4@gmail.com",
];

interface TestResult {
  tool: string;
  key: string;
  hasKey: boolean;
  keyPreview: string;
  status: "ok" | "error" | "no_key" | "skipped";
  detail: string;
}

/** GET /api/tools/test — Admin-only: test all API keys against their services */
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const results: TestResult[] = [];

  // Claude
  const claude = process.env.TOOL_KEY_CLAUDE || "";
  if (claude) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": claude, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 5, messages: [{ role: "user", content: "hi" }] }),
      });
      results.push({ tool: "Claude", key: "TOOL_KEY_CLAUDE", hasKey: true, keyPreview: claude.slice(0, 12) + "...", status: res.ok ? "ok" : "error", detail: res.ok ? "Working" : `HTTP ${res.status}` });
    } catch (e) { results.push({ tool: "Claude", key: "TOOL_KEY_CLAUDE", hasKey: true, keyPreview: claude.slice(0, 12) + "...", status: "error", detail: String(e) }); }
  } else {
    results.push({ tool: "Claude", key: "TOOL_KEY_CLAUDE", hasKey: false, keyPreview: "", status: "no_key", detail: "No key set" });
  }

  // OpenAI
  const openai = process.env.TOOL_KEY_OPENAI || "";
  if (openai) {
    try {
      const res = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: "Bearer " + openai } });
      results.push({ tool: "OpenAI", key: "TOOL_KEY_OPENAI", hasKey: true, keyPreview: openai.slice(0, 12) + "...", status: res.ok ? "ok" : "error", detail: res.ok ? "Working" : `HTTP ${res.status}` });
    } catch (e) { results.push({ tool: "OpenAI", key: "TOOL_KEY_OPENAI", hasKey: true, keyPreview: openai.slice(0, 12) + "...", status: "error", detail: String(e) }); }
  } else {
    results.push({ tool: "OpenAI", key: "TOOL_KEY_OPENAI", hasKey: false, keyPreview: "", status: "no_key", detail: "No key set" });
  }

  // ElevenLabs
  const el = process.env.TOOL_KEY_ELEVENLABS || "";
  if (el) {
    try {
      const res = await fetch("https://api.elevenlabs.io/v1/user", { headers: { "xi-api-key": el } });
      results.push({ tool: "ElevenLabs", key: "TOOL_KEY_ELEVENLABS", hasKey: true, keyPreview: el.slice(0, 12) + "...", status: res.ok ? "ok" : "error", detail: res.ok ? "Working" : `HTTP ${res.status}` });
    } catch (e) { results.push({ tool: "ElevenLabs", key: "TOOL_KEY_ELEVENLABS", hasKey: true, keyPreview: el.slice(0, 12) + "...", status: "error", detail: String(e) }); }
  } else {
    results.push({ tool: "ElevenLabs", key: "TOOL_KEY_ELEVENLABS", hasKey: false, keyPreview: "", status: "no_key", detail: "No key set" });
  }

  // Perplexity
  const perp = process.env.TOOL_KEY_PERPLEXITY || "";
  if (perp) {
    try {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + perp, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "sonar", messages: [{ role: "user", content: "test" }], max_tokens: 5 }),
      });
      results.push({ tool: "Perplexity", key: "TOOL_KEY_PERPLEXITY", hasKey: true, keyPreview: perp.slice(0, 12) + "...", status: res.ok ? "ok" : "error", detail: res.ok ? "Working" : `HTTP ${res.status}` });
    } catch (e) { results.push({ tool: "Perplexity", key: "TOOL_KEY_PERPLEXITY", hasKey: true, keyPreview: perp.slice(0, 12) + "...", status: "error", detail: String(e) }); }
  } else {
    results.push({ tool: "Perplexity", key: "TOOL_KEY_PERPLEXITY", hasKey: false, keyPreview: "", status: "no_key", detail: "No key set" });
  }

  // fal.ai
  const fal = process.env.TOOL_KEY_FALAI || "";
  if (fal) {
    try {
      // Simple auth check — list models
      const res = await fetch("https://rest.fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: { Authorization: "Key " + fal, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "test", num_inference_steps: 1, image_size: { width: 64, height: 64 } }),
      });
      // 200 or 422 (validation) both mean key works
      results.push({ tool: "fal.ai", key: "TOOL_KEY_FALAI", hasKey: true, keyPreview: fal.slice(0, 12) + "...", status: (res.ok || res.status === 422 || res.status === 400) ? "ok" : "error", detail: res.ok ? "Working" : `HTTP ${res.status} (key ${res.status === 401 ? 'invalid' : 'valid'})` });
    } catch (e) { results.push({ tool: "fal.ai", key: "TOOL_KEY_FALAI", hasKey: true, keyPreview: fal.slice(0, 12) + "...", status: "error", detail: String(e) }); }
  } else {
    results.push({ tool: "fal.ai", key: "TOOL_KEY_FALAI", hasKey: false, keyPreview: "", status: "no_key", detail: "No key set" });
  }

  // DataForSEO, Postiz, Gamma, Seedance, Nano Banana — skip API test (complex auth or no simple endpoint)
  for (const [name, envKey] of [["DataForSEO", "TOOL_KEY_DATAFORSEO"], ["Postiz", "TOOL_KEY_POSTIZ"], ["Gamma", "TOOL_KEY_GAMMA"], ["Seedance", "TOOL_KEY_SEEDANCE"], ["Nano Banana", "TOOL_KEY_NANOBANANA"]] as const) {
    const val = process.env[envKey] || "";
    results.push({ tool: name, key: envKey, hasKey: !!val, keyPreview: val ? val.slice(0, 12) + "..." : "", status: val ? "skipped" : "no_key", detail: val ? "Key set (not API-testable)" : "No key set" });
  }

  const summary = {
    ok: results.filter(r => r.status === "ok").length,
    error: results.filter(r => r.status === "error").length,
    noKey: results.filter(r => r.status === "no_key").length,
    skipped: results.filter(r => r.status === "skipped").length,
  };

  return NextResponse.json({ results, summary });
}
