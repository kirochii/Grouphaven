import { Stack } from 'expo-router';
import { XStack, YStack, Text, Progress } from 'tamagui';
import { checkSession } from '../../utils/Account';
import { getRemainingRequest, getMatchStatus, getVerificationActivity } from '../../utils/Functions';
import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, } from 'recharts';
import { lightColors } from '@tamagui/themes';

export default function Home() {
  const [progress, setProgress] = React.useState(0);
  const [count, setRequestCount] = React.useState(0);

  const [queueData, setQueueData] = React.useState<{ name: string; value: number }[]>([]);

  const [lineData, setLineData] = React.useState<{ name: string; Requests: number }[]>([]);

  const COLORS = [
    '#519CFF', // Blue
    '#34D399', // Green
    '#FBBF24', // Amber/Yellow
    '#F87171', // Red
    '#A78BFA', // Purple
    '#FB923C', // Orange
    '#22D3EE', // Cyan
    '#EC4899', // Pink
  ];

  React.useEffect(() => {
    const init = async () => {
      const loggedIn = await checkSession();

      if (!loggedIn) {
        window.location.replace('/');
      }

      const { progress, count } = await getRemainingRequest();
      setProgress(progress);
      setRequestCount(count);

      const { inQueue, idle } = await getMatchStatus();
      setQueueData([
        { name: 'In Queue', value: inQueue },
        { name: 'Idle', value: idle },
      ]);

      const activityData = await getVerificationActivity();
      const formatted = activityData.map(item => ({
        name: item.date,
        Requests: item.count,
      }));

      setLineData(formatted);
    };

    init();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Dashboard' }} />

      <YStack f={1} w="100%" h="100%" bg="$gray3" jc="center" ai="center" gap={50} overflow={"auto" as any}>
        <XStack f={1} w="100%" padding={20} jc="space-evenly" gap={20}>
          <YStack bg="white" borderRadius="$6" ai="center" jc="center" width={1280} height={620} gap={20}>
            <LineChart width={1200} height={500} data={lineData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 14, fill: '#333', fontFamily: 'Inter' }}
              />
              <YAxis
                tick={{ fontSize: 14, fill: '#333', fontFamily: 'Inter' }}
              />
              <Tooltip
                contentStyle={{ fontSize: '14px', fontFamily: 'Inter', color: '#000' }}
                labelStyle={{ fontSize: '13px', fontFamily: 'Inter', color: '#555' }}
              />
              <Line type="linear" dataKey="Requests" stroke="#519CFF" />
            </LineChart>

            <Text fontSize={20} fontWeight="400" color={lightColors.gray10}>Your Verification Activity</Text>
          </YStack>
          <YStack gap={20}>
            <YStack bg="white" padding="$4" borderRadius="$6" ai="center" jc="center" width={500} height={300} gap={20}>
              <XStack f={1} w="100%" jc="space-evenly" ai="center">
                <PieChart width={300} height={300}>
                  <Pie
                    data={queueData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    style={{ outline: 'none' }}
                  >
                    {queueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>

                <YStack gap="$3" marginRight={30}>
                  {queueData.map((entry, index) => (
                    <XStack
                      key={index}
                      padding="$3"
                      bg={COLORS[index % COLORS.length]}
                      borderRadius="$4"
                      alignItems="center"
                      justifyContent="space-between"
                      width={200}
                    >
                      <Text fontSize={16} fontWeight="400" color="white">
                        {entry.name}
                      </Text>
                      <Text fontSize={16} fontWeight="400" color="white">
                        {entry.value}
                      </Text>
                    </XStack>
                  ))}
                </YStack>
              </XStack>

              <Text fontSize={20} fontWeight="400" color={lightColors.gray10}>Matchmaking Status Overview</Text>
            </YStack>

            <YStack bg="white" padding="$4" borderRadius="$6" ai="center" jc="center" width={500} height={300} gap={20}>
              <Text fontSize={60} fontWeight="400" color="#519CFF">{count}</Text>
              <Text fontSize={20} fontWeight="400" color="#519CFF">Remaining Verification Requests</Text>
              <Progress value={progress}>
                <Progress.Indicator animation="lazy" backgroundColor="#519CFF" />
              </Progress>
            </YStack>
          </YStack>
        </XStack>

      </YStack>
    </>
  );
}
