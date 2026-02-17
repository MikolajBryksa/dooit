import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logError} from './errors.service';

export const supabase = createClient(
  Config.SUPABASE_URL,
  Config.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
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
