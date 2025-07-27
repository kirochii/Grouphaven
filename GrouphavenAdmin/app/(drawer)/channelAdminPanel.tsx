import React, { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  Separator,
  Dialog,
  Spinner,
  ScrollView,
} from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { getGroupRows, getUserGroupMembers } from '../../utils/Functions';

type GroupRow = {
  groupId: string;
  name: string;
  size: number;
  date: string;
  interests: string;
  channelId: string;
};

export default function ChannelAdminPanel() {
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<GroupRow | null>(null);
  const [newName, setNewName] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [members, setMembers] = useState<{ id: string; name: string; image?: string }[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const rows = await getGroupRows(null, null);
    const formatted: GroupRow[] = rows.map(([groupId, name, size, date, interests]) => ({
      groupId,
      name,
      size,
      date,
      interests,
      channelId: groupId,
    }));
    setGroups(formatted);
    setLoading(false);
  };

  const handleRename = async () => {
    if (!selectedGroup || !newName.trim()) return;

    try {
      // Get session to retrieve access token
      const { data: { session }, error: sessionError } = await supabase!.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error('User session not found or expired.');
      }

      const accessToken = session.access_token;

      // Step 1: Call Edge Function to rename in Stream
      const streamRes = await fetch('https://lrryxyalvumuuvefxhrg.functions.supabase.co/manage-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'rename',
          channelId: selectedGroup.channelId,
          newName: newName.trim(),
        }),
      });

      if (!streamRes.ok) {
        const errorText = await streamRes.text();
        throw new Error(`Stream rename failed: ${errorText}`);
      }

      // Step 2: Update group name in Supabase
      const { error: updateError } = await supabase!
        .from('group')
        .update({ name: newName.trim() })
        .eq('group_id', selectedGroup.groupId);

      if (updateError) {
        throw new Error(`Supabase update failed: ${updateError.message}`);
      }

      // Refresh state/UI
      await fetchData();
      setShowDialog(false);
      setNewName('');
    } catch (error) {
      console.error('Rename error:', error);
      alert('Failed to rename group. Please check the console for details.');
    }
  };

  const suspendUser = async (channelId: string, userId: string) => {
    try {
      const { data: { session }, error } = await supabase!.auth.getSession();

      if (error || !session?.access_token) {
        throw new Error('User session not found.');
      }

      const accessToken = session.access_token;

      const res = await fetch('https://lrryxyalvumuuvefxhrg.functions.supabase.co/manage-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'ban-user',
          channelId,
          userId,
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Suspend failed: ${res.status} ${text}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      alert('Failed to suspend user. See console for details.');
      return false;
    }
  };

  const fetchMembers = async (groupId: string) => {
    try {
      setMembers(null);
      const members = await getUserGroupMembers(groupId);
      setMembers(members);
    } catch (err) {
      console.error('Failed to fetch members', err);
      setMembers([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <YStack f={1} w="100%" bg="$gray3" p="$5" gap={20}>
      <Text fontSize={32} fontWeight="bold">Channel Admin Panel</Text>

      <XStack gap={10} ai="center">
        <Input
          placeholder="Search groups..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          width={300}
        />
        <Button onPress={fetchData}>Refresh</Button>
      </XStack>

      <YStack bg="white" borderRadius="$4">
        <XStack p="$3" ai="center" paddingLeft={50}>
          <YStack flex={2}><Text fontWeight="bold">Group Name</Text></YStack>
          <YStack flex={2}><Text fontWeight="bold">Channel ID</Text></YStack>
          <YStack flex={1}><Text fontWeight="bold">Size</Text></YStack>
          <YStack flex={1}><Text fontWeight="bold">Created</Text></YStack>
          <YStack flex={1}><Text fontWeight="bold">Actions</Text></YStack>
        </XStack>
        <Separator />

        {loading ? (
          <YStack ai="center" jc="center" p="$5">
            <Spinner size="large" color="$blue10" />
          </YStack>
        ) : filteredGroups.length === 0 ? (
          <Text p="$4" textAlign="center">No groups found</Text>
        ) : (
          filteredGroups.map((group, i) => (
            <YStack key={i}>
              <XStack p="$3" pl={50} ai="center">
                <YStack flex={2}><Text>{group.name}</Text></YStack>
                <YStack flex={2}><Text>{group.channelId}</Text></YStack>
                <YStack flex={1}><Text>{group.size}</Text></YStack>
                <YStack flex={1}><Text>{group.date}</Text></YStack>
                <YStack flex={1} gap={10}>
                  <Button size="$2" onPress={() => {
                    setSelectedGroup(group);
                    setShowDialog(true);
                    fetchMembers(group.groupId);
                  }}>Manage</Button>
                </YStack>
              </XStack>
              <Separator />
            </YStack>
          ))
        )}
      </YStack>

      {selectedGroup && (
        <Dialog open={showDialog} onOpenChange={setShowDialog} modal>
          <Dialog.Portal>
            <Dialog.Overlay key="overlay" />
            <Dialog.Content bordered elevate width={600} bg="white" p="$4">
              <Dialog.Title>Manage Group</Dialog.Title>
              <Dialog.Description>Update or remove this group/channel.</Dialog.Description>

              <YStack gap={10} mt="$4">
                <Text>Rename Group</Text>
                <Input
                  placeholder="New Group Name"
                  value={newName}
                  onChangeText={setNewName}
                />
                <Button size="$3" onPress={handleRename}>Rename</Button>

                <Separator my="$3" />

                <Button size="$3" theme="red" onPress={async () => {
                  await fetch('https://lrryxyalvumuuvefxhrg.functions.supabase.co/manage-channel', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      action: 'delete',
                      channelId: selectedGroup.channelId,
                    }),
                  });
                  setShowDialog(false);
                  await fetchData();
                }}>
                  Delete Channel
                </Button>

                <Separator my="$3" />

                <Text fontWeight="bold">Group Members</Text>
                <ScrollView height={200}>
                  {members === null ? (
                    <Text>Loading members...</Text>
                  ) : members.length === 0 ? (
                    <Text>No members found.</Text>
                  ) : (
                    members.map((m, idx) => (
                      <XStack key={idx} jc="space-between" ai="center" py="$2">
                        <Text>{m.name}</Text>
                        <XStack gap={10}>
                          <Button size="$1" theme="red" onPress={async () => {
                            try {
                              const res = await fetch('https://lrryxyalvumuuvefxhrg.functions.supabase.co/manage-channel', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  action: 'remove-user',
                                  channelId: selectedGroup.channelId,
                                  userId: m.id,
                                })
                              });
                              if (!res.ok) {
                                const text = await res.text();
                                throw new Error(`Remove failed: ${res.status} ${text}`);
                              }
                              fetchMembers(selectedGroup.groupId);
                            } catch (err) {
                              console.error(err);
                              alert('Failed to remove user. See console for details.');
                            }
                          }}>Remove</Button>
                        <Button size="$1" onPress={async () => {
                          const success = await suspendUser(selectedGroup.channelId, m.id);
                          if (success) {
                            fetchMembers(selectedGroup.groupId);
                          }
                        }}>
                          Suspend
                        </Button>
                        </XStack>
                      </XStack>
                    ))
                  )}
                </ScrollView>
              </YStack>

              <Dialog.Close asChild>
                <Button mt="$4">Close</Button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      )}
    </YStack>
  );
}
