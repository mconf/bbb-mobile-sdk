import { StyleSheet } from 'react-native';

// ? Rotate 180 degrees using transform, workaround for bug in Android 13
const styles = StyleSheet.create({
  item: {
    transform: [{ rotate: '180deg' }],
  },
});

export default { styles };
