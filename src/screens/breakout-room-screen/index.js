import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { useOrientation } from '../../hooks/use-orientation';
import AudioManager from '../../services/webrtc/audio-manager';
import VideoManager from '../../services/webrtc/video-manager';
import { disconnectLiveKitRoom } from '../../services/livekit';
import ScreenWrapper from '../../components/screen-wrapper';
import UtilsService from '../../utils/functions';
import Styled from './styles';
import ExpandedCard from '../../components/expandable-card';
import { useSubscription, useMutation } from '@apollo/client';
import {
  BREAKOUT_ROOM_SUBSCRIPTION,
  BREAKOUT_ROOM_REQUEST_JOIN_URL,
  FIRST_BREAKOUT_DURATION_DATA_SUBSCRIPTION
} from './queries.js'
import { setMainRoomBlockedByBreakout } from '../../store/redux/slices/wide-app/client';

const DEVICE_HEIGHT = parseInt(Dimensions.get("window").height, 10);
const DEVICE_WIDTH = parseInt(Dimensions.get("window").width, 10);

//TODO: move breakoutTimeRemaining to a component
const BreakoutRoomScreen = () => {
  const dispatch = useDispatch();
  const localCameraId = useSelector((state) => state.video.localCameraId);
  const [time, setTime] = useState(-100);
  const [requestedUrl, setRequestedUrl] = useState(false);

  const {
    data: breakoutData,
    loading: breakoutLoading,
    error: breakoutError,
  } = useSubscription(BREAKOUT_ROOM_SUBSCRIPTION);
  const {
    data: breakoutTimeData,
    loading: breakoutTimeLoading,
    error: breakoutTimeError,
  } = useSubscription(FIRST_BREAKOUT_DURATION_DATA_SUBSCRIPTION);
  const [dispatchRequestJoinUrl] = useMutation(BREAKOUT_ROOM_REQUEST_JOIN_URL);

  const breakoutRoom = breakoutData?.breakoutRoom || [];
  const hasBreakouts = breakoutRoom?.length !== 0;
  const breakoutDuration = breakoutTimeData?.breakoutRoom[0]?.durationInSeconds;
  const breakoutStartedAt = breakoutTimeData?.breakoutRoom[0]?.startedAt;
  const breakoutStartedTime = new Date(breakoutStartedAt).getTime();
  const endTime = breakoutStartedTime + breakoutDuration * 1000;
  const breakoutTimeRemaining = Math.max(
    0,
    Math.floor((endTime - Date.now()) / 1000),
  );

  const orientation = useOrientation();
  const navigation = useNavigation();
  const { t } = useTranslation();

  useEffect(() => {
    if (!breakoutLoading) {
      if (breakoutError) {
        console.error("BreakoutError: ", breakoutError);
      }
    }
  }, [breakoutData, breakoutLoading, breakoutError]);

  useEffect(() => {
    if (!breakoutTimeLoading) {
      if (breakoutTimeError) {
        console.error("BreakoutTimeError: ", breakoutTimeError);
      }
    }
  }, [breakoutTimeData, breakoutTimeLoading, breakoutTimeError]);

  useFocusEffect(
    useCallback(() => {
      setTime(breakoutTimeRemaining);
    }, [breakoutTimeRemaining]),
  );

  useFocusEffect(
    useCallback(() => {
      let interval;

      if (time <= -100) return;

      if (hasBreakouts) {
        setTime(-100);
        interval = setInterval(() => {
          setTime((prevTime) => prevTime - 1);
        }, 1000);
      } else {
        clearInterval(interval);
      }

      return () => {
        clearInterval(interval);
      };
    }, [hasBreakouts]),
  );

  const handleDispatchRequestJoinUrl = (breakoutRoomId) => {
    dispatchRequestJoinUrl({
      variables: {
        breakoutRoomId,
      },
    });
  };

  // ***** FUNCTIONS *****

  const joinSession = (breakoutRoomJoinUrl) => {
    console.log(breakoutRoomJoinUrl);
  };

  const handleJoinButton = (breakoutId, breakoutRoomJoinUrl) => {
    if (!breakoutRoomJoinUrl) {
      setRequestedUrl(true);
      handleDispatchRequestJoinUrl(breakoutId);
      setTimeout(() => setRequestedUrl(false), 3000);
    } else {
      joinSession(breakoutRoomJoinUrl);
    }
  };

  // ***** RENDER FUNCTIONS *****

  const renderUsersJoinedMiniAvatar = (participants) => {
    return (
      <Styled.MiniAvatarsContainer participantsCount={participants.length}>
        {participants.slice(0, 3).map((item, idx) => (
          // the userId in breakout room has a -\S+/ after the original userId
          <Styled.MiniAvatar
            userName={item.user.name}
            mini
            userId={item.userId.replace(/-\S+/, "")}
            key={item.userId + idx}
          />
        ))}
      </Styled.MiniAvatarsContainer>
    );
  };

  const renderItem = ({ item }) => {
    return (
      <Styled.Card>
        <ExpandedCard
          content={
            <>
              <Styled.ShortName>{item.shortName}</Styled.ShortName>
              <Styled.ParticipantsContainer>
                {renderUsersJoinedMiniAvatar(item.participants)}
                <Styled.ParticipantsCount>
                  {`${item.participants.length} ${t("mobileSdk.breakout.participantsLabel")}`}
                </Styled.ParticipantsCount>
              </Styled.ParticipantsContainer>
            </>
          }
          expandedContent={
            <>
              <Styled.DividerTinyBottom />
              {item.participants.map((user, idx) => {
                return (
                  <Styled.ParticipantsContainerExpandable
                    key={user.userId + idx}
                  >
                    {/* // the userId in breakout room has a -\S+/ after the original userId */}
                    <Styled.MiniAvatar
                      userName={user.user.name}
                      mini
                      userId={user.userId.replace(/-\S+/, "")}
                    />
                    <Styled.UserNameText>{user.user.name}</Styled.UserNameText>
                  </Styled.ParticipantsContainerExpandable>
                );
              })}

              <Styled.ButtonContainer>
                <Styled.JoinBreakoutButton
                  onPress={() =>
                    handleJoinButton(item.breakoutRoomId, item.joinURL)
                  }
                  loading={requestedUrl}
                >
                  {item.joinURL
                    ? t("mobileSdk.breakout.join")
                    : t("mobileSdk.breakout.askToJoin")}
                </Styled.JoinBreakoutButton>
              </Styled.ButtonContainer>
            </>
          }
          // 30px for each participant and 90 for the button
          expandableHeight={item.participants.length * 30 + 90}
        />
      </Styled.Card>
    );
  };

  const renderBreakoutRoomsView = () => {
    if (breakoutRoom?.length === 0) {
      return;
    }

    return (
      <Styled.FlatList
        data={breakoutRoom?.sort((a, b) => a.sequence - b.sequence)}
        renderItem={renderItem}
      />
    );
  };

  // review this...
  const renderBreakoutTimeClock = () => {
    if (time <= -100) {
      return t('mobileSdk.breakout.starting');
    }
    if (time <= 0) {
      return t('mobileSdk.breakout.finishing');
    }
    return UtilsService.humanizeSecondsWithHours(time);
  };

  const renderBreakoutDurationCard = () => {
    return (
      <>
        <Styled.CardView>
          <Styled.BreakoutRoomDurationLabel>
            {t('mobileSdk.breakout.durationLabel')}
          </Styled.BreakoutRoomDurationLabel>
          <Styled.NumberTimerLabel>
            {renderBreakoutTimeClock()}
          </Styled.NumberTimerLabel>
        </Styled.CardView>
        <Styled.DividerBottom />
      </>
    );
  };

  if (breakoutLoading) {
    return (
      <Styled.BreakoutsSkeletonLoading
        DEVICE_HEIGHT={DEVICE_HEIGHT - 60}
        DEVICE_WIDTH={DEVICE_WIDTH}
      />
    );
  } else if (!hasBreakouts && !breakoutLoading) {
    return (
      <ScreenWrapper>
        <Styled.ContainerCentralizedView>
          <Styled.NoBreakoutsImage
            source={require("../../assets/application/service-off.png")}
            resizeMode="contain"
            style={{ width: 173, height: 130 }}
          />
          <Styled.NoBreakoutsLabelTitle>
            {t("mobileSdk.breakout.noBreakoutsTitle")}
          </Styled.NoBreakoutsLabelTitle>
          <Styled.NoBreakoutsLabelSubtitle>
            {t("mobileSdk.breakout.noBreakoutsSubtitle")}
          </Styled.NoBreakoutsLabelSubtitle>
        </Styled.ContainerCentralizedView>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Styled.ContainerView orientation={orientation}>
        {renderBreakoutDurationCard()}
        {renderBreakoutRoomsView()}
      </Styled.ContainerView>
    </ScreenWrapper>
  );
};

export default BreakoutRoomScreen;
