import React, {useEffect, useRef, useState, Component} from 'react';
import {PaperProvider} from 'react-native-paper';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';
import RNRestart from 'react-native-restart';
import store from './src/redux/store';
import Navbar from './src/components/navbar.component';
import LoadingView from './src/views/loading.view';
import NowView from './src/views/now.view';
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
import {setupNotificationSync} from './src/services/notifications.service';
import {setupErrorTracking, logError} from '@/services/errors.service';
import {getHabits} from '@/services/habits.service';
import {backfillMissedExecutions} from '@/services/executions.service';

setupErrorTracking();

class ErrorBoundary extends Component<
  {children: React.ReactNode},
  {hasError: boolean}
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  componentDidCatch(error: Error) {
    logError(error, 'global_fatal_ui');
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>
            {i18next.t('error-boundary.title')}
          </Text>
          <Text style={errorStyles.body}>
            {i18next.t('error-boundary.body')}
          </Text>
          <TouchableOpacity
            style={errorStyles.button}
            onPress={() => RNRestart.restart()}>
            <Text style={errorStyles.buttonText}>
              {i18next.t('error-boundary.button')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#fff',
    height: 44,
    paddingHorizontal: 28,
    borderRadius: 22,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
});

const Tab = createBottomTabNavigator();

function AppContent() {
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

        backfillMissedExecutions(habits, 14);
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
    if (!loading && settings?.firstLaunch) {
      setShowOnboarding(true);
    }
  }, [settings?.firstLaunch, loading]);

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
        <Navbar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({route, preventDefault}: any) => {
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
          renderIcon={({route, focused, color}: any) => {
            const {options} = descriptors[route.key];
            return options.tabBarIcon
              ? options.tabBarIcon({focused, color, size: 24})
              : null;
          }}
          getLabelText={({route}: any) => {
            const {options} = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            return typeof label === 'string' ? label : undefined;
          }}
        />
      )}>
      <Tab.Screen
        name="Now"
        component={NowView}
        options={{
          tabBarLabel: t('view.now'),
          tabBarIcon: ({color, size}) => renderIcon('now', color, size),
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
  <ErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary>
);

export default Root;
