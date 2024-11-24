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
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCircleCheck,
  faCoins,
  faCalendar,
  faList,
  faWeight,
  faCog,
  faBriefcase,
} from '@fortawesome/free-solid-svg-icons';
import 'react-native-gesture-handler';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';

const Tab = createBottomTabNavigator();

function assignScreenIcon(routeName: any, focused: any) {
  const iconColor = focused ? COLORS.text : COLORS.primary;

  switch (routeName) {
    case 'Habits':
      return <FontAwesomeIcon icon={faCircleCheck} color={iconColor} />;
    case 'Weights':
      return <FontAwesomeIcon icon={faWeight} color={iconColor} />;
    case 'Costs':
      return <FontAwesomeIcon icon={faCoins} color={iconColor} />;
    case 'Hours':
      return <FontAwesomeIcon icon={faBriefcase} color={iconColor} />;
    case 'Plans':
      return <FontAwesomeIcon icon={faCalendar} color={iconColor} />;
    case 'Tasks':
      return <FontAwesomeIcon icon={faList} color={iconColor} />;
    case 'Settings':
      return <FontAwesomeIcon icon={faCog} color={iconColor} />;
  }
}

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
