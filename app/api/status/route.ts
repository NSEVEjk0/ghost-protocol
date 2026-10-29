import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHOST_URL = process.env.GHOST_URL ?? "http://38.49.214.201:4173";

export async function GET() {
  try {
    const res = await fetch(`${GHOST_URL}/status`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { running: false, error: String(e instanceof Error ? e.message : e) },
      { status: 502 }
    );
  }
}
