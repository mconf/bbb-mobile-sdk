import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Menu, Provider } from 'react-native-paper';
import { useOrientation } from '../../hooks/use-orientation';
import withPortal from '../../components/high-order/with-portal';
import { selectWaitingUsers } from '../../store/redux/slices/guest-users';
import { isModerator } from '../../store/redux/slices/current-user';
import UserParticipantsService from './service';
import Colors from '../../constants/colors';
import Styled from './styles';

const UserParticipantsScreen = () => {
  const usersStore = useSelector((state) => state.usersCollection);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const amIModerator = useSelector(isModerator);
  const pendingUsers = useSelector(selectWaitingUsers);

  const navigation = useNavigation();

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

  const orientation = useOrientation();

  const onIconPress = (event, item) => {
    const { nativeEvent } = event;
    const anchor = {
      x: nativeEvent.pageX,
      y: nativeEvent.pageY - 150,
    };

    setSelectedUser(item);
    setMenuAnchor(anchor);
    setShowMenu(true);
  };

  const renderItem = ({ item }) => {
    return (
      <Styled.CardPressable onPress={(e) => onIconPress(e, item)}>
        <Styled.UserAvatar
          userName={item.name}
          userRole={item.role}
          userColor={item.color}
        />
        <Styled.UserName>{item.name}</Styled.UserName>
      </Styled.CardPressable>
    );
  };

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
              title={isViewer ? 'Tornar moderador' : 'Tornar espectador'}
            />
          )}
      </Menu>
    );
  };

  // The user-list-item Menu is disabled on production environments because
  // its only feature is experimental - move the Settings.dev check down to
  // menu items if more stable actions are added later
  return (
    <Provider>
      <Styled.ContainerView orientation={orientation}>
        <Styled.Block orientation={orientation}>
          {amIModerator && (
            <>
              <Pressable
                onPress={() => {
                  navigation.navigate('GuestPolicyScreen');
                }}
              >
                <Styled.GuestMenuContainer>
                  <Icon name="account-cog-outline" size={24} color={Colors.white} />
                  <Styled.GuestPolicyText>Política de Convidados</Styled.GuestPolicyText>
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
                    <Styled.GuestPolicyText>Participantes Aguardando</Styled.GuestPolicyText>
                    <Styled.GuestPolicyIcon
                      icon="arrow-right"
                      iconColor={Colors.white}
                    />
                  </Styled.GuestMenuContainer>
                </Pressable>
              )}
              <Styled.DividerTop />
            </>
          )}
          <Styled.FlatList data={handleUsersName()} renderItem={renderItem} />
          {renderMenuView()}
        </Styled.Block>
        <Styled.ActionsBarContainer orientation={orientation}>
          <Styled.ActionsBar orientation={orientation} />
        </Styled.ActionsBarContainer>
      </Styled.ContainerView>
    </Provider>
  );
};

export default withPortal(UserParticipantsScreen);
