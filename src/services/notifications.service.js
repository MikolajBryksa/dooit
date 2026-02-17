import notifee, {TriggerType} from '@notifee/react-native';
import {dateToWeekday, pickRandomMotivation, getLocalDateKey} from '@/utils';
import {AppState} from 'react-native';
import {updateSettingValue} from './settings.service';
import {logError} from './errors.service.js';
import {hasExecution} from './executions.service.js';

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
  // Skips notifications for already completed executions today
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
    const todayDateKey = getLocalDateKey();
    let scheduledCount = 0;

    for (let daysAhead = 0; daysAhead < 3; daysAhead++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + daysAhead);

      const targetDateKey = getLocalDateKey(targetDate);
      const weekdayKey = dateToWeekday(targetDateKey);

      const dayHabits = habits.filter(
        habit => habit.available && habit.repeatDays.includes(weekdayKey),
      );

      for (const habit of dayHabits) {
        for (const hour of habit.repeatHours) {
          const [h, m] = hour.split(':').map(Number);

          // For today only: skip notification if already completed
          const isAlreadyCompleted =
            targetDateKey === todayDateKey &&
            hasExecution(habit.id, targetDateKey, hour);

          if (isAlreadyCompleted) {
            continue;
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

          // Only schedule future notifications
          if (triggerDate > now) {
            const notificationId = `${habit.id}-${targetDateKey}-${hour}`;

            await notifee.createTriggerNotification(
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
            scheduledCount++;
          }
        }
      }
    }
  } catch (error) {
    logError(error, 'scheduleHabitNotifications');
  }
}
