export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as unknown as Record<string, unknown>;
  const cap = win.Capacitor as Record<string, unknown> | undefined;
  if (!cap) return false;

  // Capacitor.isNativePlatform is a FUNCTION. The previous version did
  // `!!cap?.isNativePlatform`, which is truthy for the function itself and
  // would report "native" on the web as soon as any Capacitor module put
  // window.Capacitor in scope. Call it properly and fall back to false.
  const fn = cap.isNativePlatform;
  if (typeof fn === "function") {
    try {
      return (fn as () => boolean)() === true;
    } catch {
      return false;
    }
  }

  return cap.platform === "ios" || cap.platform === "android";
}
