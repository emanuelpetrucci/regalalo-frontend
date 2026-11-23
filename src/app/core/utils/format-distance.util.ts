/** Convierte metros a kilómetros con redondeo coherente con el prototipo (DistChip). */
export function formatDistanceKm(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) {
    return '—';
  }
  const km = meters / 1000;
  if (km < 10) {
    const rounded = Math.round(km * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }
  return String(Math.round(km));
}
