import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getNeon } from "@/lib/db/neon";
import { deleteImage } from "@/lib/storage/uploadthing";
import { rowToPhoto, type PhotoRow } from "@/lib/db/photos";
import { apiError } from "@/lib/api/errors";
import { ADMIN_COOKIE, isValidOwnerToken, isValidSessionToken, ownerCookieName } from "@/lib/admin/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_COOKIE)?.value;
    const isAdmin = isValidSessionToken(adminToken);

    if (!isAdmin) {
      if (!isValidOwnerToken(id, cookieStore.get(ownerCookieName(id))?.value)) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }
    }

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

    if (typeof updates.x === "number" && (!Number.isFinite(updates.x) || Math.abs(updates.x) > 100000) ||
        typeof updates.y === "number" && (!Number.isFinite(updates.y) || Math.abs(updates.y) > 100000) ||
        requestedRotation !== undefined && (!Number.isFinite(requestedRotation) || Math.abs(requestedRotation) > 360)) {
      return NextResponse.json({ error: "Valeur invalide" }, { status: 400 });
    }

    const sql = getNeon();
    const [data] = await sql`
      UPDATE photos
      SET hidden = CASE WHEN ${Object.hasOwn(updates, "hidden")} THEN ${updates.hidden ?? null} ELSE hidden END,
          x = CASE WHEN ${Object.hasOwn(updates, "x")} THEN ${updates.x ?? null} ELSE x END,
          y = CASE WHEN ${Object.hasOwn(updates, "y")} THEN ${updates.y ?? null} ELSE y END,
          rotation = CASE WHEN ${Object.hasOwn(updates, "rotation")} THEN ${updates.rotation ?? null} ELSE rotation END
      WHERE id = ${id}
      RETURNING id, url, storage_key, author, timestamp, hidden, aspect_ratio, accent_color, x, y, rotation
    `;
    if (!data) {
      return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
    }
    return NextResponse.json({ photo: rowToPhoto(data as unknown as PhotoRow) });
  } catch (err) {
    return apiError(err, "PATCH /api/photos/[id]");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_COOKIE)?.value;
    const isAdmin = isValidSessionToken(adminToken);

    if (!isAdmin) {
      if (!isValidOwnerToken(id, cookieStore.get(ownerCookieName(id))?.value)) {
        return NextResponse.json({ error: "Non autorisé à supprimer cette photo" }, { status: 403 });
      }
    }

    const sql = getNeon();
    const [photo] = await sql`DELETE FROM photos WHERE id = ${id} RETURNING storage_key`;
    if (!photo) return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });

    if (typeof photo.storage_key === "string" && photo.storage_key) {
      try {
        await deleteImage(photo.storage_key);
      } catch (cleanupError) {
        console.error("[DELETE /api/photos] UploadThing cleanup failed", cleanupError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, "DELETE /api/photos/[id]");
  }
}
