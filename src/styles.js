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
    container__center: {
      flex: 1,
      padding: theme.dimensions.padding,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topBar__shadow: {
      borderBottomWidth: 3,
      borderBottomColor: theme.colors.background,
    },
    bottomBar__shadow: {
      borderTopWidth: 3,
      borderTopColor: theme.colors.background,
    },
    onboarding__card: {
      height: theme.dimensions.height * 2,
      justifyContent: 'center',
      width: '100%',
      marginBottom: theme.dimensions.padding,
    },
    onboarding__bar: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.dimensions.padding * 3,
      marginTop: theme.dimensions.padding * 3,
    },
    button: {
      alignSelf: 'center',
    },
    title: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: theme.dimensions.height / 2,
      marginBottom: theme.dimensions.margin,
    },
    card: {
      minHeight: theme.dimensions.height,
      width: '100%',
      marginBottom: theme.dimensions.padding,
    },
    card__container: {
      flex: 1,
    },
    card__center: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.dimensions.padding,
    },
    card__deactivated: {
      minHeight: theme.dimensions.height,
      width: '100%',
      marginBottom: theme.dimensions.padding,
      opacity: 0.5,
    },
    card__selected: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
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
      flex: 1,
      marginTop: theme.dimensions.padding,
      gap: theme.dimensions.padding,
      alignItems: 'center',
    },
    chip: {
      borderRadius: 12,
    },
    chip__button: {
      borderRadius: 12,
      marginBottom: theme.dimensions.margin,
    },
    segment: {
      marginVertical: theme.dimensions.padding,
    },
    progressBar: {
      marginVertical: theme.dimensions.margin,
    },
    gap: {
      height: theme.dimensions.margin * 3,
    },
    modal: {
      backgroundColor: theme.colors.surface,
      margin: theme.dimensions.padding,
      paddingTop: theme.dimensions.padding,
      paddingBottom: theme.dimensions.padding,
      borderRadius: 12,
    },
    plan: {
      maxHeight: 400,
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
  });
};
