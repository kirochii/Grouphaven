import { StyleSheet, View, Image, Modal } from 'react-native';
import { Provider as PaperProvider, Text, IconButton, Button, ActivityIndicator, Icon } from 'react-native-paper';
import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { uploadVerificationImage, checkVerification } from '../utils/Account';

export default function VerifyAccount() {
    const [loading, setLoading] = React.useState(true);
    const [verificationStatus, setVerificationStatus] = React.useState<string | null>(null);
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
    const [Image64, setImage64] = React.useState<string | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isModalVisible, setIsModalVisible] = React.useState(false);

    React.useEffect(() => {
        fetchVerificationStatus();
    }, []);

    const fetchVerificationStatus = async () => {
        const status = await checkVerification();
        setVerificationStatus(status);
        setLoading(false);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            aspect: [1, 1],
            quality: 1,
            base64: true,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setImage64(result.assets[0].base64 || "");
            setIsModalVisible(true);
        }
    };

    const handleUpload = async () => {
        if (selectedImage && Image64) {
            setIsUploading(true);
            const success = await uploadVerificationImage(selectedImage, Image64);
            if (success) {
                fetchVerificationStatus();
            }
        }

        setIsUploading(false);
        setIsModalVisible(false);
        setSelectedImage(null);
        setImage64(null);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedImage(null);
        setImage64(null);
    };

    return (
        <PaperProvider>
            <View style={styles.container}>
                <View style={styles.header}>
                    <IconButton icon="arrow-left" iconColor="#32353b" size={25} onPress={() => router.back()}></IconButton>
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>Verify Account</Text>
                    </View>
                </View>

                {loading === true ? (
                    <View style={styles.loadContainer}>
                        <ActivityIndicator animating={true} size="large" color='#519CFF' />
                    </View>
                ) : verificationStatus === 'pending' ? (
                    <View style={styles.pendingContainer}>
                        <ActivityIndicator animating={true} size="large" color='#519CFF' />
                        <Text style={styles.infoText}>Your verification is pending. Please wait for moderator approval.</Text>
                    </View>
                ) : verificationStatus === 'rejected' ? (
                    <>
                        {!isModalVisible && (
                            <View style={styles.rejectedContainer}>
                                <Image
                                    source={require('../assets/images/verifyPose.png')}
                                    style={styles.image}
                                />
                                <Text style={styles.rejectedText}>
                                    Your verification was rejected. Please upload another selfie with this pose and our moderators will verify it.
                                </Text>
                            </View>
                        )}

                        <View style={styles.buttonContainer}>
                            <Button style={[styles.button]} labelStyle={styles.buttonText} mode="contained" onPress={() => {
                                pickImage();
                            }}
                                rippleColor="transparent"
                            >
                                UPLOAD PHOTO
                            </Button>
                        </View>
                    </>
                ) : verificationStatus === 'approved' ? (
                    <View style={styles.approvedContainer}>
                        <Icon size={100} source={"shield-check"} color='#519CFF'></Icon>
                        <Text style={styles.approvedText}>Your account has been verified!</Text>
                    </View>
                ) : (
                    <>
                        {!isModalVisible && (
                            <View style={styles.bodyContainer}>
                                <Image
                                    source={require('../assets/images/verifyPose.png')}
                                    style={styles.image}
                                />
                                <Text style={styles.infoText}>
                                    Upload a selfie with this pose and our moderators will verify it.
                                </Text>
                            </View>
                        )}
                        <View style={styles.buttonContainer}>
                            <Button style={[styles.button]} labelStyle={styles.buttonText} mode="contained" onPress={() => {
                                pickImage();
                            }}
                                rippleColor="transparent"
                            >
                                UPLOAD PHOTO
                            </Button>
                        </View>
                    </>
                )}

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {selectedImage && (
                                <Image
                                    source={{ uri: selectedImage }}
                                    style={styles.modalImage}
                                    resizeMode="cover"
                                />
                            )}
                            <View style={styles.modalButtons}>
                                <Button mode="contained" rippleColor="transparent" labelStyle={isUploading ? styles.buttonTextCancelDisabled : styles.buttonTextCancel} onPress={handleCancel} style={styles.buttonModalCancel}>
                                    Cancel
                                </Button>
                                <Button mode="contained" rippleColor="transparent" labelStyle={styles.buttonText} onPress={handleUpload} style={isUploading ? styles.buttonDisabled : styles.buttonModal}>
                                    Upload
                                </Button>
                            </View>
                        </View>
                    </View>
                </Modal>

            </View>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "white",
        paddingTop: "5%",
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
    loadContainer: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
    },
    pendingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectedContainer: {
        flex: 1,
        alignItems: 'center',
    },
    approvedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectedText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#FF0000',
        textAlign: 'center',
        width: '80%',
        marginTop: '5%',
    },
    approvedText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 24,
        color: '#519CFF',
        textAlign: 'center',
        width: '80%',
        marginTop: '5%',
    },
    bodyContainer: {
        flex: 1,
        padding: '5%',
        alignItems: 'center',
    },
    image: {
        borderRadius: 12,
        width: 300,
        height: 300,
        marginTop: '10%',
    },
    infoText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#32353b',
        textAlign: 'center',
        width: '80%',
        marginTop: '5%',
    },
    buttonContainer: {
        position: "absolute",
        bottom: '5%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#519CFF',
        borderRadius: 10,
        width: '90%',
        paddingVertical: '1%',
    },
    buttonText: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: "white",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalImage: {
        width: 350,
        height: 350,
        borderRadius: 10,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 32,
    },
    buttonModal: {
        backgroundColor: '#519CFF',
        borderRadius: 20,
        width: '40%',
        paddingVertical: '1%',
    },
    buttonModalCancel: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        width: '40%',
        paddingVertical: '1%',
    },
    buttonTextCancel: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: '#519CFF',
    },
    buttonCancelDisabled: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        borderRadius: 20,
        width: '40%',
        paddingVertical: '1%',
    },
    buttonDisabled: {
        backgroundColor: '#A9CEFF',
        borderRadius: 20,
        width: '40%',
        paddingVertical: '1%',
    },
    buttonTextCancelDisabled: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: '#A9CEFF',
    }
});
