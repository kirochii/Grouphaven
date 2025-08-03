import { useEffect, useState } from 'react';
import { View, Text, Alert, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useChatContext } from 'stream-chat-expo';

interface TaskVerificationItem {
  tv_id: string;
  group_id: string;
  host_id: string;
  reviewer_id: string;
  task_desc: string;
  task_verified: boolean;
  host: {
    name: string;
    avatar_url: string;
  };
}

export default function Notifications() {
  const { client } = useChatContext();
  const [tasks, setTasks] = useState<TaskVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client?.userID) return;

    const fetchTasks = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('task_verification')
        .select(`
          tv_id,
          group_id,
          host_id,
          reviewer_id,
          task_desc,
          task_verified,
          host:host_id (
            name,
            avatar_url
          )
        `)
        .eq('reviewer_id', client.userID!)
        .eq('task_verified', false)
        .order('tv_id', { ascending: false });

      if (error) {
        console.error('[FetchTasks]', error);
      } else {
        const casted = data.map((item: any) => ({
          ...item,
          host: item.host || { name: 'Unknown', avatar_url: '' },
        }));
        setTasks(casted as TaskVerificationItem[]);
      }

      setLoading(false);
    };

    fetchTasks();
  }, [client?.userID]);

  const confirmVerify = (task: TaskVerificationItem) => {
    Alert.alert('Verify Task', `Confirm host completed: "${task.task_desc}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Verify', onPress: () => handleVerify(task) },
    ]);
  };

  const confirmReject = (task: TaskVerificationItem) => {
    Alert.alert('Reject Task', `Are you sure the host didn't complete: "${task.task_desc}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', onPress: () => handleReject(task) },
    ]);
  };

  const handleVerify = async (task: TaskVerificationItem) => {
    const { error: updateError } = await supabase
      .from('task_verification')
      .update({ task_verified: true })
      .eq('tv_id', task.tv_id);

    if (updateError) {
      console.error('[Verify]', updateError);
      Alert.alert('Error', 'Could not verify the task.');
      return;
    }

    // Try RPC first
    const { error: rpcError } = await supabase.rpc('add_exp', {
      user_id_input: task.host_id,
      exp_amount: 10,
    });

    // If RPC fails, fall back to manual update
    if (rpcError) {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('exp')
        .eq('id', task.host_id)
        .single();

      if (!fetchError && userData) {
        const newExp = (userData.exp || 0) + 10;
        const { error: updateExpError } = await supabase
          .from('users')
          .update({ exp: newExp })
          .eq('id', task.host_id);

        if (updateExpError) {
          console.error('[Fallback EXP Update]', updateExpError);
        }
      }
    }

    // Remove task from UI immediately
    setTasks((prev) => prev.filter((t) => t.tv_id !== task.tv_id));
  };

  const handleReject = async (task: TaskVerificationItem) => {
    const { error } = await supabase.from('task_verification').delete().eq('tv_id', task.tv_id);

    if (!error) {
      setTasks((prev) => prev.filter((t) => t.tv_id !== task.tv_id));
      Alert.alert('Rejected', 'Thanks for your feedback!');
    } else {
      console.error('[Reject]', error);
      Alert.alert('Error', 'Could not reject the task.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No pending verifications.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.tv_id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 12,
            marginBottom: 12,
            borderRadius: 10,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            {item.host.avatar_url ? (
              <Image
                source={{ uri: item.host.avatar_url }}
                style={{ width: 36, height: 36, borderRadius: 18, marginRight: 8 }}
              />
            ) : (
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#ccc',
                  marginRight: 8,
                }}
              />
            )}
            <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.host.name}</Text>
          </View>

          <Text style={{ marginBottom: 6, fontSize: 15 }}>{item.task_desc}</Text>
          <Text style={{ color: 'gray', fontSize: 13, marginBottom: 10 }}>Remember to verify</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable
              onPress={() => confirmVerify(item)}
              style={{
                backgroundColor: '#4caf50',
                paddingVertical: 8,
                borderRadius: 6,
                flex: 1,
                marginRight: 6,
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>Verify</Text>
            </Pressable>
            <Pressable
              onPress={() => confirmReject(item)}
              style={{
                backgroundColor: '#f44336',
                paddingVertical: 8,
                borderRadius: 6,
                flex: 1,
                marginLeft: 6,
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center' }}>Reject</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}
