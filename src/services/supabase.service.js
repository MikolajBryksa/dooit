import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logError} from './errors.service';
import {getSettingValue, enableAdsIfDue} from './settings.service';
import {tryShowPendingAdsConsent} from './consent.service';
import store from '@/redux/store';
import {setSettings} from '@/redux/actions';

const SERVICE_NAME = 'supabase_auth';
const VERSION = require('../../package.json').version;
const LAST_ACTIVE_DATE_KEY = 'metrics_last_active_date';

const KeychainAdapter = {
  getItem: async key => {
    const credentials = await Keychain.getGenericPassword({
      service: `${SERVICE_NAME}_${key}`,
    });
    return credentials ? credentials.password : null;
  },
  setItem: async (key, value) => {
    await Keychain.setGenericPassword(key, value, {
      service: `${SERVICE_NAME}_${key}`,
    });
  },
  removeItem: async key => {
    await Keychain.resetGenericPassword({service: `${SERVICE_NAME}_${key}`});
  },
};

export const supabase = createClient(
  Config.SUPABASE_URL,
  Config.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: KeychainAdapter,
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

let initAuthPromise = null;

export const initializeAnonymousAuth = () => {
  if (__DEV__)
    return Promise.resolve({success: true, userId: null, error: null});
  if (initAuthPromise) return initAuthPromise;

  initAuthPromise = (async () => {
    const {
      data: {session},
    } = await supabase.auth.getSession();
    if (session?.user)
      return {success: true, userId: session.user.id, error: null};

    const {data, error} = await supabase.auth.signInAnonymously();
    if (error) throw error;

    return {success: true, userId: data.user.id, error: null};
  })().catch(e => {
    logError(e, 'initializeAnonymousAuth');
    initAuthPromise = null;
    throw e;
  });

  return initAuthPromise;
};

export const trackAppOpen = async () => {
  if (__DEV__) return;
  try {
    const auth = await initializeAnonymousAuth();
    const userId = auth?.userId;
    if (!userId) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastActive = await AsyncStorage.getItem(LAST_ACTIVE_DATE_KEY);
    if (lastActive === today) return;

    const {error} = await supabase.from('users').upsert(
      {
        user_id: userId,
        language: getSettingValue('language'),
        version: VERSION,
        updated_at: new Date().toISOString(),
      },
      {onConflict: 'user_id', ignoreDuplicates: false},
    );

    if (error) {
      logError(error, 'trackAppOpen');
      return;
    }

    await AsyncStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
  } catch (error) {
    logError(error, 'trackAppOpen');
  }
};

export const markActivated = async () => {
  if (__DEV__) return;
  try {
    await initializeAnonymousAuth();
    const {
      data: {session},
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    const {error} = await supabase
      .from('users')
      .update({activated_at: new Date().toISOString()})
      .eq('user_id', userId)
      .is('activated_at', null);

    if (error) logError(error, 'markActivated');
  } catch (error) {
    logError(error, 'markActivated');
  }
};

export const getCurrentUserToken = async () => {
  try {
    const {
      data: {session},
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    logError(error, 'getCurrentUserToken');
    return null;
  }
};

export const deleteUserData = async () => {
  if (__DEV__) {
    initAuthPromise = null;
    return;
  }
  try {
    const {
      data: {session},
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (userId) {
      await supabase.from('contact').delete().eq('user_id', userId);
      await supabase.from('errors').delete().eq('user_id', userId);
      await supabase.from('users').delete().eq('user_id', userId);
    }

    await supabase.auth.signOut();
    await AsyncStorage.removeItem(LAST_ACTIVE_DATE_KEY);
    initAuthPromise = null;
  } catch (error) {
    logError(error, 'deleteUserData');
    throw error;
  }
};

export const syncUserData = async (habits, streak) => {
  if (__DEV__) return;
  try {
    await initializeAnonymousAuth();
    const {
      data: {session},
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    const {error} = await supabase.from('users').upsert(
      {
        user_id: userId,
        user_name: getSettingValue('userName'),
        language: getSettingValue('language'),
        habits_json: habits,
        streak,
        version: VERSION,
        updated_at: new Date().toISOString(),
      },
      {onConflict: 'user_id'},
    );

    if (error) {
      logError(error, 'syncUserData');
    } else if (getSettingValue('pendingAdsConsent')) {
      await tryShowPendingAdsConsent();
    }

    const updated = enableAdsIfDue(session?.user?.created_at);
    if (updated) store.dispatch(setSettings(updated));
  } catch (error) {
    logError(error, 'syncUserData');
  }
};

export const getSupabaseUserId = async () => {
  try {
    const {
      data: {session},
    } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    logError(error, 'getSupabaseUserId');
    return null;
  }
};
