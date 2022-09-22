import { Alert } from 'react-native';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Menu, Provider } from 'react-native-paper';
import { useOrientation } from '../../hooks/use-orientation';
import withPortal from '../../components/high-order/with-portal';
import Styled from './styles';

const UserParticipantsScreen = () => {
  const usersStore = useSelector((state) => state.usersCollection);
  const [showMenu, setShowMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

  const handleUsersName = useCallback(
    () =>
      Object.values(usersStore.usersCollection).map((user) => {
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

  return (
    <Provider>
      <Styled.ContainerView orientation={orientation}>
        <Styled.FlatList data={handleUsersName()} renderItem={renderItem} />
        <Menu
          visible={showMenu}
          onDismiss={() => setShowMenu(false)}
          anchor={menuAnchor}
        >
          <Menu.Item
            onPress={() =>
              Alert.alert(
                'Currently under development',
                'This feature will be addressed soon, please check out our github page'
              )
            }
            title="Bate-papo privado"
          />
        </Menu>
        <Styled.ActionsBarContainer orientation={orientation}>
          <Styled.ActionsBar orientation={orientation} />
        </Styled.ActionsBarContainer>
      </Styled.ContainerView>
    </Provider>
  );
};

export default withPortal(UserParticipantsScreen);
