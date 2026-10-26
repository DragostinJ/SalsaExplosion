import type { DanceLevel, Role } from "@prisma/client";
import type { AttendedRecapItem } from "@/actions/recap.actions";

export type { AttendedRecapItem };

export interface ClassRecapVaultProps {
  initialRecaps: AttendedRecapItem[];
  allStudioRecaps?: AttendedRecapItem[];
  userRole?: Role | null;
  activeClassesForStaff?: Array<{ id: string; title: string; minLevel: DanceLevel }>;
}

export function getSafeVideoEmbed(rawUrl: string): { type: "youtube" | "html5" | "invalid"; safeUrl: string } {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { type: "invalid", safeUrl: "" };
    }

    const host = url.hostname.toLowerCase();
    // Validate YouTube
    if (host === "www.youtube.com" || host === "youtube.com" || host === "m.youtube.com") {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return { type: "youtube", safeUrl: `https://www.youtube-nocookie.com/embed/${v}` };
      }
      const match = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
      if (match) {
        return { type: "youtube", safeUrl: `https://www.youtube-nocookie.com/embed/${match[1]}` };
      }
    } else if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0]?.split("?")[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return { type: "youtube", safeUrl: `https://www.youtube-nocookie.com/embed/${id}` };
      }
    }

    // Direct video stream (mp4, webm, etc.) - must be HTTPS
    if (url.protocol === "https:") {
      return { type: "html5", safeUrl: url.toString() };
    }

    return { type: "invalid", safeUrl: "" };
  } catch {
    return { type: "invalid", safeUrl: "" };
  }
}

export const POPULAR_CUBAN_FIGURES = [
  "Guapea",
  "Dile Que No",
  "Enchufla",
  "Enchufla Doble",
  "Vacilala",
  "Setenta",
  "Sombrero",
  "Exhibela",
  "Prima con la Hermana",
  "Kentucky",
  "Evelyn",
  "Paseala",
] as const;

export function uploadFileToSignedUrl(
  signedUrl: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  if (signedUrl === "DEMO_DIRECT_BYPASS") {
    return new Promise((resolve) => {
      let pct = 15;
      onProgress(pct);
      const timer = setInterval(() => {
        pct += 25;
        if (pct >= 100) {
          clearInterval(timer);
          onProgress(100);
          resolve();
        } else {
          onProgress(pct);
        }
      }, 100);
    });
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status code ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during file upload"));
    };

    xhr.send(file);
  });
}
