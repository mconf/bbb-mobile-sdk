import * as Linking from 'expo-linking';
import { useCallback } from 'react';
import { useSubscription } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Alert, NativeModules, Platform } from 'react-native';
import useMeeting from '../../graphql/hooks/useMeeting';
import WhiteboardScreen from '../../screens/whiteboard-screen';
import {
  setDetailedInfo,
  setFocusedElement,
  setFocusedId,
  setIsFocused,
  setIsPiPEnabled,
  setIsPresentationOpen
} from '../../store/redux/slices/wide-app/layout';
import Styled from './styles';
import Settings from '../../../settings.json';
import Queries from './queries';
import LiveKitScreenshareViewContainer from '../livekit/screenshare';

const ContentArea = (props) => {
  const { style, fullscreen } = props;
  const { PictureInPictureModule } = NativeModules;

  const isPiPEnabled = useSelector((state) => state.layout.isPiPEnabled);
  const { data: currentPageData } = useSubscription(Queries.CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const { data: screenshareData } = useSubscription(Queries.SCREENSHARE_SUBSCRIPTION);
  const { data: meetingData } = useMeeting();
  const { screenShareBridge } = meetingData?.meeting[0] || {};

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const currentSlide = currentPageData?.pres_page_curr[0]?.svgUrl;
  const hasScreenshare = screenshareData?.screenshare.length > 0;
  const isAndroid = Platform.OS === 'android';

  const handleFullscreenClick = () => {
    dispatch(setIsFocused(true));
    dispatch(setFocusedId(hasScreenshare ? 'screenshare' : 'whiteboard'));
    dispatch(setFocusedElement('contentArea'));
    navigation.navigate('FullscreenWrapperScreen');
  };

  const handleMinimizeClick = () => {
    dispatch(setIsPresentationOpen(false));
  };

  const handleEnterPiPClick = async () => {
    PictureInPictureModule.setPictureInPictureEnabled(true);
    try {
      await PictureInPictureModule.enterPictureInPicture();
      dispatch(setIsPiPEnabled(true));
      dispatch(setDetailedInfo(false));
    } catch (error) {
      Alert.alert(t('mobileSdk.pip.permission.title'), t('mobileSdk.pip.permission.subtitle'), [
        {
          text: t('app.settings.main.cancel.label'),
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: t('app.settings.main.label'),
          onPress: () => {
            Linking.openSettings();
          }
        },
      ]);
    }
  };

  // ** Content area views methods **
  const presentationView = () => {
    return (
      <Styled.Presentation
        width="100%"
        height="100%"
        source={{
          uri: currentSlide,
        }}
      />
    );
  };

  const screenshareView = useCallback(() => {
    switch (screenShareBridge) {
      case 'livekit':
        return <LiveKitScreenshareViewContainer />;

      case 'bbb-webrtc-sfu':
      default:
        return <Styled.Screenshare style={style} />;
    }
  }, [screenShareBridge]);

  // ** return methods **
  if (fullscreen) {
    return (
      <>
        {!hasScreenshare && <></>}
        {hasScreenshare && screenshareView()}
      </>
    );
  }

  const renderIcons = () => {
    if (isPiPEnabled) {
      return null;
    }

    return (
      <>
        <Styled.FullscreenIcon
          isScreensharing={hasScreenshare}
          onPress={handleFullscreenClick}
        />
        <Styled.MinimizeIcon
          onPress={handleMinimizeClick}
        />
        {isAndroid && !Settings.dev && (
          <Styled.PIPIcon
            onPress={handleEnterPiPClick}
          />
        )}
      </>
    );
  };

  return (
    <Styled.ContentAreaPressable>
      {!hasScreenshare && presentationView()}
      {hasScreenshare && screenshareView()}
      {renderIcons()}
    </Styled.ContentAreaPressable>

  );
};

export default ContentArea;
