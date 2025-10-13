import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://flmudobluiyzllvgrwhs.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbXVkb2JsdWl5emxsdmdyd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjEzMzcsImV4cCI6MjA3NTkzNzMzN30.UnoJlCpU4xZgFFCTmvEYHhf9AmIZ2WwgaoemWVjpT4o';

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
