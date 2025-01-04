import { StyleSheet, ImageBackground, View, Dimensions } from 'react-native';
import { Provider as PaperProvider, Text, Button, TextInput } from 'react-native-paper';
import React from 'react';
import { Link } from 'expo-router';

const { height } = Dimensions.get('window');

export default function ForgotPassword() {
    const [email, setEmail] = React.useState('');

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
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button style={styles.button} labelStyle={styles.buttonText} mode="contained" onPress={() => console.log('Pressed')} rippleColor="rgba(0, 0, 0, 0.2)">
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
    }
});
