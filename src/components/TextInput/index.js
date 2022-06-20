import Styled from './styles';

const TextInputComponent = (props) => {
  const { label, onChangeText } = props;

  return (
    <Styled.TextInput label={label} onChangeText={onChangeText} {...props} />
  );
};

export default TextInputComponent;
