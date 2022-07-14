import React from 'react';
import Styled from './styles';

const VideoList = (props) => {
  const { style, videoUsers } = props;

  return (
    <Styled.VideoList style={style}>
      {videoUsers.map((videoUser) => (
        <Styled.VideoAvatar
          source={{
            uri: videoUser.videoSource,
          }}
          userName={videoUser.userName}
        />
      ))}
    </Styled.VideoList>
  );
};

export default VideoList;
