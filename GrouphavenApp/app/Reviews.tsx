import { StyleSheet, View, ScrollView } from 'react-native';
import { Provider as PaperProvider, Text, IconButton, List, Icon } from 'react-native-paper';
import React from 'react';
import { router, useFocusEffect } from 'expo-router';
import { getReviews, getUserProfile } from '../utils/Account';

export default function Reviews() {
    const [user, setUser] = React.useState<any>(null);
    const [reviews, setReviews] = React.useState<any[]>([]);
    const [reviewCount, setReviewCount] = React.useState<number>(0);

    useFocusEffect(
        React.useCallback(() => {
            const fetchUser = async () => {
                const userData = await getUserProfile();
                if (userData) {
                    setUser(userData);
                }
            };
            fetchUser();
        }, [])
    );

    React.useEffect(() => {
        async function fetchReviews() {
            const data = await getReviews();
            if (data) {
                setReviews(data.reviews);
                setReviewCount(data.count);
            }
        }

        fetchReviews();
    }, []);

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }

    return (
        <PaperProvider>
            <View style={styles.container}>
                <View style={styles.header}>
                    <IconButton icon="arrow-left" iconColor="#32353b" size={25} onPress={() => router.back()}></IconButton>
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>Reviews</Text>
                    </View>
                </View>

                <ScrollView style={styles.scrollContainer}>
                    <Text style={styles.infoText}>Overall Rating</Text>
                    <Text style={styles.ratingHeader}>{user?.avg_rating != null ? user.avg_rating.toFixed(2) : ''}</Text>

                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((i) => {
                            if (user?.avg_rating >= i) {
                                return <Icon key={i} source="star" size={50} color="orange" />;
                            } else if (user?.avg_rating >= i - 0.5) {
                                return <Icon key={i} source="star-half-full" size={50} color="orange" />;
                            } else {
                                return <Icon key={i} source="star-outline" size={50} color="orange" />;
                            }
                        })}
                    </View>

                    <Text style={[styles.infoText, { paddingBottom: '10%' }]}>based on {reviewCount} reviews</Text>


                    {reviews.map((review) => (
                        <View key={review.review_id} style={styles.reviewContainer}>

                            <Text style={styles.rating}>
                                {review.users?.name
                                    ? review.users.name[0] + '*'.repeat(review.users.name.length - 1)
                                    : ''}
                            </Text>

                            <View style={styles.reviewHori}>
                                <View style={styles.reviewHori}>
                                    <Text style={styles.rating}>Rating: {review.rating}</Text>
                                    <Icon
                                        source="star"
                                        color="orange"
                                        size={20}
                                    />
                                </View>

                                <Text style={styles.date}>{formatDate(review.review_date)}</Text>
                            </View>

                            <Text style={styles.reviewText}>{review.review}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "white",
        paddingTop: "5%",
    },
    header: {
        height: "5%",
        flexDirection: "row",
        alignItems: "center",
    },
    headerText: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#32353b',
        textAlign: "center",
    },
    textContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContainer: {
        flex: 1,
        padding: '5%',
    },
    infoText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 18,
        color: 'gray',
        textAlign: 'center',
    },
    ratingHeader: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 72,
        color: '#32353b',
        textAlign: 'center',
    },
    stars: {
        flexDirection: 'row',
        justifyContent: 'center',
    },









    reviewContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        padding: '5%',
        marginBottom: 10,
        borderRadius: 8,
    },
    reviewHori: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rating: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: '#32353b',
    },
    reviewText: {
        marginVertical: 5,
    },
    date: {
        color: 'gray',
        fontSize: 12,
    },
});
