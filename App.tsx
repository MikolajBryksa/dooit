import React from 'react';
import {styles, COLORS} from './styles';
import {useSelector, Provider} from 'react-redux';
import store from './redux/store';
import Habits from './views/habits';
import Weights from './views/weights';
import Costs from './views/costs';
import Hours from './views/hours';
import Plans from './views/plans';
import Tasks from './views/tasks';
import Settings from './views/settings';
import ModalDialog from './components/ModalDialog';
import toastConfig from './components/Toast';
import Toast from 'react-native-toast-message';

import 'react-native-gesture-handler';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {assignScreenIcon} from './utils';

const Tab = createBottomTabNavigator();

function AppContent() {
  const modalName = useSelector(
    (state: {modalName: string}) => state.modalName,
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarStyle: {
            ...styles.footer,
          },
          tabBarIcon: ({focused}) => assignScreenIcon(route.name, focused),
          tabBarLabelStyle: {
            display: 'none',
          },
        })}>
        <Tab.Screen name="Habits" component={Habits} />
        <Tab.Screen name="Weights" component={Weights} />
        <Tab.Screen name="Costs" component={Costs} />
        <Tab.Screen name="Hours" component={Hours} />
        <Tab.Screen name="Plans" component={Plans} />
        <Tab.Screen name="Tasks" component={Tasks} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
      {modalName && (
        // @ts-ignore
        <ModalDialog name={modalName} />
      )}

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
