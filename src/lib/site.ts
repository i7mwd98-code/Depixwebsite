/** Shop-wide settings. Placeholders until the owner supplies real details. */
export const site = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "971500000000",
  phone: process.env.NEXT_PUBLIC_SHOP_PHONE ?? "+971 50 000 0000",
  email: process.env.NEXT_PUBLIC_SHOP_EMAIL ?? "hello@example.com",
};

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
