import { Stack } from 'expo-router';
import ChatProvider from '../provider/ChatProvider';

export default function ChannelLayout() {
  return (
    <ChatProvider>
      <Stack
        screenOptions={{
          headerShown: true, // Make sure headers show by default
        }}
      />
    </ChatProvider>
  );
}
