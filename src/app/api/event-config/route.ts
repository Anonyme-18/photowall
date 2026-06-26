import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { EventConfig } from "@/lib/types/event";
import { DEFAULT_EVENT_CONFIG } from "@/lib/types/event";
import { apiError } from "@/lib/api/errors";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("event_config").select("config").eq("id", 1).maybeSingle();

    if (error) throw error;

    const config: EventConfig = data?.config
      ? { ...DEFAULT_EVENT_CONFIG, ...(data.config as EventConfig) }
      : DEFAULT_EVENT_CONFIG;

    return NextResponse.json({ config });
  } catch (err) {
    return apiError(err, "GET /api/event-config");
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const config = body.config as EventConfig;

    if (!config?.name) {
      return NextResponse.json({ error: "Config invalide" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("event_config")
      .upsert({ id: 1, config })
      .select("config")
      .single();

    if (error) throw error;

    return NextResponse.json({ config: data.config as EventConfig });
  } catch (err) {
    return apiError(err, "PUT /api/event-config");
  }
}
