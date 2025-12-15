export function qrBlobToObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url?: string | null) {
  if (!url) return;
  try {
    URL.revokeObjectURL(url);
  } catch {}
}
