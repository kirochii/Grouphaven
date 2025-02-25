import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Provider as PaperProvider, Text, IconButton, TextInput, Avatar, Portal, Modal, Button } from 'react-native-paper';
import React from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getUserProfile, updateAvatar, uploadAvatar, updateTagline, updateBio } from '../utils/Account';

export default function EditProfile() {
    const [user, setUser] = React.useState<any>(null);
    const [isChanged, setIsChanged] = React.useState(false);

    const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
    const [avatar64, setAvatar64] = React.useState<string | null>(null);

    const [avatar, setAvatar] = React.useState<string | null>(null);
    const [tagline, setTagline] = React.useState<string | null>(null);
    const [bio, setBio] = React.useState<string | null>(null);

    const [avatarModalVisible, setAvatarModalVisible] = React.useState(false);

    React.useEffect(() => {
        const fetchUser = async () => {
            const userData = await getUserProfile();
            if (userData) {
                setUser(userData);
                setTagline(userData.tagline);
            }

            if (userData?.avatar_url) {
                setAvatar(userData.avatar_url);
            }

            if (userData?.tagline) {
                setTagline(userData.tagline);
            }

            if (userData?.bio) {
                setTagline(userData.bio);
            }
        };
        fetchUser();
    }, []);


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
            setAvatar(result.assets[0].uri);
        }
    };

    const clearAvatar = async () => {
        setIsChanged(true);
        setAvatar(null);
        setAvatarModalVisible(false);
    };

    const saveChanges = async () => {
        if (avatarUri && avatar64) {
            const avatarUrl = await uploadAvatar(avatarUri, avatar64);
            if (avatarUrl) {
                await updateAvatar(avatarUrl);
            }
        } else {
            await updateAvatar(null);
        }

        updateTagline(tagline || "");
        updateBio(bio || "");
        setIsChanged(false);
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

                        <Button mode="contained" onPress={saveChanges} disabled={isChanged ? false : true}>Save Changes</Button>


                    </View>
                </ScrollView>

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

});
