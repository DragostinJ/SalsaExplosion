import { redirect } from "next/navigation";

export const metadata = {
  title: "Dance Passes & Vouchers | Salsa Explosion Bournemouth",
  description:
    "Gift vouchers, flexible class passes, and unlimited monthly salsa memberships at BOH Studios Bournemouth.",
};

export default function ShopPage() {
  redirect("/pricing");
}
