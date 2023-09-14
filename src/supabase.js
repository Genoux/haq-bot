import * as dotenv from 'dotenv';

dotenv.config();

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const draftDBUrl = process.env.DRAFT_DB_URL || '';
const draftDBKey = process.env.DRAFT_DB_ANON_KEY || '';

const haq_database = createClient(supabaseUrl, supabaseKey);
const draft_database = createClient(draftDBUrl, draftDBKey);
export default { haq_database, draft_database };
