import styled from 'styled-components/native';
import userAvatar from '../user-avatar';

const ViewContainer = styled.View`
  flex: 1;
`;

const CustomDrawerContainer = styled.View`
  padding: 20px;
  flex-direction: row;
  align-items: center;
`;

const UserAvatar = styled(userAvatar)`
  height: 80px;
  width: 80px;
  border-radius: 40px;
  margin-bottom: 10px;
`;

const NameUserAvatar = styled.Text`
  color: #ffffff;
  font-size: 18px;
  padding-left: 20px;
`;

const ContainerDrawerItemList = styled.View`
  flex: 1;
  background-color: #ffffff;
  padding-top: 10px;
`;

const ContainerCustomButtons = styled.View``;
const ButtonLeaveContainer = styled.TouchableOpacity`
  padding: 16px;
`;

const ViewLeaveContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: #eef1f4;
  border-radius: 4px;
`;

const TextLeaveContainer = styled.Text`
  color: #1c1c1ead;
  font-weight: 500;
`;

export default {
  ViewContainer,
  CustomDrawerContainer,
  ContainerDrawerItemList,
  UserAvatar,
  NameUserAvatar,
  ContainerCustomButtons,
  ButtonLeaveContainer,
  ViewLeaveContainer,
  TextLeaveContainer,
};
