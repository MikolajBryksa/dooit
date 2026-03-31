import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';
import * as Keychain from 'react-native-keychain';
import {logError} from './errors.service';

const SERVICE_NAME = 'supabase_auth';

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
    initAuthPromise = null;
  } catch (error) {
    logError(error, 'deleteUserData');
    throw error;
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
