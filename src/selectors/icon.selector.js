import React from 'react';
import {View, ScrollView} from 'react-native';
import {IconButton, useTheme} from 'react-native-paper';
import {useStyles} from '@/styles';

const IconSelector = ({selectedIcon, setSelectedIcon}) => {
  const theme = useTheme();
  const styles = useStyles();

  const availableIcons = [
    'infinity',
    'alarm',
    'water',
    'food-apple',
    'coffee',
    'silverware-fork-knife',
    'leaf',
    'flower',
    'forest',
    'dumbbell',
    'meditation',
    'run',
    'bike',
    'swim',
    'basketball',
    'book-open',
    'notebook',
    'school',
    'translate',
    'camera',
    'palette',
    'brush',
    'pen',
    'headphones',
    'music',
    'drama-masks',
    'puzzle',
    'laptop',
    'cellphone',
    'briefcase',
    'heart',
    'star',
    'trophy',
    'chart-line',
    'currency-usd',
    'wallet',
    'home',
    'car',
    'bus',
    'bed',
    'power-sleep',
    'shower',
    'toothbrush',
    'gift',
    'email',
    'tshirt-crew',
    'shoe-sneaker',
    'weight',
  ];

  return (
    <View style={{marginBottom: 16}}>
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        style={{maxHeight: 220}}>
        <View style={styles.selector__grid}>
          {availableIcons.map(icon => {
            const isSelected = selectedIcon === icon;
            return (
              <IconButton
                key={icon}
                icon={icon}
                size={24}
                mode="outlined"
                containerColor={
                  isSelected ? 'transparent' : theme.colors.primaryContainer
                }
                iconColor={theme.colors.primary}
                style={[
                  styles.selector__iconBtn,
                  {
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => setSelectedIcon(icon)}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default IconSelector;
