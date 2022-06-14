import { Image, SafeAreaView, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        style={styles.webConf}
        source={require('../../assets/portal/confWebLogo.png')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    justifyContent: 'center',
  },
  webConf: {
    width: 200,
    height: 200,
  },
});

export default LoadingScreen;
