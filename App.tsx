import React, {useEffect, useState} from 'react';
import {styles} from './styles';
import {Provider, useDispatch, useSelector} from 'react-redux';
import store from './redux/store';
import LoadingView from './views/loading.view';
import HomeView from './views/home.view';
import WeightsView from './views/weights.view';
import CostsView from './views/costs.view';
import PlansView from './views/plans.view';
import TasksView from './views/tasks.view';
import SettingsView from './views/settings.view';
import toastConfig from './components/toast';
import Toast from 'react-native-toast-message';
import 'react-native-gesture-handler';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {renderViewIcon} from './utils';
import i18next from './i18next';
import {LocaleConfig} from 'react-native-calendars';
import {plLocaleConfig, enLocaleConfig} from './translation/calendar';
import {getEveryHabit} from './services/habits.service';
import {getEveryWeight} from './services/weights.service';
import {getEveryCost} from './services/costs.service';
import {getEveryPlan} from './services/plans.service';
import {getEveryTask} from './services/tasks.service';
import {getSettings} from './services/settings.service';
import {getTempValue} from './services/temp.service';
import {
  setHabits,
  setWeights,
  setCosts,
  setPlans,
  setTasks,
  setSettings,
  setSelectedDay,
} from './redux/actions';
import {convertRealmObjects} from './utils';
import OnboardingModal from './modals/onboarding.modal';
import {formatDate} from './utils';

const Tab = createBottomTabNavigator();

function AppContent() {
  const settings = useSelector((state: any) => state.settings);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  LocaleConfig.locales['pl'] = plLocaleConfig;
  LocaleConfig.locales['en'] = enLocaleConfig;

  useEffect(() => {
    async function loadData() {
      const settings = getSettings();
      if (settings) {
        dispatch(setSettings(settings));
        settings.firstLaunch && setShowModal(true);
        i18next.changeLanguage(settings.language === 'English' ? 'en' : 'pl');
        LocaleConfig.defaultLocale =
          settings.language === 'English' ? 'en' : 'pl';
      }

      const selectedDay = formatDate(getTempValue('selectedDay'));
      dispatch(setSelectedDay(selectedDay));

      const weights = getEveryWeight();
      dispatch(setWeights(convertRealmObjects(weights)));

      const costs = getEveryCost();
      dispatch(setCosts(convertRealmObjects(costs)));

      const plans = getEveryPlan();
      dispatch(setPlans(convertRealmObjects(plans)));

      const habits = getEveryHabit();
      dispatch(setHabits(convertRealmObjects(habits)));

      const tasks = getEveryTask();
      dispatch(setTasks(convertRealmObjects(tasks)));

      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return <LoadingView />;
  }

  return (
    <>
      {showModal && <OnboardingModal setShowModal={setShowModal} />}
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarStyle: {
            ...styles.footer,
          },
          tabBarIcon: ({focused}) => renderViewIcon(route.name, focused),
          tabBarLabelStyle: {
            display: 'none',
          },
          animation: 'shift',
        })}>
        <Tab.Screen name="home" component={HomeView} />
        {settings.weightsTab && (
          <Tab.Screen name="weights" component={WeightsView} />
        )}
        {settings.costsTab && <Tab.Screen name="costs" component={CostsView} />}
        {settings.plansTab && <Tab.Screen name="plans" component={PlansView} />}
        {settings.tasksTab && <Tab.Screen name="tasks" component={TasksView} />}
        {settings && <Tab.Screen name="settings" component={SettingsView} />}
      </Tab.Navigator>

      <React.Fragment>
        {/* @ts-ignore */}
        <Toast config={toastConfig} swipeable />
      </React.Fragment>
    </>
  );
}

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </Provider>
  );
}

export default App;
