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
    size = 24,
    disabled,
    animated,
    accessibilityLabel,
    onPress,
    style,
  } = props;

  return (
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
  );
};

export default IconButtonComponent;
