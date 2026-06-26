import type { SupabaseClient } from "@supabase/supabase-js";

const BASE_COLUMNS =
  "id, url, author, timestamp, hidden, aspect_ratio, accent_color, x, y";

let rotationColumnExists: boolean | null = null;

export function isRotationSchemaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  const msg = String(e.message ?? "");
  return e.code === "42703" || e.code === "PGRST204" || msg.includes("rotation");
}

export async function hasRotationColumn(supabase: SupabaseClient): Promise<boolean> {
  if (rotationColumnExists !== null) return rotationColumnExists;

  const { error } = await supabase.from("photos").select("rotation").limit(0);
  if (!error) {
    rotationColumnExists = true;
    return true;
  }

  if (isRotationSchemaError(error)) {
    rotationColumnExists = false;
    return false;
  }

  throw error;
}

export async function photoSelectColumns(supabase: SupabaseClient): Promise<string> {
  return (await hasRotationColumn(supabase)) ? `${BASE_COLUMNS}, rotation` : BASE_COLUMNS;
}

export async function omitRotationIfMissing<T extends Record<string, unknown>>(
  supabase: SupabaseClient,
  row: T,
): Promise<Record<string, unknown>> {
  if (await hasRotationColumn(supabase)) return row;
  const { rotation: _rotation, ...rest } = row;
  return rest;
}

export const ROTATION_MIGRATION_HINT =
  "Exécutez dans Supabase → SQL Editor : alter table public.photos add column if not exists rotation double precision not null default 0; notify pgrst, 'reload schema';";
