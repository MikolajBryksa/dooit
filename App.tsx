import React, {useEffect, useState} from 'react';
import {PaperProvider, BottomNavigation} from 'react-native-paper';
import {Provider, useDispatch, useSelector} from 'react-redux';
import store from './src/redux/store';
import LoadingView from './src/views/loading.view';
import HomeView from './src/views/home.view';
import HabitsView from './src/views/habits.view';
import SettingsView from './src/views/settings.view';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {renderIcon} from './src/utils';
import i18next from './src/i18next';
import {LocaleConfig} from 'react-native-calendars';
import {getSettings} from './src/services/settings.service';
import {setSettings} from './src/redux/actions';
import {CommonActions} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTranslation} from 'react-i18next';
import {getTheme} from './src/theme/theme';
import {useColorScheme} from 'react-native';
import OnboardingView from './src/views/onboarding.view';
import {useStyles} from './src/styles';

const Tab = createBottomTabNavigator();

function AppContent() {
  const settings = useSelector((state: any) => state.settings);
  const styles = useStyles();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const {t} = useTranslation();

  useEffect(() => {
    async function loadData() {
      const settings = getSettings();
      if (settings) {
        dispatch(setSettings(settings));

        if (typeof settings.currentItem === 'number') {
          dispatch({type: 'SET_CURRENT_ITEM', payload: settings.currentItem});
        }
        settings.firstLaunch && setShowOnboarding(true);

        const newLocale = settings.language as string;
        i18next.changeLanguage(newLocale);
        LocaleConfig.defaultLocale = newLocale;
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <LoadingView setLoading={setLoading} />;
  }

  if (showOnboarding) {
    return <OnboardingView setShowOnboarding={setShowOnboarding} />;
  }

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
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
              if (options.tabBarIcon) {
                return options.tabBarIcon({focused, color, size: 24});
              }

              return null;
            }}
            getLabelText={({route}) => {
              const {options} = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

              return typeof label === 'string' ? label : undefined;
            }}
          />
        )}>
        <Tab.Screen
          name="Home"
          component={HomeView}
          options={{
            tabBarLabel: t('view.home'),
            tabBarIcon: ({color, size}) => {
              return renderIcon('home', color, size);
            },
          }}
        />
        <Tab.Screen
          name="Habits"
          component={HabitsView}
          options={{
            tabBarLabel: t('view.habits'),
            tabBarIcon: ({color, size}) => {
              return renderIcon('habits', color, size);
            },
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsView}
          options={{
            tabBarLabel: t('view.settings'),
            tabBarIcon: ({color, size}) => {
              return renderIcon('settings', color, size);
            },
          }}
        />
      </Tab.Navigator>
    </>
  );
}

function App(): React.JSX.Element {
  const reduxTheme = useSelector((state: any) => state.settings.currentTheme);
  const systemTheme = useColorScheme();
  let currentTheme = reduxTheme;

  if (!currentTheme) {
    const settings = getSettings();
    if (settings && settings.currentTheme) {
      currentTheme = settings.currentTheme;
    } else {
      currentTheme = systemTheme;
    }
  }

  const theme = getTheme(currentTheme);

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
    <App />
  </Provider>
);

export default Root;
