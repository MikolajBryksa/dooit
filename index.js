import 'react-native-url-polyfill/auto';
import {AppRegistry, LogBox} from 'react-native';
import App from './App';

// LogBox.ignoreLogs([
//   'Tried to modify key `current` of an object which has been already passed to a worklet',
// ]);
LogBox.ignoreAllLogs(true);
console.warn = () => {};

AppRegistry.registerComponent('Dooit', () => App);
