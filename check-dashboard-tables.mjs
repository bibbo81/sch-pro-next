import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vgwlnsycdohrfmrfjprl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg4ODg1NSwiZXhwIjoyMDU3NDY0ODU1fQ.PiNnQzCPkIYNw79gy7iZ3a6mPyEgDjNa2-kU1KUPIRg'
)

console.log('Checking custom_dashboards table...')
const { data: dashboards, error: dashError } = await supabase
  .from('custom_dashboards')
  .select('*')
  .limit(1)

if (dashError) {
  console.error('❌ custom_dashboards error:', dashError.message)
} else {
  console.log('✅ custom_dashboards exists')
  console.log('Columns:', dashboards[0] ? Object.keys(dashboards[0]) : 'No data yet')
}

console.log('\nChecking dashboard_widgets table...')
const { data: widgets, error: widgetError } = await supabase
  .from('dashboard_widgets')
  .select('*')
  .limit(1)

if (widgetError) {
  console.error('❌ dashboard_widgets error:', widgetError.message)
} else {
  console.log('✅ dashboard_widgets exists')
  console.log('Columns:', widgets[0] ? Object.keys(widgets[0]) : 'No data yet')
}
