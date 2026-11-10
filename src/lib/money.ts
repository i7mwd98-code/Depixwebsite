/** All amounts are whole fils. */
export function formatMoney(fils: number, locale: string): string {
  const amount = fils / 100;
  const digits = Number.isInteger(amount) ? 0 : 2;
  const number = new Intl.NumberFormat("en-AE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  }).format(amount);
  return locale === "ar" ? `${number} د.إ` : `AED ${number}`;
}

export const aed = (dirhams: number) => Math.round(dirhams * 100);
