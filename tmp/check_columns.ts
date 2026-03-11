
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
  const { data, error } = await supabase.from('payments').select('*').limit(1)
  if (error) {
    console.error(error)
  } else {
    console.log(Object.keys(data[0] || {}))
  }
}

checkColumns()
