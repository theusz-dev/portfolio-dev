const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

/**
 * Bytes and extension to save for an image. PNG and JPEG become WebP when the
 * webview can encode it and the result is smaller; everything else is kept
 * as it is.
 */
export async function prepareImage(file: File): Promise<{ bytes: Uint8Array; ext: string }> {
  const ext = EXT[file.type] ?? file.name.split(".").pop()?.toLowerCase() ?? "png";
  const original = { bytes: new Uint8Array(await file.arrayBuffer()), ext };
  if (ext !== "png" && ext !== "jpg") return original;
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return original;
    return { bytes: new Uint8Array(await blob.arrayBuffer()), ext: "webp" };
  } catch {
    return original;
  }
}

/** Alt text guess from a file name: "Captura de tela 2026.png" → "Captura de tela 2026". */
export function altFromName(name: string) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return /^(image|imagem|screenshot|captura de tela|pasted)\b/i.test(base) || /^\d+$/.test(base) ? "" : base;
}
