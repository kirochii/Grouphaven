import { StyleSheet, ScrollView, View, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { Provider as Portal, Dialog, PaperProvider, Text, IconButton, TextInput, Avatar, Button, ActivityIndicator, Icon } from 'react-native-paper';
import React from 'react';
import { router } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';
import { getUserProfile, updateAvatar, uploadAvatar, updateTagline, updateBio, updateCity, uploadImage, updateImage } from '../utils/Account';
import { supabase } from '@/utils/supabase';

const { width, height } = Dimensions.get("window");

export default function EditProfile() {
    const [returnVisible, setReturnVisible] = React.useState(false);
    const showReturnDialog = () => setReturnVisible(true);
    const hideReturnDialog = () => setReturnVisible(false);

    const CITIES = [
        { label: 'Kuala Lumpur', value: 'kuala_lumpur' },
        { label: 'Seberang Jaya', value: 'seberang_jaya' },
        { label: 'Klang', value: 'klang' },
        { label: 'Ipoh', value: 'ipoh' },
        { label: 'George Town', value: 'george_town' },
        { label: 'Petaling Jaya', value: 'petaling_jaya' },
        { label: 'Kuantan', value: 'kuantan' },
        { label: 'Shah Alam', value: 'shah_alam' },
        { label: 'Sungai Petani', value: 'sungai_petani' },
        { label: 'Johor Bahru', value: 'johor_bahru' },
        { label: 'Kota Bharu', value: 'kota_bharu' },
        { label: 'Melaka', value: 'melaka' },
        { label: 'Kota Kinabalu', value: 'kota_kinabalu' },
        { label: 'Seremban', value: 'seremban' },
        { label: 'Sandakan', value: 'sandakan' },
        { label: 'Kuching', value: 'kuching' },
        { label: 'Kluang', value: 'kluang' },
        { label: 'Muar', value: 'muar' },
        { label: 'Pasir Gudang', value: 'pasir_gudang' },
        { label: 'Kuala Terengganu', value: 'kuala_terengganu' },
        { label: 'Sibu', value: 'sibu' },
        { label: 'Taiping', value: 'taiping' },
        { label: 'Kajang', value: 'kajang' },
        { label: 'Miri', value: 'miri' },
        { label: 'Teluk Intan', value: 'teluk_intan' },
        { label: 'Kulai', value: 'kulai' },
        { label: 'Alor Setar', value: 'alor_setar' },
        { label: 'Bukit Mertajam', value: 'bukit_mertajam' },
        { label: 'Lahad Datu', value: 'lahad_datu' },
        { label: 'Segamat', value: 'segamat' },
        { label: 'Tumpat', value: 'tumpat' },
        { label: 'Keningau', value: 'keningau' },
        { label: 'Batu Pahat', value: 'batu_pahat' },
        { label: 'Batu Gajah', value: 'batu_gajah' },
        { label: 'Tuaran', value: 'tuaran' },
        { label: 'Bayan Lepas', value: 'bayan_lepas' },
        { label: 'Port Dickson', value: 'port_dickson' },
        { label: 'Bintulu', value: 'bintulu' },
        { label: 'Tawau', value: 'tawau' },
        { label: 'Simanggang', value: 'simanggang' },
        { label: 'Labuan', value: 'labuan' },
        { label: 'Cukai', value: 'cukai' },
        { label: 'Butterworth', value: 'butterworth' },
        { label: 'Putrajaya', value: 'putrajaya' },
        { label: 'Taman Johor Jaya', value: 'taman_johor_jaya' },
        { label: 'Kangar', value: 'kangar' },
        { label: 'Others', value: 'others' },
    ];

    const [isChanged, setIsChanged] = React.useState(false);
    const [isAvatarChanged, setIsAvatarChanged] = React.useState(false);

    const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
    const [avatar64, setAvatar64] = React.useState<string | null>(null);

    const [avatar, setAvatar] = React.useState<string | null>(null);
    const [tagline, setTagline] = React.useState<string | null>(null);
    const [bio, setBio] = React.useState<string | null>(null);
    const [city, setCity] = React.useState<string | null>(null);
    const [isFocus, setIsFocus] = React.useState(false);

    const [images, setImages] = React.useState<{ uri: string | null; base64: string | null }[]>([
        { uri: null, base64: null },
        { uri: null, base64: null },
        { uri: null, base64: null },
        { uri: null, base64: null },
        { uri: null, base64: null },
        { uri: null, base64: null },
    ]);
    const [selectedImageIndex, setSelectedImageIndex] = React.useState<number | null>(null);

    const [avatarModalVisible, setAvatarModalVisible] = React.useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);

    React.useEffect(() => {
        const fetchUser = async () => {
            const userData = await getUserProfile();
            if (userData) {
                setTagline(userData.tagline);
                setImages([
                    { uri: userData.photo_1 || null, base64: null },
                    { uri: userData.photo_2 || null, base64: null },
                    { uri: userData.photo_3 || null, base64: null },
                    { uri: userData.photo_4 || null, base64: null },
                    { uri: userData.photo_5 || null, base64: null },
                    { uri: userData.photo_6 || null, base64: null },
                ]);
            }

            if (userData?.avatar_url) {
                setAvatar(userData.avatar_url);
            }

            if (userData?.tagline) {
                setTagline(userData.tagline);
            }

            if (userData?.bio) {
                setBio(userData.bio);
            }

            setCity(userData?.city);
        };
        fetchUser();
    }, []);

    React.useEffect(() => {
        if (selectedImageIndex !== null && !images[selectedImageIndex]?.uri) {
            pickProfileImage(); // Automatically trigger image picker
        }
    }, [selectedImageIndex]);

    const pickProfileImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
            base64: true,
        });

        setModalVisible(false);

        if (!result.canceled && selectedImageIndex !== null) {
            // Update only the selected image
            const updatedImages = images.map((image, index) => {
                if (index === selectedImageIndex) {
                    return {
                        uri: result.assets[0].uri,
                        base64: result.assets[0].base64 || null,
                    };
                }
                return image; // Leave other images unchanged
            });

            setImages(updatedImages);
            setIsChanged(true);
        }
    };

    const clearProfileImage = () => {
        if (selectedImageIndex !== null) {
            const updatedImages = images.map((image, index) => {
                if (index === selectedImageIndex) {
                    return { uri: null, base64: null }; // Clear only the selected image
                }
                return image; // Leave other images unchanged
            });

            setImages(updatedImages);
            setIsChanged(true);
            setModalVisible(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: true,
        });

        setAvatarModalVisible(false);

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
            setAvatar64(result.assets[0].base64 || "");
            setIsChanged(true);
            setIsAvatarChanged(true);
            setAvatar(result.assets[0].uri);
        }
    };

    const clearAvatar = async () => {
        setIsChanged(true);
        setAvatar(null);
        setAvatarModalVisible(false);
        setIsAvatarChanged(true);
    };

    const saveChanges = async () => {
        setIsUploading(true);

        if (isAvatarChanged) {
            if (avatarUri && avatar64) {
                const avatarUrl = await uploadAvatar(avatarUri, avatar64);
                if (avatarUrl) {
                    await updateAvatar(avatarUrl);
                }
            } else {
                await updateAvatar(null);
            }
        }

        let newImageUrls = [...images]; // Copy the existing images array

        for (let i = 0; i < newImageUrls.length; i++) {
            const currentImage = newImageUrls[i];

            // Only upload if the image has a base64 value (newly picked image)
            if (currentImage.base64) {
                const uploadedUrl = await uploadImage(currentImage.uri!, currentImage.base64);
                if (uploadedUrl) {
                    newImageUrls[i] = { uri: uploadedUrl, base64: null }; // Replace with uploaded URL
                }
            }
        }

        // Extract URIs to update user profile
        const imageUris = newImageUrls.map(img => img.uri ?? null);

        // Update only if there are changes
        const success = await updateImage(imageUris);

        if (success) {
            setImages(newImageUrls);
            setIsChanged(false);
            setIsUploading(false);
        }

        updateTagline(tagline || "");
        updateBio(bio || "");
        updateCity(city || "");

          // ✅ Stream: only sync avatar
        if (isAvatarChanged) {
            try {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !sessionData.session) throw sessionError;

            const accessToken = sessionData.session.access_token;
            const userId = sessionData.session.user.id;

            await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-stream-user`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                id: userId,
                image: avatarUri || null,
                }),
            });
            } catch (error) {
            console.error("Stream avatar sync failed:", error);
            }
        }

        setIsChanged(false);
        setIsAvatarChanged(false);

        router.dismiss(2);
    };

    return (
        <PaperProvider>
            <View style={styles.container}>
                <View style={styles.header}>
                    <IconButton icon="arrow-left" iconColor="#32353b" size={25} onPress={() => {
                        if (isChanged) {
                            showReturnDialog();
                        } else {
                            router.back();
                        }
                    }}></IconButton>
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>Edit Profile</Text>
                    </View>
                </View>
                <ScrollView>
                    <View style={styles.detailContainer}>

                        <View style={styles.avatarContainerBG}>
                            <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
                                {avatar ? (
                                    <Avatar.Image size={150} source={{ uri: String(avatar) }} style={styles.avatar} />
                                ) : (
                                    <Avatar.Icon size={150} icon="account" style={styles.avatar} />
                                )}
                            </TouchableOpacity>
                            <View style={styles.flexRow}>
                                <Icon
                                    source="pencil-outline"
                                    color={'#32353b'}
                                    size={24}
                                />
                                <Text style={styles.avatarCaption}>PROFILE PHOTO</Text>
                            </View>
                        </View>

                        <View style={styles.padding}>
                            <TextInput
                                label="Tagline"
                                value={tagline || ""}
                                style={styles.input}
                                mode='outlined'
                                activeOutlineColor='#519CFF'
                                maxLength={50}
                                onChangeText={tagline => (setTagline(tagline), setIsChanged(true))}
                            />
                            <Text style={styles.charCount}>
                                {tagline?.length}/{50}
                            </Text>

                            <TextInput
                                label="Bio"
                                value={bio || ""}
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                mode='outlined'
                                multiline={true}
                                numberOfLines={4}
                                activeOutlineColor='#519CFF'
                                maxLength={160}
                                onChangeText={bio => (setBio(bio), setIsChanged(true))}
                            />
                            <Text style={styles.charCount}>
                                {bio?.length}/{160}
                            </Text>

                            <Dropdown
                                style={[styles.dropdown, isFocus && { borderColor: '#519CFF' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                data={CITIES}
                                labelField="label"
                                valueField="value"
                                value={city}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                onChange={item => {
                                    setCity(item.value);
                                    setIsFocus(false);
                                    setIsChanged(true);
                                }}
                            />

                            <View style={styles.gridContainer}>
                                {images.map((image, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.gridItem}
                                        onPress={() => {
                                            setSelectedImageIndex(index);
                                            setModalVisible(true);
                                        }}
                                    >
                                        {image.uri ? ( // Accessing `image.uri`
                                            <Image source={{ uri: image.uri }} style={styles.image} resizeMode="cover" />
                                        ) : (
                                            <IconButton icon="plus" size={40} iconColor="#949494" />
                                        )}
                                    </TouchableOpacity>
                                ))}

                                <Modal visible={modalVisible} transparent={true} animationType="fade">
                                    <View style={styles.modalContainer}>
                                        <TouchableOpacity
                                            style={styles.modalBackground}
                                            onPress={() => setModalVisible(false)}
                                        >
                                            <View style={styles.contentContainer}>
                                                {selectedImageIndex !== null && images[selectedImageIndex]?.uri && (
                                                    <Image source={{ uri: images[selectedImageIndex].uri }} style={styles.modalImage} resizeMode="contain" />
                                                )}

                                                {selectedImageIndex !== null && images[selectedImageIndex]?.uri ? (
                                                    <View style={styles.buttonContainer}>
                                                        <Button style={styles.modalButton} labelStyle={styles.modalButtonText} mode="contained" onPress={pickProfileImage}>Change Image</Button>
                                                        <Button style={styles.modalButton} labelStyle={styles.modalButtonText} mode="contained" onPress={clearProfileImage}>Clear Image</Button>
                                                    </View>
                                                ) : null}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </Modal>
                            </View>

                            <Button style={[styles.button, !isChanged ? styles.disabledContainedButton : null]} labelStyle={styles.buttonText} mode="contained" onPress={saveChanges} disabled={!isChanged || isUploading} rippleColor="rgba(0, 0, 0, 0.2)">Save Changes</Button>
                        </View>
                    </View>
                </ScrollView>

                <Dialog visible={returnVisible} onDismiss={hideReturnDialog} style={styles.dialogBox}>
                    <Dialog.Title style={styles.dialogTitle}>Confirmation</Dialog.Title>
                    <Dialog.Content>
                        <Text style={styles.dialogText}>You have unsaved changes. Discard changes?</Text>
                    </Dialog.Content>
                    <Dialog.Actions style={styles.dialogButtonContainer}>
                        <Button labelStyle={styles.cancelText}
                            onPress={hideReturnDialog}
                            rippleColor="transparent">Continue Editing</Button>
                        <Button
                            style={styles.confirmButton}
                            rippleColor="transparent"
                            labelStyle={styles.confirmText}
                            onPress={() => {
                                hideReturnDialog();
                                router.back();
                            }}>Discard</Button>
                    </Dialog.Actions>
                </Dialog>

                <Modal visible={isUploading} transparent={true}>
                    <View style={styles.loadingModal}>
                        <View style={styles.loadingContent}>
                            <ActivityIndicator size="large" color="#519CFF" />
                            <Text style={styles.loadingText}>Updating Profile...</Text>
                        </View>
                    </View>
                </Modal>

                <Modal visible={avatarModalVisible} transparent={true} animationType="fade" onDismiss={() => setAvatarModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            style={styles.modalBackground}
                            onPress={() => setAvatarModalVisible(false)}
                        >
                            <View style={styles.buttonContainer}>
                                <Button style={styles.modalButton} labelStyle={styles.modalButtonText} mode="contained" onPress={pickImage}>Change Avatar</Button>
                                <Button style={styles.modalButton} labelStyle={styles.modalButtonText} mode="contained" onPress={clearAvatar}>Clear Avatar</Button>
                            </View>
                        </TouchableOpacity>
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
    },
    detailContainer: {
        flexDirection: 'column',
        alignContent: 'center',
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
    input: {
        backgroundColor: 'white',
        marginTop: '5%',
    },
    padding: {
        padding: '5%',
    },
    avatar: {
        backgroundColor: "white",
        marginTop: '10%',
    },
    avatarContainerBG: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        height: '25%',
        width: '100%',
    },
    avatarCaption: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#32353b',
    },
    flexRow: {
        marginTop: '5%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    charCount: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#949494',
        textAlign: 'right',
    },
    dropdown: {
        marginTop: '10%',
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: '3%',
    },
    placeholderStyle: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
    },
    selectedTextStyle: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
    },
    gridContainer: {
        marginTop: '10%',
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
    },
    gridItem: {
        width: "31%",
        height: "100%",
        aspectRatio: 1,
        margin: "1%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.1)",
        borderRadius: 5,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBackground: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center',
    },
    contentContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: width * 0.9,
        height: '50%',
    },
    buttonContainer: {
        marginTop: '5%',
        width: '100%',
        alignItems: 'center',
    },
    modalButton: {
        marginBottom: '4%',
        backgroundColor: 'white',
        borderRadius: 25,
        width: '90%',
    },
    modalButtonText: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#519CFF',
        paddingVertical: '1%',
    },
    loadingModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loadingContent: {
        backgroundColor: 'white',
        paddingVertical: '10%',
        paddingHorizontal: '20%',
        borderRadius: 10,
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: 'Inter-Bold',
        marginTop: '15%',
        fontSize: 20,
        color: '#519CFF',
    },
    button: {
        marginTop: '10%',
        marginBottom: '20%',
        backgroundColor: '#519CFF',
        borderRadius: 25,
    },
    buttonText: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: 'white',
        paddingVertical: '1%',
    },
    disabledContainedButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
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