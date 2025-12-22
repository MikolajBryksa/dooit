import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logError} from './error-tracking.service';

export const supabase = createClient(
  Config.SUPABASE_URL,
  Config.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

export const initializeAnonymousAuth = async () => {
  try {
    const {
      data: {session},
    } = await supabase.auth.getSession();

    if (session?.user) {
      return {
        success: true,
        userId: session.user.id,
        error: null,
      };
    }

    const {data, error} = await supabase.auth.signInAnonymously();

    if (error) {
      logError(error, 'initializeAnonymousAuth');
      return {
        success: false,
        userId: null,
        error,
      };
    }

    return {
      success: true,
      userId: data.user.id,
      error: null,
    };
  } catch (error) {
    logError(error, 'initializeAnonymousAuth');
    return {
      success: false,
      userId: null,
      error,
    };
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
