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
} from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';


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

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Pressable
              onPress={() => router.push({ pathname: '/channel/GroupInfo', params: { cid } })}
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
                <Ionicons name="videocam-outline" size={22} color="black" />
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
                router.push({ pathname: '/channel/GroupInfo', params: { cid } });
              }}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownText}>Group Info</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                closeMenu();
                router.push({ pathname: '/channel/GroupMedia', params: { cid } });
              }}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownText}>Shared Media</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                closeMenu();
              }}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownText}>Chat Theme</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                closeMenu();
                router.push({ pathname: '/channel/RateHost', params: { cid } });
              }}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownText}>Rate Host</Text>
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
});
