import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerItemList } from '@react-navigation/drawer';
import { useOrientation } from '../../hooks/use-orientation';
import { setExpandActionsBar } from '../../store/redux/slices/wide-app/layout';
import { setProfile } from '../../store/redux/slices/wide-app/modal';
import useCurrentUser from '../../graphql/hooks/useCurrentUser';
import logger from '../../services/api';
import Settings from '../../../settings.json';
import Queries from './queries';
import Styled from './styles';
import BBBLiveKitRoom from '../livekit';
import useMeeting from '../../graphql/hooks/useMeeting';

const CustomDrawer = (props) => {
  const { meetingUrl, navigation } = props;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { data } = useCurrentUser();
  const { data: meetingData } = useMeeting();
  const [dispatchLeaveSession] = useMutation(Queries.USER_LEAVE_MEETING);
  const { t } = useTranslation();

  const currentUser = data?.user_current[0];
  const isBreakoutRoom = meetingData?.meeting[0]?.isBreakout;
  const isLandscape = useOrientation() === 'LANDSCAPE';

  const leaveSession = () => {
    if (isBreakoutRoom) {
      navigation.navigate('EndSessionScreen');
    } else {
      dispatchLeaveSession();
    };
  };

  const onClickFeatureNotImplemented = () => {
    dispatch(setProfile({ profile: 'not_implemented' }));
    navigation.closeDrawer();
  };

  const onClickAudioSelector = () => {
    dispatch(setExpandActionsBar(true));
    navigation.closeDrawer();
  };

  const onClickShare = async () => {
    try {
      await Share.share({
        message: meetingUrl,
      });
    } catch (error) {
      logger.error({
        logCode: 'error_sharing_link',
        extraInfo: { error },
      }, `Exception thrown while clicking to share meeting_url: ${error}`);
    }
  };

  const renderBottomDrawerItems = () => (
    <>
      <Styled.DrawerItemBottom
        label={t('mobileSdk.audio.deviceSelector.title')}
        onPress={onClickAudioSelector}
        iconName="bluetooth-audio"
      />
      {!isBreakoutRoom && meetingUrl && (
        <Styled.DrawerItemBottom
          label={t('mobileSdk.drawer.shareButtonLabel')}
          onPress={onClickShare}
          iconName="share"
        />
      )}
      <Styled.DrawerItemBottom
        label={isBreakoutRoom
          ? t('mobileSdk.breakout.leave')
          : t('app.navBar.settingsDropdown.leaveSessionLabel')}
        onPress={leaveSession}
        iconName="logout"
      />
    </>
  );

  const renderNotImplementedItem = () => (
    <Styled.DrawerItemNotImplemented
      label={t('app.actionsBar.actionsDropdown.streamOptions')}
      onPress={onClickFeatureNotImplemented}
      iconName="connected-tv"
    />
  );

  return (
    <Styled.ViewContainer>
      <Styled.CustomDrawerContainer topInset={insets.top}>
        <Styled.UserAvatarDrawer currentUser={currentUser} />
        <Styled.NameUserAvatar numberOfLines={1}>
          {currentUser?.name}
        </Styled.NameUserAvatar>
      </Styled.CustomDrawerContainer>
      <Styled.DrawerScrollView {...props}>
        <Styled.ContainerDrawerItemList>
          <DrawerItemList {...props} />
          {Settings.showNotImplementedFeatures && renderNotImplementedItem()}
          {isLandscape && renderBottomDrawerItems()}
        </Styled.ContainerDrawerItemList>
      </Styled.DrawerScrollView>
      <Styled.ContainerCustomBottomButtons>
        {!isLandscape && renderBottomDrawerItems()}
      </Styled.ContainerCustomBottomButtons>
      <BBBLiveKitRoom />
    </Styled.ViewContainer>
  );
};

export default CustomDrawer;
