export const DONATION_PRESETS = [1000, 3000, 5000, 10000] as const;

export const DONATION_MIN_AMOUNT = 500;
export const DONATION_MAX_AMOUNT = 1_000_000;

export function isValidDonationAmount(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= DONATION_MIN_AMOUNT &&
    value <= DONATION_MAX_AMOUNT
  );
}
