import { useMutation, useSubscription } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { GET_USER_CURRENT, USER_JOIN_MUTATION } from './queries';
import { setConnected, setInitialCurrentUser, setLoggedIn } from '../../store/redux/slices/wide-app/client';
import { disconnectLiveKitRoom } from '../../services/livekit';
import Styled from './styles';

const UserJoinScreen = () => {
  const navigation = useNavigation();
  const [dispatchUserJoin] = useMutation(USER_JOIN_MUTATION);
  const { data, loading, error } = useSubscription(GET_USER_CURRENT);
  const currentUser = data?.user_current[0];

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleDispatchUserJoin = (authToken) => {
    dispatchUserJoin({
      variables: {
        authToken,
        clientType: 'HTML5',
        clientIsMobile: true,
      },
    });
  };

  useEffect(() => {
    if (currentUser) {
      const handleNavigateToFeedbackScreen = (leaveReason) => {
        dispatch(setConnected(false));
        dispatch(setLoggedIn(false));
        disconnectLiveKitRoom({ final: true });
        navigation.navigate('FeedbackScreen', {
          currentUser: {
            ...currentUser,
            leaveReason
          }
        });
      };

      handleDispatchUserJoin(currentUser.authToken);
      dispatch(setInitialCurrentUser(currentUser));
      dispatch(setConnected(true));
      dispatch(setLoggedIn(true));

      if (currentUser.guestStatus === 'WAIT') {
        navigation.navigate('GuestScreen');
      } else if (currentUser?.meeting?.ended) {
        handleNavigateToFeedbackScreen('meetingEnded');
      } else if (currentUser.loggedOut) {
        handleNavigateToFeedbackScreen('loggedOut');
      } else if (currentUser.ejectReasonCode) {
        handleNavigateToFeedbackScreen('ejected');
      } else if (currentUser.joined) {
        navigation.navigate('DrawerNavigator');
      }
    }
  }, [currentUser?.guestStatus, currentUser?.joined, currentUser?.loggedOut]);

  if (!loading && !error) {
    // eslint-disable-next-line no-prototype-builtins
    if (!data?.hasOwnProperty('user_current')
      // eslint-disable-next-line eqeqeq
      || data.user_current.length == 0
    ) {
      return (
        <Text>
          Error: User not found
        </Text>
      );
    }

    return (
      <Styled.ContainerView>
        <Styled.Loading />
        <Styled.TitleText>
          {t('mobileSdk.join.loadingSession.label')}
        </Styled.TitleText>
      </Styled.ContainerView>
    );
  }
};

export default UserJoinScreen;
