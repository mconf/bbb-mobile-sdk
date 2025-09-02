import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import WebView from 'react-native-webview';
import PrimaryButton from '../../components/buttons/primary-button';
import Styled from './styles';

const TransferScreen = (props) => {
  const { transferUrl, onLeaveSession } = props;
  const [joinTransfer, setJoinTransfer] = useState(false);
  const { t } = useTranslation();

  const leaveConference = () => (
    Alert.alert(t('app.leaveModal.title'), t('app.leaveModal.desc'), [
      {
        text: t('app.settings.main.cancel.label'),
        onPress: () => { },
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => { onLeaveSession(); }
      },
    ])
  );

  if (joinTransfer) {
    return (
      <Styled.Container>
        <Styled.Wrapper>
          <WebView
            source={{ uri: transferUrl }}
            allowsFullscreenVideo
            javaScriptEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
          />
        </Styled.Wrapper>
        <Styled.LeaveIconButton onPress={leaveConference} />
      </Styled.Container>
    );
  }

  return (
    <Styled.ContainerView>
      <LottieView
        source={require('../../assets/application/lotties/transfer.json')}
        autoPlay
        loop
        style={{ width: 300, height: 300, left: -5 }}
      />
      <Styled.TitleText>
        {t('mobileSdk.transfer.title')}
      </Styled.TitleText>
      <Styled.SubtitleText>
        {t('mobileSdk.transfer.subtitle')}
      </Styled.SubtitleText>
      <Styled.SubtitleText>
        {t('mobileSdk.transfer.subtitle2')}
      </Styled.SubtitleText>
      <PrimaryButton
        variant="tertiary"
        onPress={() => setJoinTransfer(true)}
      >
        {t('mobileSdk.transfer.button.title')}
      </PrimaryButton>
    </Styled.ContainerView>
  );
};

export default TransferScreen;
