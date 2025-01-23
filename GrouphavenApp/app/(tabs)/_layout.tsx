import { Tabs } from "expo-router";
import { useFonts } from 'expo-font';
import { StyleSheet, Pressable } from 'react-native';
import { Icon } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
    const [loaded, error] = useFonts({
        'Inter-Regular': require('../../assets/fonts/Inter_28pt-Regular.ttf'),
        'Inter-Bold': require('../../assets/fonts/Inter_28pt-Bold.ttf'),
        'Inter-Black': require('../../assets/fonts/Inter_28pt-Black.ttf'),
        'Inter-ExtraBold': require('../../assets/fonts/Inter_28pt-ExtraBold.ttf'),
        'Inter-ExtraLight': require('../../assets/fonts/Inter_28pt-ExtraLight.ttf'),
        'Inter-Light': require('../../assets/fonts/Inter_28pt-Light.ttf'),
        'Inter-Medium': require('../../assets/fonts/Inter_28pt-Medium.ttf'),
        'Inter-SemiBold': require('../../assets/fonts/Inter_28pt-SemiBold.ttf'),
    });

    return (
        <Tabs screenOptions={{
            animation: 'fade',
            tabBarButton: (props) => <Pressable {...props} android_ripple={{ color: 'transparent' }} />,
            tabBarStyle: {
                backgroundColor: 'white',
                borderColor: '#519CFF',
                borderTopWidth: 3,
                height: '7%',
            },
            tabBarItemStyle: {
                justifyContent: 'center',
            },
            tabBarActiveTintColor: '#519CFF',
            tabBarInactiveTintColor: 'black',
            tabBarLabelStyle: {
                fontFamily: 'Inter-SemiBold',
                fontSize: 12,
            },
        }}>
            <Tabs.Screen
                name="Account"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <Icon source={'account-outline'} color={focused ? '#519CFF' : 'black'} size={32} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Match"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <Icon source={'magnify'} color={focused ? '#519CFF' : 'black'} size={32} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Groups"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <MaterialIcons name='chat-bubble-outline' color={focused ? '#519CFF' : 'black'} size={30} />
                    ),
                }}
            />
        </Tabs >
    );
}

const styles = StyleSheet.create({
    icon: {
    },
});
