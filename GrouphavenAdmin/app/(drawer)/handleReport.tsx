import { checkSession, getNextReport, resolveReport, rejectReport } from '../../utils/Reports'
import React from 'react';
import { XStack, YStack, Image, Button, Text, View } from 'tamagui';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

export default function HandleReport() {
  const [status, setStatus] = React.useState<'idle' | 'submitting'>('idle');
  const [report, setReport] = React.useState<any>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);


  React.useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await checkSession();
      if (!loggedIn) {
        window.location.replace('/');
      }
    };

    checkAuth();
    retrieveData();
  }, []);

  const retrieveData = async () => {
    const data = await getNextReport();
    setReport(data ?? null);
    setModalVisible(false);
  };

  const handleResolve = async () => {
    if (!report?.report_id) return;
    setStatus('submitting');
    const success = await resolveReport(report.report_id);
    if (success) retrieveData();
    setStatus('idle');
  };

  const handleReject = async () => {
    if (!report?.report_id) return;
    setStatus('submitting');
    const success = await rejectReport(report.report_id);
    if (success) retrieveData();
    setStatus('idle');
  };

  const screenshotUrls = [report?.screenshot_url, report?.screenshot_url2, report?.screenshot_url3].filter(Boolean);

  return (
    <>
      <Stack.Screen options={{ title: 'Handle Reports' }} />

      <YStack f={1} w="100%" h="100%" bg="white" jc="center" ai="center" gap={50}>
        {report ? (
          <XStack f={1} w="100%" jc="center" ai="center">
            <YStack f={1} h="100%" w="100%" jc="center" ai="center">
              <YStack
                h="75%"
                w="50%"
                jc="center"
                ai="center"
                backgroundColor="white"
                borderRadius={8}
                style={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)' }}
                padding="$5"
                gap={20}
                justifyContent="flex-start"
              >
                <Text fontSize={24} fontWeight="bold">
                  Report Reason
                </Text>
                <Text fontSize={18}>{report.reason}</Text>

                <Text fontSize={24} fontWeight="bold">
                  Reported User
                </Text>
                <Text fontSize={18}>{report.reported_user}</Text>

                <XStack gap={20} flexWrap="wrap" w="100%" jc="center">
                  {screenshotUrls.map((url, idx) => (
                    <Pressable key={idx} onPress={() => { setActiveImageIndex(idx); setModalVisible(true); }}>
                      <Image
                        source={{ uri: url, width: 200, height: 200 }}
                        borderRadius={10}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                </XStack>
              </YStack>
            </YStack>

            <YStack f={1} jc="center" ai="center" gap={50}>
              <Ionicons name="warning-outline" size={150} color="orange" />
              <XStack w="100%" gap={50} jc="center" ai="center">
                <Button w={300} disabled={status !== 'idle'} style={{ backgroundColor: 'red' }} onPress={handleReject}>
                  <Text style={{ color: 'white' }}>REJECT</Text>
                </Button>
                <Button w={300} disabled={status !== 'idle'} style={{ backgroundColor: '#519CFF' }} onPress={handleResolve}>
                  <Text style={{ color: 'white' }}>RESOLVE</Text>
                </Button>
              </XStack>
            </YStack>
          </XStack>
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={200} color="#519CFF" />
            <Text fontSize={32} fontWeight="bold" color="#519CFF">
              No pending reports!
            </Text>
          </>
        )}
      </YStack>

      {/* Fullscreen Modal */}
      {modalVisible && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          bg="rgba(0,0,0,0.9)"
          jc="center"
          ai="center"
          zIndex={1000}
          gap="$4"
        >
          <Image
            source={{ uri: screenshotUrls[activeImageIndex], width: 600, height: 600 }}
            resizeMode="contain"
            borderRadius={10}
          />

            <XStack gap="$4" jc="center" ai="center">
            <Button
                size="$4"
                circular
                onPress={() =>
                setActiveImageIndex((activeImageIndex - 1 + screenshotUrls.length) % screenshotUrls.length)
                }
                disabled={screenshotUrls.length <= 1}
            >
                <Ionicons name="chevron-back" size={24} color="black" />
            </Button>

            <Button onPress={() => setModalVisible(false)} theme="red">
                <Text color="black">Close</Text>
            </Button>

            <Button
                size="$4"
                circular
                onPress={() =>
                setActiveImageIndex((activeImageIndex + 1) % screenshotUrls.length)
                }
                disabled={screenshotUrls.length <= 1}
            >
                <Ionicons name="chevron-forward" size={24} color="black" />
            </Button>
            </XStack>
        </YStack>
      )}
    </>
  );
}
