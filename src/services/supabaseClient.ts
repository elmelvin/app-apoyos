import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lqbpuvjyvyhlrqtrumdx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxYnB1dmp5dnlobHJxdHJ1bWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzU2NjgsImV4cCI6MjA4ODI1MTY2OH0.Q7sSRo7FuFRRrprWvIrgzLmSrdsedHEbfeyawV3B5lk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)