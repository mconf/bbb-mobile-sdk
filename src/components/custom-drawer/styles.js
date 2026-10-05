import styled from 'styled-components/native';
import { DrawerItem, DrawerContentScrollView } from '@react-navigation/drawer';
import { css } from 'styled-components';
import Icon from '@expo/vector-icons/MaterialIcons';
import Tag from '../tag';
import userAvatar from '../user-avatar';
import Colors from '../../constants/colors';
import Fonts from '../../constants/fonts';
import Pressable from '../pressable';
import { Text } from '../typography';

const ViewContainer = styled.View`
  flex: 1;
`;

const CustomDrawerContainer = styled.View`
  padding: 20px;
  padding-top: ${({ topInset }) => 20 + (topInset || 0)}px;
  flex-direction: row;
  align-items: center;
  background-color: ${Colors.blue};
`;

const UserAvatar = styled(userAvatar)`
  height: 80px;
  width: 80px;
  border-radius: 40px;
  margin-bottom: 10px;
`;

const NameUserAvatar = styled(Text)`
  color: ${Colors.white};
  font-size: 18px;
  padding-left: 20px;
  flex: 1;
`;

const ContainerDrawerItemList = styled.View`
  flex: 1;
  background-color: ${Colors.white};
  padding-top: 10px;
  gap: 4px;
`;

const ContainerCustomBottomButtons = styled.View`
  padding-bottom:  5%;
  padding-left: 12px;
  padding-right: 12px;
  gap: 4px
`;

const ContainerCustomButtonsInsideScrollview = styled.View`
  background-color: white;
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

const TextButtonLabel = {
  paddingLeft: 12,
  paddingRight: 20,
  color: Colors.lightGray400,
  fontSize: 16,
  fontFamily: Fonts.regular,
  fontWeight: 400,
  textAlign: 'left',
};

const TextButtonActive = {
  paddingLeft: 12,
  paddingRight: 20,
  color: Colors.white,
  fontSize: 16,
  fontFamily: Fonts.regular,
  fontWeight: 400,
  textAlign: 'left',
};

const DrawerIcon = styled(Icon)`
  position: absolute;
  margin: 12px;
`;

const BetaTag = styled(Tag)`
  position: absolute;
  right: 12px;
`;

const DrawerItemNotImplemented = ({ label, onPress, iconName }) => {
  return (
    <DrawerItem
      label={label}
      labelStyle={TextButtonLabel}
      style={{ opacity: 0.3 }}
      onPress={onPress}
      inactiveTintColor={Colors.lightGray400}
      inactiveBackgroundColor={Colors.lightGray100}
      icon={() => (
        <DrawerIcon name={iconName} size={24} color="#1C1B1F" />
      )}
    />
  );
};

const DrawerItemBottom = ({ label, onPress, iconName }) => {
  return (
    <DrawerItem
      label={label}
      labelStyle={TextButtonLabel}
      onPress={onPress}
      inactiveTintColor={Colors.lightGray400}
      inactiveBackgroundColor={Colors.lightGray100}
      icon={() => <DrawerIcon name={iconName} size={24} color="#1C1B1F" />}
      style={{ borderRadius: 8 }}
    />
  );
};

const DrawerScrollView = ({ children }) => (
  <DrawerContentScrollView
    style={{ backgroundColor: Colors.white }}
    contentContainerStyle={{ paddingTop: 8 }}
  >
    {children}
  </DrawerContentScrollView>
);

const UserAvatarDrawer = ({ currentUser }) => (
  <UserAvatar
    userName={currentUser?.name}
    userRole={currentUser?.role}
    userColor={currentUser?.color}
    userImage={currentUser?.avatar}
    presenter={currentUser?.presenter}
  />
);

export default {
  ViewContainer,
  CustomDrawerContainer,
  ContainerDrawerItemList,
  ContainerCustomButtonsInsideScrollview,
  UserAvatar,
  NameUserAvatar,
  ContainerCustomBottomButtons,
  ButtonLeaveContainer,
  ViewLeaveContainer,
  TextButtonLabel,
  TextButtonActive,
  ViewShareContainer,
  BetaTag,
  DrawerIcon,
  DrawerItemNotImplemented,
  DrawerItemBottom,
  DrawerScrollView,
  UserAvatarDrawer
};
