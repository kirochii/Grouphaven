import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import VoiceNoteRecorder from './VoiceNoteRecorder';

export default function CustomMessageInput({ channel }: { channel: any }) {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (text.trim().length === 0) return;

    try {
      await channel.sendMessage({ text });
      setText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const sendFileAttachment = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.canceled) return;

    try {
      const file = {
        uri: result.assets[0].uri,
        name: result.assets[0].name,
        type: result.assets[0].mimeType || 'application/octet-stream',
      };

      const upload = await channel.sendFile(file);
      const fileUrl = upload.file;

      await channel.sendMessage({
        text: '📎 File attachment',
        attachments: [{ type: 'file', asset_url: fileUrl, title: file.name }],
      });
    } catch (err) {
      console.error('File upload failed:', err);
    }
  };

  const pickImageFromGallery = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert('Permission denied');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const file = {
      uri: asset.uri,
      name: asset.fileName ?? 'upload.jpg',
      type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
    };

    try {
      const upload = await channel.sendFile(file);
      const mediaUrl = upload.file;

      await channel.sendMessage({
        text: asset.type === 'video' ? '📹 Video' : '🖼️ Image',
        attachments: [{ type: asset.type, asset_url: mediaUrl, title: file.name }],
      });
    } catch (err) {
      console.error('Media upload failed:', err);
    }
  };

  const openCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return Alert.alert('Camera permission denied');

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const file = {
      uri: asset.uri,
      name: asset.fileName ?? 'camera-capture.jpg',
      type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
    };

    try {
      const upload = await channel.sendFile(file);
      const mediaUrl = upload.file;

      await channel.sendMessage({
        text: asset.type === 'video' ? '📹 Video' : '📸 Photo',
        attachments: [{ type: asset.type, asset_url: mediaUrl, title: file.name }],
      });
    } catch (err) {
      console.error('Camera media upload failed:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Pressable onPress={sendFileAttachment} style={styles.iconLeft}>
          <MaterialIcons name="attach-file" size={22} color="gray" />
        </Pressable>

        {text.trim().length === 0 && (
          <>
            <Pressable onPress={pickImageFromGallery} style={styles.iconLeft}>
              <Ionicons name="image-outline" size={22} color="gray" />
            </Pressable>
            <Pressable onPress={openCamera} style={styles.iconLeft}>
              <Ionicons name="camera-outline" size={22} color="gray" />
            </Pressable>
          </>
        )}

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message"
          style={styles.input}
          multiline
        />
      </View>

      {text.trim().length > 0 ? (
        <Pressable onPress={handleSend} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="white" />
        </Pressable>
      ) : (
        <VoiceNoteRecorder channel={channel} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderColor: 'white',
    backgroundColor: 'white',
  },
  inputWrapper: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  iconLeft: {
    padding: 4,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 12,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
