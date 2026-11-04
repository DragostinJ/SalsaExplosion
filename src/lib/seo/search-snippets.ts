/** Search results show about 60 characters of a title and 155 of a description. */
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;
const BRAND = " | Salsa Explosion";

/**
 * A move page title that fits a search result: "Name: how to dance it | Salsa Explosion" when it
 * fits, then without the brand, then the name alone. `absolute` skips the site's title template.
 */
export function moveTitle(name: string): { absolute: string } {
  const full = `${name}: how to dance it${BRAND}`;
  if (full.length <= TITLE_MAX) return { absolute: full };
  const noBrand = `${name}: how to dance it`;
  if (noBrand.length <= TITLE_MAX) return { absolute: noBrand };
  return { absolute: name };
}

/** Any page title: through the site template (" | Salsa Explosion") when that fits, else on its own. */
export function fitTitle(title: string): string | { absolute: string } {
  return `${title}${BRAND}`.length <= TITLE_MAX ? title : { absolute: title };
}

/** Cuts at the last whole word that fits and adds "…", instead of slicing mid-word. */
export function clampDescription(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.·–-]+$/, "")}…`;
}
