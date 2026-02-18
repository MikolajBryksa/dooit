import {StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
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
    onboarding__subtitle: {
      textAlign: 'center',
      marginTop: theme.dimensions.margin,
      marginHorizontal: theme.dimensions.gap,
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
      height: 140,
      paddingTop: theme.dimensions.gap * 2,
      paddingBottom: theme.dimensions.gap,
      marginBottom: theme.dimensions.gap * 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card__subtitleContainer: {
      width: '100%',
      height: 32,
      paddingBottom: theme.dimensions.margin,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card__titleContainer: {
      width: '100%',
      height: 72,
      paddingBottom: theme.dimensions.gap,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card__textContainer: {
      width: '100%',
      paddingHorizontal: theme.dimensions.gap,
      paddingBottom: theme.dimensions.gap,
    },
    card__buttonsContainer: {
      width: '100%',
      minHeight: 80,
      paddingTop: theme.dimensions.gap,
      paddingBottom: theme.dimensions.gap,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card__buttons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.dimensions.gap,
      alignItems: 'center',
      justifyContent: 'center',
    },
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
    card__divider: {
      height: 1,
      backgroundColor: theme.colors.background,
      marginBottom: theme.dimensions.margin,
    },
    card__headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    card__headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    card__headerTitle: {
      flex: 1,
      flexShrink: 1,
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
    summary__container: {
      flex: 1,
      width: '100%',
      paddingHorizontal: theme.dimensions.gap,
      marginBottom: theme.dimensions.margin,
    },
    summary__text: {
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: theme.dimensions.gap,
    },
    summary__habits: {
      marginBottom: theme.dimensions.height / 2,
    },
    summary__habit: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      paddingVertical: theme.dimensions.margin,
      paddingHorizontal: theme.dimensions.gap / 2,
      marginBottom: theme.dimensions.margin / 2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    summary__habit__icon: {
      margin: 0,
    },
    summary__habit__name: {
      flex: 1,
    },
    summary__habit__stats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    summary__habit__effectiveness: {
      fontWeight: '700',
      color: theme.colors.primary,
    },
    chip: {
      borderRadius: 12,
    },
    chip__button: {
      borderRadius: 12,
      marginBottom: theme.dimensions.margin,
    },
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
    modal__label: {
      marginBottom: theme.dimensions.margin,
    },
    segmentButtons: {
      marginVertical: theme.dimensions.gap,
    },
    selector__scroll: {
      maxHeight: 400,
    },
    selector__grid: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignContent: 'stretch',
    },
    selector__chip: {
      marginBottom: theme.dimensions.gap,
      borderWidth: 1,
    },
    selector__iconBtn: {
      marginBottom: theme.dimensions.gap,
    },
    settings__row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    // circle components
    circle__container: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle__centerContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle__flashText: {
      fontWeight: '800',
      letterSpacing: 0.5,
    },
  });
};
