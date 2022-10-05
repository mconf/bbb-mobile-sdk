import { FlatList } from 'react-native';
import Styled from './styles';
import { sortVideoStreams } from './service';

const VideoList = (props) => {
  const { videoUsers, style, orientation } = props;

  const renderVideoListItem = (videoUser) => {
    const { item: vuItem } = videoUser;
    const {
      cameraId,
      userAvatar,
      userColor,
      name,
    } = vuItem;

    return (
      <Styled.VideoListItem
        cameraId={cameraId}
        userAvatar={userAvatar}
        userColor={userColor}
        userName={name}
        orientation={orientation}
        style={style}
      />
    );
  };

  return (
    <FlatList
      horizontal
      data={sortVideoStreams(videoUsers)}
      renderItem={renderVideoListItem}
      contentContainerStyle={style}
    />
  );
};

export default VideoList;
