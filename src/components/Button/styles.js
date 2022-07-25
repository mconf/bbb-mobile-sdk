import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const ButtonOuterContainer = styled.View`
  display: flex;
  margin: 4px;
`;

const ButtonInnerContainer = styled.Pressable`
  background-color: ${Colors.blue};
  justify-content: center;
  display: flex;
  border-radius: 12px;
  min-height: 40px;
`;

const ButtonText = styled.Text`
  color: ${Colors.white};
  text-align: center;
  font-size: 18px;
`;

export default {
  ButtonOuterContainer,
  ButtonInnerContainer,
  ButtonText,
};
