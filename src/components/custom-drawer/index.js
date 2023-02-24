import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Icon from '@expo/vector-icons/MaterialIcons';
import Colors from '../../constants/colors';
import Styled from './styles';
import * as api from '../../services/api';
import { leave } from '../../store/redux/slices/wide-app/client';

const CustomDrawer = (props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentUserStore = useSelector((state) => state.currentUserCollection);

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

  const leaveSession = () => {
    dispatch(leave(api));
  };

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
            <Icon name="logout" size={24} color="#1C1B1F" />
            <Styled.TextLeaveContainer>
              {t('app.navBar.settingsDropdown.leaveSessionLabel')}
            </Styled.TextLeaveContainer>
          </Styled.ViewLeaveContainer>
        </Styled.ButtonLeaveContainer>
      </Styled.ContainerCustomButtons>
    </Styled.ViewContainer>
  );
};

export default CustomDrawer;
