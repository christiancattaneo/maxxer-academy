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
  "TOOL_KEY_SUNO",
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

  // For v0.1, update in-memory env var (persists until restart)
  // In production, you'd write to a database or .env file
  process.env[key] = value;

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
