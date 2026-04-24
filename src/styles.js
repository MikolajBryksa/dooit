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
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    gap: {
      height: theme.dimensions.margin * 3,
    },
    topbar: {
      backgroundColor: theme.colors.surface,
      borderBottomColor: theme.colors.background,
      borderBottomWidth: 2,
    },
    navbar: {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.background,
      borderTopWidth: 2,
    },
    buttons: {
      flexDirection: 'row',
      gap: theme.dimensions.gap,
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      height: theme.dimensions.height,
    },
    onboarding__container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    onboarding__bar: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.dimensions.gap * 3,
      marginTop: theme.dimensions.gap * 3,
    },
    onboarding__input: {
      marginBottom: theme.dimensions.gap * 2,
      marginTop: theme.dimensions.gap * 2,
      height: theme.dimensions.gap * 5,
      width: '80%',
    },
    onboarding__terms: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '80%',
    },
    carousel: {
      marginTop: theme.dimensions.gap,
      alignSelf: 'stretch',
      marginBottom: theme.dimensions.gap,
    },
    carousel__list: {
      height: 160,
    },
    carousel__card__inner: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingVertical: theme.dimensions.gap * 2,
      paddingHorizontal: theme.dimensions.gap * 2,
      width: '80%',
      alignItems: 'center',
      height: 160,
      justifyContent: 'center',
    },
    carousel__card__title: {
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 6,
    },
    carousel__card__body: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    carousel__dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.dimensions.gap,
      gap: 6,
    },
    carousel__dot: {
      height: 8,
      borderRadius: 4,
    },
    carousel__dot__active: {
      width: 20,
      backgroundColor: 'white',
    },
    carousel__dot__inactive: {
      width: 8,
      backgroundColor: 'white',
      opacity: 0.7,
    },
    card: {
      backgroundColor: theme.colors.surface,
      marginBottom: theme.dimensions.gap,
      borderRadius: 12,
    },
    card__iconContainer: {
      width: '100%',
      height: 140,
      paddingTop: theme.dimensions.gap * 5,
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
    card__list: {
      flex: 1,
    },
    card__header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: theme.dimensions.height,
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
    progress__bar: {
      marginBottom: theme.dimensions.gap,
      height: theme.dimensions.margin,
      borderRadius: theme.dimensions.margin / 2,
    },
    settings__row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: theme.dimensions.height,
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
      borderRadius: 12,
      paddingRight: theme.dimensions.margin,
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
      color: theme.colors.primary,
    },
    chip: {
      borderRadius: 12,
    },
    chip__button: {
      borderRadius: 12,
      marginBottom: theme.dimensions.margin,
    },
    dialog: {
      backgroundColor: theme.colors.surface,
      elevation: 0,
      shadowOpacity: 0,
      shadowColor: 'transparent',
    },
    dialog__title: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: theme.dimensions.height / 2,
      marginBottom: theme.dimensions.gap,
      paddingLeft: 24,
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
      marginBottom: theme.dimensions.gap,
      paddingLeft: 16,
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
    segmentButtons: {
      marginVertical: theme.dimensions.gap,
    },
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
      fontFamily: 'Nunito-Bold',
      fontWeight: 'normal',
      letterSpacing: 0.5,
      marginTop: 4,
    },
    tip: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: theme.dimensions.gap,
    },
    tip__footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: theme.dimensions.gap,
      paddingBottom: theme.dimensions.gap,
    },
    tip__content: {
      padding: theme.dimensions.gap * 2,
    },
    terms__section: {
      marginBottom: theme.dimensions.gap,
    },
    terms__title: {
      marginBottom: theme.dimensions.gap,
      color: theme.colors.primary,
    },
    terms__body: {
      lineHeight: 22,
      marginBottom: theme.dimensions.gap,
      color: theme.colors.onSurface,
    },
  });
};
