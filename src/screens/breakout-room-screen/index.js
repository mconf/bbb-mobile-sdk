import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useCallback, useState } from 'react';
import { Menu, Provider } from 'react-native-paper';
import { selectCurrentUserId } from '../../store/redux/slices/current-user';
import withPortal from '../../components/high-order/with-portal';
import { useOrientation } from '../../hooks/use-orientation';
import BreakoutRoomService from './service';
import Styled from './styles';

const BreakoutRoomScreen = () => {
  const orientation = useOrientation();
  const breakoutsStore = useSelector((state) => state.breakoutsCollection);
  const currentUserId = useSelector(selectCurrentUserId);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedBreakout, setSelectedBreakout] = useState({});
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

  const { t } = useTranslation();

  const handleBreakoutsData = useCallback(
    () => Object.values(breakoutsStore.breakoutsCollection).map((breakout) => {
      return {
        shortName: breakout.shortName,
        breakoutId: breakout.breakoutId,
        joinedUsers: breakout.joinedUsers,
        timeRemaining: breakout.timeRemaining,
        breakoutRoomJoinUrl: breakout[`url_${currentUserId}`]?.redirectToHtml5JoinURL
        // ...other properties
      };
    }),
    [breakoutsStore]
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

  const renderMenuView = () => {
    return (
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={menuAnchor}
      >
        {selectedBreakout.breakoutRoomJoinUrl && (
        <Menu.Item
          onPress={() => {
            setShowMenu(false);
            Linking.openURL(selectedBreakout.breakoutRoomJoinUrl);
          }}
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

  return (
    <Provider>
      <Styled.ContainerView orientation={orientation}>
        <Styled.Block orientation={orientation}>
          {renderMenuView()}
          <Styled.FlatList data={handleBreakoutsData()} renderItem={renderItem} />
        </Styled.Block>
        <Styled.ActionsBarContainer orientation={orientation}>
          <Styled.ActionsBar orientation={orientation} />
        </Styled.ActionsBarContainer>
      </Styled.ContainerView>
    </Provider>
  );
};

export default withPortal(BreakoutRoomScreen);
