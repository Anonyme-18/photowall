import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { rowToPhoto, type PhotoRow } from "@/lib/db/photos";
import {
  hasRotationColumn,
  photoSelectColumns,
} from "@/lib/db/photoSchema";
import { apiError } from "@/lib/api/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    const requestedRotation =
      typeof body.rotation === "number" ? (body.rotation as number) : undefined;

    if (typeof body.hidden === "boolean") updates.hidden = body.hidden;
    if (typeof body.x === "number") updates.x = body.x;
    if (typeof body.y === "number") updates.y = body.y;
    if (requestedRotation !== undefined) updates.rotation = requestedRotation;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Aucune mise à jour" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const rotationSupported = await hasRotationColumn(supabase);
    const dbUpdates = rotationSupported
      ? updates
      : Object.fromEntries(Object.entries(updates).filter(([key]) => key !== "rotation"));

    if (Object.keys(dbUpdates).length > 0) {
      const { data, error } = await supabase
        .from("photos")
        .update(dbUpdates)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      const photo = rowToPhoto(data as unknown as PhotoRow);
      if (!rotationSupported && requestedRotation !== undefined) {
        photo.rotation = requestedRotation;
      }
      return NextResponse.json({ photo });
    }

    const columns = await photoSelectColumns(supabase);
    const { data, error } = await supabase.from("photos").select(columns).eq("id", id).single();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
    }

    const photo = rowToPhoto(data as unknown as PhotoRow);
    if (requestedRotation !== undefined) photo.rotation = requestedRotation;
    return NextResponse.json({ photo });
  } catch (err) {
    return apiError(err, "PATCH /api/photos/[id]");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();

    if (id.startsWith("user-")) {
      const { data: photo } = await supabase.from("photos").select("url").eq("id", id).single();
      if (photo?.url?.includes("/storage/v1/object/public/photos/")) {
        const path = photo.url.split("/photos/").pop();
        if (path) await supabase.storage.from("photos").remove([path]);
      }
    }

    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, "DELETE /api/photos/[id]");
  }
}
