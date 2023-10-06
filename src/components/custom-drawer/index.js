import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Share } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Colors from '../../constants/colors';
import { selectCurrentUser, isModerator } from '../../store/redux/slices/current-user';
import Styled from './styles';
import logger from '../../services/api';
import * as api from '../../services/api';
import { leave } from '../../store/redux/slices/wide-app/client';
import { selectRecordMeeting } from '../../store/redux/slices/record-meetings';
import { openModal, setActiveModal } from '../../store/redux/slices/wide-app/modal';
import RecordService from '../modals/recording-confirm-modal/service';

const CustomDrawer = (props) => {
  const { meetingUrl } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentUserObj = useSelector(selectCurrentUser);
  const amIModerator = useSelector(isModerator);
  const recordMeeting = useSelector(selectRecordMeeting);
  const navigation = useNavigation();

  const allowStartStopRecording = recordMeeting?.allowStartStopRecording;
  const showRecordButton = RecordService.mayIRecord(amIModerator, allowStartStopRecording);

  const handleOpenRecordingModal = () => {
    dispatch(setActiveModal('recording-confirm'));
    dispatch(openModal());
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  let recordTitle = '';
  if (!recordMeeting?.recording) {
    recordTitle = recordMeeting?.time > 0
      ? t('app.recording.resumeTitle')
      : t('app.recording.startTitle');
  } else {
    recordTitle = t('app.recording.stopTitle');
  }

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
      logger.error({
        logCode: 'error_sharing_link',
        extraInfo: { error },
      }, `Exception thrown while clicking to share meeting_url: ${error}`);
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
            userName={currentUserObj?.name}
            userRole={currentUserObj?.role}
            userColor={currentUserObj?.color}
            userImage={currentUserObj?.avatar}
          />
          <Styled.NameUserAvatar numberOfLines={1}>{currentUserObj?.name}</Styled.NameUserAvatar>
        </Styled.CustomDrawerContainer>
        <Styled.ContainerDrawerItemList>
          <DrawerItemList {...props} />
        </Styled.ContainerDrawerItemList>
        {showRecordButton && (
        <Styled.ContainerCustomButtonsInsideScrollview>
          <DrawerItem
            label={recordTitle}
            labelStyle={recordMeeting?.recording ? Styled.TextButtonActive : Styled.TextButtonLabel}
            onPress={handleOpenRecordingModal}
            inactiveTintColor={recordMeeting?.recording ? Colors.orange : Colors.lightGray400}
            inactiveBackgroundColor={recordMeeting?.recording ? Colors.orange : Colors.lightGray100}
            icon={() => (
              <Styled.DrawerIcon
                name={recordMeeting?.recording ? 'pause' : 'radio-button-checked'}
                color={recordMeeting?.recording ? Colors.white : '#1C1B1F'}
                size={24}
              />
            )}
          />
        </Styled.ContainerCustomButtonsInsideScrollview>
        )}
      </DrawerContentScrollView>
      <Styled.ContainerCustomBottomButtons>
        <DrawerItem
          label={t('mobileSdk.drawer.shareButtonLabel')}
          labelStyle={Styled.TextButtonLabel}
          onPress={onClickShare}
          inactiveTintColor={Colors.lightGray400}
          inactiveBackgroundColor={Colors.lightGray100}
          icon={() => <Styled.DrawerIcon name="share" size={24} color="#1C1B1F" />}
        />

        <DrawerItem
          label={t('app.navBar.settingsDropdown.leaveSessionLabel')}
          labelStyle={Styled.TextButtonLabel}
          onPress={leaveSession}
          inactiveTintColor={Colors.lightGray400}
          inactiveBackgroundColor={Colors.lightGray100}
          icon={() => <Styled.DrawerIcon name="logout" size={24} color="#1C1B1F" />}
        />
      </Styled.ContainerCustomBottomButtons>
    </Styled.ViewContainer>
  );
};

export default CustomDrawer;
