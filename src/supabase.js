import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qwfmohgffkmfliqmpykz.supabase.co'

const supabasePublishableKey =
  'sb_publishable_ZzPxxMyBKoKnwIwR-ufe4Q_0xupv5bE'

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
)