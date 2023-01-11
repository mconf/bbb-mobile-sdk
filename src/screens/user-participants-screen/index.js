import { Alert, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// eslint-disable-next-line import/no-unresolved
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Menu, Provider } from 'react-native-paper';
import { useOrientation } from '../../hooks/use-orientation';
import withPortal from '../../components/high-order/with-portal';
import Styled from './styles';
import Settings from '../../../settings.json';
import Colors from '../../constants/colors';

const UserParticipantsScreen = () => {
  const usersStore = useSelector((state) => state.usersCollection);
  const [showMenu, setShowMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const currentUserStore = useSelector((state) => state.currentUserCollection);
  const isModerator = Object.values(currentUserStore?.currentUserCollection)[0]?.role === 'MODERATOR';
  const guestUsersStore = useSelector((state) => state.guestUsersCollection);
  const pendingUsers = Object.values(guestUsersStore.guestUsersCollection).filter((guest) => {
    return !guest.approved && !guest.denied;
  });

  const navigation = useNavigation();

  const handleUsersName = useCallback(
    () => Object.values(usersStore.usersCollection).map((user) => {
      return {
        name: user.name,
        role: user.role,
        color: user.color,
        // ...other properties
      };
    }),
    [usersStore]
  );

  const orientation = useOrientation();

  const onIconPress = (event) => {
    const { nativeEvent } = event;
    const anchor = {
      x: nativeEvent.pageX,
      y: nativeEvent.pageY - 150,
    };

    setMenuAnchor(anchor);
    setShowMenu(true);
  };

  const renderItem = ({ item }) => {
    return (
      <Styled.CardPressable onPress={onIconPress}>
        <Styled.UserAvatar
          userName={item.name}
          userRole={item.role}
          userColor={item.color}
        />
        <Styled.UserName>{item.name}</Styled.UserName>
      </Styled.CardPressable>
    );
  };

  // The user-list-item Menu is disabled on production environments because
  // its only feature is experimental - move the Settings.dev check down to
  // menu items if more stable actions are added later
  return (
    <Provider>
      <Styled.ContainerView orientation={orientation}>
        <Styled.Block orientation={orientation}>
          {isModerator && (
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
          {Settings.dev && (
            <Menu
              visible={showMenu}
              onDismiss={() => setShowMenu(false)}
              anchor={menuAnchor}
            >
              <Menu.Item
                onPress={() => {
                  Alert.alert(
                    'Currently under development',
                    'This feature will be addressed soon, please check out our github page'
                  );
                }}
                title="Bate-papo privado"
              />
            </Menu>
          )}
        </Styled.Block>
        <Styled.ActionsBarContainer orientation={orientation}>
          <Styled.ActionsBar orientation={orientation} />
        </Styled.ActionsBarContainer>
      </Styled.ContainerView>
    </Provider>
  );
};

export default withPortal(UserParticipantsScreen);
