import React from 'react';
import { FlatList } from 'react-native';
import Styled from './styles';

const Item = (props) => {
  const { videoUser, landscape } = props;
  return (
    <Styled.VideoAvatar
      source={{
        uri: videoUser.item.videoSource,
      }}
      userName={videoUser.item.userName}
      landscape={landscape}
    />
  );
};

const VideoList = (props) => {
  const { videoUsers, style, landscape } = props;

  const renderItem = (item) => <Item videoUser={item} landscape={landscape} />;

  return (
    <FlatList
      horizontal
      data={videoUsers}
      renderItem={renderItem}
      contentContainerStyle={style}
    />
  );
};

export default VideoList;
