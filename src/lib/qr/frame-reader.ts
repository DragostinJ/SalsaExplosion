interface DetectedBarcode {
  rawValue?: string;
}

interface BarcodeDetectorLike {
  detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats: string[] }): BarcodeDetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export type QrFrameReader = (video: HTMLVideoElement) => Promise<string | null>;

/** Frames this wide are plenty for a code held up to the camera, and quick to scan on an older phone. */
const MAX_FRAME_WIDTH = 640;

/**
 * Picks how to read QR codes from the camera. Android Chrome has a built-in detector. iPhones,
 * Firefox and desktop browsers don't, so they use a small decoder that loads when the camera opens.
 */
export async function createQrFrameReader(): Promise<QrFrameReader> {
  const Detector = typeof window === "undefined" ? undefined : window.BarcodeDetector;
  if (Detector) {
    const formats = await Detector.getSupportedFormats?.().catch(() => [] as string[]);
    if (!formats || formats.includes("qr_code")) {
      const detector = new Detector({ formats: ["qr_code"] });
      return async (video) => {
        try {
          const found = await detector.detect(video);
          return found[0]?.rawValue ?? null;
        } catch {
          return null;
        }
      };
    }
  }

  const { decodeQrFromRgba } = await import("@/lib/qr/decode-frame");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  return async (video) => {
    if (!context || video.videoWidth === 0) return null;
    const scale = Math.min(1, MAX_FRAME_WIDTH / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = context.getImageData(0, 0, canvas.width, canvas.height);
    return decodeQrFromRgba(frame.data, frame.width, frame.height);
  };
}
