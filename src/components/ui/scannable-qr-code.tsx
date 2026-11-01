import React from "react";
import QRCode from "qrcode";

interface ScannableQrCodeProps {
  value: string;
  size?: number;
  className?: string;
  label?: string;
}

/** Modules of empty margin around the code (the QR spec asks for 4) */
const QUIET_ZONE = 4;

/**
 * A real, camera-readable QR code (ISO/IEC 18004, error correction M) drawn as one SVG path.
 * The door scanner (BarcodeDetector) reads it from a phone screen. It used to be a QR-looking
 * pattern hashed from the value, which no camera could decode.
 */
export function ScannableQrCode({
  value,
  size = 140,
  className = "",
  label,
}: ScannableQrCodeProps) {
  const { path, extent } = React.useMemo(() => {
    const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
    const count = modules.size;
    let d = "";
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (modules.get(row, col)) d += `M${col + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`;
      }
    }
    return { path: d, extent: count + QUIET_ZONE * 2 };
  }, [value]);

  return (
    <div
      data-testid="scannable-qr-code"
      className={`inline-flex flex-col items-center justify-center border-2 border-ink p-2 ${className}`}
      style={{ backgroundColor: "#FFFFFF", color: "#161311" }}
    >
      <svg
        viewBox={`0 0 ${extent} ${extent}`}
        width={size}
        height={size}
        className="block"
        shapeRendering="crispEdges"
        role="img"
        aria-label={label || `QR Code for ${value}`}
      >
        <rect width={extent} height={extent} fill="#FFFFFF" />
        <path d={path} fill="#161311" />
      </svg>
      {label && (
        <span className="mt-1 font-mono text-xs font-bold tracking-wider" style={{ color: "#161311" }}>
          {label}
        </span>
      )}
    </div>
  );
}
