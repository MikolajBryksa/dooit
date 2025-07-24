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
      width: '50%',
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
    card__deactivated: {
      minHeight: theme.dimensions.height,
      width: '100%',
      marginBottom: theme.dimensions.padding,
      opacity: 0.5,
    },
    // card__active: {
    //   minHeight: theme.dimensions.height,
    //   width: '100%',
    //   marginBottom: theme.dimensions.padding,
    //   backgroundColor: theme.colors.background,
    //   borderWidth: 1,
    //   borderColor: theme.colors.primary,
    //   shadowColor: theme.colors.primary,
    // },
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
