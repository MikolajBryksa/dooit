import {hexToRgba} from '@/utils';

const backgroundColor = '#eef1f5';
const boardColor = '#ffffff';
const outlineColor = '#cfd8dc';
const buttonColor = '#1565c0';
const textColor = '#1a2b3c';
const disabledButtonColor = '#e3e7ed';
const disabledTextColor = '#9aa4b2';
const successColor = '#2e7d57';
const errorColor = '#c0564a';

export const lightScheme = {
  primary: buttonColor, // buttons
  onPrimary: boardColor, // text on buttons
  primaryContainer: backgroundColor, // clock selected background
  onPrimaryContainer: textColor, // clock outline
  surfaceVariant: backgroundColor, // clock and progress backround
  background: backgroundColor, // app background
  surface: boardColor, // card backround
  onSurface: textColor, // card text, selected icon text, clock text
  secondaryContainer: backgroundColor, // selected icon background
  onSecondaryContainer: textColor, // selected icon
  outline: outlineColor, // lines
  onSurfaceVariant: buttonColor, // icons
  surfaceDisabled: disabledButtonColor, // disabled button
  onSurfaceDisabled: disabledTextColor, // text on disabled button
  backdrop: hexToRgba(textColor, 0.5), // background under modal
  success: successColor,
  error: errorColor,
  elevation: {
    level0: 'transparent',
    level1: boardColor,
    level2: boardColor, // bottom nav background
    level3: boardColor,
    level4: boardColor,
    level5: boardColor,
  },
};
