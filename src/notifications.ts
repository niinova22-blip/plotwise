import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Local reminder to check in on an experiment. Permission is asked only at the
 * moment a user commits to an experiment, never at launch.
 */
export async function scheduleFollowUp(at: number, title: string, body: string) {
  if (Platform.OS === 'web') return;
  try {
    const current = await Notifications.getPermissionsAsync();
    const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
  } catch {
    // Reminders are a nice-to-have; the in-app follow-up card still appears.
  }
}

export async function cancelAllReminders() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
}
