import 'react-native-url-polyfill/auto';
import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import notifee, {EventType} from '@notifee/react-native';
import {recordExecutionChoice} from './src/services/executions.service';
import {logError} from './src/services/errors.service';

notifee.onBackgroundEvent(async ({type, detail}) => {
  try {
    if (type === EventType.ACTION_PRESS) {
      const {notification, pressAction} = detail;
      const data = notification?.data;

      if (data && (pressAction.id === 'done' || pressAction.id === 'skip')) {
        const status = pressAction.id === 'done' ? 'done' : 'skipped';
        recordExecutionChoice(
          parseInt(data.habitId, 10),
          data.date,
          parseInt(data.slotIndex, 10),
          data.plannedHour,
          status,
        );
        await notifee.cancelNotification(notification.id);
      }
    }
  } catch (e) {
    logError(e, 'notifee.onBackgroundEvent');
  }
});

// LogBox.ignoreLogs([
//   'Tried to modify key `current` of an object which has been already passed to a worklet',
// ]);

// LogBox.ignoreAllLogs(true);
// console.warn = () => {};

AppRegistry.registerComponent('Dooit', () => App);
