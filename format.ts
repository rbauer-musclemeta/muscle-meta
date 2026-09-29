/* One way to print a recorded value: "6 / 10" for ratings, "1450 ft" otherwise. */
export function formatValue(value: number, unit: string): string {
  const v = Number(value);
  return unit === '0-10' ? `${v} / 10` : `${v} ${unit}`;
}
