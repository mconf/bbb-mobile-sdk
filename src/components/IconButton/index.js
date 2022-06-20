import { IconButton } from 'react-native-paper';

// icon library: https://materialdesignicons.com/
const IconButtonComponent = (props) => {
  const { icon, onPress, color } = props;

  return <IconButton icon={icon} color={color} onPress={onPress} />;
};

export default IconButtonComponent;
