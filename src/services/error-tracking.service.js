import {supabase} from './supabase.service';
import {getSettingValue} from './settings.service';

const APP_VERSION = require('../../package.json').version;

export const logError = async (error, context = 'unknown') => {
  console.error(`Logging error in context: ${context}`, error);

  try {
    let userId = 'unknown';
    let userName = 'unknown';

    try {
      const id = getSettingValue('userId');
      if (id) {
        userId = id;
      }
    } catch (e) {
      console.error('[logError] Failed to read userId from settings:', e);
    }

    try {
      const name = getSettingValue('userName');
      if (name) {
        userName = name;
      }
    } catch (e) {
      console.error('[logError] Failed to read userName from settings:', e);
    }

    const errorData = {
      error_message: error?.message || String(error),
      error_stack: error?.stack || null,
      context,
      app_version: APP_VERSION,
      user_id: userId,
      user_name: userName,
      created_at: new Date().toISOString(),
    };

    if (!supabase || typeof supabase.from !== 'function') {
      console.error(
        '[logError] Supabase client not available, skipping remote log',
      );
      return;
    }

    const {error: supabaseError} = await supabase
      .from('Errors')
      .insert([errorData]);

    if (supabaseError) {
      console.error('Failed to save error in Supabase:', supabaseError);
    }
  } catch (e) {
    console.error('Failed to log error:', e);
  }
};

export const setupErrorTracking = () => {
  try {
    global.onunhandledrejection = event => {
      try {
        const reason =
          event?.reason ||
          new Error('Unhandled promise rejection with no reason');
        logError(reason, 'unhandled_promise');
      } catch (e) {
        console.error(
          '[setupErrorTracking] Failed to log unhandled promise rejection:',
          e,
        );
      }
    };
  } catch (e) {
    console.error(
      '[setupErrorTracking] Failed to attach onunhandledrejection handler:',
      e,
    );
  }

  if (!__DEV__) {
    try {
      // @ts-ignore
      const ErrorUtils = global.ErrorUtils;

      if (ErrorUtils && typeof ErrorUtils.setGlobalHandler === 'function') {
        ErrorUtils.setGlobalHandler((error, isFatal) => {
          try {
            logError(
              error,
              isFatal ? 'global_error_fatal' : 'global_error_nonfatal',
            );
          } catch (e) {
            console.error(
              '[setupErrorTracking] Failed to log global error:',
              e,
            );
          }

          console.error(
            '[GlobalErrorHandler] Caught error',
            isFatal ? '(fatal)' : '',
            error,
          );
        });
      }
    } catch (e) {
      console.error(
        '[setupErrorTracking] Failed to setup global ErrorUtils handler:',
        e,
      );
    }
  }
};
