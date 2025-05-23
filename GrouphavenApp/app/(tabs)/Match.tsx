import { StyleSheet, View, } from 'react-native';
import { Provider as PaperProvider, Text, Button, ActivityIndicator } from 'react-native-paper';
import React from 'react';
import { router } from 'expo-router';
import { checkMatching, leaveQueue } from '../../utils/Account';
import { supabase } from '../../utils/supabase';

export default function Match() {
    const [loading, setLoading] = React.useState(true);
    const [isMatching, setIsMatching] = React.useState(false);
    const channelRef = React.useRef<any>(null);

    const fetchMatchingStatus = async () => {
        const { result, channel } = await checkMatching(() => {
            fetchMatchingStatus();
        });

        if (channel) {
            channelRef.current = channel;
        }

        setIsMatching(result);
        setLoading(false);
    };

    React.useEffect(() => {
        fetchMatchingStatus();

        // Cleanup function to unsubscribe when component unmounts
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, []);

    return (
        <PaperProvider>
            <View style={styles.background}>
                <View style={styles.container}>
                    {loading === true ? (
                        <ActivityIndicator animating={true} size="large" color='#519CFF' />
                    ) : isMatching === true ? (
                        <>
                            <ActivityIndicator animating={true} size={100} color='#519CFF' />
                            <Text style={styles.bodyTitle}>MATCHING USERS...</Text>
                            <Text style={styles.bodySubtitle}>This may take a while. Sit back, relax, and we'll do the rest.</Text>
                            <Button style={[styles.button]} labelStyle={styles.buttonText} mode="contained" onPress={() => {
                                leaveQueue();
                            }}
                                rippleColor="transparent"
                            >
                                CANCEL
                            </Button>
                        </>
                    ) : (
                        <>
                            <Text style={styles.bodyTitle}>FEELING LONELY?</Text>
                            <Text style={styles.bodySubtitle}>Start matching to connect with others today!</Text>
                            <Button style={[styles.button]} labelStyle={styles.buttonText} mode="contained" onPress={() => {
                                router.push(`../../MatchPreference`)
                            }}
                                rippleColor="transparent"
                            >
                                START
                            </Button>
                        </>
                    )}
                </View>

            </View>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#FFFFFF'
    },
    container: {
        flex: 1,
        padding: '5%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bodyTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 28,
        color: '#519CFF',
        textAlign: 'center',
        width: '80%',
        marginTop: '5%',
    },
    bodySubtitle: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#519CFF',
        textAlign: 'center',
        width: '90%',
        marginTop: '5%',
    },
    button: {
        backgroundColor: '#519CFF',
        borderRadius: 15,
        width: '50%',
        marginTop: '20%',
    },
    buttonText: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: "white",
    },
});
