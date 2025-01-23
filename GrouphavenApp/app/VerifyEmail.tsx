import { StyleSheet, ImageBackground, View } from 'react-native';
import { Provider as PaperProvider, Text, Button, ActivityIndicator } from 'react-native-paper';
import React, { useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { maskEmail, resendConfirmationEmail, checkEmailConfirmation } from '../utils/AccountVerification';

export default function VerifyEmail() {
    const { email } = useLocalSearchParams();
    const maskedEmail = maskEmail(email as string);

    const [countdown, setCountdown] = React.useState(10);
    const [isDisabled, setIsDisabled] = React.useState(true);
    const [isRedirectDisabled, setIsRedirectDisabled] = React.useState(false);

    const [isConfirmed, setIsConfirmed] = React.useState<boolean | null>(null);

    useEffect(() => {
        // Function to call checkEmailConfirmation and store the result
        const checkAndStoreConfirmation = async () => {
            const confirmationStatus = await checkEmailConfirmation(email as string);
            setIsConfirmed(confirmationStatus);
        };

        // Call the function immediately on load
        checkAndStoreConfirmation();

        const intervalId = setInterval(() => {
            // Check if email is confirmed
            if (isConfirmed === true) {
                clearInterval(intervalId); // Stop checking if confirmed

            } else {
                checkAndStoreConfirmation();
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isConfirmed, email]);

    useEffect(() => {
        if (isConfirmed === true) {
            // Disable the button for 3 seconds
            setIsRedirectDisabled(true);
            const timer = setTimeout(() => {
                router.replace("/SignIn");
            }, 3000); // 2000ms = 2 seconds

            return () => clearTimeout(timer); // Cleanup timer on component unmount or when `isConfirmed` changes
        }
    }, [isConfirmed]);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;

        if (isDisabled && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000); // Decrease countdown every second
        } else if (countdown === 0) {
            setIsDisabled(false); // Enable the button once countdown reaches 0
        }

        return () => clearInterval(timer); // Clean up interval on unmount or when countdown ends
    }, [isDisabled, countdown]);

    const handleResend = () => {
        setIsDisabled(true); // Disable the button when pressed
        setCountdown(10); // Reset countdown to 10 seconds
        resendConfirmationEmail(email as string);
    };

    return (
        <PaperProvider>
            <ImageBackground
                source={require('../assets/images/background.png')}
                resizeMode="cover"
                style={styles.background}
            >
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>Verify Email</Text>
                        <Text style={styles.catchphraseText}>A confirmation link has been sent to email {maskedEmail}</Text>
                    </View>

                    <View style={styles.statusContainer}>
                        {(isConfirmed === null || isConfirmed === false) ? (
                            <Text style={styles.catchphraseText}>Waiting for verification <ActivityIndicator animating={true} size={18} color="white" /></Text>
                        ) : isConfirmed === true ? (
                            <Text style={styles.catchphraseText}>Email verified ✓{'\nRedirecting...'}</Text>
                        ) : null}
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button style={[styles.buttonOutline, isDisabled || isRedirectDisabled ? styles.disabledButton : null]} labelStyle={[styles.buttonOutlineText, isDisabled || isRedirectDisabled ? styles.disabledButton : null]} mode="outlined" onPress={handleResend}
                            disabled={isDisabled || isRedirectDisabled} rippleColor="rgba(0, 0, 0, 0.2)">
                            {isDisabled ? `RESEND (${countdown}s)` : 'RESEND'}
                        </Button>
                        <Button disabled={isRedirectDisabled} style={[styles.button, isRedirectDisabled ? styles.disabledContainedButton : null]} labelStyle={[styles.buttonText, isRedirectDisabled ? styles.disabledContainedButtonText : null]} mode="contained" onPress={() => router.navigate("/SignIn")} rippleColor="rgba(0, 0, 0, 0.2)">
                            PROCEED WITH SIGN IN
                        </Button>
                    </View>
                </View>
            </ImageBackground>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        padding: '5%',
        flexDirection: 'column',
    },
    headerContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    headerText: {
        fontFamily: 'Inter-Bold',
        fontSize: 48,
        color: 'white',
    },
    catchphraseText: {
        fontFamily: 'Inter-Medium',
        fontSize: 18,
        color: 'white',
    },
    statusContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    buttonContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5%',
    },
    button: {
        backgroundColor: 'white',
        borderRadius: 25,
        width: '90%',
    },
    buttonText: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#32353b',
        paddingVertical: '1%',
    },
    buttonOutline: {
        borderColor: 'white',
        borderWidth: 3,
        borderRadius: 25,
        width: '90%',
    },
    buttonOutlineText: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: 'white',
        paddingVertical: '1%',
    },
    disabledButton: {
        borderColor: 'rgba(255, 255, 255, 0.5)',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    disabledContainedButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    disabledContainedButtonText: {
        color: 'rgba(0, 0, 0, 0.5)',
    },
});
