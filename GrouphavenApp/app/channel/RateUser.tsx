import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/utils/supabase';

const placeholderImage = 'https://lrryxyalvumuuvefxhrg.supabase.co/storage/v1/object/public/images/avatar/default-avatar.png';

export default function RateUserScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewerId, setReviewerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const { data: sessionData } = await supabase.auth.getSession();
      const reviewer_id = sessionData?.session?.user?.id;
      if (!reviewer_id) return;
      setReviewerId(reviewer_id);

      const { data: userData } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .eq('id', userId)
        .single();

      if (userData) setUser(userData);

      const { data: existingReview, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewer_id', reviewer_id)
        .eq('reviewee_id', userId)
        .maybeSingle();

      if (existingReview) {
        setRating(existingReview.rating);
        setReview(existingReview.review);
        setReviewId(existingReview.review_id);
      }

      setLoading(false);
    };

    fetchData();
  }, [userId]);

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert('Error', 'Please select a rating.');
      return;
    }

    if (!reviewerId) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    const payload = {
      reviewer_id: reviewerId,
      reviewee_id: userId,
      rating,
      review,
      review_date: new Date().toISOString(),
    };

    const { error } = reviewId
      ? await supabase.from('reviews').update(payload).match({ reviewer_id: reviewerId, reviewee_id: userId })
      : await supabase.from('reviews').insert(payload);

    if (error) {
      console.error('Submit review error:', error);
      Alert.alert('Error', 'Failed to submit review.');
    } else {
      Alert.alert('Success', reviewId ? 'Your review was updated.' : 'Your review was submitted.');
      router.back();
    }
  };

  const renderStars = () => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={32}
            color="#FFD700"
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
      {reviewId && (
        <Ionicons name="pencil" size={24} color="#519CFF" style={{ marginLeft: 10 }} />
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#519CFF" />
        <Text style={{ marginTop: 10 }}>Loading user info...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar_url || placeholderImage }} style={styles.avatar} />
        <Text style={styles.userName}>{user.name || userId}</Text>
      </View>

      <Text style={styles.label}>Your Rating</Text>
      {renderStars()}

      <Text style={styles.label}>Your Review</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Write your thoughts..."
        multiline
        numberOfLines={5}
        value={review}
        onChangeText={setReview}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.cancel]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.submit]} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#519CFF',
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#32353b',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  star: {
    marginHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 6,
  },
  submit: {
    backgroundColor: '#519CFF',
  },
  cancel: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
