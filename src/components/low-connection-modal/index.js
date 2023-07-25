import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Ping from 'react-native-ping';
import Styled from './styles';

const LowConnectionModal = () => {
  const connectionStatus = useSelector((state) => state.client.connectionStatus);
  const [isPingHigh, setIsPingHigh] = useState(false);
  const [currentPing, setCurrentPing] = useState(0);

  const testPing = async () => {
    try {
      const ms = await Ping.start('114.114.114.114', { timeout: 1000 });
      if (ms > 500) {
        setIsPingHigh(true);
        setCurrentPing(ms);
      }
      //console.log(ms);
    } catch (error) {
      setCurrentPing('+5000');
      console.log('special code', error.code, error.message);
    }
  };

  useEffect(() => {
    const pingInterval = setInterval(() => {
      testPing();
    }, 1000);

    return () => {
      clearInterval(pingInterval);
    };
  }, []);

  if (connectionStatus.isInternetReachable && !isPingHigh) {
    return null;
  }

  return (
    <Styled.ContainerCard>
      <Styled.TitleText>
        A sua conexão está ruim
      </Styled.TitleText>
      <Styled.SubtitleText>
        Não se preocupe, nós desativamos seu microfone e sua camera.
      </Styled.SubtitleText>
      <Styled.SubtitleText>
        Melhore o seu sinal de conexão, aproximando-se do roteador.
      </Styled.SubtitleText>
      <Styled.SubtitleText>
        {currentPing}
        ms
      </Styled.SubtitleText>
    </Styled.ContainerCard>
  );
};

export default LowConnectionModal;
