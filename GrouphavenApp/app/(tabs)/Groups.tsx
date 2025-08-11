import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Platform, StatusBar } from 'react-native';
import { ChannelList } from 'stream-chat-expo';
import { getUserProfile, calculateAge } from '@/utils/Account';
import { router } from 'expo-router';
import ChatProvider from '../provider/ChatProvider';
import { ActivityIndicator, Icon } from 'react-native-paper';

export default function Groups() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const user = await getUserProfile();
      if (user) {
        setProfile(user);
        setAge(calculateAge(user.dob));
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" color="#519CFF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>Profile not found</Text>
      </View>
    );
  }

  // 🚫 Banned / underage UI
  if (age == null || age <= 18) {
    return (
      <View style={styles.bannedContainer}>
        <Icon size={100} source={'alert-outline'} color="red" />
        <Text style={styles.bannedText}>
          Grouphaven is meant for users above the age of 18 only. You may delete your account, or contact an administrator if you believe this is a mistake.
        </Text>
      </View>
    );
  }

  if (profile.status === 'banned') {
    return (
      <View style={styles.bannedContainer}>
        <Icon size={100} source={'alert-outline'} color="red" />
        <Text style={styles.bannedText}>
          Your account has been temporarily banned! Please wait until the ban is lifted, or contact an administrator if you believe this is a mistake.
        </Text>
      </View>
    );
  }

  // ✅ Normal groups list
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '10%',
  },
  bannedText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 15,
  },
});
