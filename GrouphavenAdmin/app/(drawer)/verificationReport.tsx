import { Stack } from 'expo-router';
import { checkSession } from '../../utils/Account';
import { XStack, YStack, Text, Input, Button, Checkbox, Label, Select, Separator, Dialog, Image } from 'tamagui';
import { getVerificationStatsPie, getAdminStatsPie, getVerificationStatsBar, getVerificationRows } from '../../utils/Functions';
import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, Brush, XAxis, YAxis, Tooltip, Legend, } from 'recharts';
import { lightColors } from '@tamagui/themes';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Ionicons } from '@expo/vector-icons';

export default function VerificationReport() {
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    const [endDate, setEndDate] = React.useState<Date | null>(null);
    const [verifiedFromDate, setVerifiedFromDate] = React.useState<Date | null>(null);
    const [verifiedToDate, setVerifiedToDate] = React.useState<Date | null>(null);
    const options = ['Approved', 'Rejected', 'Pending'];

    const [dateErrorSource, setDateErrorSource] = React.useState<'requested' | 'verified' | null>(null);
    const [dateError, setDateError] = React.useState('');

    const [selected, setSelected] = React.useState<string[]>([]);

    const [pieData, setPieData] = React.useState<{ status: string; count: number }[]>([]);
    const [adminPieData, setAdminPieData] = React.useState<{ name: string; count: number }[]>([]);

    const [verificationData, setVerificationData] = React.useState<{ date: string, Approved: number, Rejected: number }[]>([]);

    const dropdownItems = [
        { name: 'Day' },
        { name: 'Month' },
        { name: 'Year' },
    ]
    const [selectedRange, setSelectedRange] = React.useState('day');

    const [resetRequested, setResetRequested] = React.useState(false);

    const [tableData, setTableData] = React.useState<{ id: string; status: string; photo: string; requestBy: string; verifiedBy: string; requestDate: string; verifyDate: string }[]>([]);
    const [open, setOpen] = React.useState(false);
    const [selectedPhoto, setSelectedPhoto] = React.useState<string | null>(null);

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

    const toggleOption = (option: string) => {
        setSelected(prev => {
            if (prev.includes(option)) {
                return prev.filter((o) => o !== option);
            } else {
                return [...prev, option];
            }
        });
    }

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setVerifiedFromDate(null);
        setVerifiedToDate(null);
        setSelected([]);
        setResetRequested(true);
    };

    const handleApply = async () => {
        setDateError(''); // Clear previous error
        let valid = true;

        if (startDate && endDate && endDate < startDate) {
            setDateError('Invalid date range.');
            setDateErrorSource('requested');
            valid = false;
        } else if (verifiedFromDate && verifiedToDate && verifiedToDate < verifiedFromDate) {
            setDateError('Invalid date range.');
            setDateErrorSource('verified');
            valid = false;
        }

        if (!valid) return;

        setDateError('');
        setDateErrorSource(null);

        //Set pie data
        const result = await getVerificationStatsPie(
            startDate,
            endDate,
            verifiedFromDate,
            verifiedToDate,
            selected
        );
        setPieData(result.map(([status, count]) => ({ status, count })));

        const resultAdmin = await getAdminStatsPie(
            startDate,
            endDate,
            verifiedFromDate,
            verifiedToDate,
            selected
        );
        setAdminPieData(resultAdmin.map(([name, count]) => ({ name, count })));

        //set Bar chart data
        const resultVerification = await getVerificationStatsBar(
            startDate,
            endDate,
            verifiedFromDate,
            verifiedToDate,
            selected,
            selectedRange
        );

        const formatted = resultVerification.map(([date, approved, rejected]) => ({
            date,
            Approved: approved,
            Rejected: rejected,
        }))

        setVerificationData(formatted)


        //Set row data
        const resultRow = await getVerificationRows(
            startDate,
            endDate,
            verifiedFromDate,
            verifiedToDate,
            selected
        );

        const rowFormatted = resultRow.map(
            ([id, status, photo, requestBy, verifiedBy, requestDate, verifyDate]) => ({
                id,
                status,
                photo,
                requestBy,
                verifiedBy,
                requestDate,
                verifyDate,
            })
        );

        setTableData(rowFormatted)
    };

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'rejected':
                return {
                    color: 'red',
                    borderColor: 'red',
                    backgroundColor: '$red5',
                    borderWidth: 1,
                    paddingVertical: 6,
                    borderRadius: 8,
                    fontSize: 14,
                    width: 100
                };
            case 'approved':
                return {
                    color: '$green9',
                    backgroundColor: '$green4',
                    borderColor: '$green9',
                    borderWidth: 1,
                    width: 100,
                    paddingVertical: 6,
                    borderRadius: 8,
                    fontSize: 14
                };
            case 'pending':
                return {
                    color: '#FFA500',
                    borderColor: '#FFA500',
                    backgroundColor: '#FFF5E5',
                    borderWidth: 1,
                    width: 100,
                    paddingVertical: 6,
                    borderRadius: 8,
                    fontSize: 14
                };
            default:
                return {
                    color: '$gray10',
                    backgroundColor: '$gray2',
                    width: 100,
                    paddingVertical: 6,
                    borderRadius: 8,
                    fontSize: 14
                };
        }
    };


    React.useEffect(() => {
        if (resetRequested) {
            handleApply();
            setResetRequested(false);
        }
    }, [resetRequested]);

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

    return (
        <>
            <Stack.Screen options={{ title: 'Verification Report' }} />
            <YStack f={1} w="100%" h="100%" bg="$gray3" jc="flex-start" gap={20} overflow={"auto" as any}>

                <XStack paddingTop={50} paddingLeft={100}>
                    <Text fontSize={32} fontWeight="bold">Filter</Text>
                </XStack>

                <YStack bg="white" minHeight={165} w={1800} borderRadius="$6" gap={20} marginHorizontal={50} paddingVertical={20} paddingHorizontal={50}>

                    <XStack flexWrap="wrap" jc="flex-start" gap={50}>
                        <YStack gap={10}>
                            <Text fontSize={16} color={dateErrorSource === 'requested' ? 'red' : lightColors.gray10}>Requested From</Text>
                            <DatePicker popperContainer={({ children }) => <div style={{ zIndex: 9999 }}>{children}</div>}
                                popperPlacement="bottom-start"
                                portalId="root-portal" selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Enter Date" dateFormat="dd MMM yyyy" customInput={
                                    <Input
                                        fontSize={14}
                                        fontFamily="$body"
                                        padding="$3"
                                        borderWidth={1}
                                        borderColor="$gray8"
                                    />
                                }
                            />
                        </YStack>

                        <YStack gap={10}>
                            <Text fontSize={16} color={dateErrorSource === 'requested' ? 'red' : lightColors.gray10}>Requested To</Text>
                            <DatePicker popperContainer={({ children }) => <div style={{ zIndex: 9999 }}>{children}</div>}
                                popperPlacement="bottom-start"
                                portalId="root-portal" selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="Enter Date" dateFormat="dd MMM yyyy" customInput={
                                    <Input
                                        fontSize={14}
                                        fontFamily="$body"
                                        padding="$3"
                                        borderWidth={1}
                                        borderColor="$gray8"
                                    />
                                } />
                        </YStack>

                        <YStack gap={10}>
                            <Text fontSize={16} color={dateErrorSource === 'verified' ? 'red' : lightColors.gray10}>Verified From</Text>
                            <DatePicker popperContainer={({ children }) => <div style={{ zIndex: 9999 }}>{children}</div>}
                                popperPlacement="bottom-start"
                                portalId="root-portal" selected={verifiedFromDate} onChange={(date) => setVerifiedFromDate(date)} placeholderText="Enter Date" dateFormat="dd MMM yyyy" customInput={
                                    <Input
                                        fontSize={14}
                                        fontFamily="$body"
                                        padding="$3"
                                        borderWidth={1}
                                        borderColor="$gray8"
                                    />
                                } />
                        </YStack>

                        <YStack gap={10}>
                            <Text fontSize={16} color={dateErrorSource === 'verified' ? 'red' : lightColors.gray10}>Verified To</Text>
                            <DatePicker popperContainer={({ children }) => <div style={{ zIndex: 9999 }}>{children}</div>}
                                popperPlacement="bottom-start"
                                portalId="root-portal" selected={verifiedToDate} onChange={(date) => setVerifiedToDate(date)} placeholderText="Enter Date" dateFormat="dd MMM yyyy" customInput={
                                    <Input
                                        fontSize={14}
                                        fontFamily="$body"
                                        padding="$3"
                                        borderWidth={1}
                                        borderColor="$gray8"
                                    />
                                } />
                        </YStack>

                        <YStack>
                            <Text fontSize={16} color={lightColors.gray10}>Status</Text>
                            <XStack gap={20} paddingTop={10}>
                                {options.map((option) => (
                                    <XStack key={option} alignItems="center" gap={10}>
                                        <Checkbox
                                            checked={selected.includes(option)}
                                            onCheckedChange={() => toggleOption(option)}
                                            size="$4"
                                        >
                                            <Checkbox.Indicator>
                                                <Ionicons name='checkmark-sharp'></Ionicons>
                                            </Checkbox.Indicator>
                                        </Checkbox>
                                        <Label>{option}</Label>
                                    </XStack>
                                ))}
                            </XStack>
                        </YStack>

                        <YStack f={1} ai="center" paddingTop={30}>
                            <XStack gap={20}>
                                <Button backgroundColor={lightColors.red9} color={"white"} onPress={handleClear}>Clear</Button>
                                <Button backgroundColor={"#519CFF"} color={"white"} onPress={handleApply}>Apply</Button>
                            </XStack>
                        </YStack>
                    </XStack>

                    <Text
                        color={dateError ? 'red' : 'transparent'}
                        style={{ userSelect: 'none' }}
                    >
                        {dateError || ' '}
                    </Text>

                </YStack >

                <XStack gap={20} marginHorizontal={50}>
                    <YStack gap={20}>
                        <YStack bg="white" padding="$4" borderRadius="$6" ai="center" jc="center" width={500} height={300} gap={20}>
                            {pieData.length > 0 ? (
                                <XStack f={1} w="100%" jc="space-evenly" ai="center">
                                    <PieChart width={300} height={300}>
                                        <Pie
                                            data={pieData}
                                            dataKey="count"
                                            nameKey="status"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            innerRadius={60}
                                            style={{ outline: 'none' }}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>

                                    <YStack gap="$3" marginRight={30}>
                                        {pieData.map((entry, index) => (
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
                                                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1).toLowerCase()}
                                                </Text>
                                                <Text fontSize={16} fontWeight="400" color="white">
                                                    {entry.count}
                                                </Text>
                                            </XStack>
                                        ))}
                                    </YStack>
                                </XStack>
                            ) : (
                                <YStack f={1} w="100%" jc="center" ai="center">
                                    <Ionicons name='information-circle-outline' size={64} color="#ccc"></Ionicons>
                                    <Text fontSize={16} fontWeight="400" color="$gray10">
                                        No results found for the selected filters.
                                    </Text>
                                </YStack>
                            )}

                            <Text fontSize={20} fontWeight="400" color={lightColors.gray10}>Verification Overview</Text>
                        </YStack>

                        <YStack bg="white" padding="$4" borderRadius="$6" ai="center" jc="center" width={500} height={300} gap={20}>
                            {adminPieData.length > 0 ? (
                                <XStack f={1} w="100%" jc="space-evenly" ai="center">
                                    <PieChart width={300} height={300}>
                                        <Pie
                                            data={adminPieData}
                                            dataKey="count"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            style={{ outline: 'none' }}
                                        >
                                            {adminPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>

                                    <YStack gap="$3" marginRight={30}>
                                        {adminPieData.map((entry, index) => (
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
                                                    {entry.count}
                                                </Text>
                                            </XStack>
                                        ))}
                                    </YStack>
                                </XStack>
                            ) : (
                                <YStack f={1} w="100%" jc="center" ai="center">
                                    <Ionicons name='information-circle-outline' size={64} color="#ccc"></Ionicons>
                                    <Text fontSize={16} fontWeight="400" color="$gray10">
                                        No results found for the selected filters.
                                    </Text>
                                </YStack>
                            )}

                            <Text fontSize={20} fontWeight="400" color={lightColors.gray10}>Admin Contributions</Text>
                        </YStack>
                    </YStack>

                    <YStack bg="white" padding="$4" borderRadius="$6" ai="center" jc="center" width={1280} height={620} gap={20}>

                        {verificationData.length > 0 ? (
                            <YStack ai="center" jc="center">
                                <XStack gap={20} ai='center'>
                                    <Text fontSize={16} fontWeight="400" color={lightColors.gray10}>Sort By</Text>

                                    <Select value={selectedRange} onValueChange={setSelectedRange}>
                                        <Select.Trigger width={150} iconAfter={() => <Ionicons name="chevron-down" size={20} color="#333" />}>
                                            <Select.Value />
                                        </Select.Trigger>

                                        <Select.Content>
                                            <Select.Viewport>
                                                <Select.Group>
                                                    {dropdownItems.map((item, i) => (
                                                        <Select.Item
                                                            index={i}
                                                            key={item.name}
                                                            value={item.name.toLowerCase()}
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

                                <BarChart
                                    width={1200}
                                    height={450}
                                    data={verificationData}
                                >
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 14, fill: '#333', fontFamily: 'Inter' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 14, fill: '#333', fontFamily: 'Inter' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ fontSize: '14px', fontFamily: 'Inter', color: '#000' }}
                                        labelStyle={{ fontSize: '13px', fontFamily: 'Inter', color: '#555' }}
                                    />
                                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: '14px', fontFamily: 'Inter' }} />
                                    <Brush dataKey="date" height={50} stroke="#519CFF" />
                                    <Bar dataKey="Approved" stackId="a" fill="#519CFF" />
                                    <Bar dataKey="Rejected" stackId="a" fill="#F87171" />
                                </BarChart>
                            </YStack>
                        ) : (
                            <YStack f={1} w="100%" jc="center" ai="center">
                                <Ionicons name='information-circle-outline' size={64} color="#ccc"></Ionicons>
                                <Text fontSize={16} fontWeight="400" color="$gray10">
                                    No results found for the selected filters.
                                </Text>
                            </YStack>
                        )}

                        <Text fontSize={20} fontWeight="400" color={lightColors.gray10}>Verification Activity</Text>
                    </YStack>
                </XStack>

                <XStack paddingTop={50} paddingLeft={100}>
                    <Text fontSize={32} fontWeight="bold">Records</Text>
                </XStack>

                <YStack bg="white" w={1800} borderRadius="$3" marginHorizontal={50} marginBottom={50}>
                    <XStack paddingVertical="$3" ai="center" paddingLeft={50}>
                        <YStack flex={2}>
                            <Text fontWeight="bold">Request ID</Text>
                        </YStack>

                        <YStack flex={1}>
                            <Text fontWeight="bold">Status</Text>
                        </YStack>

                        <YStack flex={1}>
                            <Text fontWeight="bold">Photo</Text>
                        </YStack>

                        <YStack flex={1}>
                            <Text fontWeight="bold">Requested by</Text>
                        </YStack>

                        <YStack flex={1}>
                            <Text fontWeight="bold">Verified by</Text>
                        </YStack>

                        <YStack flex={1}>
                            <Text fontWeight="bold">Request Date</Text>
                        </YStack>

                        <YStack flex={1}>
                            <Text fontWeight="bold">Verification Date</Text>
                        </YStack>
                    </XStack>
                    <Separator />

                    {tableData.length === 0 ? (
                        <Text flex={1} textAlign="center" padding="$3" color={"$gray10"}>
                            No records found!
                        </Text>
                    ) : (
                        tableData.map((item, i) => (

                            <YStack key={i}>
                                <XStack paddingVertical="$3" paddingLeft={50} alignItems="center">

                                    <YStack flex={2}>
                                        <Text fontSize={14}>{item.id}</Text>
                                    </YStack>

                                    <YStack flex={1} ai="flex-start">
                                        <Text textAlign='center'
                                            {...getStatusStyles(item.status)}
                                        >
                                            {item.status}
                                        </Text>
                                    </YStack>

                                    <YStack flex={1}>
                                        <Text fontSize={14} color="$blue10" cursor="pointer"
                                            textDecorationLine="underline"
                                            w={80}
                                            onPress={() => {
                                                setSelectedPhoto(item.photo);
                                                setOpen(true);
                                            }}
                                        >
                                            View Photo
                                        </Text>
                                    </YStack>

                                    <YStack flex={1}>
                                        <Text fontSize={14}>{item.requestBy}</Text>
                                    </YStack>

                                    <YStack flex={1}>
                                        <Text fontSize={14}>{item.verifiedBy}</Text>
                                    </YStack>

                                    <YStack flex={1}>
                                        <Text fontSize={14}>{item.requestDate}</Text>
                                    </YStack>

                                    <YStack flex={1}>
                                        <Text fontSize={14}>{item.verifyDate}</Text>
                                    </YStack>
                                </XStack>
                                <Separator />
                            </YStack>
                        )))}

                </YStack >
            </YStack >

            <Dialog open={open} onOpenChange={setOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay />
                    <Dialog.Content shadowColor="transparent" borderWidth={0} padding={0} width="30%" height="50%" backgroundColor="$backgroundTransparent">
                        {selectedPhoto && (
                            <Image
                                source={{ uri: selectedPhoto }}
                                width="100%"
                                height="100%"
                                resizeMode="contain"
                            />
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>
        </>
    );
}