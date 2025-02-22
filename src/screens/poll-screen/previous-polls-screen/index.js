import { KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { useSubscription } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import { useOrientation } from '../../../hooks/use-orientation';
import { setProfile } from '../../../store/redux/slices/wide-app/modal';
import ScreenWrapper from '../../../components/screen-wrapper';
import PreviousPollCard from './poll-card';
import Styled from './styles';
import useCurrentPoll from '../../../graphql/hooks/useCurrentPoll';
import usePublishedPolls from '../../../graphql/hooks/usePublishedPolls';
import Queries from '../queries';

const PreviousPollScreen = () => {
  const { t } = useTranslation();
  const orientation = useOrientation();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { data: allPollsData } = useSubscription(Queries.ALL_POLLS_SUBSCRIPTION);
  const { data: currentUserData } = useCurrentUser();
  const { data: pollActiveData } = useCurrentPoll();
  const { data: publishedPollsData } = usePublishedPolls();

  const hasPublishedPolls = publishedPollsData?.poll?.length > 0;

  const allPolls = allPollsData?.poll;
  const hasCurrentPoll = pollActiveData?.poll?.length > 0;
  const amIPresenter = currentUserData?.user_current[0]?.presenter;

  const renderCreatePollButtonView = () => {
    if (hasCurrentPoll) {
      return;
    }

    return (
      <Styled.PressableButton
        onPress={() => navigation.navigate('CreatePollScreen')}
        onPressDisabled={() => dispatch(
          setProfile({
            profile: 'create_poll_permission',
          })
        )}
        disabled={!amIPresenter}
      >
        {t('mobileSdk.poll.createLabel')}
      </Styled.PressableButton>
    );
  };

  if (!hasPublishedPolls && !hasCurrentPoll) {
    return (
      <ScreenWrapper>
        <Styled.ContainerCentralizedView>
          <Styled.NoPollsImage
            source={require('../../../assets/application/service-off.png')}
            resizeMode="contain"
            style={{ width: 173, height: 130 }}
          />
          <Styled.NoPollsLabelTitle>
            {t('mobileSdk.poll.noPollsTitle')}
          </Styled.NoPollsLabelTitle>
          <Styled.NoPollsLabelSubtitle>
            {t('mobileSdk.poll.noPollsSubtitle')}
          </Styled.NoPollsLabelSubtitle>
          <Styled.ButtonContainer>
            {renderCreatePollButtonView()}
          </Styled.ButtonContainer>
        </Styled.ContainerCentralizedView>
      </ScreenWrapper>
    );
  }

  const renderMethod = () => {
    return (
      allPolls?.map(
        (pollObj) => (
          <PreviousPollCard
            pollObj={pollObj}
            key={pollObj.pollId}
            amIPresenter={amIPresenter}
          />
        )
      )
    );
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Styled.ContainerView orientation={orientation}>
          <Styled.ContainerPollScrollView>
            <Styled.ContainerViewPadding>
              <>
                {renderMethod()}
              </>
            </Styled.ContainerViewPadding>
          </Styled.ContainerPollScrollView>
          <Styled.ButtonFlyingContainer>
            {renderCreatePollButtonView()}
          </Styled.ButtonFlyingContainer>
        </Styled.ContainerView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default PreviousPollScreen;
