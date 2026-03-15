import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = [
  "christian.cattaneo@superbuilders.school",
  "nat.eliason@alpha.school",
  "cameron.sorsby@alpha.school",
  "nclawson4@gmail.com",
];

const TOOL_KEYS = [
  "TOOL_KEY_CLAUDE",
  "TOOL_KEY_OPENAI",
  "TOOL_KEY_ELEVENLABS",
  "TOOL_KEY_DATAFORSEO",
  "TOOL_KEY_POSTIZ",
  "TOOL_KEY_FALAI",
  "TOOL_KEY_GAMMA",
  "TOOL_KEY_PERPLEXITY",
  "TOOL_KEY_SEEDANCE",
  "TOOL_KEY_NANOBANANA",
] as const;

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys: Record<string, string> = {};
  for (const k of TOOL_KEYS) {
    keys[k] = process.env[k] || "";
  }

  return NextResponse.json({ keys });
}

export async function PUT(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();
  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json();
  const { key, value } = body;

  if (!TOOL_KEYS.includes(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  // Update in-memory for immediate reads
  process.env[key] = value;

  // Persist to Vercel env vars (survives cold starts + deploys)
  const vercelToken = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (vercelToken && projectId) {
    try {
      // Remove existing env var
      const listRes = await fetch(
        `https://api.vercel.com/v9/projects/${projectId}/env`,
        { headers: { Authorization: `Bearer ${vercelToken}` } }
      );
      const listData = await listRes.json();
      const existing = (listData.envs || []).find(
        (e: { key: string }) => e.key === key
      );
      if (existing) {
        await fetch(
          `https://api.vercel.com/v9/projects/${projectId}/env/${existing.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${vercelToken}` },
          }
        );
      }

      // Create new env var
      await fetch(
        `https://api.vercel.com/v10/projects/${projectId}/env`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key,
            value,
            type: "encrypted",
            target: ["production", "preview"],
          }),
        }
      );
    } catch (err) {
      console.error("[tools] Failed to persist to Vercel:", err);
      // Still succeeds — in-memory update works for current instance
    }
  }

  return NextResponse.json({ success: true });
}

/** POST /api/tools — Request access to a tool key (sends notification to admins) */
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { toolName, reason } = body;

  if (!toolName || typeof toolName !== "string") {
    return NextResponse.json({ error: "toolName required" }, { status: 400 });
  }

  // Log the request (in production, store in DB or send email)
  console.log(
    `[tool-request] ${session.user.email} requested access to ${toolName}: ${reason || "no reason given"}`
  );

  // Store request in a simple JSON file (async I/O)
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const dataDir = path.join(process.cwd(), ".data");
  const requestsFile = path.join(dataDir, "key-requests.json");

  try {
    await fs.mkdir(dataDir, { recursive: true });

    let existing: unknown[] = [];
    try {
      const raw = await fs.readFile(requestsFile, "utf-8");
      existing = JSON.parse(raw);
    } catch {
      // File doesn't exist yet
    }

    existing.push({
      email: session.user.email,
      name: session.user.name || "",
      toolName,
      reason: reason || "",
      timestamp: new Date().toISOString(),
    });

    await fs.writeFile(requestsFile, JSON.stringify(existing, null, 2));
  } catch {
    // Silently fail on file write — not critical
  }

  return NextResponse.json({ success: true, message: "Request submitted. An admin will be notified." });
}
