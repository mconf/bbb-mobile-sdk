import styled from 'styled-components/native';
import Colors from '../../../constants/colors';

const ContainerView = styled.View`
  height: 120px;
  width: 120px;
`;

const UserAvatar = styled.Image`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const NameLabelContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: #28282d99;
  padding: 5px;
  margin: 5px;
  border-radius: 4px;
`;
const NameLabel = styled.Text`
  color: ${Colors.white};
`;

export default { ContainerView, UserAvatar, NameLabel, NameLabelContainer };
