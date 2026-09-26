import { NextResponse } from "next/server";
import { getNeon } from "@/lib/db/neon";
import type { EventConfig } from "@/lib/types/event";
import { DEFAULT_EVENT_CONFIG } from "@/lib/types/event";
import { apiError } from "@/lib/api/errors";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export async function GET() {
  try {
    const sql = getNeon();
    const [data] = await sql`SELECT config FROM event_config WHERE id = 1 LIMIT 1`;

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

    const sql = getNeon();
    const [data] = await sql`
      INSERT INTO event_config (id, config)
      VALUES (1, ${JSON.stringify(config)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config
      RETURNING config
    `;

    return NextResponse.json({ config: data.config as EventConfig });
  } catch (err) {
    return apiError(err, "PUT /api/event-config");
  }
}
