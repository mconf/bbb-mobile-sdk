import React from 'react';
import Styled from './styles';

const UserAvatar = (props) => {
  const { userName } = props;

  return (
    <Styled.Background>
      <Styled.UserName>{userName.substring(0, 2)}</Styled.UserName>
    </Styled.Background>
  );
};

export default UserAvatar;
