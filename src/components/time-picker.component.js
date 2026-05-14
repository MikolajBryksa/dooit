import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {View, useWindowDimensions} from 'react-native';
import {Text, TouchableRipple, useTheme} from 'react-native-paper';
import Color from 'color';
import AnalogClock from 'react-native-paper-dates/lib/module/Time/AnalogClock';
import TimeInput from 'react-native-paper-dates/lib/module/Time/TimeInput';
import {
  circleSize,
  clockTypes,
  inputTypes,
  toHourInputFormat,
  toHourOutputFormat,
} from 'react-native-paper-dates/lib/module/Time/timeUtils';
import {sharedStyles} from 'react-native-paper-dates/lib/module/shared/styles';
import {DisplayModeContext} from 'react-native-paper-dates/lib/module/contexts/DisplayModeContext';
import {useStyles} from '@/styles';

const SwitchButton = ({label, onPress, selected, disabled, theme, styles}) => {
  const backgroundColor = selected
    ? theme.colors.primary
    : theme.colors.background;
  const color = selected ? theme.colors.background : theme.colors.onSurface;

  return (
    <TouchableRipple
      onPress={onPress}
      style={sharedStyles.root}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{disabled}}
      disabled={disabled}>
      <View style={[styles.timePicker__switchButtonInner, {backgroundColor}]}>
        <Text
          maxFontSizeMultiplier={1.5}
          selectable={false}
          style={[theme.fonts.titleMedium, {color}]}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
};

const AmPmSwitcher = ({onChange, hours, inputType}) => {
  const theme = useTheme();
  const styles = useStyles();
  const {setMode, mode} = useContext(DisplayModeContext);
  const isAM = mode === 'AM';

  return (
    <View
      style={[
        styles.timePicker__switchRoot,
        {
          borderColor: theme.colors.outline,
          borderRadius: theme.roundness * 2,
          height: inputType === inputTypes.keyboard ? 72 : 80,
          marginBottom: inputType === 'keyboard' ? 16 : 0,
        },
      ]}>
      <SwitchButton
        label="AM"
        theme={theme}
        styles={styles}
        onPress={() => {
          setMode('AM');
          if (hours - 12 >= 0) {
            onChange(hours - 12);
          }
        }}
        selected={isAM}
        disabled={isAM}
      />
      <View
        style={[
          styles.timePicker__switchSeparator,
          {backgroundColor: theme.colors.outline},
        ]}
      />
      <SwitchButton
        label="PM"
        theme={theme}
        styles={styles}
        onPress={() => {
          setMode('PM');
          if (hours + 12 <= 24) {
            onChange(hours + 12);
          }
        }}
        selected={!isAM}
        disabled={!isAM}
      />
    </View>
  );
};

const TimeInputs = memo(function TimeInputs({
  hours,
  minutes,
  onFocusInput,
  focused,
  inputType,
  onChange,
  is24Hour,
  inputFontSize,
}) {
  const theme = useTheme();
  const styles = useStyles();
  const startInput = useRef(null);
  const endInput = useRef(null);
  const dimensions = useWindowDimensions();
  const isLandscape = dimensions.width > dimensions.height;

  const onChangeHours = useCallback(
    newHours => {
      onChange({
        hours: newHours,
        minutes,
        focused: clockTypes.hours,
      });
    },
    [onChange, minutes],
  );

  const selectionColor = theme.dark
    ? Color(theme.colors.primary).darken(0.2).hex()
    : theme.colors.primary;

  return (
    <View
      style={[
        styles.timePicker__inputContainer,
        isLandscape && sharedStyles.root,
      ]}>
      <View style={styles.timePicker__column}>
        <TimeInput
          ref={startInput}
          inputFontSize={inputFontSize}
          placeholder="00"
          value={toHourInputFormat(hours, is24Hour)}
          clockType={clockTypes.hours}
          pressed={focused === clockTypes.hours}
          onPress={onFocusInput}
          inputType={inputType}
          maxFontSizeMultiplier={1.2}
          selectionColor={selectionColor}
          returnKeyType="next"
          onSubmitEditing={() => endInput.current?.focus()}
          blurOnSubmit={false}
          onChanged={newHoursFromInput => {
            let newHours = toHourOutputFormat(
              newHoursFromInput,
              hours,
              is24Hour,
            );
            if (newHoursFromInput > 24) {
              newHours = 24;
            }
            onChange({hours: newHours, minutes});
          }}
        />
      </View>
      <View style={styles.timePicker__hoursAndMinutesSeparator}>
        <View style={sharedStyles.root} />
        <View
          style={[
            styles.timePicker__dot,
            {backgroundColor: theme.colors.onSurface},
          ]}
        />
        <View style={styles.timePicker__betweenDot} />
        <View
          style={[
            styles.timePicker__dot,
            {backgroundColor: theme.colors.onSurface},
          ]}
        />
        <View style={sharedStyles.root} />
      </View>
      <View style={styles.timePicker__column}>
        <TimeInput
          ref={endInput}
          inputFontSize={inputFontSize}
          placeholder="00"
          value={minutes}
          clockType={clockTypes.minutes}
          pressed={focused === clockTypes.minutes}
          onPress={onFocusInput}
          inputType={inputType}
          maxFontSizeMultiplier={1.2}
          selectionColor={selectionColor}
          onChanged={newMinutesFromInput => {
            const newMinutes =
              newMinutesFromInput > 59 ? 59 : newMinutesFromInput;
            onChange({hours, minutes: newMinutes});
          }}
        />
      </View>
      {!is24Hour && (
        <>
          <View style={styles.timePicker__spaceBetweenInputsAndSwitcher} />
          <AmPmSwitcher
            hours={hours}
            onChange={onChangeHours}
            inputType={inputType}
          />
        </>
      )}
    </View>
  );
});

const TimePicker = ({
  hours,
  minutes,
  onFocusInput,
  focused,
  inputType,
  onChange,
  locale,
  use24HourClock,
  inputFontSize,
}) => {
  const styles = useStyles();
  const dimensions = useWindowDimensions();
  const isLandscape = dimensions.width > dimensions.height;
  const [displayMode, setDisplayMode] = useState(undefined);

  const is24Hour = useMemo(() => {
    if (use24HourClock !== undefined) {
      return use24HourClock;
    }
    const formatter = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });
    const formatted = formatter.format(new Date(Date.UTC(2020, 1, 1, 23)));
    return formatted.includes('23');
  }, [locale, use24HourClock]);

  useEffect(() => {
    setDisplayMode(hours >= 12 ? 'PM' : 'AM');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onInnerChange = useCallback(
    params => {
      onChange({
        ...params,
        hours: toHourOutputFormat(params.hours, hours, is24Hour),
      });
    },
    [onChange, hours, is24Hour],
  );

  const contextValue = useMemo(
    () => ({mode: displayMode, setMode: setDisplayMode}),
    [displayMode],
  );

  return (
    <DisplayModeContext.Provider value={contextValue}>
      <View
        style={
          isLandscape
            ? [
                styles.timePicker__rootLandscape,
                {
                  width:
                    24 * 3 +
                    96 * 2 +
                    52 +
                    (inputType === inputTypes.picker
                      ? circleSize
                      : -circleSize),
                },
              ]
            : styles.timePicker__rootPortrait
        }>
        <TimeInputs
          inputType={inputType}
          inputFontSize={inputFontSize}
          hours={hours}
          minutes={minutes}
          is24Hour={is24Hour}
          onChange={onChange}
          onFocusInput={onFocusInput}
          focused={focused}
        />
        {inputType === inputTypes.picker ? (
          <View style={styles.timePicker__clockContainer}>
            <AnalogClock
              hours={toHourInputFormat(hours, is24Hour)}
              minutes={minutes}
              focused={focused}
              is24Hour={is24Hour}
              onChange={onInnerChange}
            />
          </View>
        ) : null}
      </View>
    </DisplayModeContext.Provider>
  );
};

export default TimePicker;
