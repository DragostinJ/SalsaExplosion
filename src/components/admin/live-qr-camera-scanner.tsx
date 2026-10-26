"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, CameraOff, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveQrCameraScannerProps {
  onDetected: (scannedCode: string) => void;
  className?: string;
  buttonLabel?: string;
}

export function LiveQrCameraScanner({
  onDetected,
  className = "",
  buttonLabel = "Open Camera Scanner",
}: LiveQrCameraScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const handleScanSuccess = useCallback(
    (code: string) => {
      const cleanCode = code.trim();
      if (!cleanCode) return;
      setLastScanned(cleanCode);
      onDetected(cleanCode);
      // Small pause before closing or next scan
      setTimeout(() => {
        stopCamera();
        setIsOpen(false);
      }, 1200);
    },
    [onDetected, stopCamera]
  );

  const startCamera = async () => {
    setErrorMsg(null);
    setLastScanned(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
      setErrorMsg("Camera access is not supported on this browser. Use manual search below.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Check if native BarcodeDetector API is available (modern Android Chrome, iOS 17+)
      const hasBarcodeDetector = "BarcodeDetector" in window;

      if (hasBarcodeDetector) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ["qr_code"],
        });

        intervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              handleScanSuccess(barcodes[0].rawValue);
            }
          } catch {
            // Ignore frame decode errors
          }
        }, 300);
      }
    } catch (err) {
      console.warn("[LiveQrCameraScanner] Camera error:", err);
      const isDenied = err instanceof DOMException && err.name === "NotAllowedError";
      setErrorMsg(
        isDenied
          ? "Camera permission was denied. Please allow camera access in your browser settings or type the code below."
          : "Could not activate camera. Please ensure no other app is using it, or use manual entry below."
      );
      stopCamera();
    }
  };

  const toggleScanner = () => {
    if (isOpen) {
      stopCamera();
      setIsOpen(false);
      setErrorMsg(null);
    } else {
      setIsOpen(true);
      void startCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={toggleScanner}
          variant={isOpen ? "secondary" : "default"}
          className={`min-h-11 font-extrabold text-xs shadow-md transition-all ${
            isOpen
              ? "bg-muted text-foreground"
              : "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white"
          }`}
          data-testid="toggle-camera-scanner-btn"
        >
          {isOpen ? (
            <>
              <CameraOff className="mr-1.5 h-4 w-4" />
              Close Camera
            </>
          ) : (
            <>
              <Camera className="mr-1.5 h-4 w-4" />
              {buttonLabel}
            </>
          )}
        </Button>

        {isOpen && (
          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Rear Camera Scanning Active
          </span>
        )}
      </div>

      {isOpen && (
        <div
          className="relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-surface-2 p-4 text-ivory shadow-xl max-w-sm"
          data-testid="camera-scanner-viewport"
        >
          {lastScanned ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
              <p className="text-sm font-black text-emerald-300">
                Pass Verified!
              </p>
              <code className="text-xs bg-white/10 px-2 py-1 rounded font-mono text-white block">
                {lastScanned}
              </code>
            </div>
          ) : errorMsg ? (
            <div className="py-4 space-y-3">
              <div className="flex items-start gap-2 text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
              <div className="pt-2 border-t border-white/10 text-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleScanSuccess("RF-PASS-SOFIA-001")}
                  className="text-xs border-amber-400/40 bg-white/5 text-amber-200 hover:bg-white/10"
                >
                  Simulate QR Pass Scan (Test Demo)
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black border border-white/20 flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
                />

                {!cameraActive && isSupported && (
                  <div className="text-center p-4 text-xs text-stone-400">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-stone-500 animate-pulse" />
                    Starting camera stream...
                  </div>
                )}

                {/* Target Reticle Overlay */}
                <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-dashed border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center">
                  <div className="h-1 w-full bg-amber-400/50 animate-pulse" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span>Align student&apos;s phone QR inside box</span>
                <button
                  type="button"
                  onClick={() => handleScanSuccess("RF-PASS-SOFIA-001")}
                  className="text-amber-300 underline font-semibold hover:text-amber-200"
                >
                  Test Demo Scan
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
