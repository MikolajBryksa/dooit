import React from 'react';
import {View} from 'react-native';
import {Text, Chip, Switch, TouchableRipple} from 'react-native-paper';
import {useStyles} from '@/styles';

const SettingCard = ({
  label,
  value,
  icon,
  onPress,
  disabled = false,
  showChip = true,
  switchValue,
  onToggle,
}) => {
  const styles = useStyles();

  return (
    <TouchableRipple onPress={onPress} disabled={disabled}>
      <View style={styles.settings__row}>
        <Text variant="bodyMedium" numberOfLines={1}>
          {label}
        </Text>

        {typeof switchValue === 'boolean' ? (
          <Switch value={switchValue} onValueChange={onToggle} />
        ) : showChip ? (
          <Chip
            icon={icon}
            mode="outlined"
            onPress={onPress}
            disabled={disabled}>
            {value}
          </Chip>
        ) : (
          <Text variant="bodyMedium">{value}</Text>
        )}
      </View>
    </TouchableRipple>
  );
};

export default SettingCard;
