const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://vgwlnsycdohrfmrfjprl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0'
)

async function testTrigger() {
  console.log('Testing tracking notification trigger...\n')
  
  // 1. Get a tracking record to update
  const { data: trackings, error: trackError } = await supabase
    .from('trackings')
    .select('id, tracking_number, status, shipment_id')
    .limit(1)
    .single()
  
  if (trackError || !trackings) {
    console.log('No tracking records found to test')
    return
  }
  
  console.log('Found tracking:', trackings.tracking_number)
  console.log('Current status:', trackings.status)
  
  // 2. Update the status to trigger notification
  const newStatus = trackings.status === 'in_transit' ? 'arrived' : 'in_transit'
  
  console.log('\nUpdating status to:', newStatus)
  
  const { error: updateError } = await supabase
    .from('trackings')
    .update({ status: newStatus })
    .eq('id', trackings.id)
  
  if (updateError) {
    console.log('Error updating:', updateError.message)
    return
  }
  
  console.log('Update successful!\n')
  
  // 3. Wait a bit for trigger to execute
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 4. Check if notification was created
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('*')
    .eq('notification_type', 'tracking_update')
    .order('created_at', { ascending: false })
    .limit(1)
  
  if (notifError) {
    console.log('Error checking notifications:', notifError.message)
    return
  }
  
  if (notifications && notifications.length > 0) {
    console.log('✅ TRIGGER WORKS! Notification created:')
    console.log('  Title:', notifications[0].title)
    console.log('  Message:', notifications[0].message)
    console.log('  Created:', notifications[0].created_at)
  } else {
    console.log('❌ No notification created - trigger may not be working')
  }
  
  // 5. Restore original status
  await supabase
    .from('trackings')
    .update({ status: trackings.status })
    .eq('id', trackings.id)
  
  console.log('\nStatus restored to original value')
}

testTrigger()
