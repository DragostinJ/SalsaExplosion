import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { ClaveMark } from "@/components/poster/poster-art";
import { POSTER_BUTTON, POSTER_BUTTON_COLORS, POSTER_INK, halftone } from "@/components/poster/poster-kit";
import { ScannableQrCode } from "@/components/ui/scannable-qr-code";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { SONG_COUNT, VENUE_INFO } from "@/lib/site-content";
import { PrintButton } from "./print-button";

export const metadata = {
  title: "Cartel de pared: practise the songs",
  robots: { index: false },
};

const GRAPHICS = MEDIA_MANIFEST.mockupGraphics;
const ART = [GRAPHICS.trumpet, GRAPHICS.couple, GRAPHICS.conga, GRAPHICS.rueda] as const;

/**
 * The A3 wall poster for BOH Studios: a QR code to the song list. It points at whichever
 * address the poster was opened from, so a printed copy always reaches the live site.
 */
export default async function WallPosterPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "salsaexplosion.co.uk";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const songsUrl = `${protocol}://${host}/music`;

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl space-y-6 px-4 py-6 print:max-w-none print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/cartel" className="inline-flex min-h-[40px] items-center text-sm font-bold uppercase underline underline-offset-4">
          ← Carteles
        </Link>
        <PrintButton />
      </div>

      {/* The sheet: A3 proportions; every size is a share of its width (cqw), so screen and print match */}
      <article className="poster-sheet @container relative mx-auto aspect-[297/420] w-full overflow-hidden border-4 border-ink bg-paper text-ink print:w-[297mm] print:border-0">
        <div aria-hidden="true" className="absolute -right-[18cqw] -top-[12cqw] h-[70cqw] w-[70cqw] rounded-full bg-poster-red" />
        <div aria-hidden="true" className="absolute left-0 top-[27cqw] h-[15cqw] w-[62cqw]" style={halftone(POSTER_INK.mustard)} />

        <div className="relative flex h-full flex-col p-[6cqw]">
          <p className="text-[2.4cqw] font-bold uppercase tracking-[0.3em]">
            Salsa Explosion · {VENUE_INFO.shortName}
          </p>
          <h1 className="mt-[2cqw] text-[19cqw] leading-[0.84]">
            Practica
            <br />
            en casa
          </h1>
          <p className="mt-[3cqw] max-w-[60cqw] text-[3.6cqw] font-bold leading-snug">
            Practise the class songs at home: every section, what to dance now and what&apos;s next.
          </p>

          <div className="mt-auto flex items-end justify-between gap-[4cqw]">
            <div className="flex-1">
              <p className="font-display text-[9cqw] leading-none">Escanea</p>
              <p className="mt-[1cqw] text-[3cqw] font-bold uppercase">Scan with your phone camera</p>
              <p className="mt-[2cqw] text-[2.6cqw] font-semibold">
                {SONG_COUNT} songs · Thursdays &amp; Sundays
                <br />
                {songsUrl.replace(/^https?:\/\//, "")}
              </p>
            </div>
            <ScannableQrCode value={songsUrl} size={400} className="w-[42cqw] [&_svg]:h-auto [&_svg]:w-full" />
          </div>

          <ul className="mt-[5cqw] grid grid-cols-4 border-t-[1cqw] border-ink pt-[2cqw]" aria-hidden="true">
            {ART.map((art) => (
              <li key={art.src} className="flex justify-center">
                <Image src={art.src} alt="" width={art.width} height={art.height} sizes="25vw" className="w-[18cqw]" />
              </li>
            ))}
          </ul>
          <ClaveMark color={POSTER_INK.ink} className="mt-[2cqw] h-[3cqw] w-[30cqw]" />
        </div>
      </article>

      <p className="text-sm print:hidden">
        Prints edge to edge on A3 (also fine on A4: choose &quot;fit to page&quot;). Test the QR with your phone before you pin it up.
      </p>
      <Link href="/music" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} print:hidden`}>
        Check where the QR goes
      </Link>
    </main>
  );
}
