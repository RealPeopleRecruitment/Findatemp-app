// Pay rate rules for temp profiles.
// Temps enter only their lowest hourly rate. The top of their range is
// worked out for them so every profile shows a realistic, narrow range.

export const MINIMUM_WAGE = 14.15; // Irish National Minimum Wage (per hour)
export const MAX_START_RATE = 25; // highest "lowest rate" a temp can enter
export const RANGE_SPREAD = 1.5; // added on top of the lowest rate

// Lowest rate + €1.50, rounded up to the next 50 cent.
// e.g. 14.15 -> 16.00, 15.00 -> 16.50, 18.20 -> 20.00
export function calcPayMax(payMin: number): number {
  const cents = Math.round((payMin + RANGE_SPREAD) * 100);
  return Math.ceil(cents / 50) * 50 / 100;
}

export function formatRate(n: number): string {
  return `€${n.toFixed(2)}`;
}
