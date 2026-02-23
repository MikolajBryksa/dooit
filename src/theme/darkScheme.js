import {hexToRgba} from '@/utils';

const backgroundColor = '#1a1d23';
const boardColor = '#252931';
const buttonColor = '#53b7ff';
const textColor = '#e4e6ea';

export const darkScheme = {
  primary: buttonColor, // buttons
  onPrimary: backgroundColor, // text on buttons
  primaryContainer: backgroundColor, // clock selected background
  onPrimaryContainer: textColor, // clock outline
  surfaceVariant: backgroundColor, // clock and progress backround
  background: backgroundColor, // app background
  surface: boardColor, // card backround
  onSurface: textColor, // card text, selected icon text, clock text
  secondaryContainer: backgroundColor, // selected icon background
  onSecondaryContainer: textColor, // selected icon
  outline: buttonColor, // lines
  onSurfaceVariant: buttonColor, // icons
  surfaceDisabled: backgroundColor, // disabled button
  onSurfaceDisabled: buttonColor, // text on disabled button
  backdrop: hexToRgba(textColor, 0.5), // background under modal
  error: backgroundColor,
  elevation: {
    level0: 'transparent',
    level1: boardColor,
    level2: boardColor, // bottom nav background
    level3: boardColor,
    level4: boardColor,
    level5: boardColor,
  },
};
