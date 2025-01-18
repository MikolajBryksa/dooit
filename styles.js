import {StyleSheet} from 'react-native';

export const COLORS = {
  primary: '#836FFF',
  primary50: '#836FFF50',
  primary25: '#836FFF25',
  secondary: '#15F5BA',
  text: '#F0F3FF',
  background: '#211951',
};

export const DIMENSIONS = {
  height: 60,
  padding: 10,
  margin: 5,
};

export const styles = StyleSheet.create({
  container: {
    padding: DIMENSIONS.padding,
    backgroundColor: COLORS.background,
    flex: 1,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
  },
  scrollView: {
    marginBottom: DIMENSIONS.margin,
    flex: 1,
  },
  gap: {
    width: '100%',
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
    borderRadius: DIMENSIONS.margin,
  },
  toast: {
    height: DIMENSIONS.height,
    width: '95%',
    borderColor: COLORS.secondary,
    borderWidth: 1,
    backgroundColor: COLORS.background,
    marginBottom: DIMENSIONS.margin,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: DIMENSIONS.margin,
    borderRadius: DIMENSIONS.margin,
  },
  tableItem: {
    height: DIMENSIONS.height,
    width: '100%',
    padding: DIMENSIONS.padding,
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
    borderRadius: DIMENSIONS.margin,
  },
  when: {
    color: COLORS.primary,
  },
  what: {
    color: COLORS.text,
    textAlign: 'right',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    height: DIMENSIONS.height,
    width: '100%',
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
    alignItems: 'center',
    borderRadius: DIMENSIONS.margin,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  incrementator: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  setter: {
    height: '100%',
    color: COLORS.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  timer: {
    display: 'flex',
    flexDirection: 'row',
    gap: DIMENSIONS.margin,
  },
  clockContainer: {
    flex: 1,
    height: DIMENSIONS.height,
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
    justifyContent: 'center',
    borderRadius: DIMENSIONS.margin,
  },
  clock: {
    height: '100%',
    textAlign: 'center',
    backgroundColor: COLORS.background,
    text: {
      color: COLORS.text,
    },
    pickerItemContainer: {
      width: '100%',
    },
    pickerLabelContainer: {
      right: -20,
      top: 0,
      bottom: 6,
      width: 40,
      alignItems: 'center',
    },
    pickerAmPmContainer: {
      right: 30,
      top: 10,
    },
  },
  daysContainer: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
    justifyContent: 'center',
    borderRadius: DIMENSIONS.margin,
  },
  center: {
    color: COLORS.secondary,
  },
  centerIcon: {
    fontSize: DIMENSIONS.height / 2,
    color: COLORS.secondary,
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    height: DIMENSIONS.height,
    width: '100%',
    padding: DIMENSIONS.padding,
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
    alignItems: 'center',
    borderRadius: DIMENSIONS.margin,
  },
  listItemDay: {
    display: 'flex',
    flexDirection: 'row',
    height: DIMENSIONS.height * 0.8,
    width: '100%',
    padding: DIMENSIONS.padding,
    alignItems: 'center',
  },
  listItemWhat: {
    color: COLORS.text,
    flex: 1,
  },
  listItemCheck: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: DIMENSIONS.padding * 2,
    color: COLORS.text,
  },
  listItemChange: {
    color: COLORS.primary,
  },
  switch: {},
  listItemActive: {
    borderColor: COLORS.secondary,
  },
  calendar: {
    width: '100%',
    height: 368,
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
    paddingTop: 3,
    borderRadius: DIMENSIONS.margin,
  },
  calendarTheme: {
    backgroundColor: COLORS.background,
    calendarBackground: COLORS.background,
    textSectionTitleColor: COLORS.primary,
    selectedDayTextColor: COLORS.text,
    todayTextColor: COLORS.primary,
    dayTextColor: COLORS.primary,
    textDisabledColor: COLORS.background,
    monthTextColor: COLORS.text,
  },
  header: {
    height: DIMENSIONS.height,
    width: '100%',
    padding: DIMENSIONS.padding,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DIMENSIONS.margin,
  },
  controllers: {
    flexDirection: 'row',
    gap: DIMENSIONS.margin,
  },
  controlButton: {
    height: DIMENSIONS.height,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderRadius: DIMENSIONS.margin,
  },
  empty: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: DIMENSIONS.margin,
  },
  circleButton: {
    marginTop: DIMENSIONS.padding,
    width: DIMENSIONS.height * 1.5,
    height: DIMENSIONS.height * 1.5,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DIMENSIONS.height * 0.75,
  },
  shadowButton: {
    marginTop: DIMENSIONS.padding,
    width: DIMENSIONS.height,
    height: DIMENSIONS.height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: DIMENSIONS.height,
    color: COLORS.background,
  },
  footer: {
    paddingTop: 0,
    borderTopWidth: DIMENSIONS.margin,
    borderTopColor: COLORS.primary,
    height: DIMENSIONS.height,
    backgroundColor: COLORS.background,
  },
});
