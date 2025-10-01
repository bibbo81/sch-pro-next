const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://vgwlnsycdohrfmrfjprl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0'
)

async function testTicketDetail() {
  console.log('Testing ticket detail query...\n')
  
  // First get a ticket ID
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('id, ticket_number')
    .limit(1)
  
  if (!tickets || tickets.length === 0) {
    console.log('No tickets found')
    return
  }
  
  const ticketId = tickets[0].id
  console.log(`Testing with ticket ID: ${ticketId} (${tickets[0].ticket_number})\n`)
  
  // Now try the detail query
  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      organizations(name),
      ticket_messages(
        id,
        message,
        sender_type,
        sender_id,
        created_at,
        is_internal_note
      )
    `)
    .eq('id', ticketId)
    .single()
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Success! Ticket found:')
  console.log(`- Subject: ${ticket.subject}`)
  console.log(`- Organization: ${ticket.organizations?.name}`)
  console.log(`- Messages: ${ticket.ticket_messages?.length || 0}`)
}

testTicketDetail()
