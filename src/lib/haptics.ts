import { isNativePlatform } from "./platform";

export async function hapticLight() {
  if (!isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}

export async function hapticMedium() {
  if (!isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
}

export async function hapticSuccess() {
  if (!isNativePlatform()) return;
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
}

export async function nativeShare(title: string, text: string, url: string) {
  if (!isNativePlatform()) return false;
  try {
    const { Share } = await import("@capacitor/share");
    await Share.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}
