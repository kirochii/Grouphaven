import { StreamChat } from 'stream-chat';

const serverClient = StreamChat.getInstance(
  'h5j8g4mbjb5z',
  '93xkmvjpv83h5bfajmv9zzhbdaj83cm66qt4mw5wbxt6gfszexrtbff7e8wsad9n'
);

// System Bot ID
const systemBotId = '7b7df891-3204-41f5-bf20-dc94b7e2d0a7';

export async function createGroupChannel(groupId, groupName, users) {
  const memberIds = users.map((u) => u.id);
  if (!memberIds.includes(systemBotId)) {
    memberIds.push(systemBotId);
  }

  // 🧠 Step 1: Ensure the system bot user exists
  await serverClient.upsertUser({
    id: systemBotId,
    name: 'System Bot',
    image: 'https://yourcdn.com/system-bot-avatar.png',
  });

  // 🧠 Step 2: Create the channel with created_by_id
  const channel = serverClient.channel('messaging', groupId, {
    name: groupName,
    members: memberIds,
    created_by_id: systemBotId, // ✅ Required for server-side auth
  });

  try {
    await channel.create();
    console.log('✅ Stream channel created:', channel.id);
  } catch (error) {
    if (error?.code === 16) {
      await channel.watch();
      console.log('⚠️ Channel already existed, watching:', channel.id);
    } else {
      console.error('❌ Stream channel creation failed:', error);
    }
  }
}
