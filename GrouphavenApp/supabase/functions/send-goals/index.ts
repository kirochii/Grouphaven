import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { StreamChat } from 'npm:stream-chat'

// Env
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const stream = StreamChat.getInstance(
  Deno.env.get('STREAM_API_KEY')!,
  Deno.env.get('STREAM_API_SECRET')!
)

import { hostGoals } from '../../../utils/hostGoals.tsx';

Deno.serve(async () => {
  const today = new Date()
  const isMonday = today.getDay() === 1 // 0 = Sunday, 1 = Monday

  const { data: groups, error } = await supabase.from('groups').select('id, type') // type = e.g., "photography", "gaming"
  if (error) return new Response(JSON.stringify({ error }), { status: 500 })

  for (const group of groups) {
    const channelId = `messaging:${group.id}`
    const channel = stream.channel('messaging', group.id)

    const goal = getGoal(group.type, isMonday)

    try {
      await channel.sendMessage({
        text: `📣 **Host Prompt**\n\n${goal}`,
        user_id: 'system-bot',
      })
    } catch (err) {
      console.error(`❌ Failed for ${channelId}`, err)
    }
  }

  return new Response('Goals sent ✅')
})

function getGoal(groupType: string, isMonday: boolean): string {
  const daily = hostGoals.daily
  const weekly = hostGoals.weekly

  // Optionally customize for group type
  const photographyExtras = [
    'Share a photo you took today 📸',
    'Comment on someone else’s photo with helpful feedback 💬',
    'Try a “black and white” photo challenge today 🖤',
  ]

  const gamingExtras = [
    'What game are you playing today? 🎮',
    'Post a clip or screenshot from your recent match! 🖼️',
    'Drop your favorite gaming meme of the week 😂',
  ]

  if (groupType === 'photography') {
    return pickRandom(isMonday ? [...weekly, ...photographyExtras] : [...daily, ...photographyExtras])
  }

  if (groupType === 'gaming') {
    return pickRandom(isMonday ? [...weekly, ...gamingExtras] : [...daily, ...gamingExtras])
  }

  return pickRandom(isMonday ? weekly : daily)
}

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}
