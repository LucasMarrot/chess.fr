export function hexToRgb(color: string): { r: number; g: number; b: number } | null {
  const normalized = color.replace('#', '').trim();

  if (normalized.length !== 3 && normalized.length !== 6) {
    return null;
  }

  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : normalized;

  const intVal = Number.parseInt(full, 16);
  if (Number.isNaN(intVal)) return null;

  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
}

export function withAlpha(color: string, alpha: number): string {
  const safeAlpha = Math.max(0, Math.min(1, alpha));

  if (color.startsWith('#')) {
    const rgb = hexToRgb(color);
    if (rgb) {
      return `rgba(${rgb.r},${rgb.g},${rgb.b},${safeAlpha})`;
    }
  }

  return color;
}
