import styled from 'styled-components/native';
import VideoAvatarItem from '../videoAvatarItem';

const VideoList = styled.View`
  display: flex;
  width: 100%;
  justify-content: space-around;
  flex-direction: row;
`;

const VideoAvatar = styled(VideoAvatarItem)`
  width: 115px;
  height: 115px;
  margin: 4px;
`;

export default { VideoList, VideoAvatar };
