const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://vgwlnsycdohrfmrfjprl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0',
  {
    db: { schema: 'public' }
  }
)

async function checkFunction() {
  console.log('Checking if notify_tracking_update function exists...\n')
  
  // Try to call the function directly (will fail but we can see if it exists)
  const { data, error } = await supabase.rpc('notify_tracking_update')
  
  if (error) {
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      console.log('❌ Function notify_tracking_update does NOT exist')
      console.log('Error:', error.message)
    } else {
      console.log('✅ Function exists (error is expected - trigger functions cannot be called directly)')
      console.log('Error:', error.message)
    }
  } else {
    console.log('Function returned data:', data)
  }
}

checkFunction()
