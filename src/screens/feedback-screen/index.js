import React, {
  useCallback, useEffect, useRef, useState
} from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { useSelector } from 'react-redux';
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
const CUSTOM_FEEDBACK_ENABLED = Settings.feedback.custom.enabled;

const FeedbackScreen = () => {
  const title = useEndReason();
  const subtitle = 'Adoraríamos saber como foi sua experiência com a plataforma (opcional).';
  const nextButton = 'Próximo';
  const quitButton = 'Sair da sessão';
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
    if (CUSTOM_FEEDBACK_ENABLED) {
      navigation.navigate('ProblemFeedbackScreen', { payload, meetingData: meetingData.current });
    } else {
      navigation.navigate('EndSessionScreen');
    }
  };

  const sendStarRating = () => {
    const { host, authToken } = meetingData.current;
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
          <Styled.StarsRatingTextContainer>
            <Styled.StarsRatingText>{SLIDER_MINIMUM_VALUE}</Styled.StarsRatingText>
            <Styled.StarsRatingText>{SLIDER_MAXIMUM_VALUE}</Styled.StarsRatingText>
          </Styled.StarsRatingTextContainer>
          <Styled.SliderContainer>
            <Styled.StarsRating
              minimumValue={SLIDER_MINIMUM_VALUE}
              maximumValue={SLIDER_MAXIMUM_VALUE}
              value={rating || SLIDER_INITIAL_VALUE}
              step={1}
              animateTransitions
              thumbImage={require('../../assets/star.png')}
              thumbStyle={Styled.ThumbStyle}
              trackStyle={Styled.TrackStyle}
              minimumTrackTintColor={Colors.blue}
              maximumTrackTintColor={Colors.lightGray100}
              renderAboveThumbComponent={() => (<Styled.ThumbLabel>{rating}</Styled.ThumbLabel>)}
              onValueChange={(value) => setRating(value[0])}
            />
          </Styled.SliderContainer>
        </Styled.StarsRatingContainer>
        <Styled.ButtonContainer>
          <Styled.ConfirmButton
            disabled={noRating()}
            onPress={() => { handleNextButton(); }}
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
