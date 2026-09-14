import styled from 'styled-components/native';

const WebviewContainer = styled.View`
  flex: 1;
  background-color: #1a1a2e;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #2a2a3e;
  padding-horizontal: 16px;
  padding-vertical: 12px;
  padding-top: 40px;
`;

const BackButton = styled.TouchableOpacity`
  padding: 8px;
  margin-right: 12px;
`;

const BackButtonText = styled.Text`
  color: #ffffff;
  font-size: 16px;
`;

const Title = styled.Text`
  color: #ffffff;
  font-size: 16px;
  flex: 1;
`;

export default {
  WebviewContainer,
  Header,
  BackButton,
  BackButtonText,
  Title,
};
