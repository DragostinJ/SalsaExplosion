import { redirect } from "next/navigation";

export const metadata = {
  title: "Dance Passes & Vouchers | Salsa Explosion Bournemouth",
  description:
    "Gift vouchers and official festival passes for Salsa Explosion at BOH Studios Bournemouth. Weekly classes paid at the door.",
};

export default function ShopPage() {
  redirect("/pricing");
}
