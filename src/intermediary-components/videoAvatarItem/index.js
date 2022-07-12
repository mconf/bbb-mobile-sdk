import React from 'react';
import Styled from './styles';

const VideoAvatarItem = (props) => {
  const { source, userName } = props;

  return (
    <Styled.ContainerView>
      <Styled.UserAvatar source={source} />
      <Styled.NameLabelContainer>
        <Styled.NameLabel>{userName}</Styled.NameLabel>
      </Styled.NameLabelContainer>
    </Styled.ContainerView>
  );
};

export default VideoAvatarItem;
