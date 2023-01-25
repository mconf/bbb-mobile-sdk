import { FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import Styled from './styles';
import { selectSortedVideoUsers } from '../../../store/redux/slices/video-streams';

const VideoList = (props) => {
  const { style, orientation } = props;
  const videoUsers = useSelector(selectSortedVideoUsers);

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
