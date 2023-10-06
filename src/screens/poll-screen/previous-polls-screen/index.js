import { KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useOrientation } from '../../../hooks/use-orientation';
import { isPresenter } from '../../../store/redux/slices/current-user';
import ScreenWrapper from '../../../components/screen-wrapper';
import PreviousPollCard from './poll-card';
import Styled from './styles';

const PreviousPollScreen = () => {
  const { t } = useTranslation();
  const orientation = useOrientation();
  const navigation = useNavigation();
  const scrollViewRef = useRef();

  const previousPollPublishedStore = useSelector((state) => state.previousPollPublishedCollection);
  const amIPresenter = useSelector(isPresenter);

  if (Object.keys(previousPollPublishedStore.previousPollPublishedCollection)
    .length === 0) {
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
            <Styled.PressableButton
              onPress={() => navigation.navigate('CreatePollScreen')}
              onPressDisabled={() => Alert.alert(
                t('mobileSdk.poll.createPoll.noPermissionTitle'),
                t('mobileSdk.poll.createPoll.noPermissionSubtitle')
              )}
              disabled={!amIPresenter}
            >
              {t('mobileSdk.poll.createLabel')}
            </Styled.PressableButton>
          </Styled.ButtonContainer>
        </Styled.ContainerCentralizedView>
      </ScreenWrapper>

    );
  }

  const renderMethod = () => {
    return (
      Object.values(
        previousPollPublishedStore.previousPollPublishedCollection
      ).map((pollObj) => <PreviousPollCard pollObj={pollObj} key={pollObj.id} />)
    );
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Styled.ContainerView orientation={orientation}>
          <Styled.ContainerPollCard
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            <Styled.ContainerViewPadding>
              <>
                {renderMethod()}
              </>
            </Styled.ContainerViewPadding>
          </Styled.ContainerPollCard>
        </Styled.ContainerView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default PreviousPollScreen;
