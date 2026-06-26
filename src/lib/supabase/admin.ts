import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function resolveSupabaseKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    ""
  );
}

/** Les clés sb_secret_ / sb_publishable_ ne sont pas des JWT — pas de header Authorization. */
function isOpaqueSupabaseKey(key: string): boolean {
  return key.startsWith("sb_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return async (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("apikey", supabaseKey);

    if (isOpaqueSupabaseKey(supabaseKey)) {
      headers.delete("Authorization");
    } else {
      const auth = headers.get("Authorization");
      if (!auth) {
        headers.set("Authorization", `Bearer ${supabaseKey}`);
      }
    }

    return fetch(input, { ...init, headers });
  };
}

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = resolveSupabaseKey();

  if (!url || !key) {
    throw new Error(
      "Variables Supabase manquantes. Créez .env.local avec NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (Secret key du dashboard).",
    );
  }

  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: createSupabaseFetch(key),
    },
  });

  return adminClient;
}
