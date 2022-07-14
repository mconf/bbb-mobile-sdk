import React from 'react';
import Styled from './styles';

const VideoList = (props) => {
  const { style } = props;
  return (
    <Styled.VideoList style={style}>
      <Styled.VideoAvatar
        source={{
          uri: 'https://c.tenor.com/IRBxTXExddMAAAAM/cat-watching-cat-fun.gif',
        }}
        userName="Catinho"
      />
      <Styled.VideoAvatar
        source={{
          uri: 'http://25.media.tumblr.com/tumblr_ltp7zjkDUG1qzgfaio1_400.gif',
        }}
        userName="Scarytinho"
      />
      <Styled.VideoAvatar
        source={{
          uri: 'https://media3.giphy.com/media/cmxRB9CecJjv7PLGs3/200.gif',
        }}
        userName="Batinho"
      />
    </Styled.VideoList>
  );
};

export default VideoList;
