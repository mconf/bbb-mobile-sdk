import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Colors from '../../constants/colors';
import Styled from './styles';
import { makeCall } from '../../services/api';
import { selectCurrentUser } from '../../store/redux/slices/current-user';
import { setSessionEnded } from '../../store/redux/slices/wide-app/client';

const CustomDrawer = (props) => {
  const { onLeaveSession } = props;
  const dispatch = useDispatch();
  const currentUserStore = useSelector((state) => state.currentUserCollection);
  const userLoggedOut = useSelector((state) => selectCurrentUser(state)?.loggedOut);
  const clientLoggedIn = useSelector((state) => state.client.loggedIn);

  useEffect(() => {
    if (typeof onLeaveSession === 'function'
      && userLoggedOut
      && !clientLoggedIn
    ) {
      dispatch(setSessionEnded(true));
      onLeaveSession();
    }
  }, [userLoggedOut, clientLoggedIn]);

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
        <Styled.ButtonLeaveContainer onPress={() => { makeCall('userLeftMeeting'); }}>
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
