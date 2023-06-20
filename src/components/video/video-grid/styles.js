import styled from 'styled-components/native';
import { StyleSheet, Dimensions } from 'react-native';
import VideoContainer from '../video-container';
import contentArea from '../../content-area';

const VideoListItem = styled(VideoContainer)`
  width: 100%;
  height: 100%;
`;

const ContentArea = styled(contentArea)`
`;

const Item = styled.View`
  display: flex;
  background-color: #d0c4cb;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${parseInt(Dimensions.get('window').height / 2, 10)}px;

  ${({ usersCount }) => usersCount % 2 === 0 && usersCount > 2
  && `
      width: 50%;
      height: ${parseInt(Dimensions.get('window').height / 2.2, 10)}px;
  `}

  ${({ usersCount }) => usersCount % 2 === 1 && usersCount > 2
  && `
      width: 50%;
      flex-grow: 1;
      flex-shrink: 1;
      flex-basis: 0;
      height: ${parseInt(Dimensions.get('window').height / 2.2, 10)}px;
  `}
`;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  }
});

export default {
  VideoListItem,
  ContentArea,
  styles,
  Item
};
