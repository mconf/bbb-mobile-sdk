import styled from 'styled-components/native';
import { Divider } from 'react-native-paper';
import Colors from '../../../constants/colors';
import actionsBar from '../../../components/actions-bar';
import button from '../../../components/button';
import userAvatar from '../../../components/user-avatar';
import iconButton from '../../../components/icon-button';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  padding-top: 20px;
  padding-bottom: 20px;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    flex-direction: row;
    justify-content: center;
    padding: 10px;
  `}
`;

const ActionsBar = styled(actionsBar)`
  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    flex-direction: column;
    display: flex;
  `}
`;

const ActionsBarContainer = styled.View`
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    width: 10%;
    height: 100%;
  `}
`;

const WaitingUsersTop = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12px;
`;

const WaitingUsersTopText = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.white};
  text-align: center;
`;

const DividerTop = styled(Divider)`
  margin-top: 6px;
  margin-left: 6px;
  margin-right: 6px;
  border-width: 1px;
  border-color: ${Colors.white};
`;

const WaitingUsersView = styled.View`
  width: 100%;
  max-height: 87%;
  display: flex;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    width: 90%;
    max-height: 90%;
  `}
`;

const UserName = styled.Text`
  color: black;
  padding-left: 20px;
  font-size: 16px;
  max-width: 60%;  
`;

const UserAvatar = styled(userAvatar)``;
const FlatList = styled.FlatList`
  width: 100%;
  max-height: 85%;
  border-radius: 12px;
  padding: 12px;
  padding-top: 16px;
  display: flex;
`;

const UserCard = styled.View`
  background-color: ${Colors.white};
  min-height: 20px;
  border-radius: 12px;
  padding: 12px;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const AccRejContainer = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: center;
  padding: 16px;
`;

const AccRejButtons = styled(button)`
  background-color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  padding-bottom: 12px;
  border-radius: 40px;
`;

const AccRejButtonsText = styled.Text`
  color: ${Colors.lightGray400};
  font-size: 16px;
  font-weight: 500;
  padding: 12px;
  border-radius: 40px;
`;

const NoPendingUsersText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  font-style: italic;
  text-align: center;
  color: ${Colors.white};
`;

const AllowButton = styled(iconButton)`
  position: absolute;
  right: 36px;
`;

const DenyButton = styled(iconButton)`
  position: absolute;
  right: 0px;
`;

const BackIcon = styled(iconButton)`
  position: absolute;
  left: -12px;
`;

export default {
  ActionsBar,
  ActionsBarContainer,
  ContainerView,
  WaitingUsersView,
  WaitingUsersTop,
  WaitingUsersTopText,
  DividerTop,
  UserName,
  UserAvatar,
  FlatList,
  UserCard,
  AccRejContainer,
  AccRejButtons,
  AccRejButtonsText,
  NoPendingUsersText,
  BackIcon,
  AllowButton,
  DenyButton,
};
