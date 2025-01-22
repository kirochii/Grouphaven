import { Tabs } from "expo-router";
import { useFonts } from 'expo-font';
import { Icon } from 'react-native-paper';

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
        }}>
            <Tabs.Screen
                name="Account"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <Icon source={focused ? 'account' : 'account-outline'} color={'#519CFF'} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Match"
                options={{
                    headerShown: false,
                    tabBarIcon: () => (
                        <Icon source={'magnify'} color={'#519CFF'} size={24} />
                    ),
                }}
            />
        </Tabs>
    );
}
