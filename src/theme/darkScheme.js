import {hexToRgba} from '@/utils';

const backgroundColor = '#181b20';
const boardColor = '#23272f';
const outlineColor = '#434d5f';
const buttonColor = '#4dafff';
const textColor = '#f1f3f6';
const disabledButtonColor = '#2a2f38';
const disabledTextColor = '#6f7785';

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
  outline: outlineColor, // lines
  onSurfaceVariant: buttonColor, // icons
  surfaceDisabled: disabledButtonColor, // disabled button
  onSurfaceDisabled: disabledTextColor, // text on disabled button
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
