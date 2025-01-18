import React, {useEffect, useState, useRef} from 'react';
import {View, TextInput, Pressable, Text} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {TimerPicker} from 'react-native-timer-picker';
import {renderCheck} from '../utils';
import {styles, COLORS} from '../styles';
import {
  renderArrow,
  convertTimeToObject,
  getCurrentTime,
  formatDateWithDay,
  getMarkedDates,
  formatNumericInput,
  limitTextInput,
  formatDate,
} from '../utils';
import {useTranslation} from 'react-i18next';

export const WhatInput = ({
  what,
  setWhat,
  placeholder,
  inputModeType = 'numeric',
  incrementator,
}) => {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

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
          ref={inputRef}
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
          maxLength={60}
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
};

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

export const TimeInput = ({
  showTimePicker,
  setShowTimePicker,
  time,
  setTime,
  clockFormat,
  placeholder,
}) => (
  <View style={styles.timer}>
    {showTimePicker ? (
      <View style={styles.clockContainer}>
        <TimerPicker
          use12HourPicker={clockFormat === '12h'}
          padWithNItems={0}
          hideSeconds={true}
          hourLabel=":"
          minuteLabel={false}
          styles={styles.clock}
          padHoursWithZero={true}
          initialValue={
            time
              ? convertTimeToObject(time)
              : convertTimeToObject(getCurrentTime())
          }
          onDurationChange={duration => {
            const hours = duration.hours.toString().padStart(2, '0');
            const minutes = duration.minutes.toString().padStart(2, '0');
            setTime(`${hours}:${minutes}`);
          }}
        />
      </View>
    ) : (
      <Pressable
        style={styles.clockContainer}
        onPress={() => setShowTimePicker(true)}>
        <Text style={styles.setter}>{placeholder}</Text>
      </Pressable>
    )}
  </View>
);

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
      <Pressable style={styles.input} onPress={() => setShowDaysPicker(true)}>
        <Text style={styles.setter}>{placeholder}</Text>
      </Pressable>
    </View>
  );
};
