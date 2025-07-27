import { Stack } from 'expo-router';
import { checkSession } from '../../utils/Account';
import { XStack, YStack, Text, Input, Button, Select, Separator, } from 'tamagui';
import { getMatchStatsLine, getInterestStats, getGroupRows } from '../../utils/Functions';
import React from 'react';
import { Line, LineChart, Tooltip, Treemap, XAxis, YAxis } from 'recharts';
import { lightColors } from '@tamagui/themes';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Ionicons } from '@expo/vector-icons';

export default function MatchmakingReport() {
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    const [endDate, setEndDate] = React.useState<Date | null>(null);
    const [dateError, setDateError] = React.useState('');

    const [matchData, setMatchData] = React.useState<{ date: string, Groups: number, Count: number }[]>([]);

    const [treeMapData, setTreeMapData] = React.useState<{ name: string, count: number }[]>([]);

    const dropdownItems = [
        { name: 'Day' },
        { name: 'Month' },
        { name: 'Year' },
    ]
    const [selectedRange, setSelectedRange] = React.useState('day');

    const [resetRequested, setResetRequested] = React.useState(false);

    const [tableData, setTableData] = React.useState<{ groupId: string; name: string; size: number; date: string; interests: string }[]>([]);

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setResetRequested(true);
    };

    const handleApply = async () => {
        setDateError(''); // Clear previous error
        let valid = true;

        if (startDate && endDate && endDate < startDate) {
            setDateError('Invalid date range.');
            valid = false;
        }

        if (!valid) return;

        setDateError('');


        //set Line chart data
        const resultMatched = await getMatchStatsLine(
            startDate,
            endDate,
            selectedRange
        );

        const formatted = resultMatched.map(([date, Groups, Count]) => ({
            date,
            Groups: Groups,
            Count: Count,
        }))

        setMatchData(formatted)

        const treeMapResults = await getInterestStats(startDate, endDate);

        const treeMapFormatted = treeMapResults.map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
            count: count,
        }))

        setTreeMapData(treeMapFormatted)

        //Set row data
        const resultRow = await getGroupRows(
            startDate,
            endDate,
        );

        const rowFormatted = resultRow.map(
            ([groupId, name, size, date, interests]) => ({
                groupId, name, size, date, interests
            })
        );

        setTableData(rowFormatted)
    };

    const exportToCSV = () => {
        if (tableData.length === 0) return;

        // Define the headers
        const headers = ['Group ID', 'Name', 'Size', 'Date Created', 'Interests'];

        // Create rows by mapping tableData
        const rows = tableData.map(item => [
            item.groupId,
            item.name,
            item.size,
            item.date,
            item.interests
        ]);

        // Combine headers and rows
        const csvContent = [headers, ...rows]
            .map(e => e.join(','))
            .join('\n');

        // Create a Blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'MatchmakingReport.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            <Stack.Screen options={{ title: 'Matchmaking Report' }} />
            <YStack f={1} w="100%" h="100%" bg="$gray3" jc="flex-start" gap={20} overflow={"auto" as any}>

                <XStack paddingTop={50} paddingLeft={100}>
                    <Text fontSize={32} fontWeight="bold">Filter</Text>
                </XStack>

                <YStack bg="white" minHeight={165} w={1800} borderRadius="$6" gap={20} marginHorizontal={50} paddingVertical={20} paddingHorizontal={50}>

                    <XStack flexWrap="wrap" jc="flex-start" gap={50}>
                        <YStack gap={10}>
                            <Text fontSize={16} color={dateError !== '' ? 'red' : lightColors.gray10}>Created From</Text>
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
                            <Text fontSize={16} color={dateError !== '' ? 'red' : lightColors.gray10}>Created To</Text>
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
                            <Text fontSize={16} color={lightColors.gray10}>Sort By</Text>

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
                        </YStack>

                        <YStack ai="center" paddingTop={30}>
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
                    <YStack bg="white" padding="$4" borderRadius="$6" ai="center" jc="center" width={1080} height={620} gap={20}>
                        {treeMapData.length > 0 ? (
                            <Treemap width={1000} height={540} data={treeMapData} dataKey="count" aspectRatio={4 / 3} stroke="#fff" fill="#519CFF" />
                        ) : (
                            <YStack f={1} w="100%" jc="center" ai="center">
                                <Ionicons name='information-circle-outline' size={64} color="#ccc"></Ionicons>
                                <Text fontSize={16} fontWeight="400" color="$gray10">
                                    No results found for the selected filters.
                                </Text>
                            </YStack>
                        )}

                        <Text fontSize={20} fontWeight="400" color={lightColors.gray10}>Group Interests Treemap</Text>
                    </YStack>

                    <YStack gap={20}>
                        <YStack bg="white" padding="$4" borderRadius="$6" ai="center" jc="center" width={700} height={300} gap={10}>
                            {matchData.length > 0 ? (
                                <LineChart width={600} height={230} data={matchData}>
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
                                    <Line type="linear" dataKey="Count" stroke="#519CFF" />
                                </LineChart>
                            ) : (
                                <YStack f={1} w="100%" jc="center" ai="center">
                                    <Ionicons name='information-circle-outline' size={64} color="#ccc"></Ionicons>
                                    <Text fontSize={16} fontWeight="400" color="$gray10">
                                        No results found for the selected filters.
                                    </Text>
                                </YStack>
                            )}
                            <Text fontSize={20} fontWeight="400" color={lightColors.gray10}>Matched Users</Text>
                        </YStack>

                        <YStack bg="white" padding="$4" borderRadius="$6" ai="center" jc="center" width={700} height={300} gap={10}>
                            {matchData.length > 0 ? (
                                <LineChart width={600} height={230} data={matchData}>
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
                                    <Line type="linear" dataKey="Groups" stroke="#519CFF" />
                                </LineChart>
                            ) : (
                                <YStack f={1} w="100%" jc="center" ai="center">
                                    <Ionicons name='information-circle-outline' size={64} color="#ccc"></Ionicons>
                                    <Text fontSize={16} fontWeight="400" color="$gray10">
                                        No results found for the selected filters.
                                    </Text>
                                </YStack>
                            )}
                            <Text fontSize={20} fontWeight="400" color={lightColors.gray10}>Groups Created</Text>
                        </YStack>
                    </YStack>
                </XStack>

                <XStack paddingTop={50} paddingLeft={100} paddingRight={100} jc={"space-between"}>
                    <Text fontSize={32} fontWeight="bold">Records</Text>
                    <Button backgroundColor={"#519CFF"} color={"white"} onPress={exportToCSV}>Export CSV</Button>
                </XStack>

                <YStack bg="white" w={1800} borderRadius="$3" marginHorizontal={50} marginBottom={50}>
                    <XStack paddingVertical="$3" ai="center" paddingLeft={50}>
                        <YStack flex={2}>
                            <Text fontWeight="bold">Group ID</Text>
                        </YStack>

                        <YStack flex={1}>
                            <Text fontWeight="bold">Name</Text>
                        </YStack>

                        <YStack flex={1}>
                            <Text fontWeight="bold">Size</Text>
                        </YStack>

                        <YStack flex={1}>
                            <Text fontWeight="bold">Date Created</Text>
                        </YStack>

                        <YStack flex={2}>
                            <Text fontWeight="bold">Interests</Text>
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
                                        <Text fontSize={14}>{item.groupId}</Text>
                                    </YStack>

                                    <YStack flex={1}>
                                        <Text fontSize={14}>{item.name}</Text>
                                    </YStack>

                                    <YStack flex={1}>
                                        <Text fontSize={14}>{item.size}</Text>
                                    </YStack>

                                    <YStack flex={1}>
                                        <Text fontSize={14}>{item.date}</Text>
                                    </YStack>

                                    <YStack flex={2}>
                                        <Text fontSize={14}>{item.interests}</Text>
                                    </YStack>
                                </XStack>
                                <Separator />
                            </YStack>
                        )))}

                </YStack >
            </YStack >
        </>
    );
}