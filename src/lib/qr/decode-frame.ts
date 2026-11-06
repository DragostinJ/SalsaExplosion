import jsQR from "jsqr";

/** Reads a QR code from raw image data. Kept in its own module so the decoder only loads when the camera opens. */
export function decodeQrFromRgba(data: Uint8ClampedArray, width: number, height: number): string | null {
  const result = jsQR(data, width, height, { inversionAttempts: "dontInvert" });
  return result?.data ? result.data : null;
}
