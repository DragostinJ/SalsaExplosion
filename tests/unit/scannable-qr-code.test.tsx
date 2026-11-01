import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QRCode from "qrcode";
import { ScannableQrCode } from "@/components/ui/scannable-qr-code";

describe("ScannableQrCode draws a real QR code", () => {
  it("draws exactly the dark modules of the encoded value, inside a 4-module quiet zone", () => {
    const value = "RF-PASS-7F3A9C21";
    const html = renderToStaticMarkup(<ScannableQrCode value={value} />);
    const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
    const extent = modules.size + 8;

    expect(html).toContain(`viewBox="0 0 ${extent} ${extent}"`);
    const drawn = html.match(/M\d+ \d+h1v1h-1z/g) ?? [];
    const dark = Array.from(modules.data).filter(Boolean).length;
    expect(drawn).toHaveLength(dark);
    // Top-left finder pattern: its first module sits right after the quiet zone
    expect(html).toContain("M4 4h1v1h-1z");
  });

  it("encodes different passes differently", () => {
    const a = renderToStaticMarkup(<ScannableQrCode value="RF-PASS-AAAA0001" />);
    const b = renderToStaticMarkup(<ScannableQrCode value="RF-PASS-AAAA0002" />);
    expect(a).not.toBe(b);
  });
});
