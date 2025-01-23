import { StyleSheet, ImageBackground } from 'react-native';
import { Provider as PaperProvider, Text, } from 'react-native-paper';
import React from 'react';

export default function Groups() {
    return (
        <PaperProvider>
            <ImageBackground
                resizeMode="cover"
                style={styles.background}
            >
                <Text>Groups</Text>
            </ImageBackground>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
    },
});
