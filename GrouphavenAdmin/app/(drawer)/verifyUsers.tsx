import { approveUser, rejectUser, checkSession, getUser } from '../../utils/Account'
import { calculateAge } from '../../utils/Functions'
import React from 'react';
import { XStack, YStack, Image, Button, Text, View, Label, Select, AlertDialog } from 'tamagui';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyUsers() {
    const [reason, setReason] = React.useState('Invalid Photo')
    const [status, setStatus] = React.useState<'idle' | 'submitting'>('idle')
    const [imageUrl, setImageUrl] = React.useState(null);
    const [requestId, setRequestId] = React.useState(null);
    const [userId, setUserId] = React.useState(null);
    const [userData, setUserData] = React.useState<any>(null);
    const photoKeys = ['photo_1', 'photo_2', 'photo_3', 'photo_4', 'photo_5', 'photo_6'];

    const dropdownItems = [
        { name: 'Invalid Photo' },
        { name: 'Invalid Pose' },
        { name: 'Blurry Photo' },
        { name: 'Fake Photo' },
    ]

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

        if (!data || data.length === 0) {
            setImageUrl(null);
            setRequestId(null);
            setUserId(null);
            setUserData(null);
        } else {
            const request = data[0];
            const user = request.users;

            setImageUrl(data[0].photo_url);
            setRequestId(data[0].request_id);
            setUserId(data[0].id);
            setUserData(user);
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

        const data = await rejectUser(requestId, reason);

        if (data) {
            retrieveData();
        }

        setStatus('idle');
        setReason('Invalid Photo');
    };

    return (
        <>
            <Stack.Screen options={{ title: 'Verify Users' }} />

            <YStack f={1} w="100%" h="100%" bg="white" jc="center" ai="center" gap={50}>

                {imageUrl && requestId ? (

                    <XStack f={1} w="100%" jc="center" ai="center">

                        <YStack f={1} h="100%" w="100%" jc="center" ai="center">
                            <YStack h="75%" w="50%" jc="center" ai="center" backgroundColor={"white"} borderRadius={8}
                                style={{
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)'
                                }} padding="$5" gap={20} justifyContent='flex-start'>


                                <XStack gap={20} w='100%' jc='center'>
                                    {userData.avatar_url ? (
                                        <Image
                                            source={{
                                                uri: userData.avatar_url,
                                                width: 150,
                                                height: 150,
                                            }}
                                            borderRadius={100}
                                            resizeMode="cover"
                                        />
                                    ) : <Ionicons name='person-circle-outline' size={138} color="lightgrey"></Ionicons>}

                                    <YStack gap={20} h={"100%"} jc={"center"}>
                                        <Text fontSize={24} fontWeight="bold">{userData.name} ({calculateAge(userData.dob)})</Text>
                                        <Text fontSize={24} fontWeight="bold">{userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1)}</Text>
                                    </YStack>
                                </XStack>

                                <XStack w='100%' ai='flex-start' paddingLeft={20}>
                                    <YStack gap={20} w={"20%"}>
                                        <Text fontWeight="bold">Tagline:</Text>
                                        <Text fontWeight="bold">Bio:</Text>
                                        <Text fontWeight="bold">City:</Text>
                                        <Text fontWeight="bold">Trusted?:</Text>
                                    </YStack>
                                    <YStack gap={20}>
                                        <Text numberOfLines={1} w={'40%'}>{userData.tagline}</Text>
                                        <Text numberOfLines={1} w={'40%'}>{userData.bio}</Text>
                                        <Text>{userData.city.charAt(0).toUpperCase() + userData.city.slice(1)}</Text>
                                        <Text>{userData.is_trusted ? 'Yes' : 'No'}</Text>
                                    </YStack>
                                </XStack>

                                <XStack gap={20} flexWrap="wrap" w={"100%"} jc='center'>
                                    {photoKeys.map((key, index) => {
                                        const photoUrl = userData[key];

                                        return (
                                            <View
                                                key={index}
                                                backgroundColor="#f0f0f0"
                                                borderRadius={8}
                                                width={120}
                                                height={120}
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                {photoUrl ? (
                                                    <Image
                                                        source={{ uri: photoUrl, width: 120, height: 120 }}
                                                        borderRadius={8}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <Ionicons name="image-outline" size={80} color="lightgrey" />
                                                )}
                                            </View>
                                        );
                                    })}
                                </XStack>














                            </YStack>
                        </YStack>

                        <YStack f={1} jc="center" ai="center" gap={50}>
                            {imageUrl ? (
                                <Image
                                    source={{
                                        uri: imageUrl,
                                        width: 500,
                                        height: 500,
                                    }}
                                    resizeMode="contain"
                                />
                            ) : null}

                            <XStack w="100%" gap={50} jc="center" ai="center">
                                <AlertDialog native>
                                    <AlertDialog.Trigger asChild>
                                        <Button w={300} disabled={status !== 'idle'} style={{ backgroundColor: 'red' }}>
                                            <Text style={{ color: 'white' }}>REJECT</Text>
                                        </Button>
                                    </AlertDialog.Trigger>

                                    <AlertDialog.Portal>
                                        <AlertDialog.Overlay
                                            key="overlay"
                                            animation="quick"
                                            opacity={0.5}
                                            enterStyle={{ opacity: 0 }}
                                            exitStyle={{ opacity: 0 }}
                                        />
                                        <AlertDialog.Content
                                            key="content"
                                            animation={'quick'}
                                            enterStyle={{ opacity: 0 }}
                                            exitStyle={{ opacity: 0 }}
                                        >
                                            <YStack gap="$4">
                                                <AlertDialog.Title fontWeight="bold" fontSize={24} >Reject Photo</AlertDialog.Title>
                                                <YStack gap="$4">
                                                    <XStack gap="$3" justifyContent="flex-end">
                                                        <Label fontSize={16}>
                                                            Reason:
                                                        </Label>
                                                        <Select value={reason} onValueChange={setReason}>
                                                            <Select.Trigger width={200} iconAfter={() => <Ionicons name="chevron-down" size={20} color="#333" />}>
                                                                <Select.Value />
                                                            </Select.Trigger>

                                                            <Select.Content zIndex={10000}>
                                                                <Select.Viewport>
                                                                    <Select.Group>
                                                                        {dropdownItems.map((item, i) => (
                                                                            <Select.Item
                                                                                index={i}
                                                                                key={item.name}
                                                                                value={item.name}
                                                                            >
                                                                                <Select.ItemText>{item.name}</Select.ItemText>
                                                                                <Select.ItemIndicator marginLeft="auto">
                                                                                    <Ionicons name="checkmark-sharp" size={16} />
                                                                                </Select.ItemIndicator>
                                                                            </Select.Item>
                                                                        ))}
                                                                    </Select.Group>
                                                                </Select.Viewport>
                                                            </Select.Content>
                                                        </Select>
                                                    </XStack>

                                                    <XStack justifyContent='space-between'>
                                                        <AlertDialog.Cancel asChild>
                                                            <Button style={{ backgroundColor: 'red', color: 'white' }}>Cancel</Button>
                                                        </AlertDialog.Cancel>
                                                        <AlertDialog.Action asChild>
                                                            <Button onPress={() => {
                                                                handleReject();
                                                            }} style={{ backgroundColor: '#519CFF', color: 'white' }}>Submit</Button>
                                                        </AlertDialog.Action>
                                                    </XStack>
                                                </YStack>
                                            </YStack>
                                        </AlertDialog.Content>
                                    </AlertDialog.Portal>
                                </AlertDialog>

                                <Button w={300} disabled={status !== 'idle'} style={{ backgroundColor: '#519CFF' }}
                                    onPress={() => {
                                        handleApprove();
                                    }}>
                                    <Text style={{ color: 'white' }}>APPROVE</Text>
                                </Button>
                            </XStack>
                        </YStack>
                    </XStack>

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
