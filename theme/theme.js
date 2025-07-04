import {useColorScheme} from 'react-native';
import {MD3DarkTheme, MD3LightTheme} from 'react-native-paper';
import {darkScheme} from './darkScheme';
import {lightScheme} from './lightScheme';
import {fontConfig} from './fontConfig';

export const getTheme = currentTheme => {
  const systemTheme = useColorScheme();
  const themeToUse = currentTheme || systemTheme;

  const LightScheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      ...lightScheme,
    },
    dimensions: {
      height: 60,
      padding: 10,
      margin: 5,
    },
    fonts: fontConfig,
  };

  const DarkScheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      ...darkScheme,
    },
    dimensions: {
      height: 60,
      padding: 10,
      margin: 5,
    },
    fonts: fontConfig,
  };

  return themeToUse === 'dark' ? DarkScheme : LightScheme;
};
