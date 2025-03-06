import { StyleSheet, View, ScrollView } from 'react-native';
import { Provider as PaperProvider, Text, IconButton, HelperText, TextInput, Button, Portal, Dialog, } from 'react-native-paper';
import React from 'react';
import { router } from 'expo-router';
import { validateEmail, changeCurrentEmail } from '../utils/AccountVerification';

export default function ChangeEmail() {
    const [email, setEmail] = React.useState('');

    const [visible, setVisible] = React.useState(false);
    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    const [errorVisible, setErrorVisible] = React.useState(false);
    const showErrorDialog = () => setErrorVisible(true);
    const hideErrorDialog = () => setErrorVisible(false);
    const [errorText, setErrorText] = React.useState<string>('');

    const [isValid, setIsValid] = React.useState(false);

    React.useEffect(() => {
        setIsValid(validateEmail(email));
    }, [email]);

    const handleChangeEmail = async () => {
        const response = await changeCurrentEmail(email);

        if (!response.success) {
            setErrorText(response.message || "Unknown error occurred.");
            showErrorDialog();
        } else {
            showDialog();
        }
    };

    return (
        <PaperProvider>
            <View style={styles.container}>
                <View style={styles.header}>
                    <IconButton icon="arrow-left" iconColor="#32353b" size={25} onPress={() => router.back()}></IconButton>
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>Change Email</Text>
                    </View>
                </View>

                <ScrollView style={styles.scrollContainer}>
                    <Text style={styles.infoText}>Enter your new email address here. A confirmation link will be sent to your new email.</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            label="New Email"
                            mode='outlined'
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                            value={email}
                            onChangeText={(value) => setEmail(value)}
                            activeOutlineColor='#32353b'
                        />
                        <HelperText style={styles.errorText} type="error" visible={!isValid && email.length > 0}>
                            Error: Invalid email format
                        </HelperText>
                    </View>
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <Button style={[styles.button, { backgroundColor: isValid ? '#519CFF' : '#A9CEFF' }]} labelStyle={styles.buttonText} mode="contained" onPress={() => {
                        if (isValid) {
                            handleChangeEmail();
                        }
                    }}
                        disabled={!isValid}
                        rippleColor="transparent"
                    >
                        REQUEST EMAIL
                    </Button>
                </View>

                <Portal>
                    <Dialog visible={errorVisible} onDismiss={hideErrorDialog} style={styles.dialogBox}>
                        <Dialog.Title style={[styles.dialogTitle, { color: "red" }]}>Error</Dialog.Title>
                        <Dialog.Content>
                            <Text style={styles.dialogText}>{errorText}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                style={[styles.confirmButton, { backgroundColor: 'red' }]}
                                rippleColor="transparent"
                                labelStyle={styles.confirmText}
                                onPress={() => {
                                    hideErrorDialog();
                                }}>OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialogBox}>
                        <Dialog.Title style={styles.dialogTitle}>Email Sent!</Dialog.Title>
                        <Dialog.Content>
                            <Text style={styles.dialogText}>A confirmation link has been sent to your new email.</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                style={styles.confirmButton}
                                rippleColor="transparent"
                                labelStyle={styles.confirmText}
                                onPress={() => {
                                    hideDialog();
                                    router.back();
                                }}>OK</Button>
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
    scrollContainer: {
        flex: 1,
        padding: '5%',
    },
    infoText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#32353b',
    },
    inputContainer: {
        marginTop: '10%',
    },
    input: {
        marginTop: '5%',
        backgroundColor: 'white',
        width: '100%',
        height: 50,
    },
    label: {
        fontSize: 16,
        color: 'red',
    },
    inputOutline: {
        borderColor: '#32353b',
        borderWidth: 2,
        borderRadius: 10,
    },
    errorText: {
        color: 'red',
        fontFamily: 'Inter-Medium',
        fontSize: 12,
    },
    buttonContainer: {
        position: "absolute",
        bottom: '5%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#A9CEFF',
        borderRadius: 10,
        width: '90%',
        paddingVertical: '1%',
    },
    buttonText: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: "white",
    },
    dialogBox: {
        borderRadius: 10,
        backgroundColor: 'white',
    },
    dialogTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#4CBB17',
        textAlign: 'center',
    },
    dialogText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#32353b',
        textAlign: 'center',
    },
    confirmText: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        color: 'white',
    },
    confirmButton: {
        marginTop: '5%',
        backgroundColor: '#4CBB17',
        borderRadius: 5,
        width: '40%'
    },
});
