import { isNativePlatform } from "./platform";

const WEEKLY_REMINDER_ID = 1001;
const INACTIVITY_NUDGE_ID = 1002;
const MONTHLY_SUMMARY_ID = 1003;

/**
 * Request notification permission and schedule local notifications.
 * Call this when a user signs in on native.
 */
export async function setupNotifications() {
  if (!isNativePlatform()) return;

  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );

    // Request permission
    const { display } = await LocalNotifications.requestPermissions();
    if (display !== "granted") return;

    // Cancel any existing scheduled notifications before rescheduling
    await LocalNotifications.cancel({
      notifications: [
        { id: WEEKLY_REMINDER_ID },
        { id: INACTIVITY_NUDGE_ID },
        { id: MONTHLY_SUMMARY_ID },
      ],
    });

    // Schedule weekly logging reminder (every Sunday at 6pm)
    await LocalNotifications.schedule({
      notifications: [
        {
          id: WEEKLY_REMINDER_ID,
          title: "GiveTime",
          body: "Have you logged your volunteer hours this week?",
          schedule: {
            on: { weekday: 1, hour: 18, minute: 0 },
            repeats: true,
            every: "week",
            allowWhileIdle: true,
          },
        },
      ],
    });

    // Schedule inactivity nudge (14 days from now)
    scheduleInactivityNudge();

    // Schedule monthly summary notification (1st of next month at 9am)
    scheduleMonthlySummary();
  } catch {
    // Local notifications not available
  }
}

/**
 * Reschedule the inactivity nudge to 14 days from now.
 * Call this every time the app opens to push the timer forward.
 */
export async function scheduleInactivityNudge() {
  if (!isNativePlatform()) return;

  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );

    // Cancel existing nudge
    await LocalNotifications.cancel({
      notifications: [{ id: INACTIVITY_NUDGE_ID }],
    });

    // Reschedule 14 days from now
    const fourteenDays = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: INACTIVITY_NUDGE_ID,
          title: "GiveTime",
          body: "It's been a while! Open GiveTime to log your recent volunteer hours.",
          schedule: {
            at: fourteenDays,
            allowWhileIdle: true,
          },
        },
      ],
    });
  } catch {
    // Local notifications not available
  }
}

/**
 * Schedule a notification for the 1st of the next month at 9am
 * announcing that the monthly summary is ready.
 */
async function scheduleMonthlySummary() {
  if (!isNativePlatform()) return;

  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );

    // Cancel existing monthly notification
    await LocalNotifications.cancel({
      notifications: [{ id: MONTHLY_SUMMARY_ID }],
    });

    // Calculate the 1st of next month at 9am
    const now = new Date();
    const firstOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      9,
      0,
      0
    );

    // Get the name of the current month (the one being summarized)
    const currentMonthName = now.toLocaleString("en-US", { month: "long" });

    await LocalNotifications.schedule({
      notifications: [
        {
          id: MONTHLY_SUMMARY_ID,
          title: "GiveTime",
          body: `Your monthly summary for ${currentMonthName} is ready!`,
          schedule: {
            at: firstOfNextMonth,
            allowWhileIdle: true,
          },
        },
      ],
    });
  } catch {
    // Local notifications not available
  }
}
