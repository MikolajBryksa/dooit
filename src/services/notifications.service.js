import notifee, {TriggerType, AndroidImportance} from '@notifee/react-native';
import {dateToWeekday, getLocalDateKey} from '@/utils';
import {AppState} from 'react-native';
import {updateSettingValue} from './settings.service';
import {logError} from './errors.service.js';
import {hasExecutionOrDeleted} from './executions.service.js';

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

async function ensureChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Dooit Channel',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

// Cancels all scheduled (trigger) notifications without dismissing already-displayed ones
async function cancelScheduledNotifications() {
  const ids = await notifee.getTriggerNotificationIds();
  await Promise.all(ids.map(id => notifee.cancelNotification(id)));
}

const STREAK_REMINDER_PREFIX = 'streak-reminder-';

// Mutex: prevents concurrent rescheduling; keeps only the latest pending call
let _isScheduling = false;
let _pendingSchedule = null;

export async function scheduleHabitNotifications(habits, t, lastStreakDate) {
  if (_isScheduling) {
    _pendingSchedule = {habits, t, lastStreakDate};
    return;
  }

  _isScheduling = true;
  try {
    await _doScheduleHabitNotifications(habits, t, lastStreakDate);

    while (_pendingSchedule) {
      const next = _pendingSchedule;
      _pendingSchedule = null;
      await _doScheduleHabitNotifications(
        next.habits,
        next.t,
        next.lastStreakDate,
      );
    }
  } finally {
    _isScheduling = false;
  }
}

async function _doScheduleHabitNotifications(habits, t, lastStreakDate) {
  // Schedules habit notifications and streak reminders over the next 3 days.
  // Streak reminder is skipped for days where the streak is already maintained.
  try {
    await cancelScheduledNotifications();

    if (!habits || habits.length === 0) {
      return;
    }

    await ensureChannel();

    await notifee.setNotificationCategories([
      {
        id: 'habit-actions',
        actions: [
          {
            id: 'skip',
            title: t('button.skip'),
            destructive: true,
          },
          {
            id: 'done',
            title: t('button.done'),
          },
        ],
      },
    ]);

    const now = new Date();
    const todayDateKey = getLocalDateKey();

    for (let daysAhead = 0; daysAhead < 3; daysAhead++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + daysAhead);

      const targetDateKey = getLocalDateKey(targetDate);
      const weekdayKey = dateToWeekday(targetDateKey);

      // Streak reminder at 18:00 for days where streak isn't maintained yet
      const streakAlreadyMaintained = lastStreakDate === targetDateKey;
      if (!streakAlreadyMaintained) {
        const streakTriggerDate = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate(),
          18,
          0,
          0,
          0,
        );

        if (streakTriggerDate > now) {
          await notifee.createTriggerNotification(
            {
              id: `${STREAK_REMINDER_PREFIX}${targetDateKey}`,
              title: t('streak.reminder-title'),
              body: t('streak.reminder-body'),
              android: {
                channelId: 'default',
                smallIcon: 'ic_notification',
                pressAction: {id: 'default', launchActivity: 'default'},
              },
              ios: {
                sound: 'default',
              },
            },
            {
              type: TriggerType.TIMESTAMP,
              timestamp: streakTriggerDate.getTime(),
            },
          );
        }
      }

      const dayHabits = habits.filter(habit =>
        habit.repeatDays.includes(weekdayKey),
      );

      for (const habit of dayHabits) {
        for (
          let slotIndex = 0;
          slotIndex < habit.repeatHours.length;
          slotIndex++
        ) {
          const hour = habit.repeatHours[slotIndex];
          const [h, m] = hour.split(':').map(Number);

          // For today only: skip notification if already completed or deleted
          const isAlreadyCompleted =
            targetDateKey === todayDateKey &&
            hasExecutionOrDeleted(habit.id, targetDateKey, slotIndex);

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
            const notificationId = `${habit.id}-${targetDateKey}-${slotIndex}`;

            await notifee.createTriggerNotification(
              {
                id: notificationId,
                title: `${hour} ${habit.habitName}`,
                data: {
                  habitId: String(habit.id),
                  date: targetDateKey,
                  slotIndex: String(slotIndex),
                  plannedHour: hour,
                },
                android: {
                  channelId: 'default',
                  smallIcon: 'ic_notification',
                  pressAction: {
                    id: 'default',
                    launchActivity: 'default',
                  },
                  actions: [
                    {
                      title: t('button.skip'),
                      pressAction: {id: 'skip'},
                    },
                    {
                      title: t('button.done'),
                      pressAction: {id: 'done'},
                    },
                  ],
                },
                ios: {
                  categoryId: 'habit-actions',
                  sound: 'default',
                },
              },
              {
                type: TriggerType.TIMESTAMP,
                timestamp: triggerDate.getTime(),
              },
            );
          }
        }
      }
    }
  } catch (error) {
    logError(error, '_doScheduleHabitNotifications');
  }
}
