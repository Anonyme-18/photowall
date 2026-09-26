import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

export function getNeon(): NeonQueryFunction<false, false> {
  if (client) return client;

  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is not configured");

  client = neon(url);
  return client;
}
