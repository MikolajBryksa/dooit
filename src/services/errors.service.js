import {supabase, getSupabaseUserId} from './supabase.service';
import {getSettingValue} from './settings.service';
import realm from '@/storage/schemas';

const APP_VERSION = require('../../package.json').version;

export const logError = async (error, context = 'unknown') => {
  try {
    let supabaseUserId = null;
    let userName = null;

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

    const isFatal = context.includes('fatal');
    console.error('═══════════════════════════════════════');
    console.error(
      '⚠️  ERROR',
      isFatal ? '(FATAL - APP CRASH)' : '',
      `[${context}]`,
    );
    console.error('Message:', errorData.error_message);
    if (errorData.error_stack) {
      console.error('Stack:', errorData.error_stack);
    }
    console.error(
      'User:',
      errorData.user_name || 'Anonymous',
      errorData.user_id ? `(${errorData.user_id})` : '(no user ID)',
    );
    console.error('Version:', errorData.app_version);
    console.error('═══════════════════════════════════════');
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

    let currentUserId = null;
    let currentUserName = null;

    try {
      currentUserId = await getSupabaseUserId();
    } catch (e) {
      console.warn('Could not get user ID for error flush:', e);
    }

    try {
      currentUserName = getSettingValue('userName');
    } catch (e) {
      console.warn('Could not get user name for error flush:', e);
    }

    const errorsToSend = errors.map(e => ({
      error_message: e.error_message,
      error_stack: e.error_stack,
      context: e.context,
      app_version: e.app_version,
      user_id: currentUserId || e.user_id,
      user_name: currentUserName || e.user_name,
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
    return {success: true, sent: errorsToSend.length};
  } catch (e) {
    console.error('Failed to flush errors:', e);
    return {success: false, sent: 0, error: e.message};
  }
};

export const testErrorLogging = async () => {
  const testError = new Error(
    'TEST ERROR - This is a test error for debugging',
  );
  testError.stack = 'Test Stack Trace\n  at testErrorLogging\n  at User Action';
  await logError(testError, 'test_manual');
};

export const setupErrorTracking = () => {
  global.onunhandledrejection = event => {
    const reason = event?.reason || new Error('Unhandled promise rejection');
    logError(reason, 'unhandled_promise').catch(() => {});
  };

  const ErrorUtils = global.ErrorUtils;
  if (ErrorUtils?.setGlobalHandler) {
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      logError(error, isFatal ? 'global_fatal' : 'global_nonfatal').catch(
        () => {},
      );
    });
  }
};
