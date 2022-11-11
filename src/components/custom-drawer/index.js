import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Colors from '../../constants/colors';
import Styled from './styles';
import { makeCall } from '../../services/api';

const CustomDrawer = (props) => {
  const { onLeaveSession } = props;
  const currentUserStore = useSelector((state) => state.currentUserCollection);

  const leaveSession = () => {
    makeCall('userLeftMeeting');
    if (typeof onLeaveSession === 'function') onLeaveSession();
  }

  // TODO Think a way to avoid this
  const currentUserObj = Object.values(
    currentUserStore.currentUserCollection
  )[0] || {
    name: 'User not logged in',
    role: 'VIEWER',
    color: '#FFFFFF',
  };

  const handleUserInfo = useCallback(() => {
    return {
      name: currentUserObj?.name,
      role: currentUserObj?.role,
      color: currentUserObj?.color,
    };
  }, [currentUserStore]);

  return (
    <Styled.ViewContainer>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ backgroundColor: Colors.blue }}
      >
        <Styled.CustomDrawerContainer>
          <Styled.UserAvatar
            userName={handleUserInfo().name}
            userRole={handleUserInfo().role}
            userColor={handleUserInfo().color}
          />
          <Styled.NameUserAvatar>{handleUserInfo().name}</Styled.NameUserAvatar>
        </Styled.CustomDrawerContainer>
        <Styled.ContainerDrawerItemList>
          <DrawerItemList {...props} />
        </Styled.ContainerDrawerItemList>
      </DrawerContentScrollView>
      <Styled.ContainerCustomButtons>
        <Styled.ButtonLeaveContainer onPress={leaveSession}>
          <Styled.ViewLeaveContainer>
            <Styled.TextLeaveContainer>
              Sair da sessão
            </Styled.TextLeaveContainer>
          </Styled.ViewLeaveContainer>
        </Styled.ButtonLeaveContainer>
      </Styled.ContainerCustomButtons>
    </Styled.ViewContainer>
  );
};

export default CustomDrawer;
