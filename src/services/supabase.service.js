import {createClient} from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tusifknpymyhuiohqgjv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1c2lma25weW15aHVpb2hxZ2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDMzMTEsImV4cCI6MjA3NjA3OTMxMX0.xqCoEa3DY5px3m_XSbiV_74OeO0tj2YVkASDpu2TK3c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
