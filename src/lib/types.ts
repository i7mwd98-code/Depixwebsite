export type Localized = { en: string; ar: string };

export type Category = "flowers" | "cakes" | "gifts";
export type Format = "bouquet" | "box" | "vase" | "bag" | "cake" | "gift";
export type Occasion =
  | "birthday"
  | "anniversary"
  | "love"
  | "newBaby"
  | "congratulations"
  | "getWell"
  | "thankYou";
export type Colour = "pink" | "red" | "white" | "yellow" | "purple" | "mixed";
export type Badge = "sameDay" | "bestSeller" | "new";

export type Variant = {
  id: string;
  name: Localized;
  /** Price in fils (1 AED = 100 fils), VAT included. */
  price: number;
};

export type Product = {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  includes: Localized;
  category: Category;
  format: Format;
  occasions: Occasion[];
  colour: Colour;
  /** Colours used to draw the placeholder artwork until real photos are added. */
  palette: string[];
  variants: Variant[];
  badges: Badge[];
  /** Hours the shop needs before this product can be delivered. */
  prepHours: number;
  isAddon: boolean;
  featured: boolean;
  /** Cakes only. */
  servings?: Localized;
};

export type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
  /** Text written on a cake. */
  inscription?: string;
};

export type DeliveryZone = {
  id: string;
  emirate: Localized;
  name: Localized;
  active: boolean;
  /** Fils. */
  fee: number;
  /** Order value in fils above which delivery is free; null means never free. */
  freeOver: number | null;
  sameDay: boolean;
  /** Last time of day (Dubai time, HH:MM) to order for delivery today. */
  cutoff: string;
};

export type TimeSlot = {
  id: string;
  label: Localized;
  /** Dubai time, HH:MM. */
  start: string;
  end: string;
};

export type Totals = {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  /** VAT already included in total. */
  vatIncluded: number;
};
