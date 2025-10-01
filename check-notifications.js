const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://vgwlnsycdohrfmrfjprl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0'
)

async function checkNotifications() {
  console.log('Checking if notifications table exists...\n')
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .limit(1)
  
  if (error) {
    console.log('Error or table does not exist:')
    console.log(error)
  } else {
    console.log('Table exists. Columns:')
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]))
    } else {
      console.log('Table exists but empty')
    }
  }
}

checkNotifications()
