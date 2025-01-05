export function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(
    price
  );
}

export function parsePrice(input: string): number {
  const cleanInput = input.replace(/[^\dkKmM]/g, "").toLowerCase();
  let multiplier = 1;

  if (cleanInput.endsWith("k")) {
    multiplier = 1000;
  } else if (cleanInput.endsWith("m")) {
    multiplier = 1000000;
  }

  const numericValue = parseInt(cleanInput.replace(/[km]/g, ""), 10);
  return isNaN(numericValue) ? 0 : numericValue * multiplier;
}

export function formatPriceWithCurrency(
  price: number,
  listingType?: string
): string {
  const formattedPrice = formatPrice(price);
  return `${
    listingType === "sports-player-listing" ? "€" : "₺"
  }${formattedPrice}`;
}
