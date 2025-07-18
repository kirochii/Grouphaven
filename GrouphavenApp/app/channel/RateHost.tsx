import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useUser } from '../provider/UserProvider';
import { FontAwesome } from '@expo/vector-icons';

const placeholderAvatar = 'https://via.placeholder.com/100.png?text=Avatar';

export default function RateHost() {
  const router = useRouter();
  const { group_id } = useLocalSearchParams();
  const { user } = useUser();
  const [hostId, setHostId] = useState<string | null>(null);
  const [hostInfo, setHostInfo] = useState<{ name: string; avatar_url: string | null } | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    const fetchHost = async () => {
      if (!group_id || typeof group_id !== 'string' || !user?.id) return;

      const { data: groupMembers, error } = await supabase
        .from('user_group')
        .select('user_id, is_host')
        .eq('group_id', group_id);

      if (error) {
        console.error('Failed to fetch group members:', error);
        return;
      }

      const host = groupMembers?.find((m) => m.is_host);
      if (!host) {
        Alert.alert('Error', 'No host found for this group.');
        router.back();
        return;
      }

      if (host.user_id === user.id) {
        Alert.alert('You cannot rate yourself.');
        router.back();
        return;
      }

      setHostId(host.user_id);

      const { data: hostProfile, error: profileError } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', host.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching host profile:', profileError);
        return;
      }

      setHostInfo({
        name: hostProfile.name,
        avatar_url: hostProfile.avatar_url,
      });
    };

    fetchHost();
  }, [group_id, user?.id]);

  const handleSubmit = async () => {
    if (!rating || !review.trim() || !hostId || !user?.id || !group_id) {
      Alert.alert('Please fill in all fields.');
      return;
    }

    try {
      const { data: existing, error: checkError } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', user.id)
        .eq('host_id', hostId)
        .eq('group_id', group_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        Alert.alert('You have already submitted a review for this group.');
        return;
      }

      const { error } = await supabase.from('reviews').insert({
        reviewer_id: user.id,
        host_id: hostId,
        group_id,
        rating,
        review,
        review_date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      Alert.alert('Success', 'Review submitted!');
      router.back();
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Failed to submit review.');
    }
  };

  const renderStars = () => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <FontAwesome
            name={i <= rating ? 'star' : 'star-o'}
            size={32}
            color="#FFD700"
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate the Host</Text>

      {hostInfo && (
        <View style={styles.hostInfo}>
          <Image
            source={{ uri: hostInfo.avatar_url || placeholderAvatar }}
            style={styles.avatar}
          />
          <Text style={styles.hostName}>{hostInfo.name}</Text>
        </View>
      )}

      {renderStars()}

      <TextInput
        placeholder="Write your review"
        style={styles.input}
        multiline
        numberOfLines={4}
        value={review}
        onChangeText={setReview}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Review</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  hostInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  hostName: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    color: '#32353b',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#519CFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
