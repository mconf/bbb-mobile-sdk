import { ActivityIndicator, View } from 'react-native';
import Styled from './styles';

// icon library: https://materialdesignicons.com/

const IconButtonComponent = (props) => {
  const {
    type,
    icon,
    mode,
    iconColor,
    containerColor,
    selected,
    size,
    disabled,
    animated,
    accessibilityLabel,
    onPress,
    style,
    loading = false,
  } = props;

  return (
    <View>
      <Styled.IconButton
        type={type}
        icon={icon}
        mode={mode}
        iconColor={iconColor}
        containerColor={containerColor}
        selected={selected}
        size={size}
        disabled={disabled}
        animated={animated}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={style}
      />
      <Styled.IconButtonLoadingWrapper pointerEvents="none">
        <ActivityIndicator
          size={(size * 2)}
          color={iconColor}
          animating={loading}
          hidesWhenStopped
        />
      </Styled.IconButtonLoadingWrapper>
    </View>
  );
};

export default IconButtonComponent;
