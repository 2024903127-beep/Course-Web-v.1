// assets/js/supabase.js

const SUPABASE_URL = "https://nrhpiwtoqaucfqpsslsw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yaHBpd3RvcWF1Y2ZxcHNzbHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzQwNDQsImV4cCI6MjA4NTYxMDA0NH0.su5cGjd9J3U66TVToJroC0R5DHgI1AT0wTb-4dfuaUI";

window.supabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  }
);

// Expose for edge function calls
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
