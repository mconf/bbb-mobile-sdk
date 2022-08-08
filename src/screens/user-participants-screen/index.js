import { Alert } from 'react-native';
import { useState } from 'react';
import { Menu, Provider } from 'react-native-paper';
import { useOrientation } from '../../hooks/use-orientation';
import Styled from './styles';

const UserParticipantsScreen = () => {
  const userListNames = [
    'Patolino',
    'Gaguinho',
    'Pernalonga',
    'Taz',
    'Lola',
    'Frajola',
    'Gaguinho',
    'Pernalonga',
    'Taz',
    'Lola',
    'Frajola',
  ];

  const [showMenu, setShowMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

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
        <Styled.UserAvatar userName={item} />
        <Styled.UserName>{item}</Styled.UserName>
      </Styled.CardPressable>
    );
  };

  return (
    <Provider>
      <Styled.ContainerView orientation={orientation}>
        <Styled.FlatList data={userListNames} renderItem={renderItem} />
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

export default UserParticipantsScreen;
