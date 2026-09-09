import { forwardRef } from 'react';
import Styled from './styles';

const TextInputComponent = forwardRef((props, ref) => {
  const { label, onChangeText, style } = props;

  return (
    <Styled.TextInput
      ref={ref}
      label={label}
      onChangeText={onChangeText}
      style={style}
      {...props}
    />
  );
});

export default TextInputComponent;
