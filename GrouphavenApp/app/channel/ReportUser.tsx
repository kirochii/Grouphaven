import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/utils/supabase';
import * as FileSystem from 'expo-file-system';

const reasons = [
  'Spam',
  'Harassment',
  'Inappropriate Content',
  'Scam or Fraud',
  'Other',
];

export default function ReportUser() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImagePick = async () => {
    if (imageUris.length >= 3) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUris([...imageUris, uri]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Please select a reason for reporting.');
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const uploadedUrls: string[] = [];

      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];
        const ext = uri.split('.').pop();
        const path = `report/${Date.now()}-${i}.${ext}`;

        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) throw new Error('File not found: ' + uri);

        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const byteArray = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
        const blob = new Blob([byteArray], { type: `image/${ext}` });

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(path, blob);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(path);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      const { error } = await supabase.from('reports').insert({
        reported_by: user?.id,
        reported_user: userId,
        reason: selectedReason === 'Other' ? otherReason : selectedReason,
        screenshot_url: uploadedUrls[0] || null,
        screenshot_url2: uploadedUrls[1] || null,
        screenshot_url3: uploadedUrls[2] || null,
        report_date: new Date().toISOString(),
        status: 'PENDING',
      });

      if (error) throw error;

      Alert.alert('Report submitted successfully.');
      router.back();
    } catch (err) {
      console.error('Report error:', err);
      Alert.alert('Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report User</Text>
      {reasons.map((reason) => (
        <TouchableOpacity
          key={reason}
          style={[styles.reasonOption, selectedReason === reason && styles.selectedOption]}
          onPress={() => setSelectedReason(reason)}
        >
          <Text style={styles.reasonText}>{reason}</Text>
        </TouchableOpacity>
      ))}

      {selectedReason === 'Other' && (
        <TextInput
          style={styles.input}
          placeholder="Please describe the issue"
          multiline
          numberOfLines={4}
          value={otherReason}
          onChangeText={setOtherReason}
        />
      )}

      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>Screenshots (max 3)</Text>
        <View style={styles.imageRow}>
          {imageUris.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))}
          {imageUris.length < 3 && (
            <TouchableOpacity style={styles.addImage} onPress={handleImagePick}>
              <Text style={styles.plus}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Report'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  reasonOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedOption: {
    borderColor: '#519CFF',
    backgroundColor: '#EAF4FF',
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  imageSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  addImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plus: {
    fontSize: 24,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#519CFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
