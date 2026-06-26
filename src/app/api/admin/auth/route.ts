import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
  createSessionToken,
  verifyAdminPin,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";

    if (!verifyAdminPin(pin)) {
      return NextResponse.json({ error: "Code PIN incorrect" }, { status: 401 });
    }

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
