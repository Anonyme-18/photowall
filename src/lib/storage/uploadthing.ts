import { UTApi, UTFile } from "uploadthing/server";

let client: UTApi | null = null;

function getUploadThing(): UTApi {
  if (client) return client;
  if (!process.env.UPLOADTHING_TOKEN?.trim()) {
    throw new Error("UPLOADTHING_TOKEN is not configured");
  }
  client = new UTApi({ token: process.env.UPLOADTHING_TOKEN.trim(), logLevel: "Error" });
  return client;
}

export interface UploadedImage {
  url: string;
  key: string;
}

export async function uploadImage(buffer: Buffer, contentType: string, photoId: string): Promise<UploadedImage> {
  const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);
  const file = new UTFile([arrayBuffer], `${photoId}.${extension}`, {
    type: contentType,
    customId: photoId,
  });
  const result = await getUploadThing().uploadFiles(file, { acl: "public-read" });

  if (!result.data) {
    throw new Error("UploadThing upload failed");
  }

  return { url: result.data.ufsUrl, key: result.data.key };
}

export async function deleteImage(key: string): Promise<void> {
  await getUploadThing().deleteFiles(key);
}
