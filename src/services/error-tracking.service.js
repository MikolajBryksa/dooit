import {supabase} from './supabase.service';
import {getSettingValue} from './settings.service';

const APP_VERSION = require('../../package.json').version;

export const logError = async (error, context = 'unknown') => {
  try {
    const errorData = {
      error_message: error?.message || String(error),
      error_stack: error?.stack || null,
      context: context,
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

  if (!__DEV__) {
    // @ts-ignore
    const ErrorUtils = global.ErrorUtils;
    if (ErrorUtils) {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        logError(error, 'global_error');
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }
  }
};
