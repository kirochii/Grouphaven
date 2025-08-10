import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { XStack, YStack, Text, Input, Button, Checkbox, Label, Select, Separator, Dialog, Image, Slider } from 'tamagui';
import { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';
import React from 'react';
import { checkSession } from '~/utils/Account';


export default function ManageUsers() {
    const [tableData, setTableData] = useState<any[]>([]);
    const statusOptions = ['active', 'banned'];
    const genderOptions = ['male', 'female', 'other'];

    const [open, setOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const [confirmSuspendId, setConfirmSuspendId] = useState<string | null>(null);

    React.useEffect(() => {
        const init = async () => {
            const loggedIn = await checkSession();

            if (!loggedIn) {
                window.location.replace('/');
            }

            await handleApply();
        };

        init();
    }, []);

    const [filters, setFilters] = useState({
        id: '',
        name: '',
        status: [] as string[],
        gender: [] as string[],
        minAge: 13,
        maxAge: 80,
        minExp: 0,
        maxExp: 10000,
        minRating: 0,
        maxRating: 5,
    });

    const toggleOption = (field: 'status' | 'gender', value: string) => {
        setFilters((prev) => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter((v) => v !== value)
                : [...prev[field], value],
        }));
    };

    const fetchUsers = async () => {
        if (!supabase) return;

        const { data, error } = await supabase
            .from('users')
            .select('id, name, status, avatar_url, avg_rating, exp');

        if (error) {
            console.error('Failed to fetch users:', error);
            alert('Failed to load users');
            return;
        }

        setTableData(data ?? []);
    };

    const handleClear = () => {
        const defaultFilters = {
            id: '',
            name: '',
            status: [],
            gender: [],
            minAge: 13,
            maxAge: 80,
            minExp: 0,
            maxExp: 10000,
            minRating: 0,
            maxRating: 5,
        };

        setFilters(defaultFilters);

        // Fetch all users after filters reset
        setTimeout(() => {
            fetchUsers();
        }, 0);
    };

    const handleApply = async () => {
        console.log('Applying filters:', filters);

        if (!supabase) {
            return [];
        }

        let query = supabase
            .from('users')
            .select('id, name, status, gender, dob, avatar_url, avg_rating, exp');

        // ID
        if (filters.id?.trim()) {
            query = query.eq('id', filters.id.trim());
        }

        // Name (partial match)
        if (filters.name?.trim()) {
            query = query.ilike('name', `%${filters.name.trim()}%`);
        }

        // Status
        if (filters.status.length > 0) {
            query = query.in('status', filters.status);
        }

        // Gender
        if (filters.gender.length > 0) {
            query = query.in('gender', filters.gender);
        }

        // EXP
        query = query
            .gte('exp', filters.minExp)
            .lte('exp', filters.maxExp);

        // Rating
        query = query
            .gte('avg_rating', filters.minRating)
            .lte('avg_rating', filters.maxRating);

        // Age → Convert to DOB range
        const today = new Date();
        const maxDOB = new Date(today.getFullYear() - filters.minAge, today.getMonth(), today.getDate());
        const minDOB = new Date(today.getFullYear() - filters.maxAge, today.getMonth(), today.getDate());

        query = query
            .gte('dob', minDOB.toISOString())
            .lte('dob', maxDOB.toISOString());

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching filtered users:', error);
            alert('Failed to load filtered users.');
            return;
        }

        console.log('Filtered users:', data);
        setTableData(data ?? []);
    };

    const handleSuspend = async (userId: string) => {
        if (!supabase) {
            alert('Supabase client not initialized.');
            return false;
        }

        const { error } = await supabase
            .from('users')
            .update({ status: 'banned' })
            .eq('id', userId);

        if (error) {
            console.error('Failed to suspend user:', error);
            alert('Suspend failed');
            return false;
        }

        setTableData(prev =>
            prev.map(u => u.id === userId ? { ...u, status: 'banned' } : u)
        );

        return true;
    };

    const handleUnban = async (userId: string) => {
        if (!supabase) {
            alert('Supabase client not initialized.');
            return false;
        }

        const { error } = await supabase
            .from('users')
            .update({ status: 'active' })
            .eq('id', userId);

        if (error) {
            console.error('Failed to unban user:', error);
            alert('Unban failed');
            return false;
        }

        setTableData(prev =>
            prev.map(u => u.id === userId ? { ...u, status: 'active' } : u)
        );

        return true;
    };

    const getStatusStyles = (status: string) => {
        const safeStatus = status?.toLowerCase?.() || '';

        switch (safeStatus) {
            case 'active':
                return {
                    color: '$green9',
                    backgroundColor: '$green4',
                    borderColor: '$green9',
                    borderWidth: 1,
                    width: 100,
                    paddingVertical: 6,
                    borderRadius: 8,
                    fontSize: 14,
                    textAlign: 'center' as const,
                };

            case 'banned':
                return {
                    color: '$red10',
                    backgroundColor: '$red4',
                    borderColor: '$red10',
                    borderWidth: 1,
                    width: 100,
                    paddingVertical: 6,
                    borderRadius: 8,
                    fontSize: 14,
                    textAlign: 'center' as const,
                };

            default:
                return {
                    color: '$gray10',
                    backgroundColor: '$gray2',
                    width: 100,
                    paddingVertical: 6,
                    borderRadius: 8,
                    fontSize: 14,
                    textAlign: 'center' as const,
                };
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            if (!supabase) {
                return [];
            }
            const { data, error } = await supabase
                .from('users')
                .select('id, name, status, avatar_url, avg_rating, exp');

            console.log('Fetched users:', data, 'Error:', error); // 👈 Add this

            if (error) {
                console.error('Failed to fetch users:', error);
                return;
            }

            setTableData(data ?? []);
        };

        fetchUsers();
    }, []);


    return (
        <>
            <Stack.Screen options={{ title: 'Manage Users' }} />
            <YStack f={1} w="100%" h="100%" bg="$gray3" jc="flex-start" gap={20} overflow={"auto" as any}>

                <XStack paddingTop={50} paddingLeft={100}>
                    <Text fontSize={32} fontWeight="bold">Filter</Text>
                </XStack>

                <YStack bg="white" minHeight={165} w={1800} borderRadius="$6" gap={20} marginHorizontal={50} paddingVertical={20} paddingHorizontal={50}>
                    <XStack flexWrap="wrap" jc="flex-start" gap={50}>
                        <YStack gap={10}>
                            <Text fontSize={16}>User ID</Text>
                            <Input
                                placeholder="Search by ID"
                                fontSize={14}
                                padding="$3"
                                borderWidth={1}
                                borderColor="$gray8"
                                value={filters.id}
                                onChangeText={(text) => setFilters(f => ({ ...f, id: text }))}
                            />
                        </YStack>

                        {/* Name */}
                        <YStack gap={10}>
                            <Text fontSize={16}>Name</Text>
                            <Input
                                placeholder="Search by Name"
                                fontSize={14}
                                padding="$3"
                                borderWidth={1}
                                borderColor="$gray8"
                                value={filters.name}
                                onChangeText={(text) => setFilters(f => ({ ...f, name: text }))}
                            />
                        </YStack>

                        {/* Status */}
                        <YStack>
                            <Text fontSize={16}>Status</Text>
                            <XStack gap={20} paddingTop={10}>
                                {statusOptions.map((option) => (
                                    <XStack key={option} alignItems="center" gap={10}>
                                        <Checkbox
                                            checked={filters.status.includes(option)}
                                            onCheckedChange={() => toggleOption('status', option)}
                                            size="$4"
                                        >
                                            <Checkbox.Indicator>
                                                <Ionicons name="checkmark-sharp" />
                                            </Checkbox.Indicator>
                                        </Checkbox>
                                        <Label>{option}</Label>
                                    </XStack>
                                ))}
                            </XStack>
                        </YStack>

                        {/* Gender */}
                        <YStack>
                            <Text fontSize={16}>Gender</Text>
                            <XStack gap={20} paddingTop={10}>
                                {genderOptions.map((option) => (
                                    <XStack key={option} alignItems="center" gap={10}>
                                        <Checkbox
                                            checked={filters.gender.includes(option)}
                                            onCheckedChange={() => toggleOption('gender', option)}
                                            size="$4"
                                        >
                                            <Checkbox.Indicator>
                                                <Ionicons name="checkmark-sharp" />
                                            </Checkbox.Indicator>
                                        </Checkbox>
                                        <Label>{option}</Label>
                                    </XStack>
                                ))}
                            </XStack>
                        </YStack>

                        {/* Age Range */}
                        <YStack>
                            <Text fontSize={16}>Age Range</Text>
                            <Text>{filters.minAge} - {filters.maxAge}</Text>
                            <Slider
                                defaultValue={[filters.minAge, filters.maxAge]}
                                min={13}
                                max={80}
                                step={1}
                                onValueChange={(val) =>
                                    setFilters((f) => ({ ...f, minAge: val[0], maxAge: val[1] }))
                                }
                                width={125}
                                height={20}
                            >
                                <Slider.Track>
                                    <Slider.TrackActive />
                                </Slider.Track>
                                <Slider.Thumb
                                    index={0}
                                    size={20}
                                    circular
                                    bg="$blue8"
                                    borderColor="$blue8"
                                    borderWidth={2}
                                />
                                <Slider.Thumb
                                    index={1}
                                    size={20}
                                    circular
                                    bg="$blue8"
                                    borderColor="$blue8"
                                    borderWidth={2}
                                />
                            </Slider>
                        </YStack>

                        {/* EXP Range */}
                        <YStack>
                            <Text fontSize={16}>EXP Range</Text>
                            <Text>{filters.minExp} - {filters.maxExp}</Text>
                            <Slider
                                defaultValue={[filters.minExp, filters.maxExp]}
                                min={0}
                                max={10000}
                                step={100}
                                onValueChange={(val) =>
                                    setFilters((f) => ({ ...f, minExp: val[0], maxExp: val[1] }))
                                }
                                width={125}
                                height={20}
                            >
                                <Slider.Track>
                                    <Slider.TrackActive />
                                </Slider.Track>
                                <Slider.Thumb
                                    index={0}
                                    size={20}
                                    circular
                                    bg="$blue8"
                                    borderColor="$blue8"
                                    borderWidth={2}
                                />
                                <Slider.Thumb
                                    index={1}
                                    size={20}
                                    circular
                                    bg="$blue8"
                                    borderColor="$blue8"
                                    borderWidth={2}
                                />
                            </Slider>
                        </YStack>

                        <YStack>
                            <Text fontSize={16}>Rating Range</Text>
                            <Text>{filters.minRating.toFixed(1)} - {filters.maxRating.toFixed(1)}</Text>
                            <Slider
                                defaultValue={[filters.minRating, filters.maxRating]}
                                min={0}
                                max={5}
                                step={0.1}
                                onValueChange={(val) =>
                                    setFilters((f) => ({ ...f, minRating: val[0], maxRating: val[1] }))
                                }
                                width={125}
                                height={20}
                            >
                                <Slider.Track>
                                    <Slider.TrackActive />
                                </Slider.Track>
                                <Slider.Thumb
                                    index={0}
                                    size={20}
                                    circular
                                    bg="$blue8"
                                    borderColor="$blue8"
                                    borderWidth={2}
                                />
                                <Slider.Thumb
                                    index={1}
                                    size={20}
                                    circular
                                    bg="$blue8"
                                    borderColor="$blue8"
                                    borderWidth={2}
                                />
                            </Slider>
                        </YStack>

                        {/* Buttons */}
                        <YStack f={1} ai="center" paddingTop={30}>
                            <XStack gap={20}>
                                <Button backgroundColor="#E5484D" color="white" onPress={handleClear}>
                                    Clear
                                </Button>
                                <Button backgroundColor="#519CFF" color="white" onPress={handleApply}>
                                    Apply
                                </Button>
                            </XStack>
                        </YStack>

                    </XStack>
                </YStack>

                <YStack bg="white" w={1800} borderRadius="$3" marginHorizontal={50} marginBottom={50}>
                    <XStack paddingVertical="$3" ai="center" paddingLeft={50}>
                        <YStack flex={2}><Text fontWeight="700">User ID</Text></YStack>
                        <YStack flex={2}><Text fontWeight="700">Name</Text></YStack>
                        <YStack flex={1}><Text fontWeight="700">Status</Text></YStack>
                        <YStack flex={1}><Text fontWeight="700">Avatar</Text></YStack>
                        <YStack flex={1}><Text fontWeight="700">Rating</Text></YStack>
                        <YStack flex={1}><Text fontWeight="700">EXP</Text></YStack>
                        <YStack flex={1}><Text fontWeight="700">Action</Text></YStack>
                    </XStack>
                    <Separator />

                    {tableData.length === 0 ? (
                        <Text flex={1} textAlign="center" padding="$3" color="$gray10">
                            No users found!
                        </Text>
                    ) : (
                        tableData.map((user, i) => (
                            <YStack key={i}>
                                <XStack paddingVertical="$3" paddingLeft={50} alignItems="center">
                                    <YStack flex={2}><Text fontSize={14}>{user.id}</Text></YStack>
                                    <YStack flex={2}><Text fontSize={14}>{user.name}</Text></YStack>
                                    <YStack flex={1}>
                                        <Text  {...getStatusStyles(user.status)}>
                                            {user.status}
                                        </Text>
                                    </YStack>
                                    <YStack flex={1}>
                                        <Text
                                            fontSize={14}
                                            color="$blue10"
                                            cursor="pointer"
                                            textDecorationLine="underline"
                                            onPress={() => {
                                                setSelectedPhoto(user.avatar_url);
                                                setOpen(true);
                                            }}
                                        >
                                            View Avatar
                                        </Text>
                                    </YStack>
                                    <YStack flex={1}><Text fontSize={14}>{user.avg_rating ?? '—'}</Text></YStack>
                                    <YStack flex={1}><Text fontSize={14}>{user.exp}</Text></YStack>
                                    <YStack flex={1}>
                                        {user.status === 'banned' ? (
                                            <Button size="$2" backgroundColor="$green8" color="white" onPress={() => handleUnban(user.id)}>
                                                Unban
                                            </Button>
                                        ) : (
                                            <Button size="$2" theme="red" onPress={() => setConfirmSuspendId(user.id)}>
                                                Suspend
                                            </Button>
                                        )}
                                    </YStack>
                                </XStack>
                                <Separator />
                            </YStack>
                        ))
                    )}

                    {/* Confirm Suspend Dialog */}
                    <Dialog open={!!confirmSuspendId} onOpenChange={() => setConfirmSuspendId(null)} modal>
                        <Dialog.Portal>
                            <Dialog.Overlay key="overlay" />
                            <Dialog.Content bordered elevate width={400} bg="white" p="$4">
                                <Dialog.Title>Confirm Suspend</Dialog.Title>
                                <Dialog.Description>This will set the user’s status to <Text color="red">banned</Text>.</Dialog.Description>
                                <XStack mt="$4" gap={10} jc="flex-end">
                                    <Button backgroundColor="$gray6" color="$gray12" onPress={() => setConfirmSuspendId(null)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        theme="red"
                                        onPress={async () => {
                                            if (!confirmSuspendId) return;

                                            if (!supabase) {
                                                return [];
                                            }

                                            const { error } = await supabase
                                                .from('users')
                                                .update({ status: 'banned' })
                                                .eq('id', confirmSuspendId);

                                            if (error) {
                                                console.error('Failed to suspend user:', error);
                                                alert('Suspend failed');
                                            } else {
                                                setTableData(prev =>
                                                    prev.map(u => u.id === confirmSuspendId ? { ...u, status: 'banned' } : u)
                                                );
                                            }

                                            setConfirmSuspendId(null);
                                        }}
                                    >
                                        Confirm
                                    </Button>
                                </XStack>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog>
                </YStack>

                {selectedPhoto && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <Dialog.Portal>
                            <Dialog.Overlay />
                            <Dialog.Content bordered elevate width={600} bg="white" p="$4">
                                <Dialog.Title>Avatar Preview</Dialog.Title>
                                <YStack ai="center" jc="center" padding="$4">
                                    <Image
                                        source={{ uri: selectedPhoto }}
                                        width={300}
                                        height={300}
                                        borderRadius="$4"
                                    />
                                </YStack>
                                <Dialog.Close asChild>
                                    <Button mt="$4">Close</Button>
                                </Dialog.Close>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog>
                )}


            </YStack>

        </>
    );
}