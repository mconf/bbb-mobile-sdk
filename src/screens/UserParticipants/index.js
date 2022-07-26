import React from 'react';

import Styled from './styles';

const UserParticipantsScreen = () => {
  const userListNames = [
    'Patolino',
    'Gaguinho',
    'Pernalonga',
    'Taz',
    'Lola',
    'Frajola',
  ];

  const renderItem = ({ item }) => {
    return (
      <Styled.CardPressable
        // handle "pressed" styled here until styled-components api should let us use inside styles.js
        style={({ pressed }) => [pressed ? { opacity: 0.75 } : null]}
        onPress={() => {}}
      >
        <Styled.UserAvatar userName={item} />
        <Styled.UserName>{item}</Styled.UserName>
      </Styled.CardPressable>
    );
  };

  return <Styled.FlatList data={userListNames} renderItem={renderItem} />;
};

export default UserParticipantsScreen;
