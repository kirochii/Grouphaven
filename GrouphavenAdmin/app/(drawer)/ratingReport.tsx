import { Stack } from 'expo-router';
import { checkSession } from '../../utils/Account';
import { XStack, YStack, Text, Input, Button, Select, Separator,   
    AlertDialog,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel, } from 'tamagui';
import { getReviewRows, getReviewStatsPie, getSentimentLabel, getReviewSentimentStatsPie, getSentimentRatingMismatch, getReviewStatsLine } from '../../utils/Functions';
import React from 'react';
import { Line, LineChart, Tooltip, Treemap, XAxis, YAxis, Pie, PieChart,Cell,  TooltipProps, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { lightColors } from '@tamagui/themes';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '~/utils/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ratingReport(){
    const [createdFrom, setCreatedFrom] = React.useState<Date | null>(null);
    const [createdTo, setCreatedTo] = React.useState<Date | null>(null);
    const [dateError, setDateError] = React.useState<string | null>(null);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#8dd1e1', '#d0ed57', '#a4de6c'];


    type ReviewType = [string, string, string, number, string, string];
    const [reviewData, setReviewData] = React.useState<ReviewType[]>([]);
    const [selectedReviews, setSelectedReviews] = React.useState<Set<string>>(new Set());
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)

    const [tableData, setTableData] = React.useState<{review_id: string; reviewer_id: string; reviewee_id: string; rating: number; review: string; review_date: string;}[]>([]);


    const [ratingStats, setRatingStats] = React.useState<{ rating: number, count: number }[]>([]);
    const [sentimentStats, setSentimentStats] = React.useState<{ sentiment: string; count: number }[]>([]);

    type SentimentMismatch = {review_id: string;rating: number;sentiment: string;review: string;};
    const [sentimentMismatches, setSentimentMismatches] = React.useState<SentimentMismatch[]>([]);

    const [sentimentPieData, setSentimentPieData] = React.useState([]);

    const [loading, setLoading] = React.useState(false);
    const [mismatches, setMismatches] = React.useState<{ review_id: string; rating: number; sentiment: string; review: string; }[]>([]);

    const [lineData, setLineData] = React.useState<{ date: string, avgRating: number }[]>([]);


    async function fetchSentimentStats() {
        setLoading(true);
        const stats = await getReviewSentimentStatsPie(createdFrom, createdTo);
        const mismatches = await getSentimentRatingMismatch(createdFrom, createdTo);
        setSentimentStats(stats);
        setMismatches(mismatches);
        setLoading(false);
    }

    const exportReviewCSV = () => {
        if (tableData.length === 0) return;

        // Define the CSV headers
        const headers = ['Review ID', 'Reviewer ID', 'Reviewee ID', 'Rating', 'Review', 'Review Date'];

        // Map the tableData into rows
        const rows = tableData.map((item) => [
            item.review_id,
            item.reviewer_id,
            item.reviewee_id,
            item.rating,
            `"${item.review.replace(/"/g, '""')}"`, // Escape quotes
            item.review_date
        ]);

        // Combine headers and rows into CSV content
        const csvContent = [headers, ...rows]
            .map((row) => row.join(','))
            .join('\n');

        // Create a Blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ReviewSentimentMismatch.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleReviewSelection = (reviewId: string) => {
        setSelectedReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(reviewId)) {
            newSet.delete(reviewId);
            } else {
            newSet.add(reviewId);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedReviews.size === reviewData.length) {
            setSelectedReviews(new Set());
        } else {
            setSelectedReviews(new Set(reviewData.map(r => r[0])));
        }
    };

    const deleteSelectedReviews = async () => {
        if (!supabase) {
            console.error("Supabase client is null");
            return;
        }

        const ids = Array.from(selectedReviews);

        const { error } = await supabase
            .from('reviews')
            .delete()
            .in('review_id', ids);

        if (error) {
            console.error("Deletion error:", error.message);
        } else {
            setReviewData(prev => prev.filter(r => !selectedReviews.has(r[0])));
            setSelectedReviews(new Set());
        }
    };

    function handleClear() {
        setCreatedFrom(null);
        setCreatedTo(null);
        setDateError(null);
        // Optionally reset results too
    }

    function handleApply() {
        if (setCreatedFrom && setCreatedTo && setCreatedTo < setCreatedFrom) {
            setDateError('End date cannot be earlier than start date.');
            return;
        }

        setDateError(null);
        //fetchSentimentStats();

        (async () => {
            const stats = await getReviewStatsPie(createdFrom, createdTo);
            setRatingStats(stats);
        })();
    }

    React.useEffect(() => {
        const fetchData = async () => {
            const [rows, stats, sentimentStats, mismatches] = await Promise.all([
                getReviewRows(createdFrom, createdTo),
                getReviewStatsPie(createdFrom, createdTo),
                getReviewSentimentStatsPie(createdFrom, createdTo),
                getSentimentRatingMismatch(createdFrom, createdTo)
            ]);

            setReviewData(rows);
            setRatingStats(stats);
            setSentimentStats(sentimentStats);           
            setSentimentMismatches(mismatches);          
        };

        fetchData();
    }, [createdFrom, createdTo]);


    return(
            <>
        <Stack.Screen options={{ title: 'Rating and Review Report' }} />
        <YStack f={1} w="100%" h="100%" bg="$gray3" jc="flex-start" gap={20} overflow={"auto" as any}>
            
            <XStack paddingTop={50} paddingLeft={100}>
                <Text fontSize={32} fontWeight="bold">Filter</Text>
            </XStack>

            <YStack bg="white" minHeight={165} w={1800} borderRadius="$6" gap={20} marginHorizontal={50} paddingVertical={20} paddingHorizontal={50}>
                <XStack flexWrap="wrap" jc="flex-start" gap={50}>

                    <YStack gap={10}>
                        <Text fontSize={16} color={!!dateError ? 'red' : lightColors.gray10}>Created From</Text>
                        <DatePicker popperContainer={({ children }) => <div style={{ zIndex: 9999 }}>{children}</div>}
                            popperPlacement="bottom-start"
                            portalId="root-portal" selected={createdFrom} onChange={(date) => setCreatedFrom(date)} placeholderText="Enter Date" dateFormat="dd MMM yyyy" customInput={
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
                        <Text fontSize={16} color={!!dateError ? 'red' : lightColors.gray10}>Created To</Text>
                        <DatePicker popperContainer={({ children }) => <div style={{ zIndex: 9999 }}>{children}</div>}
                            popperPlacement="bottom-start"
                            portalId="root-portal" selected={createdTo} onChange={(date) => setCreatedTo(date)} placeholderText="Enter Date" dateFormat="dd MMM yyyy" customInput={
                                <Input
                                    fontSize={14}
                                    fontFamily="$body"
                                    padding="$3"
                                    borderWidth={1}
                                    borderColor="$gray8"
                                />
                            } />
                    </YStack>

                    <YStack ai="center" paddingTop={30}>
                        <XStack gap={20}>
                            <Button backgroundColor={lightColors.red9} color={"white"} onPress={handleClear}>Clear</Button>
                            <Button backgroundColor={"#519CFF"} color={"white"} onPress={handleApply}>Apply</Button>
                        </XStack>
                    </YStack>                    
                    
                    <Text
                        color={dateError ? 'red' : 'transparent'}
                        style={{ userSelect: 'none' }}
                    >
                        {dateError || ' '}
                    </Text>                    

                </XStack>
            </YStack>

            <XStack space="$4" width="100%" paddingHorizontal="$4" marginLeft={50} >
            {/* LEFT: Pie Charts (stacked) */}
                <YStack space="$4">
                    {/* Rating Overview */}
                    <YStack bg="white" borderRadius={'$6'} padding="$4" height={350} width={600}>
                    {ratingStats.length === 0 ? (
                        <Text flex={1} textAlign="center" padding="$3" color="$gray10">
                        No records found!
                        </Text>
                    ) : (
                        <XStack f={1} w="100%" jc="space-evenly" ai="center">
                        <PieChart width={300} height={300}>
                            <Pie
                            data={ratingStats}
                            dataKey="count"
                            nameKey="rating"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={60}
                            style={{ outline: 'none' }}
                            label={({ name, percent, x, y }) => (
                                <text
                                x={x}
                                y={y}
                                fill="#333"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={12}
                                fontFamily="Arial"
                                fontWeight="bold"
                                >
                                {`${name}: ${(percent * 100).toFixed(0)}%`}
                                </text>
                            )}
                            >
                            {ratingStats.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            </Pie>
                        </PieChart>

                        <YStack gap="$3" marginRight={30}>
                            {ratingStats.map((entry, index) => (
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
                                {entry.rating}
                                </Text>
                                <Text fontSize={16} fontWeight="400" color="white">
                                {entry.count}
                                </Text>
                            </XStack>
                            ))}
                        </YStack>
                        </XStack>
                    )}
                    <XStack justifyContent="center" width="100%" marginTop="$3">
                        <Text fontSize={20} fontWeight="400" color={lightColors.gray10}>
                        Rating Overview
                        </Text>
                    </XStack>
                    </YStack>

                    {/* Sentiment Overview */}
                    <YStack bg="white" borderRadius={'$6'} padding="$4" height={350} width={600}>
                    {sentimentStats.length === 0 ? (
                        <Text flex={1} textAlign="center" padding="$3" color="$gray10">
                        No sentiment records found!
                        </Text>
                    ) : (
                        <XStack f={1} w="100%" jc="space-evenly" ai="center">
                        <PieChart width={300} height={300}>
                            <Pie
                            data={sentimentStats}
                            dataKey="count"
                            nameKey="sentiment"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={60}
                            style={{ outline: 'none' }}
                            >
                            {sentimentStats.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>

                        <YStack gap="$3" marginRight={30}>
                            {sentimentStats.map((entry, index) => (
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
                                {entry.sentiment}
                                </Text>
                                <Text fontSize={16} fontWeight="400" color="white">
                                {entry.count}
                                </Text>
                            </XStack>
                            ))}
                        </YStack>
                        </XStack>
                    )}

                    <XStack justifyContent="center" width="100%" marginTop="$3">
                        <Text fontSize={20} fontWeight="400" color={lightColors.gray10}>
                        Sentiment Overview
                        </Text>
                    </XStack>
                    </YStack>
                </YStack>

                {/* RIGHT: Line Chart */}
                <YStack bg="white" borderRadius="$6" padding="$4" height={720} width={1165}>
                    <Text fontSize={20} fontWeight="500" marginBottom="$3">
                    Daily Average Rating
                    </Text>

                    {lineData.length === 0 ? (
                    <Text textAlign="center" color="$gray10">
                        No data for line chart
                    </Text>
                    ) : (
                    <ResponsiveContainer width="100%" height={650}>
                        <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[1, 5]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avgRating" stroke="#4da6ff" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                    )}
                </YStack>
            </XStack>

            <XStack paddingTop={50} paddingLeft={100} paddingRight={100} jc={"space-between"}>
                <Text fontSize={32} fontWeight="bold">Records</Text>
                <XStack>
                <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <AlertDialog.Trigger asChild>
                    <Button
                    size="$3"
                    circular
                    icon={<Ionicons name="trash-outline" color="white" size={20} />}
                    backgroundColor="red"
                    onPress={() => setOpenDeleteDialog(true)}
                    disabled={selectedReviews.size === 0}
                    />
                </AlertDialog.Trigger>

                <AlertDialog.Portal>
                    <AlertDialog.Overlay />
                    <AlertDialog.Content bordered elevate>
                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the selected review(s)? This action cannot be undone.
                    </AlertDialogDescription>

                    <XStack justifyContent="flex-end" gap="$3" mt="$4">
                        <AlertDialogCancel asChild>
                        <Button theme="active" backgroundColor="$gray6" color="black">
                            Cancel
                        </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                        <Button theme="active" backgroundColor="red" color="white" onPress={deleteSelectedReviews}>
                            Confirm
                        </Button>
                        </AlertDialogAction>
                    </XStack>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
                </AlertDialog>
                    <Text>{selectedReviews.size}</Text>
                </XStack>
                <Button backgroundColor={"#519CFF"} color={"white"} onPress={exportReviewCSV}>Export CSV</Button>
            </XStack>

            <YStack bg="white" w={1800} borderRadius="$3" marginHorizontal={50} marginBottom={50}>
                <XStack paddingVertical="$3" ai="center" paddingLeft={50}>
                    <YStack width={50}>
                        <input
                        type="checkbox"
                        checked={selectedReviews.size === reviewData.length}
                        onChange={() => {
                            if (selectedReviews.size === reviewData.length) {
                            setSelectedReviews(new Set());
                            } else {
                            setSelectedReviews(new Set(reviewData.map(r => r[0])));
                            }
                        }}
                        />
                    </YStack>
                    <YStack flex={1}><Text fontWeight="bold">Review ID</Text></YStack>
                    <YStack flex={1}><Text fontWeight="bold">Reviewer ID</Text></YStack>
                    <YStack flex={1}><Text fontWeight="bold">Reviewee ID</Text></YStack>
                    <YStack flex={1}><Text fontWeight="bold">Rating</Text></YStack>
                    <YStack flex={3}><Text fontWeight="bold">Review</Text></YStack>
                    <YStack flex={1}><Text fontWeight="bold">Review Date</Text></YStack>
                </XStack>

                <Separator/>

                {reviewData.length === 0 ? (
                    <Text flex={1} textAlign="center" padding="$3" color="$gray10">
                    No records found!
                    </Text>
                ) : (
                    reviewData.map((item, i) => (
                    <YStack key={i}>
                        <XStack paddingVertical="$3" paddingLeft={50} alignItems="center">
                        {/* Checkbox */}
                        <YStack width={50}>
                            <input
                            type="checkbox"
                            checked={selectedReviews.has(item[0])}
                            onChange={() => toggleReviewSelection(item[0])}
                            />
                        </YStack>
                        <YStack flex={1}><Text fontSize={14}>{item[0]}</Text></YStack>
                        <YStack flex={1}><Text fontSize={14}>{item[1]}</Text></YStack>
                        <YStack flex={1}><Text fontSize={14}>{item[2]}</Text></YStack>
                        <YStack flex={1}><Text fontSize={14}>{item[3]}</Text></YStack>
                        <YStack flex={3}><Text fontSize={14}>{item[4]}</Text></YStack>
                        <YStack flex={1}><Text fontSize={14}>{item[5]}</Text></YStack>
                        </XStack>
                        <Separator />
                    </YStack>
                    ))
                )}         

            </YStack>

            <YStack bg="white" w={1800} borderRadius="$3" marginHorizontal={50} marginBottom={50}>
            <Text fontSize={20} fontWeight="400" marginBottom={10}>Rating-Sentiment Mismatches</Text>
            {mismatches.length > 0 ? (
                <YStack>
                <XStack paddingVertical={5} borderBottomWidth={1} borderColor="$gray6">
                    <Text width={100} fontWeight="bold">Review ID</Text>
                    <Text width={60} fontWeight="bold">Rating</Text>
                    <Text width={100} fontWeight="bold">Sentiment</Text>
                    <Text flex={1} fontWeight="bold">Review</Text>
                </XStack>
                {mismatches.map((item, index) => (
                    <XStack key={index} paddingVertical={5} borderBottomWidth={1} borderColor="$gray4">
                    <Text width={100}>{item.review_id}</Text>
                    <Text width={60}>{item.rating}</Text>
                    <Text width={100}>{item.sentiment}</Text>
                    <Text flex={1}>{item.review}</Text>
                    </XStack>
                ))}
                </YStack>
            ) : (
                <Text color="$gray10">No mismatches found</Text>
            )}
            </YStack>

        </YStack>
    </>
    );
}

