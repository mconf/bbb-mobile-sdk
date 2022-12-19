import { Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { hide } from '../../store/redux/slices/wide-app/notification-bar';
import Styled from './styles';

const NotificationBar = () => {
  const dispatch = useDispatch();

  // select the UI states from the redux store
  const notificationBarStore = useSelector((state) => state.notificationBar);
  const navigation = useNavigation();

  const handleIcon = () => {
    switch (notificationBarStore.icon) {
      case 'hand': 
        return <Avatar.Icon size={36} icon="hand-back-left-outline" />;
      case 'poll': 
        return <Avatar.Icon size={36} icon="poll" />;
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
        dispatch(hide())
      }}
    >
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
