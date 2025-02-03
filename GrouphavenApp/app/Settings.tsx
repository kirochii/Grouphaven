import { StyleSheet, View, ScrollView } from 'react-native';
import { Provider as PaperProvider, Text, IconButton, List, Divider, Dialog, Portal, Button } from 'react-native-paper';
import React from 'react';
import { router } from 'expo-router';
import { signOut } from '../utils/AccountVerification';

export default function Settings() {
    const [visible, setLogOutVisible] = React.useState(false);

    const showLogOutDialog = () => setLogOutVisible(true);
    const hideLogOutDialog = () => setLogOutVisible(false);

    return (
        <PaperProvider>
            <View style={styles.container}>
                <View style={styles.header}>
                    <IconButton icon="arrow-left" iconColor="#32353b" size={25} onPress={() => router.back()}></IconButton>
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>Settings</Text>
                    </View>
                </View>

                <ScrollView>
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
                            onPress={() => { router.push(`../ChangeEmail`) }}
                        />
                        <List.Item
                            titleStyle={styles.listItem}
                            title="Change Password"
                            left={() => <List.Icon icon="lock-outline" />}
                            onPress={() => { router.push(`../ChangePassword`) }}
                        />
                        <List.Item
                            titleStyle={styles.listItem}
                            title="Log Out"
                            left={() => <List.Icon icon="logout" />}
                            onPress={showLogOutDialog}
                        />
                        <Divider bold={true} style={styles.divider} />
                        <List.Item
                            titleStyle={[styles.listItem, { color: 'red' }]}
                            title="Delete Account"
                            left={() => <List.Icon icon="delete-outline" color='red' />}
                            onPress={() => { }}
                        />
                    </List.Section>
                </ScrollView>

                <Portal>
                    <Dialog visible={visible} onDismiss={hideLogOutDialog} style={styles.dialogBox}>
                        <Dialog.Title style={styles.dialogTitle}>Log out</Dialog.Title>
                        <Dialog.Content>
                            <Text style={styles.dialogText}>Are you sure you want to log out?</Text>
                        </Dialog.Content>
                        <Dialog.Actions style={styles.dialogButtonContainer}>
                            <Button labelStyle={styles.cancelText}
                                onPress={hideLogOutDialog}
                                rippleColor="transparent">Cancel</Button>
                            <Button
                                style={styles.confirmButton}
                                rippleColor="transparent"
                                labelStyle={styles.confirmText}
                                onPress={async () => {
                                    hideLogOutDialog();
                                    await signOut();
                                    router.replace("/");
                                }}>Log Out</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
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
    },
    dialogBox: {
        borderRadius: 10,
        backgroundColor: 'white',
    },
    dialogTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#32353b',
        textAlign: 'center',
    },
    dialogText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#32353b',
        textAlign: 'center',
    },
    dialogButtonContainer: {
        justifyContent: "space-between",
    },
    cancelText: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        color: '#949494',
    },
    confirmText: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        color: 'white',
    },
    confirmButton: {
        backgroundColor: 'red',
        borderRadius: 5,
        width: '40%'
    },
});
