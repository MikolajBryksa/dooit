import React from 'react';
import {View} from 'react-native';
import {BottomNavigation} from 'react-native-paper';
import {useStyles} from '@/styles';

const Navbar = ({navigationState, safeAreaInsets, ...props}) => {
  const styles = useStyles();

  return (
    <View>
      <BottomNavigation.Bar
        navigationState={navigationState}
        safeAreaInsets={safeAreaInsets}
        style={[styles.bar__background]}
        {...props}
      />
    </View>
  );
};

export default Navbar;
