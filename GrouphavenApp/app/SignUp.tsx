import { StyleSheet, ImageBackground, View, Image } from 'react-native';
import { Provider as PaperProvider, Text, Button } from 'react-native-paper';
import React from 'react';

export default function LandingScreen() {
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
                        <Text>Welcome to Grouphaven.</Text>
                    </View>
                    <View style={styles.inputContainer}>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button style={styles.button} labelStyle={styles.buttonText} mode="contained" onPress={() => console.log('Pressed')} rippleColor="rgba(0, 0, 0, 0.2)">
                            SIGN UP
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
        alignItems: 'center',
        padding: '5%',
    },
    headerContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerText: {
        fontFamily: 'Inter-ExtraBold',
        fontSize: 20,
        color: '#32353b',
    },
    inputContainer: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
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
        paddingVertical: '2%',
    },
});
