const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://vgwlnsycdohrfmrfjprl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0'
)

async function checkTickets() {
  console.log('Checking support_tickets table...\n')
  
  const { data, error, count } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact' })
    .limit(10)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log(`Total tickets: ${count}`)
  console.log('\nTickets:')
  data.forEach(t => {
    console.log(`${t.ticket_number} - ${t.subject} (${t.status})`)
  })
}

checkTickets()
