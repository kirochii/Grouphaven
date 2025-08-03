/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { StreamChat } from 'npm:stream-chat';

const STREAM_API_KEY = Deno.env.get('STREAM_API_KEY');
const STREAM_SECRET = Deno.env.get('STREAM_API_SECRET');

serve(async (req: Request): Promise<Response> => {
  try {
    console.log('[INFO] Received request');

    // Validate env variables
    if (!STREAM_API_KEY || !STREAM_SECRET) {
      console.error('[ERROR] Missing Stream credentials');
      return new Response('Missing Stream credentials', { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');
    if (!channelId) {
      console.error('[ERROR] Missing channelId');
      return new Response('Missing channelId', { status: 400 });
    }

    console.log(`[INFO] Using channelId: ${channelId}`);

    const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_SECRET);
    const channel = serverClient.channel('messaging', channelId);

    console.log('[INFO] Querying channel members...');
    const result = await channel.queryMembers({});

    console.log(`[INFO] Found ${result.members.length} members`);

    const members = result.members.map((m) => ({
      id: m.user?.id,
      name: m.user?.name ?? '(no name)',
      image: m.user?.image ?? '',
    }));

    return new Response(JSON.stringify({ members }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[ERROR] Exception thrown: ', err);
    return new Response('Error fetching members', { status: 500 });
  }
});



/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-channel-members' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/get-channel-members?channelId=029c91c4-6ac0-482e-b279-8d1c15e334e6' \
  --header 'Authorization: Bearer XoOBY7DH1h15gR3yO4+KATZLKbaiGjQS+4RXgOlpcZwTrXCxNt2i9yk867wbj25EHJJnGR/AOnMAnxBA2iu1Xw=='



  curl -i --location --request GET \
  'https://lrryxyalvumuuvefxhrg.functions.supabase.co/get-channel-members?channelId=029c91c4-6ac0-482e-b279-8d1c15e334e6' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycnl4eWFsdnVtdXV2ZWZ4aHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NDI1MTUsImV4cCI6MjA0OTExODUxNX0.OPUCbJI_3ufrSJ7dX7PH6XCpL5jj8cn9dv9AwvX4y_c'

*/
