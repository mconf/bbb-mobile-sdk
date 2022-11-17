import { Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { hide } from '../../store/redux/slices/wide-app/notification-bar';
import Styled from './styles';

const NotificationBar = () => {
  const dispatch = useDispatch();

  // select the UI states from the redux store
  const notificationBarStore = useSelector((state) => state.notificationBar);

  const handleIcon = () => {
    if (notificationBarStore.icon === 'hand') {
      return <Avatar.Icon size={36} icon="hand-back-left-outline" />;
    }
    // other icons...

    return null;
  };

  if (!notificationBarStore.isShow) {
    return null;
  }

  return (
    <Styled.NotificationsBarPressable onPress={() => dispatch(hide())}>
      {handleIcon()}
      <Styled.TextContainer>
        <Styled.TitleText>
          {notificationBarStore.messageTitle}
        </Styled.TitleText>
        <Styled.SubtitleText>
          {notificationBarStore.messageSubtitle}
        </Styled.SubtitleText>
      </Styled.TextContainer>
    </Styled.NotificationsBarPressable>
  );
};

export default NotificationBar;
