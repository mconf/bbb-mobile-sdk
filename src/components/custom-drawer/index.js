import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Share } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Colors from '../../constants/colors';
import { selectCurrentUser, isModerator } from '../../store/redux/slices/current-user';
import Styled from './styles';
import * as api from '../../services/api';
import { leave } from '../../store/redux/slices/wide-app/client';
import { selectRecordMeeting } from '../../store/redux/slices/record-meetings';
import { openModal, setActiveModal } from '../../store/redux/slices/wide-app/modal';
import RecordService from '../modals/recording-confirm-modal/service';
import { useNavigation, DrawerActions } from '@react-navigation/native';

const CustomDrawer = (props) => {
  const { meetingUrl } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentUserObj = useSelector(selectCurrentUser);
  const amIModerator = useSelector(isModerator);
  const isBreakout = useSelector((state) => state.client.meetingData.isBreakout);
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
      : t('app.recording.startTitle')
  } else {
    recordTitle = t('app.recording.stopTitle')
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
          <Styled.ButtonRecordContainer onPress={() => {handleOpenRecordingModal()}}>
            <Styled.ViewRecordContainer recording={recordMeeting?.recording}>
              <Styled.DrawerIcon 
                name={recordMeeting?.recording ? "pause" : "radio-button-checked"} 
                color={recordMeeting?.recording ? Colors.white : "#1C1B1F"} 
                size={24} 
              />
              <Styled.TextRecordContainer recording={recordMeeting?.recording}>
                {recordTitle}
              </Styled.TextRecordContainer>
            </Styled.ViewRecordContainer>
          </Styled.ButtonRecordContainer>
        )}
      </DrawerContentScrollView>
      <Styled.ContainerCustomButtons>
        {!isBreakout && (
          <Styled.ButtonLeaveContainer onPress={onClickShare}>
            <Styled.ViewShareContainer>
              <Styled.DrawerIcon name="share" size={24} color="#1C1B1F" />
              <Styled.TextLeaveContainer>
                {t('mobileSdk.drawer.shareButtonLabel')}
              </Styled.TextLeaveContainer>
            </Styled.ViewShareContainer>
          </Styled.ButtonLeaveContainer>
        )}
        <Styled.ButtonLeaveContainer onPress={leaveSession}>
          <Styled.ViewLeaveContainer>
            <Styled.DrawerIcon name="logout" size={24} color="#1C1B1F" />
            <Styled.TextLeaveContainer>
              {isBreakout ? t('mobileSdk.breakout.leave') : t('app.navBar.settingsDropdown.leaveSessionLabel')}
            </Styled.TextLeaveContainer>
          </Styled.ViewLeaveContainer>
        </Styled.ButtonLeaveContainer>
      </Styled.ContainerCustomButtons>
    </Styled.ViewContainer>
  );
};

export default CustomDrawer;
