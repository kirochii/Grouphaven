// To learn about scheduled functions and supported cron extensions,
// see: https://ntl.fyi/sched-func

import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://lrryxyalvumuuvefxhrg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycnl4eWFsdnVtdXV2ZWZ4aHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NDI1MTUsImV4cCI6MjA0OTExODUxNX0.OPUCbJI_3ufrSJ7dX7PH6XCpL5jj8cn9dv9AwvX4y_c')

export default async (req) => {
  const { next_run } = await req.json()

  const { data, error } = await supabase
    .from('test')
    .select()

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data:', data);
  }

  console.log('Received event! Next invocation at:', next_run)
}

export const config = {
  schedule: '@hourly',
}
