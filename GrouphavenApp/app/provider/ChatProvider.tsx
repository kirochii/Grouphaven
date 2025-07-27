import { PropsWithChildren, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { StreamChat } from 'stream-chat';
import { Chat, OverlayProvider } from 'stream-chat-expo';

import { getUserProfile } from '@/utils/Account';
import { supabase } from '@/utils/supabase';
import { tokenProvider } from '@/utils/TokenProvider';

const client = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY || 'h5j8g4mbjb5z'); // Use environment variable or default

export default function ChatProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    const setup = async () => {
      console.log('[ChatProvider] Setup started');
      console.log('[ChatProvider] Using Stream API key:', process.env.EXPO_PUBLIC_STREAM_API_KEY || 'h5j8g4mbjb5z');

      try {
        const user = await getUserProfile();
        console.log('[ChatProvider] Got user profile:', user);

        if (!user) {
          console.warn('[ChatProvider] No user found. Skipping Stream connection.');
          return;
        }

        setProfile(user);

        const avatarUrl = user.avatar_url
          ? supabase.storage.from('avatars').getPublicUrl(user.avatar_url).data.publicUrl
          : undefined;

        console.log('[ChatProvider] Avatar URL:', avatarUrl);

        console.log('[ChatProvider] Fetching token...');
        const token = await tokenProvider();
        console.log('[ChatProvider] Got token:', token);

        console.log('[ChatProvider] Connecting to Stream...');
        await client.connectUser(
          {
            id: user.id,
            name: user.name,
            image: avatarUrl,
          },
          token
        );

        console.log('[ChatProvider] Stream client connected successfully');
        setIsReady(true);
      } catch (err) {
        console.error('[ChatProvider] Error during setup:', err);
      }
    };

    setup();

    return () => {
      if (client.userID) {
        console.log('[ChatProvider] Disconnecting Stream user:', client.userID);
        client.disconnectUser().catch(console.warn);
      }
      setIsReady(false);
    };
  }, []);

  if (!isReady) {
    console.log('[ChatProvider] Waiting for setup...');
    return <ActivityIndicator />;
  }

  return (
    <OverlayProvider>
      <Chat client={client}>{children} </Chat>
    </OverlayProvider>
  );
}
