import { FlatList } from 'react-native';
import Styled from './styles';

const VideoList = (props) => {
  const { videoUsers, style, orientation } = props;

  const renderVideoListItem = (videoUser) => {
    const { item: vuItem } = videoUser;
    const { cameraId, userAvatar, userColor, userName } = vuItem;

    return (
      <Styled.VideoListItem
        cameraId={cameraId}
        userAvatar={userAvatar}
        userColor={userColor}
        userName={userName}
        orientation={orientation}
        style={style}
      />
    );
  };

  return (
    <FlatList
      horizontal
      data={videoUsers}
      renderItem={renderVideoListItem}
      contentContainerStyle={style}
    />
  );
};

export default VideoList;
