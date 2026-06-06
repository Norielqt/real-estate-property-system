/**
 * Resolve a property image path to a displayable URL.
 * Handles:
 *  - Full external URLs (Unsplash, etc.)  → returned as-is
 *  - Frontend static assets (/images/…)   → returned as-is (served by Vite/host)
 *  - Local storage paths                  → prefixed with {API_URL}/storage/
 *  - null / undefined                     → returns placeholder
 */
export const PLACEHOLDER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export function imgUrl(path) {
  if (!path) return PLACEHOLDER;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/images/')) return path;
  return `${API_URL}/storage/${path}`;
}
