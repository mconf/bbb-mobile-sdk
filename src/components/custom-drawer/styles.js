import styled from 'styled-components/native';
import { css } from 'styled-components';
import Icon from '@expo/vector-icons/MaterialIcons';
import userAvatar from '../user-avatar';
import Colors from '../../constants/colors';
import Pressable from '../pressable';

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
  color: ${Colors.white};
  font-size: 18px;
  padding-left: 20px;
`;

const ContainerDrawerItemList = styled.View`
  flex: 1;
  background-color: ${Colors.white};
  padding-top: 10px;
`;

const ContainerCustomButtons = styled.View`
  padding-bottom:  5%;
`;

const ButtonLeaveContainer = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    padding:  5px 10px;
  `}
`;

const ViewLeaveContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px;
  background-color: ${Colors.lightGray100};
  border-radius: 8px;
`;

const ViewShareContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
`;

const TextLeaveContainer = styled.Text`
  padding-left: 12px;
  color: ${Colors.lightGray400};
  font-size: 17px;
  font-weight: 400;
  text-align: left;
  text-align-vertical: center;
  padding-left: 14px;
`;

const ViewRecordContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px;
  background-color: ${Colors.lightGray100};
  border-radius: 8px;

  ${({ recording }) => recording
    && `
      background-color: ${Colors.orange};
  `}
`;

const ButtonRecordContainer = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    padding:  5px 10px;
    background-color: ${Colors.white};
  `}
`;

const TextRecordContainer = styled.Text`
  padding-left: 12px;
  color: ${Colors.lightGray400};
  font-size: 17px;
  font-weight: 400;
  text-align: left;
  text-align-vertical: center;
  padding-left: 14px;

  ${({ recording }) => recording
    && `
      color: ${Colors.white};
  `}
`;

const DrawerIcon = styled(Icon)`
  padding-left: 4px;
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
  ViewShareContainer,
  ButtonRecordContainer,
  ViewRecordContainer,
  TextRecordContainer,
  DrawerIcon,
};
