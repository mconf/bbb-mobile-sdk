import React, {
  useCallback, useState
} from 'react';
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { PORTRAIT, OrientationLocker } from 'react-native-orientation-locker';
import { useTranslation } from 'react-i18next';
import { BackHandler, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import * as Device from 'expo-device';
import axios from 'axios';
import logger from '../../services/logger';
import useAppState from '../../hooks/use-app-state';
import PiPView from './pip-view';
import Settings from '../../../settings.json';
import Styled from './styles';
import Service from './service';
import { useSubscription } from '@apollo/client';
import { GET_USER_CURRENT } from '../user-join-screen/queries';

const POST_ROUTE = Settings.feedback.route;
const APP_IDENTIFIER = Settings.feedback.custom.appIdentifier;
// const CUSTOMER_METADATA = Settings.feedback.custom.customerMetadata;

const FeedbackScreen = (props) => {
  const { t } = useTranslation();
  const leaveReason = props?.route?.params?.currentUser?.leaveReason;
  const title = t(Service.parseEndReason(leaveReason));
  const navigation = useNavigation();
  const [rating, setRating] = useState(undefined);
  const isPiPEnabled = useSelector((state) => state.layout.isPiPEnabled);
  const appState = useAppState();

  const { data: user } = useSubscription(GET_USER_CURRENT);
  const logoutUrl = user?.user_current[0]?.meeting?.logoutUrl;
  const meetingData = user?.user_current[0]?.meeting;
  const userData = user?.user_current[0];
  const isAndroid = Platform.OS === 'android';
  const isBackgrounded = appState === 'background';

  // disables android go back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  const handleNextButton = () => {
    sendStarRating();
  };

  const nextScreen = (payload, host) => {
    navigation.navigate('ProblemFeedbackScreen', { payload, host, meetingData });
  };

  const buildFeedback = (host) => {
    const payload = {
      rating,
      userId: userData?.userId,
      meetingId: meetingData?.meetingId,
      comment: '',
      // userRole: role, // TODO: get the user role before leaving the meeting using redux or route...
    };
    // const {
    //   metadata = {},
    // } = meetingData;

    const getDeviceType = () => {
      if (Platform.OS === 'ios') {
        return Platform.constants.interfaceIdiom;
      }
      return Platform.constants.uiMode;
    };

    const feedback = {
      timestamp: new Date().toISOString(),
      rating,
      session: {
        sessionName: meetingData?.name,
        // institution_name: metadata.name,
        // institution_guid: metadata[CUSTOMER_METADATA.guid],
        institutionName: host,
        institutionGuid: meetingData?.name,
        sessionId: payload.meetingId,
      },
      device: {
        type: getDeviceType(),
        os: Platform.OS,
        browser: APP_IDENTIFIER,
        nativeAppDeviceInformation: {
          ...Device,
          appVersion: nativeApplicationVersion,
          appBuildNumber: parseInt(nativeBuildVersion, 10) || 0,
        },
      },
      user: {
        name: payload.userName,
        userId: payload.userId,
        // role: payload.userRole,
      },
      feedback: {
        incomplete: 'Incomplete Feedback'
      },
    };

    return feedback;
  };

  const sendStarRating = () => {
    const url = new URL(logoutUrl);
    const host = url.hostname;
    const payload = buildFeedback(host);

    // sends partial feedback
    axios.post(`https://${host}${POST_ROUTE}`, payload).catch((e) => {
      logger.warn({
        logCode: 'app_user_feedback_not_sent_error',
        extraInfo: {
          errorName: e.name,
          errorMessage: e.message,
        },
      }, `Unable to send feedback: ${e.message}`);
    });
    nextScreen(payload, host);
  };

  if (isBackgrounded && isAndroid && isPiPEnabled) {
    return (
      <PiPView />
    );
  }

  return (
    <Styled.ContainerView>
      <Styled.ContainerFeedbackCard>
        <Styled.Title>{title}</Styled.Title>
        <Styled.Subtitle>{t('app.feedback.subtitle')}</Styled.Subtitle>
        <Styled.StarsRatingContainer>
          <Styled.SliderContainer>
            <Styled.StarRatingComponent
              value={rating}
              onValueChange={(value) => setRating(value[0])}
            />
          </Styled.SliderContainer>
          <Styled.StarsRatingTextContainer>
            <Styled.StarsRatingText>{1}</Styled.StarsRatingText>
            <Styled.StarsRatingText>{10}</Styled.StarsRatingText>
          </Styled.StarsRatingTextContainer>
        </Styled.StarsRatingContainer>
        <Styled.ButtonContainer>
          <Styled.ConfirmButton
            disabled={rating === undefined || rating === 0}
            onPress={handleNextButton}
          >
            {t('app.customFeedback.defaultButtons.next')}
          </Styled.ConfirmButton>
        </Styled.ButtonContainer>
        <Styled.QuitSessionButtonContainer>
          <Styled.QuitSessionButton
            onPress={() => navigation.navigate('EndSessionScreen')}
          >
            {t('app.navBar.settingsDropdown.leaveSessionLabel')}
          </Styled.QuitSessionButton>
        </Styled.QuitSessionButtonContainer>
      </Styled.ContainerFeedbackCard>
      <OrientationLocker orientation={PORTRAIT} />
    </Styled.ContainerView>
  );
};

export default FeedbackScreen;
