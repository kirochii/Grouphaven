import { StyleSheet, ScrollView, View, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { Provider as PaperProvider, Text, IconButton, TextInput, Avatar, Portal, Button, ActivityIndicator } from 'react-native-paper';
import React from 'react';
import { router } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';
import { getUserProfile, updateAvatar, uploadAvatar, updateTagline, updateBio, updateCity, uploadImage, updateImage } from '../utils/Account';

const { width, height } = Dimensions.get("window");

export default function EditProfile() {
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
        setIsChanged(false);
        setIsAvatarChanged(false);

        router.dismiss(2);
    };

    return (
        <PaperProvider>
            <View style={styles.container}>
                <View style={styles.header}>
                    <IconButton icon="arrow-left" iconColor="#32353b" size={25} onPress={() => router.back()}></IconButton>
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>Edit Profile</Text>
                    </View>
                </View>
                <ScrollView style={styles.background}>
                    <View style={styles.detailContainer}>
                        <View style={styles.avatarContainer}>
                            <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
                                {avatar ? (
                                    <Avatar.Image size={80} source={{ uri: String(avatar) }} style={styles.avatar} />
                                ) : (
                                    <Avatar.Icon size={80} icon="account" style={styles.avatar} />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            label="Tagline"
                            value={tagline || ""}
                            style={styles.input}
                            mode='outlined'
                            onChangeText={tagline => (setTagline(tagline), setIsChanged(true))}
                        />

                        <TextInput
                            label="Bio"
                            value={bio || ""}
                            style={styles.input}
                            mode='outlined'
                            onChangeText={bio => (setBio(bio), setIsChanged(true))}
                        />

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
                                        {selectedImageIndex !== null && images[selectedImageIndex]?.uri && (
                                            <Image source={{ uri: images[selectedImageIndex].uri }} style={styles.modalImage} resizeMode="contain" />
                                        )}
                                    </TouchableOpacity>
                                    <View>
                                        {selectedImageIndex !== null && images[selectedImageIndex]?.uri ? (
                                            <>
                                                <Button mode="contained" onPress={pickProfileImage}>Change Image</Button>
                                                <Button mode="contained" onPress={clearProfileImage}>Clear Image</Button>
                                            </>
                                        ) : (
                                            <Button mode="contained" onPress={pickProfileImage}>Add Image</Button>
                                        )}
                                    </View>
                                </View>
                            </Modal>
                        </View>

                        <Button mode="contained" onPress={saveChanges} disabled={!isChanged || isUploading}>Save Changes</Button>

                    </View>
                </ScrollView>

                <Modal visible={isUploading} transparent={true}>
                    <View style={styles.loadingModal}>
                        <View style={styles.loadingContent}>
                            <ActivityIndicator size="large" color="#519CFF" />
                            <Text style={styles.loadingText}>Uploading images...</Text>
                        </View>
                    </View>
                </Modal>

                <Portal>
                    <Modal visible={avatarModalVisible} onDismiss={() => setAvatarModalVisible(false)}>
                        <View>
                            <Button mode="contained" onPress={pickImage}>Change Avatar</Button>
                            <Button mode="contained" onPress={clearAvatar}>Clear Avatar</Button>
                        </View>
                    </Modal>
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
    background: {
        padding: '5%',
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
    },
    avatar: {
        backgroundColor: "white",
    },
    avatarContainer: {
        marginVertical: '10%',
        width: 90,
        height: 90,
        borderRadius: 100,
        borderWidth: 3,
        borderColor: "#519CFF",
        justifyContent: "center",
        alignItems: "center",
    },
    dropdown: {
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
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
    },
    modalImage: {
        width: width * 0.9,
        height: height,
    },

    loadingModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    loadingContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#32353b',
    },
});
