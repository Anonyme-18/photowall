const DEFAULT_HEADER_H = 64;
const DEFAULT_BOTTOMBAR_H = 72;

export function getHeaderHeight(): number {
  if (typeof window === "undefined") return DEFAULT_HEADER_H;
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--app-header-h");
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_HEADER_H;
}

export function getBottomBarHeight(): number {
  return DEFAULT_BOTTOMBAR_H;
}
