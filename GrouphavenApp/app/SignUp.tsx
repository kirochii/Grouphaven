import { StyleSheet, ImageBackground, View, Dimensions } from 'react-native';
import { Provider as PaperProvider, Text, Button, TextInput } from 'react-native-paper';
import React from 'react';
import { Link, router } from 'expo-router';
import { signUpNewUser, validateEmail, validatePassword, validateConfirmPassword } from '../utils/AccountVerification';

const { height } = Dimensions.get('window');

export default function SignUp() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const [emailError, setEmailError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');
    const [confirmPasswordError, setConfirmPasswordError] = React.useState('');

    const validateInputs = () => {
        let isValid = true;

        // Validate Email
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            isValid = false;
        } else {
            setEmailError('');
        }

        // Validate Password
        if (!validatePassword(password)) {
            setPasswordError('Password must be between 8 and 15 characters, contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character');
            isValid = false;
        } else {
            setPasswordError('');
        }

        // Validate Confirm Password
        if (!validateConfirmPassword(password, confirmPassword)) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        } else {
            setConfirmPasswordError('');
        }

        return isValid;
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
                        <Text style={styles.headerText}>Sign Up</Text>
                        <Text style={styles.catchphraseText}>Haven is just a few steps away.</Text>
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
                            error={!!emailError}
                        />
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                        <TextInput
                            placeholder="Password"
                            mode='outlined'
                            secureTextEntry
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                            value={password}
                            onChangeText={(value) => setPassword(value)}
                            left={<TextInput.Icon icon="key" disabled={true} />}
                            error={!!passwordError}
                        />
                        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                        <TextInput
                            placeholder="Confirm Password"
                            mode='outlined'
                            secureTextEntry
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                            value={confirmPassword}
                            onChangeText={(value) => setConfirmPassword(value)}
                            left={<TextInput.Icon icon="key" disabled={true} />}
                            error={!!confirmPasswordError}
                        />
                        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

                        <Text style={styles.termText}>
                            By continuing, you agree to our{' '}
                            <Text style={styles.link}>Terms of Service</Text> and acknowledge that you have read our{' '}
                            <Text style={styles.link}>Privacy Policy</Text>.
                        </Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button style={styles.button} labelStyle={styles.buttonText} mode="contained" onPress={() => {
                            if (validateInputs()) {
                                signUpNewUser(email, password);
                                router.replace(`../VerifyEmail?email=${email}`);
                            }
                        }} rippleColor="rgba(0, 0, 0, 0.2)">
                            SIGN UP
                        </Button>
                        <Text style={styles.loginText}>Already have an account? <Link style={styles.link} href="/SignIn">Sign in instead.</Link></Text>
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
        fontSize: 60,
        color: 'white',
    },
    catchphraseText: {
        fontFamily: 'Inter-Medium',
        fontSize: 20,
        color: 'white',
    },
    inputContainer: {
        flexShrink: 1,
        alignItems: 'center',
        gap: '5%',
        justifyContent: 'center',
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
    termText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
    },
    link: {
        fontFamily: 'Inter-SemiBold',
        textDecorationLine: 'underline',
        color: 'white',
    },
    loginText: {
        paddingTop: '5%',
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontFamily: 'Inter-Regular',
        fontSize: 12,
    },
});
