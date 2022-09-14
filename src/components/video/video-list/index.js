import { FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import Styled from './styles';

const Item = (props) => {
  const { videoUser, orientation } = props;
  const { item: vuItem } = videoUser;
  const { cameraId, userAvatar, userColor, userName } = vuItem;
  const mediaStreamId = useSelector(
    (state) => state.video.videoStreams[cameraId]
  );

  return (
    <Styled.VideoAvatar
      mediaStreamId={mediaStreamId}
      userAvatar={userAvatar}
      userColor={userColor}
      userName={userName}
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
