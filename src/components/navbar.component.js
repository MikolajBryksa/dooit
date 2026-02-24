import React from 'react';
import {View} from 'react-native';
import {BottomNavigation} from 'react-native-paper';
import {useStyles} from '@/styles';

const Navbar = ({navigationState, safeAreaInsets, ...props}) => {
  const styles = useStyles();

  return (
    <View style={styles.navbar}>
      <BottomNavigation.Bar
        navigationState={navigationState}
        safeAreaInsets={safeAreaInsets}
        {...props}
      />
    </View>
  );
};

export default Navbar;
