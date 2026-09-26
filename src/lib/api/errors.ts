import { NextResponse } from "next/server";

export function apiError(err: unknown, label?: string) {
  if (label) console.error(`[${label}]`, err);
  return NextResponse.json({ error: "Une erreur serveur est survenue." }, { status: 500 });
}
