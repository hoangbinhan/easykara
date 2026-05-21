/**
 * Formats seconds into ASS time format: H:MM:SS.cs (e.g. 0:01:23.45)
 */
export const formatASSTime = (secs: number): string => {
  if (secs < 0) secs = 0;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const cs = Math.round((secs % 1) * 100);
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0').slice(0, 2)}`;
};

/**
 * Formats seconds into LRC time format: MM:SS.xx (e.g. 01:23.45)
 */
export const formatLRCTime = (secs: number): string => {
  if (secs < 0) secs = 0;
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const xx = Math.round((secs % 1) * 100);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${xx.toString().padStart(2, '0').slice(0, 2)}`;
};

/**
 * Formats seconds into SRT time format: HH:MM:SS,ms (e.g. 00:01:23,450)
 */
export const formatSRTTime = (secs: number): string => {
  if (secs < 0) secs = 0;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const ms = Math.round((secs % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
};

/**
 * Converts a standard hex color string (#RRGGBB or #RGB) into an ASS-compatible hex ABGR string (e.g., &H00BBGGRR&)
 */
export const hexToASSColor = (hex: string): string => {
  let r = 'FF', g = 'FF', b = 'FF';
  if (hex.startsWith('#')) {
    if (hex.length === 7) {
      r = hex.substring(1, 3);
      g = hex.substring(3, 5);
      b = hex.substring(5, 7);
    } else if (hex.length === 4) {
      r = hex[1] + hex[1];
      g = hex[2] + hex[2];
      b = hex[3] + hex[3];
    }
  }
  // ASS format: &H00BBGGRR& (ABGR with 00 alpha)
  return `&H00${b}${g}${r}&`;
};
