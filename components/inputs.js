import React from 'react';
import {View, TextInput, Pressable, Text} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {TimerPicker} from 'react-native-timer-picker';
import {styles, COLORS} from '../styles';
import {
  renderArrow,
  convertTimeToObject,
  getCurrentTime,
  formatDateWithDay,
  getMarkedDates,
} from '../utils';

export const WhatInput = ({
  inputRef,
  what,
  setWhat,
  placeholder,
  inputModeType = 'numeric',
  incrementator,
}) => (
  <View style={styles.inputContainer}>
    {incrementator && (
      <>
        <Pressable
          style={styles.incrementator}
          onPress={() => {
            const increasedValue =
              parseFloat(Number(what)) + parseFloat(incrementator);
            setWhat(increasedValue.toFixed(2));
          }}>
          {renderArrow('up')}
        </Pressable>
      </>
    )}
    <TextInput
      ref={inputRef}
      style={styles.input}
      value={what}
      onChangeText={text => setWhat(text)}
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
            const decreasedValue =
              parseFloat(Number(what)) - parseFloat(incrementator);
            setWhat(decreasedValue.toFixed(2));
          }}>
          {renderArrow('down')}
        </Pressable>
      </>
    )}
  </View>
);

export const WhenInput = ({
  showCalendar,
  setShowCalendar,
  when,
  setWhen,
  data,
}) =>
  showCalendar ? (
    <View style={styles.calendar}>
      <Calendar
        onDayPress={day => {
          setWhen(day.dateString);
        }}
        initialDate={when}
        firstDay={1}
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
          setWhen(currentDate.toISOString().split('T')[0]);
        }}>
        {renderArrow('left')}
      </Pressable>
      <Pressable style={styles.input} onPress={() => setShowCalendar(true)}>
        <Text style={styles.input}>{formatDateWithDay(when)}</Text>
      </Pressable>
      <Pressable
        style={styles.incrementator}
        onPress={() => {
          const currentDate = new Date(when);
          currentDate.setDate(currentDate.getDate() + 1);
          setWhen(currentDate.toISOString().split('T')[0]);
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
}) => (
  <View style={styles.timer}>
    {showTimePicker ? (
      <View style={styles.clockContainer}>
        <TimerPicker
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
        <Text style={styles.setter}>Set time</Text>
      </Pressable>
    )}
  </View>
);
