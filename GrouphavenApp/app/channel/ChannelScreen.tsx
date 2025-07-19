import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import {
  Channel,
  MessageList,
  MessageInput,
  useChatContext,
} from 'stream-chat-expo';
import {
  ActivityIndicator,
  View,
  Text,
  Pressable,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
  Alert
} from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';



export default function ChannelScreen() {
  const { cid } = useLocalSearchParams();
  const { client } = useChatContext();
  const router = useRouter();

  const [channel, setChannel] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [dropdownAnim] = useState(new Animated.Value(-100));
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const initChannel = async () => {
      if (!cid || typeof cid !== 'string') {
        setError('Invalid channel ID');
        return;
      }

      try {
        const [type, id] = cid.split(':');
        const selectedChannel = client.channel(type, id);
        await selectedChannel.watch();
        setChannel(selectedChannel);
      } catch (err: any) {
        setError(err.message || 'Failed to load channel');
      }
    };

    initChannel();
  }, [cid]);

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(dropdownAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(dropdownAnim, {
      toValue: -100,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </View>
    );
  }

  if (!channel) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const channelName = channel?.data?.name ?? 'Group Chat';
  const avatarUrl = channel?.data?.image;

  const exitGroup = async () => {
    if (!cid || typeof cid !== 'string') return;

    const confirmed = await new Promise<boolean>((resolve) => {
      Alert.alert(
        'Exit Group',
        'Are you sure you want to leave this group?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Yes, Exit', style: 'destructive', onPress: () => resolve(true) },
        ],
        { cancelable: true }
      );
    });

    if (!confirmed) return;

    try {
      const [type, id] = cid.split(':');
      const channel = client.channel(type, id);
      await channel.removeMembers([client.userID!]);

      const { error } = await supabase
        .from('user_group')
        .delete()
        .eq('group_id', id)
        .eq('id', client.userID!);

      if (error) {
        console.error('[ExitGroup] Supabase error:', error);
        Alert.alert('Error', 'Failed to update group membership.');
        return;
      }

      Alert.alert('Success', 'You have left the group.');
      router.replace('/Groups'); // Or navigate to home screen or groups list
    } catch (err) {
      console.error('[ExitGroup] Error:', err);
      Alert.alert('Error', 'Failed to leave the group.');
    }
  };  

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Pressable
              onPress={() => router.push({ pathname: '../channel/GroupInfo', params: { cid } })}
              style={{ width: '120%' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: '#ccc' }]} />
                )}
                <Text style={styles.channelName}>{channelName}</Text>
              </View>
            </Pressable>
          ),
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <Pressable onPress={() => {}} style={{ padding: 8 }}>
                <Ionicons name="call-outline" size={22} color="black" />
              </Pressable>
              <Pressable onPress={() => {}} style={{ padding: 8 }}>
                <Ionicons name="notifications-outline" size={22} color="black" />
              </Pressable>
              <Pressable onPress={openMenu} style={{ padding: 8 }}>
                <MaterialIcons name="more-vert" size={24} color="black" />
              </Pressable>
            </View>
          ),
        }}
      />

      {/* Chat Content */}
      <Channel channel={channel}>
        <MessageList />
        <MessageInput />
      </Channel>

      {/* Dropdown Overlay */}
      {menuVisible && (
        <View style={styles.overlayContainer}>
          <Pressable onPress={closeMenu} style={styles.dismissArea} />
          <Animated.View
            style={[
              styles.dropdown,
              {
                width: screenWidth * 0.55,
                transform: [{ translateY: dropdownAnim }],
              },
            ]}
          >
            <Pressable
              onPress={() => {
                closeMenu();
                router.push({ pathname: '../channel/GroupInfo', params: { cid } });
              }}
              style={styles.dropdownItem}
            >
            <View style={styles.iconRow}>
              <Ionicons name="information-circle-outline" size={24} color="#333" style={styles.icon} />
              <Text style={styles.dropdownText}>Group Info</Text>
            </View>
            </Pressable>

            <Pressable
              onPress={() => {
                closeMenu();
                router.push({ pathname: '../channel/GroupMedia', params: { cid } });
              }}
              style={styles.dropdownItem}
            >
              <View style={styles.iconRow}>
                <Ionicons name="images-outline" size={24} color="#333" style={styles.icon} />
                <Text style={styles.dropdownText}>Shared Media</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                closeMenu();
                router.push({ pathname: '../channel/RateHost', params: { cid } });
              }}
              style={styles.dropdownItem}
            >
              <View style={styles.iconRow}>
                <Ionicons name="star-outline" size={24} color="#333" style={styles.icon} />
                <Text style={styles.dropdownText}>Rate Host</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                closeMenu();
              }}
              style={styles.dropdownItem}
            >
              <View style={styles.iconRow}>
                <Ionicons name="exit-outline" size={24} color="#d00" style={styles.icon} />
                <Text style={[styles.dropdownText, { color: '#d00' }]}>Exit Group</Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  channelName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 0,
    paddingRight: 10,
  },
  dismissArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 1001,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  dropdownText: {
    fontSize: 16,
  },
  iconRow: {
  flexDirection: 'row',
  alignItems: 'center',
},
  icon: {
    marginRight: 10,
  },
});
