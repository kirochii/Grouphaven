import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem, } from '@react-navigation/drawer';
import { checkSession, signOut } from '../../utils/Account'
import React from 'react';
import { router } from 'expo-router';


const DrawerLayout = () => {
  React.useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await checkSession();

      if (!loggedIn) {
        window.location.replace('/');
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.replace('/');
  };

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          <DrawerItem
            label="Dashboard"
            icon={({ size, color }) => (
              <Ionicons name="speedometer-outline" size={size} color={color} />
            )}
            onPress={() => router.push('/(drawer)/dashboard')}
          />
          <DrawerItem
            label="Verify Users"
            icon={({ size, color }) => (
              <Ionicons name="shield-checkmark-outline" size={size} color={color} />
            )}
            onPress={() => router.push('/(drawer)/verifyUsers')}
          />
          <DrawerItem
            label="Sign Out"
            icon={({ size, color }) => (
              <Ionicons name="log-out-outline" size={size} color={color} />
            )}
            onPress={handleSignOut}
          />
        </DrawerContentScrollView>
      )}
    >
    </Drawer>
  );
};

export default DrawerLayout;