import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  PERSISTENT_PROFILES,
  dismissNotification,
} from '../../store/redux/slices/wide-app/notification-bar';
import Colors from '../../constants/colors';
import Styled from './styles';

const NotificationBar = () => {
  const notificationBarStore = useSelector((state) => state.notificationBar);
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);

  const [fadeAnim] = useState(new Animated.Value(0)); // Initialize the opacity to 0
  const [slideAnim] = useState(new Animated.Value(0));
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isDismissible = PERSISTENT_PROFILES.includes(notificationBarStore.profile);

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

  if (!notificationBarStore.isShow) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
        translateY: slideAnim,
        width: '100%',
        bottom: 20,
      }}
    >
      <Styled.Container pointerEvents="box-none">
        <Styled.NotificationContainer>
          <Styled.TextContainer>
            <Styled.Text>
              {t(`${notificationBarStore.text}`)}
            </Styled.Text>
          </Styled.TextContainer>
          {isDismissible && (
            <Styled.DismissButton
              icon="close"
              iconColor={Colors.white}
              size={16}
              accessibilityLabel={t('app.modal.close')}
              onPress={() => dispatch(dismissNotification(notificationBarStore.profile))}
            />
          )}
        </Styled.NotificationContainer>
      </Styled.Container>
    </Animated.View>
  );
};

export default NotificationBar;
