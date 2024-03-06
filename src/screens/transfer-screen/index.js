import React, { useState } from 'react';
import WebView from 'react-native-webview';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import Styled from './styles';

const TransferScreen = (props) => {
  const { transferUrl } = props;
  const [joinTransfer, setJoinTransfer] = useState(false);
  const { t } = useTranslation();

  if (joinTransfer) {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: transferUrl }}
          allowsFullscreenVideo
          javaScriptEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
        />
      </View>
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
      <Styled.PressableButton
        onPress={() => setJoinTransfer(true)}
      >
        {t('mobileSdk.transfer.button.title')}
      </Styled.PressableButton>
    </Styled.ContainerView>
  );
};

export default TransferScreen;
