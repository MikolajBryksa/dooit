import React, {useState, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {Button, ThemeProvider, useTheme} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import DialogComponent from '@/components/dialog.component';
import TimePicker from '@/components/time-picker.component';
import {useStyles} from '@/styles';

const CustomHourDialog = ({visible, onDismiss, onConfirm}) => {
  const {t} = useTranslation();
  const baseTheme = useTheme();
  const styles = useStyles();
  const clockFormat = useSelector(state => state.settings.clockFormat);
  const language = useSelector(state => state.settings.language);

  const pickerTheme = useMemo(() => {
    const c = baseTheme.colors;
    return {
      ...baseTheme,
      colors: {
        ...c,
        onPrimaryContainer: c.primary,
      },
    };
  }, [baseTheme]);

  const [hours, setHours] = useState(8);
  const [minutes, setMinutes] = useState(0);
  const [focused, setFocused] = useState('hours');

  useEffect(() => {
    if (visible) {
      setHours(8);
      setMinutes(0);
      setFocused('hours');
    }
  }, [visible]);

  const handleChange = ({hours: h, minutes: m, focused: f}) => {
    if (f) {
      setFocused(f);
    }
    setHours(h);
    setMinutes(m);
  };

  const handleSave = () => {
    onConfirm({hours, minutes});
  };

  return (
    <DialogComponent
      visible={visible}
      onDismiss={onDismiss}
      title={t('title.customHour')}>
      <DialogComponent.Content>
        <ThemeProvider theme={pickerTheme}>
          <View style={styles.gap} />
          <TimePicker
            inputType="picker"
            focused={focused}
            hours={hours}
            minutes={minutes}
            onFocusInput={setFocused}
            onChange={handleChange}
            locale={language === 'en' ? 'en' : 'pl'}
            use24HourClock={clockFormat !== '12 h'}
            inputFontSize={44}
          />
        </ThemeProvider>
      </DialogComponent.Content>
      <DialogComponent.Actions>
        <Button onPress={onDismiss}>{t('button.cancel')}</Button>
        <Button onPress={handleSave}>{t('button.save')}</Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default CustomHourDialog;
