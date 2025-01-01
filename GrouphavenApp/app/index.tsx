import { StyleSheet, ImageBackground, View, Image } from 'react-native';
import { Provider as PaperProvider, Text, Button } from 'react-native-paper';
import React from 'react';

export default function LandingScreen() {
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
            <Button style={styles.button} labelStyle={styles.buttonText} icon={() => (
              <Image
                source={require('../assets/images/logo_Facebook.png')}
                style={styles.iconImage}
              />
            )} mode="elevated" rippleColor="rgba(0, 0, 0, 0.2)" onPress={() => console.log('Pressed')}>
              Continue with Facebook
            </Button>
            <Button style={styles.button} labelStyle={styles.buttonText} icon={() => (
              <Image
                source={require('../assets/images/logo_Google.png')}
                style={styles.iconImage}
              />
            )} mode="elevated" rippleColor="rgba(0, 0, 0, 0.2)" onPress={() => console.log('Pressed')}>
              Continue with Google
            </Button>
            <Button style={styles.button} labelStyle={styles.buttonText} icon={() => (
              <Image
                source={require('../assets/images/logo_X.png')}
                style={styles.iconImage}
              />
            )} mode="elevated" rippleColor="rgba(0, 0, 0, 0.2)" onPress={() => console.log('Pressed')}>
              Continue with X
            </Button>
          </View>

          <Text style={styles.termText}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and acknowledge that you have read our{' '}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
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
    flex: 7,
    alignItems: 'center',
    paddingTop: '15%',
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
  link: {
    fontFamily: 'Inter-SemiBold',
    textDecorationLine: 'underline',
    color: 'white',
  },
  termText: {
    flex: 1,
    fontFamily: 'Inter-Light',
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    width: '90%',
    paddingTop: '15%',
  },
  buttonContainer: {
    flex: 3,
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'black',
  },
  iconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});
