import { StyleSheet, ScrollView, ImageBackground, View, Dimensions } from 'react-native';
import { Provider as PaperProvider, Text, Button, TextInput, IconButton } from 'react-native-paper';
import React from 'react';
import { router } from 'expo-router';

export default function Account() {
    return (
        <PaperProvider>
            <ScrollView style={styles.background}>
                <IconButton icon="menu" onPress={() => router.push(`../../Settings`)}></IconButton>
            </ScrollView>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: "white",
    },
    container: {
        flex: 1,
        padding: '5%',
        flexDirection: 'column',
    },
});
