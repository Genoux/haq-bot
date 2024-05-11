import * as dotenv from 'dotenv';

dotenv.config();

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const haq_database = createClient(supabaseUrl, supabaseKey,  { db: { schema: 'aram_draft_pick' } });
const live_tournament = createClient(supabaseUrl, supabaseKey,  { db: { schema: 'live_tournament' } });
export default { haq_database, live_tournament };
