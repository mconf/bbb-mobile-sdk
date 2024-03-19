import React, {
  useCallback, useEffect, useRef, useState
} from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { BackHandler, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import * as Device from 'expo-device';
import axios from 'axios';
import logger from '../../services/logger';
import { selectMeeting } from '../../store/redux/slices/meeting';
import { selectCurrentUser } from '../../store/redux/slices/current-user';
import useEndReason from '../../hooks/use-end-reason';
import Settings from '../../../settings.json';
import Colors from '../../constants/colors';
import Styled from './styles';

const SLIDER_MINIMUM_VALUE = Settings.feedback.minimumScore;
const SLIDER_MAXIMUM_VALUE = Settings.feedback.maximumScore;
const SLIDER_INITIAL_VALUE = Settings.feedback.initialScore;
const POST_ROUTE = Settings.feedback.route;
const APP_IDENTIFIER = Settings.feedback.custom.appIdentifier;
const CUSTOMER_METADATA = Settings.feedback.custom.customerMetadata;
const CUSTOM_FEEDBACK_ENABLED = Settings.feedback.custom.enabled;

const DEVICE_INFORMATION = {
  brand: Device.brand,
  designName: Device.designName,
  name: Device.deviceName,
  yearClass: Device.deviceYearClass,
  manufacturer: Device.manufacturer,
  modelId: Device.modelId,
  modelName: Device.modelName,
  osBuildId: Device.osBuildId,
  osInternalBuildId: Device.osInternalBuildId,
  osName: Device.osName,
  osVersion: Device.osVersion,
  platformApiLevel: Device.platformApiLevel,
  productName: Device.productName,
  suppCpuArch: Device.supportedCpuArchitectures,
  totalMemory: Device.totalMemory
};

const FeedbackScreen = () => {
  const title = useEndReason();
  const { t } = useTranslation();

  const subtitle = t('app.feedback.subtitle');
  const nextButton = t('app.customFeedback.defaultButtons.next');
  const quitButton = t('app.navBar.settingsDropdown.leaveSessionLabel');
  const navigation = useNavigation();
  const [rating, setRating] = useState(undefined);
  const currentMeetingData = useSelector((state) => state.client.meetingData);
  const currentMeeting = useSelector(selectMeeting);
  const currentUser = useSelector(selectCurrentUser);
  const meetingData = useRef(null);
  const user = useRef(null);

  useEffect(() => {
    // Some info are lost after first render
    // it's a bug - the meeting/user data are reset before the feedback
    // ends so we store it as a reference on the first render.
    meetingData.current = currentMeetingData;
    user.current = currentUser;
  }, []);

  // disables android go back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // do nothing
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  const handleNextButton = () => {
    if (noRating()) return;
    sendStarRating();
  };

  const nextScreen = (payload) => {
    if (rating === 10) {
      navigation.navigate('EndSessionScreen');
      return;
    }

    if (CUSTOM_FEEDBACK_ENABLED) {
      navigation.navigate('ProblemFeedbackScreen', { payload, meetingData: meetingData.current });
      return;
    }

    navigation.navigate('EndSessionScreen');
  };

  const buildFeedback = () => {
    const { role, name, intId } = user.current;
    const payload = {
      rating,
      userId: intId,
      userName: name,
      authToken,
      meetingId: currentMeeting?.meetingProp?.intId,
      comment: '',
      userRole: role,
    };
    const {
      authToken,
      confname,
      metadata = {},
    } = meetingData.current;

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
        session_name: confname,
        institution_name: metadata.name,
        institution_guid: metadata[CUSTOMER_METADATA.guid],
        session_id: payload.meetingId,
      },
      device: {
        type: getDeviceType(),
        os: Platform.OS,
        browser: APP_IDENTIFIER,
        nativeAppDeviceInformation: {
          brand: DEVICE_INFORMATION.brand,
          designName: DEVICE_INFORMATION.designName,
          name: DEVICE_INFORMATION.deviceName,
          yearClass: DEVICE_INFORMATION.deviceYearClass,
          manufacturer: DEVICE_INFORMATION.manufacturer,
          modelId: DEVICE_INFORMATION.modelId,
          modelName: DEVICE_INFORMATION.modelName,
          osBuildId: DEVICE_INFORMATION.osBuildId,
          osInternalBuildId: DEVICE_INFORMATION.osInternalBuildId,
          osName: DEVICE_INFORMATION.osName,
          osVersion: DEVICE_INFORMATION.osVersion,
          platformApiLevel: DEVICE_INFORMATION.platformApiLevel,
          productName: DEVICE_INFORMATION.productName,
          suppCpuArch: DEVICE_INFORMATION.supportedCpuArchitectures,
          totalMemory: DEVICE_INFORMATION.totalMemory
        },
      },
      user: {
        name: payload.userName,
        id: payload.userId,
        role: payload.userRole,
      },
      feedback: 'Incomplete feedback',
    };

    return feedback;
  };

  const sendStarRating = () => {
    const payload = buildFeedback();
    const { host } = meetingData.current;
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
    nextScreen(payload);
  };

  const noRating = () => rating === undefined;

  return (
    <Styled.ContainerView>
      <Styled.ContainerFeedbackCard>
        <Styled.Title>{title}</Styled.Title>
        <Styled.Subtitle>{subtitle}</Styled.Subtitle>
        <Styled.StarsRatingContainer>
          <Styled.SliderContainer>
            <Styled.StarsRating
              minimumValue={SLIDER_MINIMUM_VALUE}
              maximumValue={SLIDER_MAXIMUM_VALUE}
              value={rating || SLIDER_INITIAL_VALUE}
              step={1}
              animateTransitions
              thumbImage={require('../../assets/application/star.png')}
              thumbStyle={Styled.ThumbStyle}
              trackStyle={Styled.TrackStyle}
              minimumTrackTintColor={Colors.blue}
              maximumTrackTintColor={Colors.white}
              renderAboveThumbComponent={
                () => (
                  <Styled.ThumbContainer>
                    <Styled.ThumbLabel>
                      {rating || 5}
                    </Styled.ThumbLabel>
                  </Styled.ThumbContainer>
                )
              }
              onValueChange={(value) => setRating(value[0])}
            />
          </Styled.SliderContainer>
          <Styled.StarsRatingTextContainer>
            <Styled.StarsRatingText>{SLIDER_MINIMUM_VALUE}</Styled.StarsRatingText>
            <Styled.StarsRatingText>{SLIDER_MAXIMUM_VALUE}</Styled.StarsRatingText>
          </Styled.StarsRatingTextContainer>
        </Styled.StarsRatingContainer>
        <Styled.ButtonContainer>
          <Styled.ConfirmButton
            disabled={noRating()}
            onPress={handleNextButton}
          >
            {nextButton}
          </Styled.ConfirmButton>
        </Styled.ButtonContainer>
        <Styled.QuitSessionButtonContainer>
          <Styled.QuitSessionButton onPress={() => { navigation.navigate('EndSessionScreen'); }}>{quitButton}</Styled.QuitSessionButton>
        </Styled.QuitSessionButtonContainer>
      </Styled.ContainerFeedbackCard>
    </Styled.ContainerView>
  );
};

export default FeedbackScreen;
