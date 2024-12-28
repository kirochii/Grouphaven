import { StyleSheet, ImageBackground, View, Image } from 'react-native';
import { Provider as PaperProvider, Text } from 'react-native-paper';
import React from 'react';

export default function HomeScreen() {
  return (
    <PaperProvider>
      <ImageBackground
        source={require('../assets/images/background.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../assets/images/iconWhite.png')}  // Replace with your image path
              style={styles.icon}
            />
            <Text style={styles.iconText}>GROUPHAVEN</Text>
          </View>
          <Text style={styles.text}>Match. Connect. Thrive.</Text>
        </View>
      </ImageBackground>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginBottom: 20,
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  iconContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 75,
  },
  icon: {
    width: 72,
    height: 72,
  },
  iconText: {
    marginTop: 20,
    marginLeft: 10,
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  }
});
