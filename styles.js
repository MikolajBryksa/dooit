import {StyleSheet} from 'react-native';

export const COLORS = {
  primary: '#836FFF',
  secondary: '#15F5BA',
  text: '#F0F3FF',
  background: '#211951',
};

export const DIMENSIONS = {
  row: 60,
  height: 40,
  padding: 10,
  margin: 5,
};

export const styles = StyleSheet.create({
  container: {
    padding: DIMENSIONS.padding,
    backgroundColor: COLORS.background,
    flex: 1,
  },
  scrollView: {
    marginBottom: DIMENSIONS.margin,
    flex: 1,
  },
  toast: {
    height: DIMENSIONS.height * 3 + DIMENSIONS.margin,
    width: '95%',
    borderColor: COLORS.secondary,
    borderWidth: 1,
    backgroundColor: COLORS.background,
    marginBottom: DIMENSIONS.margin,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: DIMENSIONS.margin,
  },
  tableItem: {
    height: DIMENSIONS.row,
    width: '100%',
    padding: DIMENSIONS.padding,
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
  },
  when: {
    color: COLORS.primary,
  },
  what: {
    color: COLORS.text,
    textAlign: 'right',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inputContainer: {
    height: DIMENSIONS.row,
    width: '100%',
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
  },
  input: {
    height: '100%',
    color: COLORS.text,
    textAlign: 'center',
  },
  center: {
    color: COLORS.secondary,
    paddingTop: 3,
  },
  centerIcon: {
    fontSize: DIMENSIONS.height / 2,
    color: COLORS.secondary,
  },
  listItem: {
    flexDirection: 'row',
    height: DIMENSIONS.row,
    width: '100%',
    padding: DIMENSIONS.padding,
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lisItemWhat: {
    color: COLORS.text,
  },
  listItemActive: {
    borderColor: COLORS.secondary,
  },
  calendar: {
    width: '100%',
    height: DIMENSIONS.height * 9,
    borderColor: COLORS.primary,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
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
  info: {
    height: DIMENSIONS.height * 3 + DIMENSIONS.margin,
    width: '100%',
    padding: DIMENSIONS.padding,
    borderColor: COLORS.secondary,
    borderWidth: 1,
    marginBottom: DIMENSIONS.margin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controllers: {
    flexDirection: 'row',
    gap: DIMENSIONS.margin,
  },
  controlButton: {
    height: DIMENSIONS.height * 3,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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
