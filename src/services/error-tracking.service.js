import {supabase, getSupabaseUserId} from './supabase.service';
import {getSettingValue} from './settings.service';
import realm from '@/storage/schemas';

const APP_VERSION = require('../../package.json').version;

export const logError = async (error, context = 'unknown') => {
  console.error(`Logging error in context: ${context}`, error);

  try {
    let supabaseUserId = 'unknown';
    let userName = 'unknown';

    try {
      const id = await getSupabaseUserId();
      if (id) supabaseUserId = id;
    } catch (e) {}

    try {
      const name = getSettingValue('userName');
      if (name) userName = name;
    } catch (e) {}

    const errorData = {
      error_message: error?.message || String(error),
      error_stack: error?.stack || null,
      context,
      app_version: APP_VERSION,
      user_id: supabaseUserId,
      user_name: userName,
      created_at: new Date().toISOString(),
    };

    await queueErrorLocally(errorData);

    if (__DEV__) {
      console.log(`🐛 [${context}]:`, errorData.error_message);
    }
  } catch (e) {
    console.error('Failed to queue error:', e);
  }
};

const queueErrorLocally = async errorData => {
  try {
    const errorId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    realm.write(() => {
      realm.create('ErrorLog', {
        id: errorId,
        ...errorData,
      });

      // Keep only last 3 errors
      const allErrors = realm.objects('ErrorLog').sorted('created_at', false);
      if (allErrors.length > 3) {
        realm.delete(allErrors.slice(3));
      }
    });
  } catch (e) {
    console.error('Failed to queue error:', e);
  }
};

export const flushErrorQueue = async () => {
  try {
    const errors = realm.objects('ErrorLog');

    if (errors.length === 0) {
      return {success: true, sent: 0};
    }

    if (!supabase?.from) {
      return {success: false, sent: 0, error: 'Supabase not available'};
    }

    const errorsToSend = errors.map(e => ({
      error_message: e.error_message,
      error_stack: e.error_stack,
      context: e.context,
      app_version: e.app_version,
      user_id: e.user_id,
      user_name: e.user_name,
      created_at: e.created_at,
    }));

    const {error: supabaseError} = await supabase
      .from('errors')
      .insert(errorsToSend);

    if (supabaseError) {
      console.error('Failed to send errors:', supabaseError);
      return {success: false, sent: 0, error: supabaseError.message};
    }

    // Delete errors after successful send to prevent duplicates
    realm.write(() => realm.delete(errors));

    console.log(`Sent ${errorsToSend.length} errors to database`);
    return {success: true, sent: errorsToSend.length};
  } catch (e) {
    console.error('Failed to flush errors:', e);
    return {success: false, sent: 0, error: e.message};
  }
};

export const setupErrorTracking = () => {
  global.onunhandledrejection = event => {
    const reason = event?.reason || new Error('Unhandled promise rejection');
    logError(reason, 'unhandled_promise').catch(() => {});
  };

  if (!__DEV__) {
    const ErrorUtils = global.ErrorUtils;
    if (ErrorUtils?.setGlobalHandler) {
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        console.error('═══════════════════════════════════════');
        console.error(
          '⚠️ GLOBAL ERROR',
          isFatal ? '(FATAL - APP CRASH)' : '(NON-FATAL)',
        );
        console.error('Message:', error?.message || error);
        if (error?.stack) {
          console.error('Stack:', error.stack);
        }
        console.error('═══════════════════════════════════════');

        logError(error, isFatal ? 'global_fatal' : 'global_nonfatal').catch(
          () => {},
        );
      });
    }
  }
};
