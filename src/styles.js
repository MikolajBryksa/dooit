import {StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    // main elements
    container: {
      flex: 1,
      padding: theme.dimensions.gap,
      backgroundColor: theme.colors.background,
    },
    container__center: {
      flex: 1,
      padding: theme.dimensions.gap,
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
    gap: {
      height: theme.dimensions.margin * 3,
    },
    // onboarding
    onboarding__card: {
      height: theme.dimensions.height * 2,
      justifyContent: 'center',
      width: '100%',
      marginBottom: theme.dimensions.gap,
    },
    onboarding__bar: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.dimensions.gap * 3,
      marginTop: theme.dimensions.gap * 3,
    },
    onboarding__buttons: {
      flexDirection: 'row',
      gap: theme.dimensions.gap,
    },
    onboarding__input: {
      marginBottom: theme.dimensions.gap * 2,
      marginTop: theme.dimensions.gap * 2,
      height: theme.dimensions.gap * 5,
      width: '80%',
    },
    // buttons
    button: {
      alignSelf: 'center',
    },
    button__good: {
      alignSelf: 'center',
      backgroundColor: theme.colors.primary,
    },
    button__bad: {
      alignSelf: 'center',
      backgroundColor: theme.colors.error,
    },
    // now card
    card: {
      marginBottom: theme.dimensions.gap,
    },
    card__outline: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
      borderWidth: 2,
      marginBottom: theme.dimensions.gap,
    },
    card__center: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.dimensions.gap,
    },
    card__iconContainer: {
      width: '100%',
      paddingTop: theme.dimensions.gap,
      paddingBottom: theme.dimensions.gap * 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card__titleContainer: {
      width: '100%',
      paddingBottom: theme.dimensions.gap,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card__progressContainer: {
      width: '100%',
      paddingBottom: theme.dimensions.gap,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card__contentContainer: {
      width: '100%',
      paddingBottom: theme.dimensions.gap,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card__textContainer: {
      width: '100%',
      flex: 1,
    },
    card__buttonsContainer: {
      width: '100%',
      paddingBottom: theme.dimensions.gap,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card__choices: {
      paddingTop: theme.dimensions.gap,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card__choicesTitleContainer: {
      height: theme.dimensions.height / 2,
      justifyContent: 'center',
    },
    card__buttons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingTop: theme.dimensions.gap,
      gap: theme.dimensions.gap,
      alignItems: 'center',
      minHeight: theme.dimensions.height,
    },
    progress__container: {
      width: '50%',
    },
    progress__bar: {
      marginVertical: theme.dimensions.gap,
      height: theme.dimensions.margin,
      borderRadius: theme.dimensions.margin / 2,
    },
    summary__card: {
      marginBottom: theme.dimensions.gap * 2,
    },
    summary_container: {
      flex: 1,
      width: '100%',
      paddingHorizontal: theme.dimensions.gap,
      paddingBottom: theme.dimensions.margin,
    },
    summary__text: {
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: theme.dimensions.gap,
    },
    // habit & settings card
    card__list: {
      flex: 1,
    },
    card__header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: theme.dimensions.height * 0.8,
    },
    card__options: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.dimensions.margin,
    },
    card__row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chip: {
      borderRadius: 12,
    },
    chip__button: {
      borderRadius: 12,
      marginBottom: theme.dimensions.margin,
    },
    // modal
    modal: {
      backgroundColor: theme.colors.surface,
      margin: theme.dimensions.gap * 2,
      paddingTop: theme.dimensions.gap * 2,
      paddingBottom: theme.dimensions.gap * 2,
      paddingHorizontal: theme.dimensions.gap,
      borderRadius: 28,
    },
    modal__title: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: theme.dimensions.height / 2,
      marginBottom: theme.dimensions.margin,
    },
    segmentButtons: {
      marginVertical: theme.dimensions.gap,
    },
  });
};
