import { StyleSheet, ImageBackground, View, Dimensions } from 'react-native';
import { Provider as PaperProvider, Text, Button, TextInput } from 'react-native-paper';
import React from 'react';
import { Link } from 'expo-router';

const { height } = Dimensions.get('window');

export default function SignUp() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

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
                            left={<TextInput.Icon icon="email" />}
                        />

                        <TextInput
                            placeholder="Password"
                            mode='outlined'
                            secureTextEntry
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                            value={password}
                            onChangeText={(value) => setPassword(value)}
                            left={<TextInput.Icon icon="key" />}
                        />

                        <TextInput
                            placeholder="Confirm Password"
                            mode='outlined'
                            secureTextEntry
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                            value={confirmPassword}
                            onChangeText={(value) => setConfirmPassword(value)}
                            left={<TextInput.Icon icon="key" />}
                        />

                        <Text style={styles.termText}>
                            By continuing, you agree to our{' '}
                            <Text style={styles.link}>Terms of Service</Text> and acknowledge that you have read our{' '}
                            <Text style={styles.link}>Privacy Policy</Text>.
                        </Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button style={styles.button} labelStyle={styles.buttonText} mode="contained" onPress={() => console.log('Pressed')} rippleColor="rgba(0, 0, 0, 0.2)">
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
});
