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
    'pen',
    'puzzle',
    'laptop',
    'cellphone',
    'briefcase',
    'heart',
    'star',
    'trophy',
    'chart-line',
    'currency-usd',
    'home',
    'car',
    'bed',
    'shower',
    'gift',
    'email',
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
