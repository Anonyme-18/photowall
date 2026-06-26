import { NextResponse } from "next/server";
import { ROTATION_MIGRATION_HINT, isRotationSchemaError } from "@/lib/db/photoSchema";

function isStorageAuthError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { message?: string; statusCode?: string };
  const msg = String(e.message ?? "");
  return (
    msg.includes("JWS Protected Header is invalid") ||
    msg.includes("Storage upload failed") ||
    e.statusCode === "403"
  );
}

export function apiError(err: unknown, label?: string) {
  if (label) console.error(`[${label}]`, err);

  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    const message = [e.message, e.details, e.hint, e.code ? `code: ${e.code}` : null]
      .filter(Boolean)
      .join(" — ");
    if (message) {
      if (isRotationSchemaError(err)) {
        return NextResponse.json(
          {
            error: `Colonne 'rotation' absente en base. ${ROTATION_MIGRATION_HINT}`,
          },
          { status: 500 },
        );
      }
      if (isStorageAuthError(err)) {
        return NextResponse.json(
          {
            error:
              "Erreur d'authentification Supabase Storage. Vérifiez que SUPABASE_SERVICE_ROLE_KEY est bien la Secret key (sb_secret_...) sur l'hébergeur, sans guillemets ni espaces.",
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: String(message) }, { status: 500 });
    }
  }

  if (err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Erreur inconnue" }, { status: 500 });
}
