import { StyleSheet, ImageBackground, View, Dimensions } from 'react-native';
import { Provider as PaperProvider, Text, Button, TextInput } from 'react-native-paper';
import React from 'react';
import { Link, router } from 'expo-router';
import { signInWithEmail, userExist } from '../utils/AccountVerification';

const { height } = Dimensions.get('window');

export default function SignIn() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [userExistError, setUserExistError] = React.useState('');

    const handleSignIn = async () => {
        const response = await signInWithEmail(email, password);

        if (!response.success) {
            if (response.error?.message === 'Email not confirmed') {
                router.replace(`../VerifyEmail?email=${email}`);
            } else {
                setUserExistError('⚠︎ Incorrect email or password');
            }
        } else {
            if (response.userId) {
                const exist = await userExist(response.userId);

                if (exist) {
                    router.dismissAll();
                    router.replace(`../(tabs)/Match`);
                } else {
                    router.dismissAll();
                    router.replace(`../CompleteProfile`);
                }
            }
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
                        <Text style={styles.headerText}>Sign In</Text>
                        <Text style={styles.catchphraseText}>Welcome back! We missed you.</Text>
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
                            activeOutlineColor='#32353b'
                        />

                        <TextInput
                            placeholder="Password"
                            mode='outlined'
                            secureTextEntry
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                            value={password}
                            onChangeText={(value) => setPassword(value)}
                            left={<TextInput.Icon icon="key" disabled={true} />}
                            activeOutlineColor='#32353b'
                        />
                        <Link style={styles.forgotText} href="/ForgotPassword">Forgot password?</Link>
                    </View>

                    <View style={styles.errorContainer}>
                        {userExistError ? <Text style={styles.errorText}>{userExistError}</Text> : null}
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button style={styles.button} labelStyle={styles.buttonText} mode="contained" onPress={() => handleSignIn()} rippleColor="rgba(0, 0, 0, 0.2)">
                            SIGN IN
                        </Button>
                        <Text style={styles.signupText}>Don't have an account? <Link style={styles.link} href="/SignUp">Sign up instead.</Link></Text>
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
        flex: 3,
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
        flex: 3,
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
    link: {
        fontFamily: 'Inter-SemiBold',
        textDecorationLine: 'underline',
        color: 'white',
    },
    signupText: {
        paddingTop: '5%',
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
    forgotText: {
        fontFamily: 'Inter-SemiBold',
        color: 'white',
        fontSize: 16,
        textAlign: 'right',
    },
    errorContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: 'white',
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        backgroundColor: '#D32F2F',
        borderRadius: 15,
        padding: '3%',
    },
});
