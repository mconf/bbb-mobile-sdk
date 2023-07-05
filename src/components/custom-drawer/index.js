import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Share } from 'react-native';
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
  const { meetingUrl } = props;
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
      avatar: currentUserObj?.avatar
    };
  }, [currentUserStore]);

  const leaveSession = () => {
    dispatch(leave(api));
  };

  const onClickShare = async () => {
    try {
      const result = await Share.share({
        message: meetingUrl || 'https://bigbluebutton.org/',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.error('error sharing link', error);
    }
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
            userImage={handleUserInfo().avatar}
          />
          <Styled.NameUserAvatar>{handleUserInfo().name}</Styled.NameUserAvatar>
        </Styled.CustomDrawerContainer>
        <Styled.ContainerDrawerItemList>
          <DrawerItemList {...props} />
        </Styled.ContainerDrawerItemList>
      </DrawerContentScrollView>
      <Styled.ContainerCustomButtons>
        <Styled.ButtonLeaveContainer onPress={onClickShare}>
          <Styled.ViewShareContainer>
            <Icon name="share" size={24} color="#1C1B1F" />
            <Styled.TextLeaveContainer>
              {t('mobileSdk.drawer.shareButtonLabel')}
            </Styled.TextLeaveContainer>
          </Styled.ViewShareContainer>
        </Styled.ButtonLeaveContainer>
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
