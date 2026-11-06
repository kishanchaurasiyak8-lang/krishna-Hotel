export const STAY_TAX_RATE = 0.12;
export const FOOD_TAX_RATE = 0.05;

const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(amount: number): string {
  return rupeeFormatter.format(amount);
}

export function withStayTax(amount: number): number {
  return Math.round(amount * (1 + STAY_TAX_RATE));
}
