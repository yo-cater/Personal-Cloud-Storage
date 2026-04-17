// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcfantmpskzwxexfwafi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjZmFudG1wc2t6d3hleGZ3YWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTU3NzgsImV4cCI6MjA5MTc5MTc3OH0.ltDjCjoxD6lx2CZYAGwa00avNjDVLVZJD53RxUzNowY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);