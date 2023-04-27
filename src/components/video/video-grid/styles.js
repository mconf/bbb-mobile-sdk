import styled from 'styled-components/native';
import VideoContainer from '../video-container';
import contentArea from '../../content-area';

const VideoListItem = styled(VideoContainer)`
  width: 100%;
  height: 100%;
`;

const ContentArea = styled(contentArea)`
`;

export default {
  VideoListItem,
  ContentArea
};
