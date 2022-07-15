import React from 'react';
import { FlatList } from 'react-native';
import Styled from './styles';

const Item = (props) => {
  const { videoUser } = props;
  return (
    <Styled.VideoAvatar
      source={{
        uri: videoUser.item.videoSource,
      }}
      userName={videoUser.item.userName}
    />
  );
};

const VideoList = (props) => {
  const { videoUsers } = props;

  const renderItem = (item) => <Item videoUser={item} />;

  return <FlatList horizontal data={videoUsers} renderItem={renderItem} />;
};

export default VideoList;
