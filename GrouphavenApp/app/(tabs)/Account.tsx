import { StyleSheet, ImageBackground, View, Dimensions } from 'react-native';
import { Provider as PaperProvider, Text, Button, TextInput } from 'react-native-paper';
import React from 'react';
import { Link } from 'expo-router';

const { height } = Dimensions.get('window');

export default function Account() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    return (
        <PaperProvider>
            <ImageBackground
                resizeMode="cover"
                style={styles.background}
            >
                <Text>Account</Text>
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
});
