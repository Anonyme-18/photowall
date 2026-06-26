import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { apiError } from "@/lib/api/errors";
import {
  rowToPhoto,
  randomPhotoPosition,
  uploadPhotoImage,
  uploadPhotoBuffer,
  type PhotoRow,
} from "@/lib/db/photos";
import {
  hasRotationColumn,
  isRotationSchemaError,
  omitRotationIfMissing,
  photoSelectColumns,
} from "@/lib/db/photoSchema";

async function resolveImageUrl(
  id: string,
  url: string | undefined,
  imageFile: File | Blob | null,
): Promise<string> {
  if (imageFile && imageFile.size > 0) {
    const contentType = imageFile.type || "image/jpeg";
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    return uploadPhotoBuffer(buffer, contentType, id);
  }

  if (!url) {
    throw new Error("Image requise");
  }

  if (url.startsWith("data:image/")) {
    return uploadPhotoImage(url, id);
  }

  return url;
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const columns = await photoSelectColumns(supabase);
    const { data, error } = await supabase
      .from("photos")
      .select(columns)
      .order("timestamp", { ascending: false });

    if (error) throw error;

    const photos = (data as unknown as PhotoRow[]).map(rowToPhoto);
    return NextResponse.json({ photos });
  } catch (err) {
    return apiError(err, "GET /api/photos");
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let url: string | undefined;
    let author = "";
    let aspectRatio = 1.333;
    let accentColor: string | undefined;
    let x: number | undefined;
    let y: number | undefined;
    let imageFile: File | Blob | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      imageFile = form.get("image") as File | null;
      author = String(form.get("author") ?? "").trim();
      const ratio = form.get("aspectRatio");
      if (ratio != null) aspectRatio = Number(ratio) || 1.333;
      const color = form.get("accentColor");
      if (typeof color === "string" && color) accentColor = color;
      const rawX = form.get("x");
      const rawY = form.get("y");
      if (rawX != null && rawY != null) {
        x = Number(rawX);
        y = Number(rawY);
      }
    } else {
      const body = await request.json();
      ({
        url,
        author = "",
        aspectRatio = 1.333,
        accentColor,
        x,
        y,
      } = body as {
        url?: string;
        author?: string;
        aspectRatio?: number;
        accentColor?: string;
        x?: number;
        y?: number;
      });
      author = author?.trim() ?? "";
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pos = x != null && y != null ? { x, y } : randomPhotoPosition();
    const finalUrl = await resolveImageUrl(id, url, imageFile);

    const supabase = getSupabaseAdmin();
    const row = await omitRotationIfMissing(supabase, {
      id,
      url: finalUrl,
      author,
      timestamp: new Date().toISOString(),
      hidden: false,
      aspect_ratio: aspectRatio ?? 1.333,
      accent_color: accentColor ?? null,
      x: pos.x,
      y: pos.y,
      rotation: 0,
    });

    const { data, error } = await supabase.from("photos").insert(row).select("*").single();

    if (error) throw error;

    return NextResponse.json({ photo: rowToPhoto(data as PhotoRow) }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/photos");
  }
}
