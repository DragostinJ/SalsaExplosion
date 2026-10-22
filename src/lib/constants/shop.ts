export interface CatalogShopItem {
  id: string;
  name: string;
  category: "APPAREL" | "ACCESSORY" | "FOOTWEAR" | "VOUCHER";
  pricePounds: number;
  description: string;
  features: string[];
  sizes?: string[];
  gradient: string;
  badge: string;
}

export const SHOP_CATALOG: Record<string, CatalogShopItem> = {
  voucher: {
    id: "voucher",
    name: "Cuban Salsa Dance Gift Voucher",
    category: "VOUCHER",
    pricePounds: 35,
    description:
      "Looking for a gift that’s a little different? Why not give your friends or family the gift of Cuban Salsa! Perfect for Birthday, Christmas, or any special occasion across Bournemouth, Boscombe & Poole.",
    features: [
      "Valid for weekly Cuban Salsa group classes in Bournemouth & Poole",
      "Redeemable for 12 months with Maestro Enrique & teaching team",
      "Physical presentation certificate or direct digital voucher",
      "Direct telephone ordering available on 07969 633701",
    ],
    gradient: "from-rose-600 via-amber-600 to-yellow-500",
    badge: "The Perfect Gift",
  },
  hoodie: {
    id: "hoodie",
    name: "Salsa Explosion Official Zip Hoodie",
    category: "APPAREL",
    pricePounds: 40,
    description:
      "Premium heavy-weight fleece hoodie featuring embroidered Salsa Explosion UK Cuban crest on chest and Havana Clave print on back.",
    features: [
      "80% organic cotton, 20% recycled poly",
      "Reinforced zipper & fleece-lined hood",
      "Perfect warm-up gear before BOH Studios classes",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    gradient: "from-amber-600 via-orange-600 to-rose-700",
    badge: "Bestseller",
  },
  tshirt: {
    id: "tshirt",
    name: "Bournemouth Summer Congress 2026 Festival Tee",
    category: "APPAREL",
    pricePounds: 20,
    description:
      "Commemorative 2026 Bournemouth Cuban Congress festival t-shirt featuring guest artist lineup and vibrant Havana artwork.",
    features: [
      "100% breathable ringspun cotton",
      "Screen-printed in Dorset, UK",
      "Pre-shrunk for durability through social washes",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    gradient: "from-orange-600 via-amber-700 to-yellow-600",
    badge: "Official Congress Merch",
  },
  abanico: {
    id: "abanico",
    name: "Hand-Crafted Cuban Flag Abanico (Dance Fan)",
    category: "ACCESSORY",
    pricePounds: 12,
    description:
      "Essential for surviving high-energy Thursday & Sunday social nights and hot congress workshops. Heavy-duty wooden ribs with authentic Cuban flag silk.",
    features: [
      "Durable bamboo frame with silk fabric",
      "Snap-open sound for dramatic dance accents",
      "Fits perfectly in clutch or back pocket",
    ],
    gradient: "from-rose-600 via-blue-700 to-amber-700",
    badge: "Social Floor Essential",
  },
  shoes: {
    id: "shoes",
    name: "Cuban Casino Suede-Sole Practice Dance Shoes",
    category: "FOOTWEAR",
    pricePounds: 55,
    description:
      "Specially calibrated suede-soled practice sneakers for Canadian maple sprung floors. Provides effortless pivot spinning without slipping.",
    features: [
      "Genuine split suede chrome sole",
      "Shock-absorbing cushioned heel padding",
      "Protects knees & ankles during fast Rueda turns",
    ],
    sizes: ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    gradient: "from-slate-800 via-zinc-700 to-amber-900",
    badge: "Pro Dancer Choice",
  },
};
