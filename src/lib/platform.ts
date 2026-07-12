export function isNativePlatform(): boolean {
  return (
    typeof window !== "undefined" &&
    !!(window as Record<string, unknown>).Capacitor &&
    !!(
      (window as Record<string, unknown>).Capacitor as Record<string, unknown>
    )?.isNativePlatform
  );
}
