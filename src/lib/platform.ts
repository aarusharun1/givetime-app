export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as unknown as Record<string, unknown>;
  const cap = win.Capacitor as Record<string, unknown> | undefined;
  return !!cap?.isNativePlatform;
}
