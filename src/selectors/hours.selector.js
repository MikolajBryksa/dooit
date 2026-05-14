import React, {useEffect, useMemo, useState} from 'react';
import {View, ScrollView} from 'react-native';
import {Chip, useTheme} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {en, pl, registerTranslation} from 'react-native-paper-dates';
import {useStyles} from '@/styles';
import CustomHourDialog from '@/dialogs/custom-hour.dialog';

registerTranslation('en', en);
registerTranslation('pl', pl);

const SLOT_START_HOUR = 5;
const SLOT_END_HOUR = 23;
const SLOT_STEP_MIN = 15;

const isStandardSlot = hour24 => {
  const [h, m] = hour24.split(':').map(Number);
  if (h < SLOT_START_HOUR || h > SLOT_END_HOUR) {
    return false;
  }
  return m % SLOT_STEP_MIN === 0;
};

const HoursSelector = ({repeatHours, setRepeatHours, onResetRef}) => {
  const styles = useStyles();
  const theme = useTheme();
  const {t} = useTranslation();
  const clockFormat = useSelector(state => state.settings.clockFormat);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = () => setRepeatHours([]);
    }
  }, [onResetRef, setRepeatHours]);

  const toDisplay = (h, m) => {
    if (clockFormat === '12 h') {
      const period = h < 12 ? 'AM' : 'PM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const allSlots = useMemo(() => {
    const slots = [];
    for (let h = SLOT_START_HOUR; h <= SLOT_END_HOUR; h++) {
      for (let m = 0; m < 60; m += SLOT_STEP_MIN) {
        const hour24 = `${h.toString().padStart(2, '0')}:${m
          .toString()
          .padStart(2, '0')}`;
        slots.push({hour24, display: toDisplay(h, m)});
      }
    }
    return slots;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockFormat]);

  const customHours = useMemo(() => {
    return repeatHours
      .filter(h => !isStandardSlot(h))
      .slice()
      .sort()
      .map(hour24 => {
        const [h, m] = hour24.split(':').map(Number);
        return {hour24, display: toDisplay(h, m)};
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatHours, clockFormat]);

  const handleToggleHour = hour24 => {
    setRepeatHours(prev =>
      prev.includes(hour24)
        ? prev.filter(h => h !== hour24)
        : [...prev, hour24],
    );
  };

  const handleRemoveHour = hour24 => {
    setRepeatHours(prev => prev.filter(h => h !== hour24));
  };

  const handleConfirmTime = ({hours, minutes}) => {
    const hour24 = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
    setRepeatHours(prev => (prev.includes(hour24) ? prev : [...prev, hour24]));
    setPickerVisible(false);
  };

  return (
    <View style={{marginBottom: 16}}>
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        style={styles.selector__scroll}>
        <View style={styles.selector__gridStart}>
          <Chip
            icon="plus"
            style={[
              styles.selector__chip,
              {borderColor: theme.colors.secondaryContainer},
            ]}
            mode="flat"
            selected={false}
            onPress={() => setPickerVisible(true)}>
            {t('button.customHour')}
          </Chip>
          {customHours.map(({hour24, display}) => (
            <Chip
              key={`custom-${hour24}`}
              style={[
                styles.selector__chip,
                {borderColor: theme.colors.primary},
              ]}
              mode="outlined"
              selected={false}
              onPress={() => handleRemoveHour(hour24)}
              onClose={() => handleRemoveHour(hour24)}>
              {display}
            </Chip>
          ))}
        </View>

        {customHours.length > 0 && (
          <View
            style={[styles.card__divider, {marginTop: 4, marginBottom: 12}]}
          />
        )}

        <View style={styles.selector__grid}>
          {allSlots.map(({hour24, display}) => {
            const selected = repeatHours.includes(hour24);
            return (
              <Chip
                key={hour24}
                style={[
                  styles.selector__chip,
                  {
                    borderColor: selected
                      ? theme.colors.primary
                      : theme.colors.secondaryContainer,
                  },
                ]}
                mode={selected ? 'outlined' : 'flat'}
                selected={false}
                onPress={() => handleToggleHour(hour24)}>
                {display}
              </Chip>
            );
          })}
        </View>
      </ScrollView>

      <CustomHourDialog
        visible={pickerVisible}
        onDismiss={() => setPickerVisible(false)}
        onConfirm={handleConfirmTime}
      />
    </View>
  );
};

export default HoursSelector;
