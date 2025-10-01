const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://vgwlnsycdohrfmrfjprl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0'
)

async function checkTrigger() {
  console.log('Checking if tracking notification trigger exists...\n')
  
  // Check if function exists
  const { data: functions, error: funcError } = await supabase.rpc('pg_get_functiondef', {
    funcid: 'notify_tracking_update'
  }).single()
  
  if (funcError) {
    console.log('❌ Function notify_tracking_update NOT found')
    console.log('Error:', funcError.message)
  } else {
    console.log('✅ Function notify_tracking_update EXISTS')
  }
  
  // Check if there are any notifications of type tracking_update
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('id, notification_type, created_at')
    .eq('notification_type', 'tracking_update')
    .limit(5)
  
  if (notifError) {
    console.log('\n❌ Error checking notifications:', notifError.message)
  } else {
    console.log(`\n📊 Found ${notifications?.length || 0} tracking_update notifications`)
    if (notifications && notifications.length > 0) {
      console.log('Latest tracking notifications:')
      notifications.forEach(n => {
        console.log(`  - ID: ${n.id}, Created: ${n.created_at}`)
      })
    }
  }
}

checkTrigger()
