import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      console.log('[Supabase Auth] Existing session found:', session.user.id);
      return {
        success: true,
        userId: session.user.id,
        error: null,
      };
    }

    const {data, error} = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('[Supabase Auth] Failed to sign in anonymously:', error);
      return {
        success: false,
        userId: null,
        error,
      };
    }

    console.log('[Supabase Auth] Anonymous session created:', data.user.id);
    return {
      success: true,
      userId: data.user.id,
      error: null,
    };
  } catch (error) {
    console.error('[Supabase Auth] Error initializing auth:', error);
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
    console.error('[Supabase Auth] Error getting user token:', error);
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
    console.error('[Supabase Auth] Error getting user ID:', error);
    return null;
  }
};
