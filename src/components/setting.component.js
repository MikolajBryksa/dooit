import React from 'react';
import {View} from 'react-native';
import {
  Card,
  Text,
  Chip,
  Switch,
  TouchableRipple,
  Avatar,
  Checkbox,
} from 'react-native-paper';
import {useStyles} from '@/styles';

const SettingComponent = ({
  label,
  value,
  icon,
  leftIcon,
  onPress,
  disabled = false,
  showChip = true,
  switchValue,
  onToggle,
  checkboxValue,
  onCheckboxToggle,
}) => {
  const styles = useStyles();

  const hasSwitch = typeof switchValue === 'boolean';
  const hasCheckbox = typeof checkboxValue === 'boolean';

  const handleRowPress = () => {
    if (disabled) return;

    if (hasCheckbox && typeof onCheckboxToggle === 'function') {
      onCheckboxToggle(!checkboxValue);
      return;
    }
    if (hasSwitch && typeof onToggle === 'function') {
      onToggle(!switchValue);
      return;
    }

    if (typeof onPress === 'function') onPress();
  };

  return (
    <View style={styles.card__background}>
      <TouchableRipple onPress={handleRowPress} disabled={disabled}>
        <Card.Content style={styles.card__list}>
          <View style={styles.settings__row}>
            {leftIcon ? (
              <Avatar.Icon
                icon={leftIcon}
                size={40}
                style={{marginRight: 16}}
              />
            ) : null}

            <View style={{flex: 1}}>
              <Text variant="bodyMedium" numberOfLines={1}>
                {label}
              </Text>
            </View>

            {hasCheckbox ? (
              <Checkbox
                status={checkboxValue ? 'checked' : 'unchecked'}
                onPress={handleRowPress}
                disabled={disabled}
              />
            ) : hasSwitch ? (
              <Switch
                value={switchValue}
                onValueChange={v => onToggle?.(v)}
                disabled={disabled}
              />
            ) : showChip ? (
              <Chip
                icon={icon}
                mode="outlined"
                onPress={handleRowPress}
                disabled={disabled}
                style={{backgroundColor: 'transparent'}}>
                {value}
              </Chip>
            ) : (
              <Text variant="bodyMedium">{value}</Text>
            )}
          </View>
        </Card.Content>
      </TouchableRipple>
    </View>
  );
};

export default SettingComponent;
