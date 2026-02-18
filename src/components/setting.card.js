import React from 'react';
import {View} from 'react-native';
import {Card, Text, Chip, Switch, TouchableRipple} from 'react-native-paper';
import {useStyles} from '@/styles';
import GradientCard from '../gradients/card.gradient';

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
    <GradientCard>
      <Card.Content style={styles.card__list}>
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
                disabled={disabled}
                style={{backgroundColor: 'transparent'}}>
                {value}
              </Chip>
            ) : (
              <Text variant="bodyMedium">{value}</Text>
            )}
          </View>
        </TouchableRipple>
      </Card.Content>
    </GradientCard>
  );
};

export default SettingCard;
