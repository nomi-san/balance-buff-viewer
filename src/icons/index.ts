import icons, { mime } from 'virtual:icons'

const cache: Record<string, { blob: Blob, url: string }> = {};

for (const key in icons) {
  const bytes = new Uint8Array(icons[key]);
  const blob = new Blob([bytes], { type: mime });
  cache[key] = {
    blob,
    url: URL.createObjectURL(blob)
  };
}

// @ts-ignore
window[Symbol('stats-icons')] = cache;

export const getIconUrl = (key: string): string => cache[key].url;