import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Provider } from 'react-native-paper';
import { useOrientation } from '../../hooks/use-orientation';
import withPortal from '../../components/high-order/with-portal';
import { selectWaitingUsers } from '../../store/redux/slices/guest-users';
import { isModerator, selectCurrentUserId } from '../../store/redux/slices/current-user';
import { setDetailedInfo } from '../../store/redux/slices/wide-app/layout';
import UserParticipantsService from './service';
import Colors from '../../constants/colors';
import Styled from './styles';

const UserParticipantsScreen = () => {
  const usersStore = useSelector((state) => state.usersCollection);
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);
  const amIModerator = useSelector(isModerator);
  const myUserId = useSelector(selectCurrentUserId);
  const pendingUsers = useSelector(selectWaitingUsers);

  const [showMenu, setShowMenu] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const orientation = useOrientation();
  const navigation = useNavigation();

  const handleDispatchDetailedInfo = () => {
    if (detailedInfo) {
      return dispatch(setDetailedInfo(false));
    }
    return dispatch(setDetailedInfo(true));
  };

  const handleUsersName = useCallback(
    () => Object.values(usersStore.usersCollection).map((user) => {
      return {
        name: user.name,
        role: user.role,
        color: user.color,
        userId: user.intId,
        // ...other properties
      };
    }),
    [usersStore]
  );

  const onIconPress = (event, item, isMe) => {
    const { nativeEvent } = event;
    const anchor = {
      x: nativeEvent.pageX,
      y: nativeEvent.pageY - 150,
    };

    // disable dropdown if the user selected === isMe
    if (isMe) {
      return;
    }

    setSelectedUser(item);
    setMenuAnchor(anchor);
    setShowMenu(true);
  };

  const renderItem = ({ item }) => {
    const isMe = myUserId === item.userId;

    return (
      <Styled.CardPressable onPress={(e) => onIconPress(e, item, isMe)} isMe={isMe}>
        <Styled.UserAvatar
          userName={item.name}
          userRole={item.role}
          userColor={item.color}
        />
        <Styled.UserName numberOfLines={1}>{item.name}</Styled.UserName>
      </Styled.CardPressable>
    );
  };

  const renderGuestPolicy = () => (
    <>
      <Pressable
        onPress={() => {
          navigation.navigate('GuestPolicyScreen');
        }}
      >
        <Styled.GuestMenuContainer>
          <Icon name="account-cog-outline" size={24} color={Colors.white} />
          <Styled.GuestPolicyText>{t('app.guest-policy.title')}</Styled.GuestPolicyText>
          <Styled.GuestPolicyIcon
            icon="arrow-right"
            iconColor={Colors.white}
          />
        </Styled.GuestMenuContainer>
      </Pressable>
      {pendingUsers.length > 0 && (
        <Pressable
          onPress={() => {
            navigation.navigate('WaitingUsersScreen');
          }}
        >
          <Styled.GuestMenuContainer>
            <Icon name="account-multiple-outline" size={24} color={Colors.white} />
            <Styled.GuestPolicyText>{t('mobileSdk.userList.waitingAtendees')}</Styled.GuestPolicyText>
            <Styled.GuestPolicyIcon
              icon="arrow-right"
              iconColor={Colors.white}
            />
          </Styled.GuestMenuContainer>
        </Pressable>
      )}
      <Styled.DividerTop />
    </>
  );

  const renderMenuView = () => {
    const isViewer = selectedUser.role === 'VIEWER';

    return (
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={menuAnchor}
      >
        {amIModerator
          && (
            <Menu.Item
              onPress={() => {
                UserParticipantsService.handleChangeRole(selectedUser.userId, selectedUser.role);
                setShowMenu(false);
              }}
              title={isViewer ? t('app.userList.menu.promoteUser.label') : t('app.userList.menu.demoteUser.label')}
            />
          )}
      </Menu>
    );
  };

  return (
    <Provider>
      <Styled.ContainerView orientation={orientation} onPress={handleDispatchDetailedInfo}>
        <Styled.Block orientation={orientation}>
          {amIModerator && renderGuestPolicy()}
          <Styled.FlatList data={handleUsersName()} renderItem={renderItem} />
          {renderMenuView()}
        </Styled.Block>
      </Styled.ContainerView>
    </Provider>
  );
};

export default withPortal(UserParticipantsScreen);
