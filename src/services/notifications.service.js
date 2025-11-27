import notifee, {TriggerType} from '@notifee/react-native';
import {dateToWeekday, pickRandomMotivation} from '@/utils';
import {AppState} from 'react-native';
import {updateSettingValue} from './settings.service';
import {logError} from './error-tracking.service.js';

export async function syncNotificationStatus(settings, dispatch, setSettings) {
  // Checks system notification permissions and updates app settings to match
  try {
    const settingsStatus = await notifee.getNotificationSettings();
    const granted =
      settingsStatus.authorizationStatus === 1 ||
      settingsStatus.authorizationStatus === 2;

    if (settings && settings.notifications !== granted) {
      updateSettingValue('notifications', granted);
      const updatedSettings = {...settings, notifications: granted};
      dispatch(setSettings(updatedSettings));
    }
  } catch (error) {
    logError(error, 'syncNotificationStatus');
  }
}

export async function requestNotificationPermission(
  // Requests notification permission and updates app settings
  settings,
  dispatch,
  setSettings,
) {
  try {
    await notifee.requestPermission();
    const settingsStatus = await notifee.getNotificationSettings();
    const granted =
      settingsStatus.authorizationStatus === 1 ||
      settingsStatus.authorizationStatus === 2;

    updateSettingValue('notifications', granted);
    const updatedSettings = {...settings, notifications: granted};
    dispatch(setSettings(updatedSettings));

    return granted;
  } catch (error) {
    logError(error, 'requestNotificationPermission');
    return false;
  }
}

export function setupNotificationSync(
  // Sets up notification sync when app becomes active
  settings,
  loading,
  dispatch,
  setSettings,
) {
  if (!loading && settings) {
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        syncNotificationStatus(settings, dispatch, setSettings);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    syncNotificationStatus(settings, dispatch, setSettings);

    return () => {
      subscription.remove();
    };
  }
}

export async function scheduleHabitNotifications(habits, t) {
  // Schedules notifications for habits over the next 3 days
  try {
    if (!habits || habits.length === 0) {
      await notifee.cancelAllNotifications();
      return;
    }

    await notifee.createChannel({
      id: 'default',
      name: 'Dooit Channel',
    });

    await notifee.cancelAllNotifications();

    const now = new Date();

    const makeDateKey = date =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(date.getDate()).padStart(2, '0')}`;

    const todayDateKey = makeDateKey(now);

    for (let daysAhead = 0; daysAhead < 3; daysAhead++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + daysAhead);

      const targetDateKey = makeDateKey(targetDate);
      const weekdayKey = dateToWeekday(targetDateKey);

      const dayHabits = habits.filter(
        habit => habit.available && habit.repeatDays.includes(weekdayKey),
      );

      dayHabits.forEach(habit => {
        const completedHours = habit.completedHours || [];

        habit.repeatHours.forEach(hour => {
          const [h, m] = hour.split(':').map(Number);

          const isCompletedToday =
            targetDateKey === todayDateKey &&
            Array.isArray(completedHours) &&
            completedHours.includes(hour);

          if (isCompletedToday) {
            return;
          }

          const triggerDate = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate(),
            h,
            m || 0,
            0,
            0,
          );

          if (triggerDate > now) {
            const notificationId = `${habit.id}-${targetDate.getFullYear()}-${
              targetDate.getMonth() + 1
            }-${targetDate.getDate()}-${hour}`;

            notifee.createTriggerNotification(
              {
                id: notificationId,
                title: `${hour} ${habit.habitName}`,
                body: pickRandomMotivation(t, 'notification'),
                android: {
                  channelId: 'default',
                  smallIcon: 'ic_notification',
                  pressAction: {
                    id: 'default',
                    launchActivity: 'default',
                  },
                },
              },
              {
                type: TriggerType.TIMESTAMP,
                timestamp: triggerDate.getTime(),
              },
            );
          }
        });
      });
    }
  } catch (error) {
    logError(error, 'scheduleHabitNotifications');
  }
}
