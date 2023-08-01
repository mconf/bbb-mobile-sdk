import { Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { hide } from '../../store/redux/slices/wide-app/notification-bar';
import Styled from './styles';

const NotificationBar = () => {
  const dispatch = useDispatch();

  // select the UI states from the redux store
  const notificationBarStore = useSelector((state) => state.notificationBar);
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleIcon = () => {
    switch (notificationBarStore.icon) {
      case 'hand':
        return <Avatar.Icon size={36} icon="hand-back-left-outline" />;
      case 'poll':
        return <Avatar.Icon size={36} icon="poll" />;
      case 'breakout-room':
        return <Avatar.Icon size={36} icon="account-group" />;
      // other icons...
      default:
        return null;
    }
  };

  if (!notificationBarStore.isShow) {
    return null;
  }

  return (
    <Styled.NotificationsBarPressable
      onPress={() => {
        if (notificationBarStore.icon === 'poll') {
          navigation.navigate('PollScreen');
        }
        if (notificationBarStore.icon === 'breakout-room') {
          navigation.navigate('BreakoutRoomScreen');
        }
        dispatch(hide());
      }}
    >
      {handleIcon()}
      <Styled.TextContainer>
        <Styled.TitleText>
          {t(notificationBarStore.messageTitle)}
        </Styled.TitleText>
        <Styled.SubtitleText>
          {t(notificationBarStore.messageSubtitle)}
        </Styled.SubtitleText>
      </Styled.TextContainer>
    </Styled.NotificationsBarPressable>
  );
};

export default NotificationBar;
