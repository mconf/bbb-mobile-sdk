import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.blueBackgroundColor || '#1a1a2e'};
  padding: 24px;
`;

const Label = styled.Text`
  color: #ffffff;
  font-size: 18px;
  margin-bottom: 16px;
`;

const Input = styled.TextInput`
  width: 100%;
  background-color: #2a2a3e;
  color: #ffffff;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
`;

const Button = styled.TouchableOpacity`
  background-color: ${({ disabled }) => (disabled ? '#333366' : '#0066cc')};
  padding-vertical: 14px;
  padding-horizontal: 32px;
  border-radius: 8px;
  width: 100%;
  align-items: center;
`;

const ButtonText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
`;

const HelperText = styled.Text`
  color: #888888;
  font-size: 12px;
  margin-top: 16px;
  text-align: center;
`;

export default {
  Container,
  Label,
  Input,
  Button,
  ButtonText,
  HelperText,
};
