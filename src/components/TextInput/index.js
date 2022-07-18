import Styled from './styles';

const TextInputComponent = (props) => {
  const { label, onChangeText, style } = props;

  return (
    <Styled.TextInput
      label={label}
      onChangeText={onChangeText}
      style={style}
      {...props}
    />
  );
};

export default TextInputComponent;
