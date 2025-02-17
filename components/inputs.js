import React, {useEffect, useState, forwardRef} from 'react';
import {View, TextInput, Pressable, Text} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {renderCheck} from '../utils';
import {styles, COLORS} from '../styles';
import {
  renderArrow,
  formatDateWithDay,
  getMarkedDates,
  formatNumericInput,
  limitTextInput,
  formatDate,
  renderControlIcon,
  convertTextToDisplayTime,
  convertDisplayTimeToTime,
  display12HourFormat,
} from '../utils';
import {useTranslation} from 'react-i18next';

export const WhatInput = forwardRef(
  (
    {what, setWhat, placeholder, inputModeType = 'numeric', incrementator},
    ref,
  ) => {
    return (
      <>
        <View style={styles.inputContainer}>
          {incrementator && (
            <>
              <Pressable
                style={styles.incrementator}
                onPress={() => {
                  const decreasedValue =
                    parseFloat(Number(what)) - parseFloat(incrementator);
                  setWhat(decreasedValue.toFixed(2));
                }}>
                {renderArrow('minus')}
              </Pressable>
            </>
          )}
          <TextInput
            ref={ref}
            style={styles.input}
            value={what}
            onChangeText={text => {
              if (inputModeType === 'numeric') {
                setWhat(formatNumericInput(text));
              } else {
                setWhat(limitTextInput(text));
              }
            }}
            inputMode={inputModeType}
            placeholder={placeholder}
            placeholderTextColor={COLORS.primary}
            maxLength={55}
          />
          {incrementator && (
            <>
              <Pressable
                style={styles.incrementator}
                onPress={() => {
                  const increasedValue =
                    parseFloat(Number(what)) + parseFloat(incrementator);
                  setWhat(increasedValue.toFixed(2));
                }}>
                {renderArrow('plus')}
              </Pressable>
            </>
          )}
        </View>
      </>
    );
  },
);

export const WhenInput = ({
  showCalendar,
  setShowCalendar,
  when,
  setWhen,
  data,
  firstDay,
  language,
}) =>
  showCalendar ? (
    <View style={styles.calendar}>
      <Calendar
        onDayPress={day => {
          setWhen(day.dateString);
        }}
        initialDate={when}
        firstDay={firstDay === 'Sunday' ? 0 : 1}
        markedDates={getMarkedDates(data, when)}
        renderArrow={renderArrow}
        theme={styles.calendarTheme}
        hideExtraDays={true}
      />
    </View>
  ) : (
    <View style={styles.inputContainer}>
      <Pressable
        style={styles.incrementator}
        onPress={() => {
          const currentDate = new Date(when);
          currentDate.setDate(currentDate.getDate() - 1);
          setWhen(formatDate(currentDate));
        }}>
        {renderArrow('left')}
      </Pressable>
      <Pressable style={styles.input} onPress={() => setShowCalendar(true)}>
        <Text style={styles.input}>{formatDateWithDay(when, language)}</Text>
      </Pressable>
      <Pressable
        style={styles.incrementator}
        onPress={() => {
          const currentDate = new Date(when);
          currentDate.setDate(currentDate.getDate() + 1);
          setWhen(formatDate(currentDate));
        }}>
        {renderArrow('right')}
      </Pressable>
    </View>
  );

export const TimeInput = ({time, setTime, clockFormat, placeholder}) => {
  const [timeMode, setTimeMode] = useState('AM');
  const [displayTime, setDisplayTime] = useState('');
  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    if (initialRender && time !== '') {
      let [hours] = time.split(':');
      hours = parseInt(hours, 10);
      const mode = hours >= 12 ? 'PM' : 'AM';
      setTimeMode(mode);
      if (clockFormat === '12h') {
        setDisplayTime(display12HourFormat(time, clockFormat));
      } else {
        setDisplayTime(time);
      }
      setInitialRender(false);
    }
  }, [time]);

  useEffect(() => {
    setTime(convertDisplayTimeToTime(displayTime, clockFormat, timeMode));
  }, [displayTime, timeMode]);

  return (
    <View style={styles.inputContainer}>
      <Pressable
        style={styles.incrementator}
        onPress={() => {
          setTime(''), setDisplayTime('');
        }}>
        {time !== '' && renderControlIcon('cancel', 'shadow')}
      </Pressable>

      <TextInput
        style={styles.input}
        value={displayTime}
        onChangeText={text => {
          setDisplayTime(convertTextToDisplayTime(text));
          setInitialRender(false);
        }}
        inputMode="numeric"
        placeholder={placeholder}
        placeholderTextColor={COLORS.primary}
        maxLength={5}
      />

      {clockFormat === '12h' && time !== '' ? (
        timeMode === 'AM' ? (
          <Pressable
            style={styles.incrementator}
            onPress={() => setTimeMode('PM')}>
            <Text style={styles.listItemChange}>AM</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.incrementator}
            onPress={() => setTimeMode('AM')}>
            <Text style={styles.listItemChange}>PM</Text>
          </Pressable>
        )
      ) : (
        <Pressable
          style={[styles.incrementator, {opacity: 0}]}
          onPress={() => {
            setTime(''), setDisplayTime('');
          }}>
          {time !== '' && renderControlIcon('cancel', 'shadow')}
        </Pressable>
      )}
    </View>
  );
};

const toggleCheck = (value, setter, day, days, setDays) => {
  const newCheck = !value;
  setter(newCheck);

  const newDays = {...days, [day]: newCheck};
  setDays(newDays);
};

export const DaysInput = ({
  showDaysPicker,
  setShowDaysPicker,
  days,
  setDays,
  firstDay,
  placeholder,
}) => {
  const {t} = useTranslation();
  const [mondayCheck, setMondayCheck] = useState(days.monday || false);
  const [tuesdayCheck, setTuesdayCheck] = useState(days.tuesday || false);
  const [wednesdayCheck, setWednesdayCheck] = useState(days.wednesday || false);
  const [thursdayCheck, setThursdayCheck] = useState(days.thursday || false);
  const [fridayCheck, setFridayCheck] = useState(days.friday || false);
  const [saturdayCheck, setSaturdayCheck] = useState(days.saturday || false);
  const [sundayCheck, setSundayCheck] = useState(days.sunday || false);

  const falseDays = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  };

  useEffect(() => {
    setMondayCheck(days.monday || false);
    setTuesdayCheck(days.tuesday || false);
    setWednesdayCheck(days.wednesday || false);
    setThursdayCheck(days.thursday || false);
    setFridayCheck(days.friday || false);
    setSaturdayCheck(days.saturday || false);
    setSundayCheck(days.sunday || false);
  }, [days]);

  return showDaysPicker ? (
    <View style={styles.daysContainer}>
      {firstDay === 'Sunday' && (
        <View style={styles.listItemDay}>
          <Text
            style={styles.listItemWhat}
            numberOfLines={1}
            ellipsizeMode="tail">
            {t('sundays')}
          </Text>
          <Pressable
            style={styles.listItemCheck}
            onPress={() =>
              toggleCheck(sundayCheck, setSundayCheck, 'sunday', days, setDays)
            }>
            {renderCheck(sundayCheck)}
          </Pressable>
        </View>
      )}
      <View style={styles.listItemDay}>
        <Text
          style={styles.listItemWhat}
          numberOfLines={1}
          ellipsizeMode="tail">
          {t('mondays')}
        </Text>
        <Pressable
          style={styles.listItemCheck}
          onPress={() =>
            toggleCheck(mondayCheck, setMondayCheck, 'monday', days, setDays)
          }>
          {renderCheck(mondayCheck)}
        </Pressable>
      </View>
      <View style={styles.listItemDay}>
        <Text
          style={styles.listItemWhat}
          numberOfLines={1}
          ellipsizeMode="tail">
          {t('tuesdays')}
        </Text>
        <Pressable
          style={styles.listItemCheck}
          onPress={() =>
            toggleCheck(tuesdayCheck, setTuesdayCheck, 'tuesday', days, setDays)
          }>
          {renderCheck(tuesdayCheck)}
        </Pressable>
      </View>
      <View style={styles.listItemDay}>
        <Text
          style={styles.listItemWhat}
          numberOfLines={1}
          ellipsizeMode="tail">
          {t('wednesdays')}
        </Text>
        <Pressable
          style={styles.listItemCheck}
          onPress={() =>
            toggleCheck(
              wednesdayCheck,
              setWednesdayCheck,
              'wednesday',
              days,
              setDays,
            )
          }>
          {renderCheck(wednesdayCheck)}
        </Pressable>
      </View>
      <View style={styles.listItemDay}>
        <Text
          style={styles.listItemWhat}
          numberOfLines={1}
          ellipsizeMode="tail">
          {t('thursdays')}
        </Text>
        <Pressable
          style={styles.listItemCheck}
          onPress={() =>
            toggleCheck(
              thursdayCheck,
              setThursdayCheck,
              'thursday',
              days,
              setDays,
            )
          }>
          {renderCheck(thursdayCheck)}
        </Pressable>
      </View>
      <View style={styles.listItemDay}>
        <Text
          style={styles.listItemWhat}
          numberOfLines={1}
          ellipsizeMode="tail">
          {t('fridays')}
        </Text>
        <Pressable
          style={styles.listItemCheck}
          onPress={() =>
            toggleCheck(fridayCheck, setFridayCheck, 'friday', days, setDays)
          }>
          {renderCheck(fridayCheck)}
        </Pressable>
      </View>
      <View style={styles.listItemDay}>
        <Text
          style={styles.listItemWhat}
          numberOfLines={1}
          ellipsizeMode="tail">
          {t('saturdays')}
        </Text>
        <Pressable
          style={styles.listItemCheck}
          onPress={() =>
            toggleCheck(
              saturdayCheck,
              setSaturdayCheck,
              'saturday',
              days,
              setDays,
            )
          }>
          {renderCheck(saturdayCheck)}
        </Pressable>
      </View>
      {firstDay === 'Monday' && (
        <View style={styles.listItemDay}>
          <Text
            style={styles.listItemWhat}
            numberOfLines={1}
            ellipsizeMode="tail">
            {t('sundays')}
          </Text>
          <Pressable
            style={styles.listItemCheck}
            onPress={() =>
              toggleCheck(sundayCheck, setSundayCheck, 'sunday', days, setDays)
            }>
            {renderCheck(sundayCheck)}
          </Pressable>
        </View>
      )}
    </View>
  ) : (
    <View style={styles.inputContainer}>
      <Pressable
        style={styles.input}
        onPress={() => {
          setShowDaysPicker(true);
          setDays(falseDays);
        }}>
        <Text style={styles.setter}>{placeholder}</Text>
      </Pressable>
    </View>
  );
};
