import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';

export const supabase = createClient(
  Config.SUPABASE_URL,
  Config.SUPABASE_ANON_KEY,
);
