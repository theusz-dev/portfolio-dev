/**
 * Reads an "r g b" (or "r, g, b") custom property from an element's computed
 * style, as "r, g, b" for use inside `rgba(...)`. Cached per element and
 * refreshed at most twice a second, so canvases follow palette changes
 * without calling getComputedStyle on every frame.
 */
const cache = new WeakMap<Element, { at: number; values: Map<string, string> }>();

export function cssRgb(el: Element, name: string, fallback: string): string {
  const now = performance.now();
  let entry = cache.get(el);
  if (!entry || now - entry.at > 500) {
    entry = { at: now, values: new Map() };
    cache.set(el, entry);
  }
  let value = entry.values.get(name);
  if (value === undefined) {
    const raw = getComputedStyle(el).getPropertyValue(name).trim();
    value = raw ? raw.split(/[\s,]+/).join(", ") : fallback;
    entry.values.set(name, value);
  }
  return value;
}
