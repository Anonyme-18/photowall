import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { EventConfig } from "@/lib/types/event";
import { DEFAULT_EVENT_CONFIG } from "@/lib/types/event";
import { apiError } from "@/lib/api/errors";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/admin/auth";

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
    if (!isAdminAuthenticated(await cookies())) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }
    const body = await request.json();
    const config = body.config as EventConfig;

    const textFields = [
      config?.name,
      config?.subtitle,
      config?.eventDate,
      config?.eventTime,
      config?.eventLocation,
      config?.eventParticipants,
    ];
    if (!config?.name || textFields.some((value) => typeof value !== "string" || value.length > 120) ||
        !/^#[0-9a-f]{6}$/i.test(config.accentColor) ||
        !Array.isArray(config.tabs) || config.tabs.length < 1 || config.tabs.length > 10 ||
        config.tabs.some((tab) => !tab || typeof tab.id !== "string" || tab.id.length > 40 ||
          typeof tab.label !== "string" || tab.label.length > 50)) {
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
