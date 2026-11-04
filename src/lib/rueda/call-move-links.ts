/**
 * Links each call in the /rueda dictionary to its full steps in the move library. The dictionary
 * has no ids, so calls are matched by name ("Enchufla (Enchufe)" -> enchufla). A few calls share
 * one library entry, listed below.
 */

/** Calls the move library covers in a combined entry (its name lists them together). */
const SHARED_ENTRIES: Record<string, string> = {
  dedo: "dedo-el-uno-el-dos",
  "el-uno": "dedo-el-uno-el-dos",
  "el-dos": "dedo-el-uno-el-dos",
  siete: "siete-y-siete-loco",
  "siete-loco": "siete-y-siete-loco",
  "coca-cola": "coca-cola-y-bayamo",
  bayamo: "coca-cola-y-bayamo",
  "rueda-cruzada": "rueda-cruzada-pa-fuera",
  "pa-fuera": "rueda-cruzada-pa-fuera",
  "micro-leading": "micro-leading-frame-modulation",
  "contrapunto-on1-on2": "mid-figure-rhythm-reversals",
};

/** "Príncipe Bueno / Príncipe Malo" -> "principe-bueno-principe-malo"; parentheses are dropped. */
export function callSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The move page for a dictionary call, or null when the library has no entry for it yet. */
export function moveIdForCall(name: string, moveIds: ReadonlySet<string>): string | null {
  const slug = callSlug(name);
  if (moveIds.has(slug)) return slug;
  const shared = SHARED_ENTRIES[slug];
  return shared && moveIds.has(shared) ? shared : null;
}
