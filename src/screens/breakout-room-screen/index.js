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
import withPortal from '../../components/high-order/with-portal';
import BreakoutRoomService from './service';
import Styled from './styles';

const BreakoutRoomScreen = () => {
  const orientation = useOrientation();
  const breakoutsStore = useSelector((state) => state.breakoutsCollection);
  const currentUserId = useSelector(selectCurrentUserId);
  const localCameraId = useSelector((state) => state.video.localCameraId);
  const meetingData = useSelector((state) => state.client.meetingData);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedBreakout, setSelectedBreakout] = useState({});
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [joinedBreakouts, setJoinedBreakouts] = useState();
  const [notJoinedBreakouts, setNotJoinedBreakouts] = useState();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      setJoinedBreakouts(Object.values(breakoutsStore.breakoutsCollection)
        .filter((item) => Object.keys(item)
          .some((key) => key.includes('url_')))
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

  useFocusEffect(
    useCallback(() => {
      setNotJoinedBreakouts(Object.values(breakoutsStore.breakoutsCollection)
        .filter((item) => !Object.keys(item)
          .some((key) => key.includes('url_')))
        .map((filteredItem) => {
          return {
            shortName: filteredItem.shortName,
            breakoutId: filteredItem.breakoutId,
            joinedUsers: filteredItem.joinedUsers,
            timeRemaining: filteredItem.timeRemaining
          };
        }));
    }, [breakoutsStore]),
  );

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

  const renderItem = ({ item }) => {
    return (
      <Styled.CardPressable onPress={(e) => onIconPress(e, item)}>
        <Styled.ShortName>{item.shortName}</Styled.ShortName>
        <Styled.TimeRemaining>{`${item.joinedUsers.length} participantes`}</Styled.TimeRemaining>
      </Styled.CardPressable>
    );
  };

  const renderJoinedRoomsView = () => {
    if (joinedBreakouts?.length === 0) {
      return;
    }

    return (
      <>
        <Styled.TitleText>{t('mobileSdk.breakout.joinedRoomsLabel')}</Styled.TitleText>
        <Styled.FlatList data={joinedBreakouts} renderItem={renderItem} />
      </>
    );
  };

  const renderNotJoinedRoomsView = () => {
    if (notJoinedBreakouts?.length === 0) {
      return;
    }
    return (
      <>
        <Styled.TitleText>{t('mobileSdk.breakout.remainingRoomsLabel')}</Styled.TitleText>
        <Styled.FlatList data={notJoinedBreakouts} renderItem={renderItem} />
      </>
    );
  };

  if (joinedBreakouts?.length === 0 && notJoinedBreakouts?.length === 0) {
    return (
      <Styled.TitleText>
        {t('mobileSdk.breakout.noBreakouts')}
      </Styled.TitleText>
    );
  }

  return (
    <Provider>
      <Styled.ContainerView orientation={orientation}>
        <Styled.Block orientation={orientation}>
          {renderMenuView()}
          {renderJoinedRoomsView()}
          {renderNotJoinedRoomsView()}
        </Styled.Block>
        <Styled.ActionsBarContainer orientation={orientation}>
          <Styled.ActionsBar orientation={orientation} />
        </Styled.ActionsBarContainer>
      </Styled.ContainerView>
    </Provider>
  );
};

export default withPortal(BreakoutRoomScreen);
