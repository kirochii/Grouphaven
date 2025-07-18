import { Stack } from 'expo-router';
import { XStack, YStack, Text, Input, Button, Select, Separator } from 'tamagui';
import { getReviewRows } from '../../utils/Functions';
import React from 'react';
import { lightColors } from '@tamagui/themes';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, Legend, ResponsiveContainer, LabelList } from 'recharts';

export default function RatingReport() {
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    const [endDate, setEndDate] = React.useState<Date | null>(null);
    const [dateError, setDateError] = React.useState('');

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#DA70D6'];

    const [tableData, setTableData] = React.useState<{
        reviewId: string;
        groupId: string;
        reviewer: string;
        host: string;
        rating: number;
        review: string;
        date: string;
    }[]>([]);

    const [activeFilter, setActiveFilter] = React.useState<number | null>(null);

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setActiveFilter(null);
    };

    const handleApply = async () => {
        if (!startDate || !endDate) {
            setDateError('Please select both start and end dates');
            return;
        }

        if (startDate > endDate) {
            setDateError('Start date cannot be after end date');
            return;
        }

        setDateError('');

        const resultRow = await getReviewRows(startDate, endDate);
        const rowFormatted = resultRow.map(
            ([reviewId, groupId, reviewer, host, rating, review, date]) => ({
                reviewId, groupId, reviewer, host, rating, review, date
            })
        );

        setTableData(rowFormatted);
    };

    const exportToCSV = () => {
        const headers = ['Review ID', 'Group ID', 'Reviewer', 'Host', 'Rating', 'Review', 'Date'];
        const rows = filteredData.map(row => [
            row.reviewId,
            row.groupId,
            row.reviewer,
            row.host,
            row.rating,
            JSON.stringify(row.review),
            row.date
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'host_reviews.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredData = activeFilter !== null
        ? tableData.filter(row => row.rating === activeFilter)
        : tableData;

    const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: tableData.filter(row => row.rating === rating).length,
    }));

    return (
        <>
            <Stack.Screen options={{ title: 'Rating Report' }} />
            <YStack f={1} w="100%" h="100%" bg="$gray3" jc="flex-start" gap={20} overflow={"auto" as any}>

                <XStack paddingTop={50} paddingLeft={100}>
                    <Text fontSize={32} fontWeight="bold">Filter</Text>
                </XStack>

                <YStack bg="white" minHeight={165} w={1800} borderRadius="$6" gap={20} marginHorizontal={50} paddingVertical={20} paddingHorizontal={50}>
                    <XStack flexWrap="wrap" jc="flex-start" gap={50}>
                        <YStack gap={10}>
                            <Text fontSize={16} color={dateError !== '' ? 'red' : lightColors.gray10}>Start Date</Text>
                            <DatePicker popperContainer={({ children }) => <div style={{ zIndex: 9999 }}>{children}</div>}
                                popperPlacement="bottom-start"
                                portalId="root-portal" selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Enter Date" dateFormat="dd MMM yyyy" customInput={
                                    <Input fontSize={14} fontFamily="$body" padding="$3" borderWidth={1} borderColor="$gray8" />
                                }
                            />
                        </YStack>

                        <YStack gap={10}>
                            <Text fontSize={16} color={dateError !== '' ? 'red' : lightColors.gray10}>End Date</Text>
                            <DatePicker popperContainer={({ children }) => <div style={{ zIndex: 9999 }}>{children}</div>}
                                popperPlacement="bottom-start"
                                portalId="root-portal" selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="Enter Date" dateFormat="dd MMM yyyy" customInput={
                                    <Input fontSize={14} fontFamily="$body" padding="$3" borderWidth={1} borderColor="$gray8" />
                                } />
                        </YStack>

                        <YStack ai="center" paddingTop={30}>
                            <XStack gap={20}>
                                <Button backgroundColor={lightColors.red9} color="white" onPress={handleClear}>Clear</Button>
                                <Button backgroundColor="#519CFF" color="white" onPress={handleApply}>Apply</Button>
                            </XStack>
                        </YStack>
                    </XStack>

                    <Text color={dateError ? 'red' : 'transparent'} style={{ userSelect: 'none' }}>{dateError || ' '}</Text>
                </YStack>

                <XStack paddingLeft={100} gap={40} ai="center">
                    <YStack w={400} h={350} bg="white" borderRadius="$6" ai="center" jc="center">
                        <Text fontSize={20} fontWeight="bold" marginBottom={10}>Rating Distribution</Text>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ratingCounts}
                                    dataKey="count"
                                    nameKey="rating"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={60}
                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                    onClick={(data, index) => setActiveFilter(data.rating === activeFilter ? null : data.rating)}
                                >
                                    {ratingCounts.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            cursor="pointer"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => `${value} reviews`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </YStack>

                    <YStack w={800} h={350} bg="white" borderRadius="$6" ai="center" jc="center">
                        <Text fontSize={20} fontWeight="bold" marginBottom={10}>Rating Bar Chart</Text>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ratingCounts} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                                <XAxis dataKey="rating" tick={{ fontSize: 14 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
                                <Tooltip formatter={(value: any) => `${value} reviews`} />
                                <Legend />
                                <Bar dataKey="count" fill="#519CFF">
                                    <LabelList dataKey="count" position="top" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </YStack>
                </XStack>

                <XStack paddingTop={50} paddingLeft={100}>
                    <Text fontSize={32} fontWeight="bold">Records</Text>
                    <Button onPress={exportToCSV}>Export CSV</Button>
                </XStack>

                <YStack bg="white" w={1800} borderRadius="$3" marginHorizontal={50} marginBottom={50}>
                    <XStack paddingVertical="$3" ai="center" paddingLeft={50}>
                        <YStack flex={2}><Text fontWeight="bold">Review ID</Text></YStack>
                        <YStack flex={2}><Text fontWeight="bold">Group ID</Text></YStack>
                        <YStack flex={1}><Text fontWeight="bold">Reviewer Name</Text></YStack>
                        <YStack flex={1}><Text fontWeight="bold">Host Name</Text></YStack>
                        <YStack flex={0.3}><Text fontWeight="bold">Rating</Text></YStack>
                        <YStack flex={2}><Text fontWeight="bold">Review</Text></YStack>
                        <YStack flex={1}><Text fontWeight="bold">Date</Text></YStack>
                    </XStack>
                    <Separator />

                    {filteredData.length === 0 ? (
                        <Text flex={1} textAlign="center" padding="$3" color="$gray10">No records found!</Text>
                    ) : (
                        filteredData.map((item, i) => (
                            <YStack key={i}>
                                <XStack paddingVertical="$3" alignItems="center" paddingLeft={50}>
                                    <YStack flex={2}><Text fontSize={14}>{item.reviewId}</Text></YStack>
                                    <YStack flex={2}><Text fontSize={14}>{item.groupId}</Text></YStack>
                                    <YStack flex={1}><Text fontSize={14}>{item.reviewer}</Text></YStack>
                                    <YStack flex={1}><Text fontSize={14}>{item.host}</Text></YStack>
                                    <YStack flex={0.3}><Text fontSize={14}>{item.rating}</Text></YStack>
                                    <YStack flex={2}><Text fontSize={14}>{item.review}</Text></YStack>
                                    <YStack flex={1}><Text fontSize={14}>{item.date}</Text></YStack>
                                </XStack>
                                <Separator />
                            </YStack>
                        ))
                    )}
                </YStack>
            </YStack>
        </>
    );
};
