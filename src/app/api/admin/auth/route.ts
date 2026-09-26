import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
  createSessionToken,
  verifyAdminPin,
} from "@/lib/admin/auth";
import { clearRateLimit, isRateLimited } from "@/lib/security/rateLimit";

export async function POST(request: Request) {
  try {
    const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(`admin-login:${address}`)) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
    }
    const body = await request.json();
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";

    if (!verifyAdminPin(pin)) {
      return NextResponse.json({ error: "Code PIN incorrect" }, { status: 401 });
    }

    clearRateLimit(`admin-login:${address}`);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, createSessionToken(), ADMIN_COOKIE_OPTIONS);
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur d'authentification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { ...ADMIN_COOKIE_OPTIONS, maxAge: 0 });
  return res;
}
