import React, {useEffect} from 'react';
import {styles} from './styles';
import {Provider, useDispatch, useSelector} from 'react-redux';
import store from './redux/store';
import HabitsView from './views/habits.view';
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
import {getSettings} from './services/settings.service';
import {setSettings} from './redux/actions';

const Tab = createBottomTabNavigator();

function AppContent() {
  const settings = useSelector((state: any) => state.settings);
  const dispatch = useDispatch();

  useEffect(() => {
    const settings = getSettings();
    if (settings) {
      dispatch(setSettings(settings));
    }
  }, []);

  return (
    <>
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
        })}>
        <Tab.Screen name="habits" component={HabitsView} />
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
