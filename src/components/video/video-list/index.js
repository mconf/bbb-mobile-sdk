import { FlatList } from 'react-native';
import Styled from './styles';

const VideoList = (props) => {
  const { videoUsers, style, orientation } = props;

  const renderVideoListItem = (videoUser) => {
    const { item: vuItem } = videoUser;
    const {
      cameraId,
      userId,
      userAvatar,
      userColor,
      name,
      local,
      visible,
    } = vuItem;

    return (
      <Styled.VideoListItem
        cameraId={cameraId}
        userId={userId}
        userAvatar={userAvatar}
        userColor={userColor}
        userName={name}
        local={local}
        visible={visible}
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
