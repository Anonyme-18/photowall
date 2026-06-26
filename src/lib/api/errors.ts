import { NextResponse } from "next/server";
import { ROTATION_MIGRATION_HINT, isRotationSchemaError } from "@/lib/db/photoSchema";

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
      return NextResponse.json({ error: String(message) }, { status: 500 });
    }
  }

  if (err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Erreur inconnue" }, { status: 500 });
}
