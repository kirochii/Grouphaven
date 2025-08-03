import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Platform, StatusBar } from 'react-native';
import { ChannelList } from 'stream-chat-expo';
import { getUserProfile } from '@/utils/Account';
import { router } from 'expo-router';
import ChatProvider from '../provider/ChatProvider';

export default function Groups() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const user = await getUserProfile();
      setProfile(user);
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) return <Text>Loading profile...</Text>;
  if (!profile) return <Text>Profile not found</Text>;

  return (
    <ChatProvider>
      <View style={styles.container}>
        <ChannelList
          filters={{ members: { $in: [profile.id] } }}
          sort={{ last_message_at: -1 }}
          onSelect={(channel) => router.push(`/channel/${channel.cid}`)}
        />
      </View>
    </ChatProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 25 : 0,
    backgroundColor: '#fff',
  },
});
