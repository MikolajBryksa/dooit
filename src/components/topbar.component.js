import React from 'react';
import {View} from 'react-native';
import {Appbar} from 'react-native-paper';
import {useStyles} from '@/styles';

const Topbar = ({children, ...props}) => {
  const styles = useStyles();

  return (
    <View style={styles.topbar}>
      <Appbar.Header {...props}>{children}</Appbar.Header>
    </View>
  );
};

Topbar.Content = Appbar.Content;
Topbar.Action = Appbar.Action;
Topbar.BackAction = Appbar.BackAction;

export default Topbar;
