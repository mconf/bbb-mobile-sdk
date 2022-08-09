import { FlatList } from 'react-native';
import Styled from './styles';

const Item = (props) => {
  const { videoUser, orientation } = props;
  return (
    <Styled.VideoAvatar
      source={{
        uri: videoUser.item.videoSource,
      }}
      userName={videoUser.item.userName}
      orientation={orientation}
    />
  );
};

const VideoList = (props) => {
  const { videoUsers, style, orientation } = props;

  const renderItem = (item) => (
    <Item videoUser={item} orientation={orientation} />
  );

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
