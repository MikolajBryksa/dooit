import React, {useEffect, useRef, useState} from 'react';
import {PaperProvider, BottomNavigation} from 'react-native-paper';
import {Provider, useDispatch, useSelector} from 'react-redux';
import store from './src/redux/store';
import LoadingView from './src/views/loading.view';
import HomeView from './src/views/home.view';
import HabitsView from './src/views/habits.view';
import SettingsView from './src/views/settings.view';
import 'react-native-gesture-handler';
import {NavigationContainer, CommonActions} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTranslation} from 'react-i18next';
import {LocaleConfig} from 'react-native-calendars';
import {useColorScheme} from 'react-native';

import {renderIcon} from './src/utils';
import i18next from './src/i18next';
import {getSettings} from './src/services/settings.service';
import {setSettings, setHabits} from './src/redux/actions';
import {getTheme} from './src/theme/theme';
import OnboardingView from './src/views/onboarding.view';
import {useStyles} from './src/styles';
import {setupNotificationSync} from './src/services/notifications.service';

import ErrorBoundary from '@/dialogs/error.dialog';
import {setupErrorTracking, logError} from '@/services/error-tracking.service';
import {cleanOldExecutions} from '@/services/effectiveness.service';
import {getHabits} from '@/services/habits.service';

setupErrorTracking();

const Tab = createBottomTabNavigator();

function AppContent() {
  const styles = useStyles();
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const settings = useSelector((state: any) => state.settings);

  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const start = Date.now();

    async function loadLocalData() {
      try {
        const localSettings = getSettings();

        if (!localSettings) {
          logError(
            new Error('Settings not found in database'),
            'loadLocalData',
          );
        } else {
          dispatch(setSettings(localSettings));

          if (typeof localSettings.currentItem === 'number') {
            dispatch({
              type: 'SET_CURRENT_ITEM',
              payload: localSettings.currentItem,
            });
          }

          if (localSettings.firstLaunch) {
            setShowOnboarding(true);
          }

          const newLocale = localSettings.language as string;
          i18next.changeLanguage(newLocale);
          LocaleConfig.defaultLocale = newLocale;
        }

        const habits = getHabits() || [];
        dispatch(setHabits(habits));

        cleanOldExecutions(14);
      } catch (e) {
        logError(e, 'loadLocalData');
      } finally {
        const elapsed = Date.now() - start;
        const remainingTime = Math.max(0, 800 - elapsed);
        setTimeout(() => setLoading(false), remainingTime);
      }
    }

    loadLocalData();
  }, [dispatch]);

  useEffect(() => {
    return setupNotificationSync(settings, loading, dispatch, setSettings);
  }, [loading, settings, dispatch]);

  if (loading) return <LoadingView />;
  if (showOnboarding)
    return <OnboardingView setShowOnboarding={setShowOnboarding} />;

  return (
    <Tab.Navigator
      screenOptions={{headerShown: false}}
      tabBar={({navigation, state, descriptors, insets}) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          style={styles.bottomBar__shadow}
          onTabPress={({route, preventDefault}) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({route, focused, color}) => {
            const {options} = descriptors[route.key];
            return options.tabBarIcon
              ? options.tabBarIcon({focused, color, size: 24})
              : null;
          }}
          getLabelText={({route}) => {
            const {options} = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            return typeof label === 'string' ? label : undefined;
          }}
        />
      )}>
      <Tab.Screen
        name="Home"
        component={HomeView}
        options={{
          tabBarLabel: t('view.home'),
          tabBarIcon: ({color, size}) => renderIcon('home', color, size),
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsView}
        options={{
          tabBarLabel: t('view.habits'),
          tabBarIcon: ({color, size}) => renderIcon('habits', color, size),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsView}
        options={{
          tabBarLabel: t('view.settings'),
          tabBarIcon: ({color, size}) => renderIcon('settings', color, size),
        }}
      />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  const settings = useSelector((state: any) => state.settings);
  const systemTheme = useColorScheme();
  const currentTheme = settings?.currentTheme || systemTheme;
  const theme: any = getTheme(currentTheme);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </PaperProvider>
  );
}

const Root = () => (
  <Provider store={store}>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </Provider>
);

export default Root;
