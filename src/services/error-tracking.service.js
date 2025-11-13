import {supabase} from './supabase.service';
import {getSettingValue} from './settings.service';

const APP_VERSION = require('../../package.json').version;

export const logError = async (error, screen = 'unknown') => {
  try {
    const errorData = {
      error_message: error?.message || String(error),
      error_stack: error?.stack || null,
      screen: screen,
      app_version: APP_VERSION,
      user_id: getSettingValue('userId') || 'unknown',
      user_name: getSettingValue('userName') || 'unknown',
    };

    const {error: supabaseError} = await supabase
      .from('Errors')
      .insert([errorData]);

    if (supabaseError) {
      console.error('Failed to log error:', supabaseError);
    }
  } catch (logError) {
    console.error('Error in logError:', logError);
  }
};

export const setupErrorTracking = () => {
  global.onunhandledrejection = event => {
    logError(event.reason, 'unhandled_promise');
  };
};
