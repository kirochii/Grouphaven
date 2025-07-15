import { StyleSheet, Dimensions, ScrollView, View, RefreshControl, TouchableOpacity, Modal, Image } from 'react-native';
import { Provider as PaperProvider, Text, IconButton, Avatar, Icon } from 'react-native-paper';
import React from 'react';
import { router, useFocusEffect } from 'expo-router';
import { getUserProfile, calculateAge, getLocation } from '../../utils/Account';

const { width, height } = Dimensions.get("window");

export default function Account() {
    const [user, setUser] = React.useState<any>(null);
    const [age, setAge] = React.useState<number | null>(null);
    const [location, setLocation] = React.useState<string | null>(null);

    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
    const [modalVisible, setModalVisible] = React.useState(false);

    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const images = user
        ? [
            { id: 1, uri: user.photo_1 },
            { id: 2, uri: user.photo_2 },
            { id: 3, uri: user.photo_3 },
            { id: 4, uri: user.photo_4 },
            { id: 5, uri: user.photo_5 },
            { id: 6, uri: user.photo_6 },
        ]
        : [];
    const validImages = images.filter(image => image.uri);

    const onRefresh = async () => {
        setIsRefreshing(true);

        const userData = await getUserProfile();
        if (userData) {
            setUser(userData);
        }

        setIsRefreshing(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            const fetchUser = async () => {
                const userData = await getUserProfile();
                if (userData) {
                    setUser(userData);
                }
            };
            fetchUser();
        }, [])
    );

    React.useEffect(() => {
        if (user) {
            setAge(calculateAge(user.dob));
            setLocation(getLocation(user.city));
        }
    }, [user]);

    const handleImagePress = (image: string) => {
        setSelectedImage(image);
        setModalVisible(true);
    };

    return (
        <PaperProvider>
            <ScrollView style={styles.container} refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }>
                <View style={styles.headerContainer}>
                    <View style={styles.infoContainer}>
                        <View style={styles.avatarContainer}>
                            <TouchableOpacity onPress={() => router.push(`../../EditProfile`)}>
                                {user?.avatar_url ? (
                                    <Avatar.Image size={80} source={{ uri: String(user.avatar_url) }} style={styles.avatar} />
                                ) : (
                                    <Avatar.Icon size={80} icon="account" style={styles.avatar} />
                                )}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.userInfoContainer}>
                            <View style={styles.userContainer}>
                                <Text style={styles.userInfo}>{user?.name || "Null"}, {age} </Text>
                                <Icon
                                    source="shield-check"
                                    color={user?.is_verified ? "#519CFF" : "#949494"}
                                    size={20}
                                />
                            </View>
                            <View style={styles.userContainer}>
                                <Icon
                                    source="map-marker"
                                    color={"#949494"}
                                    size={20}
                                />
                                <Text style={styles.userLocation}>{location || "Null"}</Text>
                            </View>
                        </View>
                    </View>
                    <IconButton size={30} icon="menu" onPress={() => router.push(`../../Settings`)}></IconButton>
                </View>

                {(user?.tagline || user?.bio) && (<View style={styles.userText}>
                    {user?.tagline && <Text style={styles.userTag}>{user?.tagline}</Text>}
                    {user?.bio && <Text style={styles.userBio}>{user?.bio}</Text>}
                </View>)}
                <Text style={styles.title}>Photos</Text>

                <View style={styles.gridContainer}>
                    {validImages.length > 0 ? (
                        validImages.map((image, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.gridItem}
                                onPress={() => handleImagePress(image.uri)}
                            >
                                <Image source={{ uri: image.uri }} style={styles.image} resizeMode='cover' />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <TouchableOpacity
                            style={styles.gridItem}
                            onPress={() => {
                                router.push(`../../EditProfile`);
                            }}
                        >
                            <IconButton icon="plus" size={40} iconColor='#949494' />
                        </TouchableOpacity>
                    )}

                    <Modal visible={modalVisible} transparent={true} animationType="fade">
                        <View style={styles.modalContainer}>
                            <TouchableOpacity
                                style={styles.modalBackground}
                                onPress={() => setModalVisible(false)}
                            >
                                {selectedImage && (
                                    <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode='contain' />
                                )}
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </View>
            </ScrollView>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: '5%',
        flexDirection: 'column',
        backgroundColor: "white",
        paddingTop: "10%",
    },
    headerContainer: {
        flex: 1,
        flexDirection: "row",
        width: '100%',
        alignItems: 'center',
    },
    infoContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        width: 90,
        height: 90,
        borderRadius: 100,
        borderWidth: 3,
        borderColor: "#519CFF",
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        backgroundColor: "white",
    },
    userInfo: {
        fontFamily: 'Inter-Bold',
        fontSize: 22,
        color: '#32353b',
    },
    userInfoContainer: {
        marginLeft: '5%',
        flexDirection: 'column',
        alignSelf: 'center',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userLocation: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        color: '#32353b',
    },
    userText: {
        marginVertical: '5%',
    },
    userBio: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        color: '#32353b',
    },
    userTag: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: '#949494',
    },
    title: {
        marginTop: '5%',
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        color: '#32353b',
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
        padding: "100%",
    },
    modalImage: {
        width: width * 0.9,
        height: height,
    },
});
