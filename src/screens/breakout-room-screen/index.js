import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Menu, Provider } from 'react-native-paper';
import { selectCurrentUserId } from '../../store/redux/slices/current-user';
import { setBreakoutData } from '../../store/redux/slices/wide-app/client';
import { useOrientation } from '../../hooks/use-orientation';
import AudioManager from '../../services/webrtc/audio-manager';
import VideoManager from '../../services/webrtc/video-manager';
import ScreenWrapper from '../../components/screen-wrapper';
import BreakoutRoomService from './service';
import UtilsService from '../../utils/functions';
import Styled from './styles';

const BreakoutRoomScreen = () => {
  const orientation = useOrientation();
  const breakoutsStore = useSelector((state) => state.breakoutsCollection);
  const breakoutTimeRemaining = useSelector((state) => state.breakoutsCollection.timeRemaining);
  const currentUserId = useSelector(selectCurrentUserId);
  const localCameraId = useSelector((state) => state.video.localCameraId);
  const meetingData = useSelector((state) => state.client.meetingData);

  const [showMenu, setShowMenu] = useState(false);
  const [selectedBreakout, setSelectedBreakout] = useState({});
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [breakoutsList, setBreakoutsList] = useState([]);
  const [time, setTime] = useState(0);

  const hasBreakouts = breakoutsList?.length !== 0;

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  // ***** REACT LIFECYCLE FUNCTIONS *****

  // this useEffect handles the breakout timer
  useFocusEffect(
    useCallback(() => {
      let interval;

      if (hasBreakouts) {
        interval = setInterval(() => {
          setTime((prevTime) => prevTime - 1);
        }, 1050);
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
            breakoutRoomJoinUrl: filteredItem[`url_${currentUserId}`]?.redirectToHtml5JoinURL
          };
        }));
    }, [breakoutsStore]),
  );

  // ***** FUNCTIONS *****

  const onIconPress = (event, item) => {
    const { nativeEvent } = event;
    const anchor = {
      x: nativeEvent.pageX,
      y: nativeEvent.pageY - 150,
    };

    setSelectedBreakout(item);
    setMenuAnchor(anchor);
    setShowMenu(true);
  };

  const onClickJoinSession = () => {
    setShowMenu(false);
    AudioManager.exitAudio();
    VideoManager.unpublish(localCameraId);
    dispatch(setBreakoutData({ parentMeetingJoinUrl: meetingData.joinUrl }));
    navigation.navigate('InsideBreakoutRoomScreen', { joinUrl: selectedBreakout.breakoutRoomJoinUrl });
  };

  // ***** RENDER FUNCTIONS *****

  const renderMenuView = () => {
    return (
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={menuAnchor}
      >
        {selectedBreakout.breakoutRoomJoinUrl && (
        <Menu.Item
          onPress={onClickJoinSession}
          title={t('app.createBreakoutRoom.join')}
        />
        )}
        {!selectedBreakout.breakoutRoomJoinUrl && (
          <Menu.Item
            onPress={() => {
              setShowMenu(false);
              BreakoutRoomService.requestJoinURL(selectedBreakout.breakoutId);
            }}
            title={t('app.createBreakoutRoom.askToJoin')}
          />
        )}
      </Menu>
    );
  };

  const renderUsersJoinedMiniAvatar = (joinedUsers) => {
    return (
      <Styled.MiniAvatarsContainer participantsCount={joinedUsers.length}>
        {
          joinedUsers.slice(0, 3).map((item) => (
            // the userId in breakout room has a -\S+/ after the original userId
            <Styled.MiniAvatar userName={item.name} mini userId={item.userId.replace(/-\S+/, '')} />
          ))
        }
      </Styled.MiniAvatarsContainer>
    );
  };

  const renderItem = ({ item }) => {
    return (
      <Styled.CardPressable onPress={(e) => onIconPress(e, item)}>
        <Styled.ShortName>{item.shortName}</Styled.ShortName>
        <Styled.ParticipantsContainer>
          {renderUsersJoinedMiniAvatar(item.joinedUsers)}
          <Styled.ParticipantsCount>
            {`${item.joinedUsers.length} ${t('mobileSdk.breakout.participantsLabel')}`}
          </Styled.ParticipantsCount>
        </Styled.ParticipantsContainer>

      </Styled.CardPressable>
    );
  };

  const renderBreakoutRoomsView = () => {
    if (breakoutsList?.length === 0) {
      return;
    }

    return (
      <Styled.FlatList
        data={[...breakoutsList]}
        renderItem={renderItem}
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
      <Provider>
        <Styled.ContainerView orientation={orientation}>
          {renderBreakoutDurationCard()}
          {renderMenuView()}
          {renderBreakoutRoomsView()}
        </Styled.ContainerView>
      </Provider>
    </ScreenWrapper>
  );
};

export default BreakoutRoomScreen;
