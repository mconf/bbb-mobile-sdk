import styled from 'styled-components/native';
import VideoAvatarItem from '../videoAvatarItem';

const VideoList = styled.View`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

const VideoAvatar = styled(VideoAvatarItem)`
  width: 115px;
  height: 115px;
  margin: 4px;
  ${({ landscape }) =>
    landscape === 'LANDSCAPE' &&
    `
      width: 200px;
      height: 200px;
  `}
`;

export default { VideoList, VideoAvatar };
