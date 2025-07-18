import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, Alert, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { useChatContext } from 'stream-chat-expo';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceNoteRecorder({ channel }: { channel: any }) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { client } = useChatContext();

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Microphone access denied', 'Enable mic permissions in settings.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) return;

      const { sound, status } = await recording.createNewLoadedSoundAsync();
      setSound(sound);

      if ('durationMillis' in status) {
        setDuration(status.durationMillis ?? 0);
      }

      // Auto-upload
      setIsUploading(true);
      const file = {
        uri,
        name: 'voice-note.m4a',
        type: 'audio/m4a',
      };
      const response = await channel.sendFile(file);
      const audioUrl = response.file;

      await channel.sendMessage({
        text: '🎤 Voice Note',
        attachments: [
          {
            type: 'audio',
            asset_url: audioUrl,
            title: 'Voice Note',
          },
        ],
      });
    } catch (err) {
      console.error('Upload or playback failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const playRecording = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  return (
    <View style={{ padding: 10, gap: 12, flexDirection: 'row', alignItems: 'center' }}>
      {recording ? (
        <Pressable onPress={stopRecording}>
          <Ionicons name="stop-circle" size={32} color="red" />
        </Pressable>
      ) : (
        <Pressable onPress={startRecording}>
          <Ionicons name="mic" size={28} color="#007AFF" />
        </Pressable>
      )}

      {duration !== null && (
        <Pressable onPress={playRecording} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="play" size={24} color="green" />
          <Text style={{ marginLeft: 6 }}>{(duration / 1000).toFixed(1)}s</Text>
        </Pressable>
      )}

      {isUploading && <ActivityIndicator />}
    </View>
  );
}
