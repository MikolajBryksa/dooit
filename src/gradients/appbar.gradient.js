import React from 'react';
import {View} from 'react-native';
import {Appbar} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from 'react-native-paper';

const GradientAppbar = ({children, ...props}) => {
  const theme = useTheme();

  return (
    <View style={{position: 'relative'}}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.background]}
        locations={[0, 1]}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
      />
      <Appbar.Header {...props} style={{backgroundColor: 'transparent'}}>
        {children}
      </Appbar.Header>
    </View>
  );
};

export default GradientAppbar;
