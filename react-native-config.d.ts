declare module 'react-native-config' {
  export interface NativeConfig {
    // Supabase configuration
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;

    // AI API configuration
    HINT_GENERATOR_API_URL: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
