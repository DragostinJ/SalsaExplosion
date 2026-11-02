import Image from "next/image";
import Link from "next/link";
import { KICKER, POSTER_BUTTON, POSTER_BUTTON_COLORS, TYPE } from "@/components/poster/poster-kit";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

const RECORD = MEDIA_MANIFEST.mockupGraphics.record;

/** 404 as a small poster: the record skipped, so back to count 1. */
export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto grid min-h-[75vh] max-w-5xl items-center gap-8 px-4 py-12 md:grid-cols-2">
      <div className="relative mx-auto w-64 md:w-full">
        <div aria-hidden="true" className="absolute inset-[12%] rounded-full bg-poster-red" />
        <Image
          src={RECORD.src}
          alt={RECORD.alt}
          width={RECORD.width}
          height={RECORD.height}
          sizes="(max-width: 768px) 16rem, 40vw"
          className="relative w-full rotate-12"
          priority
        />
      </div>
      <div>
        <p className={KICKER}>404 · page not found</p>
        <h1 className={`mt-3 ${TYPE.section}`}>
          Se rayó el disco
          <span className="mt-3 block font-sans text-lg font-bold normal-case leading-snug tracking-normal">The record skipped</span>
        </h1>
        <p className="mt-4 max-w-md text-lg font-medium">
          We couldn&apos;t find that page. In casino, when you lose the count you go back to the basic step and wait for
          the 1. Pick a door:
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/classes" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink}`}>
            Clases
          </Link>
          <Link href="/music" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper`}>
            Canciones
          </Link>
          <Link href="/events" className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.outline} bg-paper`}>
            Fiestas
          </Link>
        </div>
      </div>
    </main>
  );
}
