import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vbcvbruvqvbvkouiutdz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiY3ZicnV2cXZidmtvdWl1dGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDc0MjAsImV4cCI6MjA5MDI4MzQyMH0.CB8aj7-K7br2CN3MJgF7dbIUZfT4CMnLYjFVM4aZ5KQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)