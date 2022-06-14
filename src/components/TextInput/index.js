import Styled from './styles';

const TextInputComponent = (props) => {
  const { placeholder, keyboardType, onChange } = props;

  return (
    <Styled.TextInput
      placeholder={placeholder}
      keyboardType={keyboardType}
      onChange={onChange}
      {...props}
    />
  );
};

export default TextInputComponent;
