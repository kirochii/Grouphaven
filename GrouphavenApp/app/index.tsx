import { StyleSheet, ImageBackground, View, Image } from 'react-native';
import { Provider as PaperProvider, Text, Button } from 'react-native-paper';
import React from 'react';
import { router } from 'expo-router';

export default function index() {
  return (
    <PaperProvider>
      <ImageBackground
        source={require('../assets/images/background.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../assets/images/iconWhite.png')}
                style={styles.icon}
              />
              <Text style={styles.iconText}>GROUPHAVEN</Text>
            </View>
            <Text style={styles.text}>Match. Connect. Thrive.</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button style={styles.button} labelStyle={styles.buttonText} mode="contained" onPress={() => router.navigate("/SignUp")} rippleColor="rgba(0, 0, 0, 0.2)">
              SIGN UP
            </Button>
            <Button style={styles.button} labelStyle={styles.buttonText}
              mode="contained"
              onPress={() => console.log('Pressed')} rippleColor="rgba(0, 0, 0, 0.2)"
            >
              SIGN IN
            </Button>
          </View>
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
    alignItems: 'center',
    padding: '5%',
  },
  headerContainer: {
    flex: 2,
    alignItems: 'center',
    paddingTop: '30%',
  },
  text: {
    fontFamily: 'Inter-Light',
    fontSize: 22,
    color: 'white',
    paddingTop: '5%',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: '20%',
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  iconText: {
    fontFamily: 'Inter-Black',
    marginLeft: '3%',
    fontSize: 32,
    color: 'white',
  },
  buttonContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    gap: '10%',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: '90%',
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#32353b',
    paddingVertical: '1%',
  },
});