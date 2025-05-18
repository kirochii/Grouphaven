import { approveUser, rejectUser, checkSession, getUser } from '../../utils/Account'
import React from 'react';
import { XStack, YStack, Image, Button, Text } from 'tamagui';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyUsers() {
    const [status, setStatus] = React.useState<'idle' | 'submitting'>('idle')
    const [imageUrl, setImageUrl] = React.useState(null);
    const [requestId, setRequestId] = React.useState(null);
    const [userId, setUserId] = React.useState(null);

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
        const data = await getUser();

        console.log(data);

        if (!data || data.length === 0) {
            setImageUrl(null);
            setRequestId(null);
            setUserId(null);
        } else {
            setImageUrl(data[0].photo_url);
            setRequestId(data[0].request_id);
            setUserId(data[0].id);
        }
    };

    const handleApprove = async () => {
        setStatus('submitting');

        if (!requestId || !userId) return;

        const data = await approveUser(requestId, userId);

        if (data) {
            retrieveData();
        }

        setStatus('idle');
    };

    const handleReject = async () => {
        setStatus('submitting');

        if (!requestId) return;

        const data = await rejectUser(requestId);

        if (data) {
            retrieveData();
        }

        setStatus('idle');
    };

    return (
        <>
            <Stack.Screen options={{ title: 'Verify Users' }} />
            <YStack f={1} w="100%" h="100%" bg="white" jc="center" ai="center" gap={50}>

                {imageUrl && requestId ? (
                    <>
                        <XStack>
                            {imageUrl ? (
                                <Image
                                    source={{
                                        uri: imageUrl,
                                        width: 600,
                                        height: 600,
                                    }}
                                    style={{ borderRadius: 10, borderWidth: 3 }}
                                />
                            ) : null}
                        </XStack>
                        <XStack w="100%" gap={50} jc="center" ai="center">
                            <Button w={300} disabled={status !== 'idle'} style={{ backgroundColor: 'red' }}
                                onPress={() => {
                                    handleReject();
                                }}>
                                <Text style={{ color: 'white' }}>REJECT</Text>
                            </Button>
                            <Button w={300} disabled={status !== 'idle'} style={{ backgroundColor: '#519CFF' }}
                                onPress={() => {
                                    handleApprove();
                                }}>
                                <Text style={{ color: 'white' }}>APPROVE</Text>
                            </Button>
                        </XStack>
                    </>
                ) : (
                    <>
                        <Ionicons name="checkmark-circle" size={200} color={'#519CFF'} />
                        <Text fontSize={32} fontWeight="bold" color={'#519CFF'}>No pending verification requests!</Text>
                    </>
                )}

            </YStack>
        </>
    );
}
