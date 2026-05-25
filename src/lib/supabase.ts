/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lvcjhvfbcdnvkdzvlysb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Y2podmZiY2RudmtkenZseXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MTU5ODQsImV4cCI6MjA5NDk5MTk4NH0.gdBPF_OPPbNeUgZJN6831zjgZJzkOnstbO3kAJgw-48';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
