export const CURRENCY = "MAD";

export const formatMoney = (n: number | string | null | undefined) => {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
  }).format(isFinite(v) ? v : 0);
};

export const formatNumber = (n: number | string | null | undefined, digits = 2) => {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(isFinite(v) ? v : 0);
};
