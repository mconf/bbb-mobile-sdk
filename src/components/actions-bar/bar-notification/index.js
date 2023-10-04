import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Styled from './styles';

const NotificationBar = () => {
  const notificationBarStore = useSelector((state) => state.notificationBar);
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);

  const [fadeAnim] = useState(new Animated.Value(0)); // Initialize the opacity to 0
  const [slideAnim] = useState(new Animated.Value(0));
  const { t } = useTranslation();

  useEffect(() => {
    // Configure the fade-in animation
    if (notificationBarStore.isShow) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
    else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }

    if (detailedInfo) {
      Animated.timing(slideAnim, {
        toValue: -100,
        friction: 5,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        friction: 5,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [notificationBarStore.isShow, detailedInfo]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
        translateY: slideAnim,
        width: '100%',
        bottom: 20,
      }}
    >
      <Styled.Container>
        <Styled.NotificationContainer>
          <Styled.TextContainer>
            <Styled.Text>
              {t('mobileSdk.notificationBar.handsUp')}
            </Styled.Text>
          </Styled.TextContainer>
        </Styled.NotificationContainer>
      </Styled.Container>
    </Animated.View>
  );
};

export default NotificationBar;
