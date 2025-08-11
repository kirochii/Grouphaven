/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { StreamChat } from 'npm:stream-chat';

const STREAM_API_KEY = Deno.env.get('STREAM_API_KEY')!;
const STREAM_SECRET = Deno.env.get('STREAM_API_SECRET')!;

function withCors(res: Response): Response {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return withCors(new Response(null, { status: 204 }));
  }

  try {
    const { action, channelId, userId, newName } = await req.json();

    if (!action || !channelId) {
      return withCors(
        new Response(JSON.stringify({ error: 'Missing action or channelId' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_SECRET);
    const channel = serverClient.channel('messaging', channelId);
    await channel.query(); // Ensure the channel exists

    switch (action) {
      case 'rename':
        if (!newName) {
          return withCors(
            new Response(JSON.stringify({ error: 'Missing newName' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        await channel.update({ name: newName } as Record<string, unknown>);
        return withCors(
          new Response(JSON.stringify({ message: 'Channel renamed' }), {
            headers: { 'Content-Type': 'application/json' },
          })
        );

      case 'delete':
        await channel.delete();
        return withCors(
          new Response(JSON.stringify({ message: 'Channel deleted' }), {
            headers: { 'Content-Type': 'application/json' },
          })
        );

      case 'remove-user':
        if (!userId) {
          return withCors(
            new Response(JSON.stringify({ error: 'Missing userId' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        await channel.removeMembers([userId]);
        return withCors(
          new Response(JSON.stringify({ message: 'User removed from channel' }), {
            headers: { 'Content-Type': 'application/json' },
          })
        );

        case 'ban-user': {
          if (!userId) {
            return withCors(
              new Response(JSON.stringify({ error: 'Missing userId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          }

          console.log('Ban Request — userId:', userId, 'channelId:', channelId);

          try {
            // Check if user exists on Stream
            const result = await serverClient.queryUsers({ id: { $eq: userId } });
            const foundUser = result.users?.[0];

            if (!foundUser) {
              return withCors(
                new Response(JSON.stringify({ error: 'User does not exist on Stream' }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json' },
                })
              );
            }

            // Ban the user
          await serverClient.banUser(userId, {
            banned_by_id: 'Admin',
            reason: 'Banned by Admin',
            timeout: 86400,
          });

            console.log('Ban successful');

            return withCors(
              new Response(JSON.stringify({ message: 'User banned successfully' }), {
                headers: { 'Content-Type': 'application/json' },
              })
            );
          } catch (err) {
            console.error('Ban error:', err);
            return withCors(
              new Response(JSON.stringify({ error: 'Ban failed', detail: String(err) }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          }
        }

      default:
        return withCors(
          new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        );
    }
  } catch (err) {
    console.error('Server error:', err);
    return withCors(
      new Response(JSON.stringify({ error: 'Server error', detail: String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/manage-channel' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'


  curl -i --location --request POST \
  'https://lrryxyalvumuuvefxhrg.functions.supabase.co/manage-channel' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycnl4eWFsdnVtdXV2ZWZ4aHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NDI1MTUsImV4cCI6MjA0OTExODUxNX0.OPUCbJI_3ufrSJ7dX7PH6XCpL5jj8cn9dv9AwvX4y_c' \
  --header 'Content-Type: application/json' \
  --data '{
    "action": "rename",
    "channelId": "029c91c4-6ac0-482e-b279-8d1c15e334e6",
    "newName": "Updated Nameee"
  }'

  curl -i --location --request POST 'https://lrryxyalvumuuvefxhrg.functions.supabase.co/manage-channel' \
  --header 'Authorization: Bearer YOUR_BEARER_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "action": "delete",
    "channelId": "YOUR_CHANNEL_ID"
  }'

  curl -i --location --request POST 'https://lrryxyalvumuuvefxhrg.functions.supabase.co/manage-channel' \
  --header 'Authorization: Bearer YOUR_BEARER_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "action": "remove-user",
    "channelId": "YOUR_CHANNEL_ID",
    "userId": "USER_ID_TO_REMOVE"
  }'

  curl -i --location --request POST 'https://lrryxyalvumuuvefxhrg.functions.supabase.co/manage-channel' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycnl4eWFsdnVtdXV2ZWZ4aHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NDI1MTUsImV4cCI6MjA0OTExODUxNX0.OPUCbJI_3ufrSJ7dX7PH6XCpL5jj8cn9dv9AwvX4y_c' \
  --header 'Content-Type: application/json' \
  --data '{
    "action": "ban-user",
    "channelId": "54ee5d04-0ffc-4a3f-a59c-a04c9edf0079",
    "userId": "e80aeddf-e335-4c97-8768-fc89721fcd02"
  }'


*/
