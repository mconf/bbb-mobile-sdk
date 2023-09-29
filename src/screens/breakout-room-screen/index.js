import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { selectCurrentUserId } from '../../store/redux/slices/current-user';
import { useOrientation } from '../../hooks/use-orientation';
import AudioManager from '../../services/webrtc/audio-manager';
import VideoManager from '../../services/webrtc/video-manager';
import ScreenWrapper from '../../components/screen-wrapper';
import BreakoutRoomService from './service';
import UtilsService from '../../utils/functions';
import Styled from './styles';
import ExpandedCard from '../../components/expandable-card';

const BreakoutRoomScreen = () => {
  const breakoutsStore = useSelector((state) => state.breakoutsCollection);
  const breakoutTimeRemaining = useSelector((state) => state.breakoutsCollection.timeRemaining);
  const currentUserId = useSelector(selectCurrentUserId);
  const localCameraId = useSelector((state) => state.video.localCameraId);

  const [breakoutsList, setBreakoutsList] = useState([]);
  const [requestedUrl, setRequestedUrl] = useState(false);
  const [time, setTime] = useState(0);

  const orientation = useOrientation();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const hasBreakouts = breakoutsList?.length !== 0;

  // ***** REACT LIFECYCLE FUNCTIONS *****

  // this useEffect handles the breakout timer
  useFocusEffect(
    useCallback(() => {
      let interval;

      if (hasBreakouts) {
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

  // this useEffect handles the breakout timer
  useFocusEffect(
    useCallback(() => {
      setTime(breakoutTimeRemaining);
    }, [breakoutTimeRemaining]),
  );

  useFocusEffect(
    useCallback(() => {
      setBreakoutsList(Object.values(breakoutsStore.breakoutsCollection)
        .map((filteredItem) => {
          return {
            shortName: filteredItem.shortName,
            breakoutId: filteredItem.breakoutId,
            joinedUsers: filteredItem.joinedUsers,
            timeRemaining: filteredItem.timeRemaining,
            sequence: filteredItem.sequence,
            breakoutRoomJoinUrl: filteredItem[`url_${currentUserId}`]?.redirectToHtml5JoinURL
          };
        }));
    }, [breakoutsStore]),
  );

  // ***** FUNCTIONS *****

  const joinSession = (breakoutRoomJoinUrl) => {
    AudioManager.exitAudio();
    VideoManager.unpublish(localCameraId);
    navigation.navigate('InsideBreakoutRoomScreen', { joinUrl: breakoutRoomJoinUrl });
  };

  const handleJoinButton = (breakoutId, breakoutRoomJoinUrl) => {
    if (!breakoutRoomJoinUrl) {
      setRequestedUrl(true);
      BreakoutRoomService.requestJoinURL(breakoutId);
      setTimeout(() => setRequestedUrl(false), 3000);
    } else {
      joinSession(breakoutRoomJoinUrl);
    }
  };

  // ***** RENDER FUNCTIONS *****

  const renderUsersJoinedMiniAvatar = (joinedUsers) => {
    return (
      <Styled.MiniAvatarsContainer participantsCount={joinedUsers.length}>
        {
          joinedUsers.slice(0, 3).map((item, idx) => (
            // the userId in breakout room has a -\S+/ after the original userId
            <Styled.MiniAvatar userName={item.name} mini userId={item.userId.replace(/-\S+/, '')} key={item.userId + idx} />
          ))
        }
      </Styled.MiniAvatarsContainer>
    );
  };

  const renderItem = ({ item }) => {
    return (
      <Styled.Card>
        <ExpandedCard
          content={(
            <>
              <Styled.ShortName>{item.shortName}</Styled.ShortName>
              <Styled.ParticipantsContainer>
                {renderUsersJoinedMiniAvatar(item.joinedUsers)}
                <Styled.ParticipantsCount>
                  {`${item.joinedUsers.length} ${t('mobileSdk.breakout.participantsLabel')}`}
                </Styled.ParticipantsCount>
              </Styled.ParticipantsContainer>
            </>
            )}
          expandedContent={(
            <>
              <Styled.DividerTinyBottom />
              {item.joinedUsers.map((user, idx) => {
                return (
                  <Styled.ParticipantsContainerExpandable key={user.userId + idx}>
                    {/* // the userId in breakout room has a -\S+/ after the original userId */}
                    <Styled.MiniAvatar userName={user.name} mini userId={user.userId.replace(/-\S+/, '')} />
                    <Styled.UserNameText>{user.name}</Styled.UserNameText>
                  </Styled.ParticipantsContainerExpandable>
                );
              })}

              <Styled.ButtonContainer>
                <Styled.JoinBreakoutButton
                  onPress={() => handleJoinButton(item.breakoutId, item.breakoutRoomJoinUrl)}
                  loading={requestedUrl}
                >
                  {item.breakoutRoomJoinUrl ? 'Entrar' : 'Pedir para entrar'}
                </Styled.JoinBreakoutButton>
              </Styled.ButtonContainer>
            </>
          )}
          // 30px for each participant and 90 for the button
          expandableHeight={item.joinedUsers.length * 30 + 90}
        />
      </Styled.Card>
    );
  };

  const renderBreakoutRoomsView = () => {
    if (breakoutsList?.length === 0) {
      return;
    }

    return (
      <Styled.FlatList
        data={breakoutsList.sort((a, b) => a.sequence - b.sequence)}
        renderItem={renderItem}
        keyExtractor={(item) => item.breakoutId}
      />
    );
  };

  const renderBreakoutDurationCard = () => {
    return (
      <>
        <Styled.CardView>
          <Styled.BreakoutRoomDurationLabel>
            {t('mobileSdk.breakout.durationLabel')}
          </Styled.BreakoutRoomDurationLabel>
          <Styled.NumberTimerLabel>
            {UtilsService.humanizeSeconds(time)}
          </Styled.NumberTimerLabel>
        </Styled.CardView>
        <Styled.DividerBottom />
      </>
    );
  };

  if (!hasBreakouts) {
    return (
      <ScreenWrapper>
        <Styled.ContainerCentralizedView>
          <Styled.NoBreakoutsImage
            source={require('../../assets/service-off.png')}
            resizeMode="contain"
            style={{ width: 173, height: 130 }}
          />
          <Styled.NoBreakoutsLabelTitle>
            {t('mobileSdk.breakout.noBreakoutsTitle')}
          </Styled.NoBreakoutsLabelTitle>
          <Styled.NoBreakoutsLabelSubtitle>
            {t('mobileSdk.breakout.noBreakoutsSubtitle')}
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
