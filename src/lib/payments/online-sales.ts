/**
 * Whether the site may sell festival passes online right now.
 *
 * On the live site a Stripe test key means no real money can move: a dancer's real card is simply
 * declined at checkout. So until the school's own live key is set, passes are paid at the door.
 * Local and preview builds may use a test key, which is how checkout gets tested.
 */
export function onlineTicketSalesOpen(env: Record<string, string | undefined> = process.env): boolean {
  const key = env.STRIPE_SECRET_KEY ?? "";
  if (!key || key.includes("placeholder") || key.includes("...")) return false;
  if (env.VERCEL_ENV === "production") return key.startsWith("sk_live_") || key.startsWith("rk_live_");
  return true;
}
