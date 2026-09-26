import { NextResponse } from "next/server";
import { getNeon } from "@/lib/db/neon";
import { apiError } from "@/lib/api/errors";
import {
  rowToPhoto,
  randomPhotoPosition,
  uploadPhotoImage,
  uploadPhotoBuffer,
  type PhotoRow,
} from "@/lib/db/photos";
import { createOwnerToken, ownerCookieName } from "@/lib/admin/auth";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_AUTHOR_LENGTH = 80;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function validNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function validateUrl(value: string): string {
  if (value.length > 2048) throw new Error("URL d'image trop longue");
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
  } catch {
    throw new Error("URL d'image invalide");
  }
  return value;
}

function validateAccentColor(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error("Couleur invalide");
  return value;
}

async function resolveImageUrl(
  id: string,
  url: string | undefined,
  imageFile: File | Blob | null,
): Promise<{ url: string; key: string | null }> {
  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > MAX_IMAGE_BYTES || !ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
      throw new Error("Image invalide ou trop lourde (JPG, PNG ou WebP de 10 Mo maximum)");
    }
    const contentType = imageFile.type || "image/jpeg";
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const uploaded = await uploadPhotoBuffer(buffer, contentType, id);
    return { url: uploaded.url, key: uploaded.key };
  }

  if (!url) {
    throw new Error("Image requise");
  }

  if (url.startsWith("data:image/")) {
    if (url.length > 14 * 1024 * 1024) throw new Error("Image trop lourde");
    const uploaded = await uploadPhotoImage(url, id);
    return { url: uploaded.url, key: uploaded.key };
  }

  return { url: validateUrl(url), key: null };
}

export async function GET() {
  try {
    const sql = getNeon();
    const data = await sql`SELECT id, url, storage_key, author, timestamp, hidden, aspect_ratio, accent_color, x, y, rotation FROM photos ORDER BY timestamp DESC`;
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
      const candidate = form.get("image");
      imageFile = candidate instanceof File ? candidate : null;
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

    if (author.length > MAX_AUTHOR_LENGTH) throw new Error("Nom trop long");
    if (!validNumber(aspectRatio, 0.1, 10)) throw new Error("Format d'image invalide");
    if (x !== undefined && !validNumber(x, -100000, 100000)) throw new Error("Position X invalide");
    if (y !== undefined && !validNumber(y, -100000, 100000)) throw new Error("Position Y invalide");
    accentColor = validateAccentColor(accentColor);

    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pos = x != null && y != null ? { x, y } : randomPhotoPosition();
    const image = await resolveImageUrl(id, url, imageFile);
    const sql = getNeon();
    const [data] = await sql`
      INSERT INTO photos (id, url, storage_key, author, timestamp, hidden, aspect_ratio, accent_color, x, y, rotation)
      VALUES (${id}, ${image.url}, ${image.key}, ${author}, ${new Date().toISOString()}, false, ${aspectRatio}, ${accentColor ?? null}, ${pos.x}, ${pos.y}, 0)
      RETURNING id, url, storage_key, author, timestamp, hidden, aspect_ratio, accent_color, x, y, rotation
    `;

    const response = NextResponse.json({ photo: rowToPhoto(data as PhotoRow) }, { status: 201 });
    response.cookies.set(ownerCookieName(id), createOwnerToken(id), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  } catch (err) {
    return apiError(err, "POST /api/photos");
  }
}
