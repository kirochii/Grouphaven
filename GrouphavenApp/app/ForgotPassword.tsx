import { StyleSheet, ImageBackground, View, Dimensions } from 'react-native';
import { Provider as PaperProvider, Text, Button, TextInput, } from 'react-native-paper';
import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { resetPassword, validateEmail, } from '../utils/AccountVerification';

const { height } = Dimensions.get('window');

export default function ForgotPassword() {
    const [email, setEmail] = React.useState('');

    const [countdown, setCountdown] = React.useState(10);
    const [isDisabled, setIsDisabled] = React.useState(false);
    const [bgColor, setBgColor] = React.useState('');
    const [error, setError] = React.useState(' ');

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

    const handleButtonClick = () => {
        setError('');

        if (!validateEmail(email)) {
            setError('⚠︎ Please enter a valid email');
            setBgColor("#D32F2F");
            return false;
        } else {
            setBgColor("transparent");
            setError('A password reset link has been sent to your email!');
            setIsDisabled(true);
            setCountdown(10);
            resetPassword(email);
        }
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
                        <Text style={styles.headerText}>RESET PASSWORD</Text>
                        <Text style={styles.catchphraseText}>A password reset link will be sent to your email.</Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Email"
                            mode='outlined'
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                            value={email}
                            onChangeText={(value) => setEmail(value)}
                            left={<TextInput.Icon icon="email" disabled={true} />}
                        />
                        <View style={styles.errorContainer}>
                            {error ? <Text style={[styles.errorText, { backgroundColor: bgColor }]}>{error}</Text> : null}
                        </View>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button style={[styles.buttonOutline, isDisabled ? styles.disabledButton : null]} labelStyle={[styles.buttonOutlineText, isDisabled ? styles.disabledButton : null]} mode="outlined" onPress={() => handleButtonClick()} rippleColor="rgba(0, 0, 0, 0.2)" disabled={isDisabled}>
                            {isDisabled ? `${countdown}s` : 'REQUEST EMAIL'}
                        </Button>
                        <Button style={styles.button} labelStyle={styles.buttonText} mode="contained" onPress={() => router.back()} rippleColor="rgba(0, 0, 0, 0.2)">
                            BACK
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
        fontSize: 36,
        color: 'white',
    },
    catchphraseText: {
        fontFamily: 'Inter-Medium',
        fontSize: 18,
        color: 'white',
    },
    inputContainer: {
        flexShrink: 1,
        gap: '5%',
        justifyContent: 'flex-start',
    },
    input: {
        backgroundColor: 'white',
        width: '100%',
        height: height * 0.05,
    },
    inputOutline: {
        borderColor: 'white',
        borderRadius: 25,
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
    errorContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '5%',
    },
    errorText: {
        color: 'white',
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        borderRadius: 15,
        padding: '3%',
    },
});
