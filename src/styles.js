import {StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.dimensions.padding,
      backgroundColor: theme.colors.background,
    },
    topBar__shadow: {
      borderBottomWidth: 3,
      borderBottomColor: theme.colors.background,
    },
    bottomBar__shadow: {
      borderTopWidth: 3,
      borderTopColor: theme.colors.background,
    },
    loading__container: {
      flex: 1,
      padding: theme.dimensions.padding,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loading__text: {
      marginTop: theme.dimensions.padding,
    },
    onboarding__card: {
      height: theme.dimensions.height * 2,
      justifyContent: 'center',
      width: '100%',
      marginBottom: theme.dimensions.padding,
    },
    onboarding__title: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.dimensions.padding * 3,
    },
    onboarding__button: {
      marginTop: theme.dimensions.padding * 3,
    },
    disabled: {
      opacity: 0.5,
    },
    targetScore: {
      flexDirection: 'row',
      gap: theme.dimensions.margin,
    },
    input: {
      flex: 1,
    },
    title: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: theme.dimensions.height / 2,
      marginBottom: theme.dimensions.margin,
    },
    rowActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    card: {
      minHeight: theme.dimensions.height,
      width: '100%',
      marginBottom: theme.dimensions.padding,
    },
    card__container: {
      flex: 1,
    },
    card__deactivated: {
      minHeight: theme.dimensions.height,
      width: '100%',
      marginBottom: theme.dimensions.padding,
      opacity: 0.5,
    },
    card__active: {
      minHeight: theme.dimensions.height,
      width: '100%',
      marginBottom: theme.dimensions.padding,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
    },
    card__title: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: theme.dimensions.height * 0.8,
    },
    card__options: {
      flexDirection: 'row',
      alignItems: 'center',
      maxHeight: theme.dimensions.height / 3,
    },
    card__row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    card__buttons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.dimensions.margin,
      marginLeft: 'auto',
    },
    chip: {
      borderRadius: 12,
    },
    time: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressBar: {
      marginVertical: theme.dimensions.margin,
    },
    progressExcess: {
      color: theme.colors.secondary,
    },
    button: {
      marginVertical: theme.dimensions.padding,
      backgroundColor: theme.colors.primary,
    },
    gap: {
      height: theme.dimensions.margin * 3,
    },
    noProgress: {
      marginBottom: theme.dimensions.padding,
      color: theme.colors.onSurface,
    },
    modal: {
      backgroundColor: theme.colors.surface,
      margin: theme.dimensions.padding,
      paddingTop: theme.dimensions.padding,
      paddingBottom: theme.dimensions.padding,
      borderRadius: 12,
    },
    daysSelector__container: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      flexDirection: 'row',
      width: '100%',
      marginTop: theme.dimensions.margin,
    },
    daysSelector__chip: {
      marginLeft: theme.dimensions.margin,
      borderRadius: 25,
    },
    calendar: {
      height: theme.dimensions.height * 7.5,
    },
  });
};
