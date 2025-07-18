import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useChatContext } from 'stream-chat-expo';
import * as ImagePicker from 'expo-image-picker';

import { uploadImage } from '@/utils/Account';
import { supabase } from '@/utils/supabase';

const placeholderImage = 'https://via.placeholder.com/120x120.png?text=Group';

export default function GroupInfoScreen() {
  const { cid } = useLocalSearchParams();
  const { client } = useChatContext();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelImage, setChannelImage] = useState<string | null>(null);
  const [channelName, setChannelName] = useState<string>('Unnamed Group');
  const [newChannelName, setNewChannelName] = useState<string>('');

  const handleChangeGroupAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset.base64 || !asset.uri) return;

      const newImageUrl = await uploadImage(asset.uri, asset.base64);
      if (!newImageUrl) {
        Alert.alert('Error', 'Image upload failed.');
        return;
      }

      if (!cid || typeof cid !== 'string') return;
      const [type, id] = cid.split(':');
      const channel = client.channel(type, id);

      await channel.updatePartial({
        set: {
          image: newImageUrl,
        } as any,
      });

      setChannelImage(newImageUrl);
      Alert.alert('Success', 'Group avatar updated!');
    } catch (error) {
      console.error('Avatar update error:', error);
      Alert.alert('Error', 'not admin.');
    }
  };

  const handleUpdateGroupName = async () => {
    if (!cid || typeof cid !== 'string') return;

    const [type, id] = cid.split(':');
    const channel = client.channel(type, id);

    try {
      await channel.updatePartial({
        set: {
          name: newChannelName,
        }as any,
      });

      const { error } = await supabase
        .from('group')
        .update({ name: newChannelName })
        .eq('id', id);

      if (error) {
        console.error('Supabase update error:', error);
        Alert.alert('Error', 'Failed to update name in Supabase.');
        return;
      }

      setChannelName(newChannelName);
      setNewChannelName('');
      Alert.alert('Success', 'Group name updated!');
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert('Error', 'you not adminnn');
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      if (!cid || typeof cid !== 'string') return;

      try {
        const [type, id] = cid.split(':');
        const channel = client.channel(type, id);
        await channel.watch();

        const memberList = Object.values(channel.state.members || {});
        const userIds = memberList
          .map((m) => m.user_id)
          .filter((id): id is string => typeof id === 'string');

        const { data: usersData, error } = await supabase
          .from('users')
          .select('id, avatar_url, tagline')
          .in('id', userIds);

        if (error) {
          console.error('Supabase user fetch error:', error);
          return;
        }

        const userMap = usersData?.reduce((acc, user) => {
          acc[user.id] = {
            avatar_url: user.avatar_url,
            tagline: user.tagline,
          };
          return acc;
        }, {} as Record<string, { avatar_url: string | null; tagline: string | null }>);

        const enrichedMembers = memberList.map((m) => ({
          ...m,
          avatar_url: m.user_id ? userMap[m.user_id]?.avatar_url || null : null,
          tagline: m.user_id ? userMap[m.user_id]?.tagline || null : null,
        }));

        setMembers(enrichedMembers);
        setChannelImage((channel.data as { image?: string })?.image ?? null);
        setChannelName((channel.data as { name?: string })?.name ?? 'Unnamed Group');
      } catch (err) {
        console.error('Failed to fetch channel members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [cid]);

  return (
    <>
      <Stack.Screen options={{ title: 'Group Info' }} />
      <View style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity onPress={handleChangeGroupAvatar}>
            <Image
              source={{ uri: channelImage || placeholderImage }}
              style={styles.groupImage}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Group Info</Text>
        <Text style={styles.subtitle}>Channel ID: {cid}</Text>
        <Text style={styles.subtitle}>Channel Name: {channelName}</Text>

        <TextInput
          style={styles.input}
          placeholder="Edit group name"
          value={newChannelName}
          onChangeText={setNewChannelName}
        />
        <TouchableOpacity style={styles.button} onPress={handleUpdateGroupName}>
          <Text style={styles.buttonText}>Save Group Name</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Group: {members.length} members</Text>

        {loading ? (
          <Text>Loading members...</Text>
        ) : (
          <FlatList
            data={members}
            keyExtractor={(item) => item.user_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.member}
                onPress={() =>
                  router.push({ pathname: '/channel/UserInfo', params: { userId: item.user_id } })
                }
              >
                <Image
                  source={{ uri: item.avatar_url || placeholderImage }}
                  style={styles.avatar}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.memberName}>{item.user?.name || item.user_id}</Text>
                  {item.tagline ? (
                    <Text style={styles.tagline}>{item.tagline}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#519CFF',
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#32353b',
    marginVertical: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#519CFF',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  member: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#32353b',
  },
  tagline: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
});
