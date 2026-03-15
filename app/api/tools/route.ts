import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = [
  "christian.cattaneo@superbuilders.school",
  "nat.eliason@alpha.school",
  "cameron.sorsby@alpha.school",
  "nclawson4@gmail.com",
];

const TOOL_KEYS = [
  "TOOL_KEY_PINATA",
  "TOOL_KEY_CROWBAR",
  "TOOL_KEY_WHACKAMOLE",
  "TOOL_KEY_SLOPOMETER",
  "TOOL_KEY_PADLOCK",
  "TOOL_KEY_PITCHFORK",
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
