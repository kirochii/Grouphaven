import { StyleSheet, View, } from 'react-native';
import { Provider as PaperProvider, Text, IconButton, List, Divider, } from 'react-native-paper';
import React from 'react';
import { router } from 'expo-router';
import { signOut } from '../utils/AccountVerification';

export default function Settings() {
    return (
        <PaperProvider>
            <View style={styles.container}>
                <View style={styles.header}>
                    <IconButton icon="arrow-left" iconColor="#32353b" size={25} onPress={() => router.back()}></IconButton>
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>Settings</Text>
                    </View>
                </View>

                <List.Section style={styles.list}>
                    <List.Item
                        titleStyle={styles.listItem}
                        title="Edit Profile"
                        left={() => <List.Icon icon="pencil-outline" />}
                        onPress={() => { }}
                    />
                    <List.Item
                        titleStyle={styles.listItem}
                        title="Verify Account"
                        left={() => <List.Icon icon="security" />}
                        onPress={() => { }}
                    />
                    <Divider bold={true} style={styles.divider} />
                    <List.Item
                        titleStyle={styles.listItem}
                        title="Change Email"
                        left={() => <List.Icon icon="email-outline" />}
                        onPress={() => { }}
                    />
                    <List.Item
                        titleStyle={styles.listItem}
                        title="Change Password"
                        left={() => <List.Icon icon="lock-outline" />}
                        onPress={() => { }}
                    />
                    <List.Item
                        titleStyle={styles.listItem}
                        title="Log Out"
                        left={() => <List.Icon icon="logout" />}
                        onPress={async () => {
                            await signOut();
                            router.replace("/");
                        }}
                    />
                    <Divider bold={true} style={styles.divider} />
                    <List.Item
                        titleStyle={[styles.listItem, { color: 'red' }]}
                        title="Delete Account"
                        left={() => <List.Icon icon="delete-outline" color='red' />}
                        onPress={() => { }}
                    />
                </List.Section>
            </View>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "white",
    },
    header: {
        height: "5%",
        flexDirection: "row",
        alignItems: "center",
    },
    headerText: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#32353b',
        textAlign: "center",
    },
    textContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    list: {
        marginTop: "5%",
        marginHorizontal: "5%",
    },
    listItem: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        color: '#32353b',
    },
    divider: {
        marginVertical: "2.5%",
    }
});
