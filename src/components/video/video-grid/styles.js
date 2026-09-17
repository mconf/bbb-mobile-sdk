import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';
import VideoContainer from '../video-container';
import contentArea from '../../content-area';
import Colors from '../../../constants/colors';

const VideoListItem = styled(VideoContainer)`
  width: 100%;
  height: 100%;
`;

const ContentArea = styled(contentArea)`
`;

// Landscape: the presentation takes this share of the width and the cameras
// stack in the remaining column.
const LANDSCAPE_CONTENT_WIDTH = '65%';

// Tile size as a function of the grid box (dimensionHeight is the measured
// height of the whole grid area, presentation included). Portrait keeps the
// historical thirds-based layout; landscape splits rows in halves because the
// box is short and wide.
const getItemSize = ({
  usersCount, dimensionHeight, isPresentationOpen, isLandscape
}) => {
  const H = dimensionHeight || 0;
  const px = (fraction) => `${parseInt(H * fraction, 10)}px`;

  if (isLandscape) {
    if (isPresentationOpen) {
      // Single side column next to the presentation.
      return { width: '100%', height: usersCount > 1 ? px(1 / 2) : px(1) };
    }
    if (usersCount <= 1) return { width: '100%', height: px(1) };
    if (usersCount === 2) return { width: '50%', height: px(1) };
    return { width: '50%', height: px(1 / 2), fillRow: usersCount % 2 === 1 };
  }

  if (isPresentationOpen) {
    if (usersCount <= 1) return { width: '100%', height: px(2 / 3) };
    if (usersCount === 2) return { width: '100%', height: px(1 / 3) };
    return { width: '50%', height: px(1 / 3), fillRow: usersCount % 2 === 1 };
  }

  if (usersCount <= 1) return { width: '100%', height: px(1) };
  if (usersCount === 2) return { width: '100%', height: px(1 / 2) };
  if (usersCount <= 4) return { width: '50%', height: px(1 / 2), fillRow: usersCount % 2 === 1 };
  return { width: '50%', height: px(1 / 3), fillRow: usersCount % 2 === 1 };
};

const Item = styled.View`
  display: flex;
  background-color: #d0c4cb;
  align-items: center;
  justify-content: center;

  ${(props) => {
    const { width, height, fillRow } = getItemSize(props);
    return `
      width: ${width};
      height: ${height};
      ${fillRow ? `
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: 0;
      ` : ''}
    `;
  }}
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  }
});

// Wraps presentation + camera list; measured by the grid to size the tiles.
// Column in portrait (presentation above the cameras), row in landscape
// (presentation beside them).
const GridContainer = styled.View`
  flex: 1;
  width: 100%;
  flex-direction: ${({ isLandscape }) => (isLandscape ? 'row' : 'column')};
`;

const ContainerViewItem = styled.View`
  display: flex;
  background-color: #d0c4cb;
  align-items: center;
  justify-content: center;

  ${({ isPresentationOpen }) => !isPresentationOpen
  && `
      display: none;
  `}

  ${({ isLandscape, dimensionHeight }) => (isLandscape
    ? `
      width: ${LANDSCAPE_CONTENT_WIDTH};
      height: 100%;
    `
    : `
      width: 100%;
      height: ${parseInt((dimensionHeight || 0) / 3, 10)}px;
    `)}
`;

const SessionAloneTitle = styled.Text`
  color: white;
  font-weight: 600;
  font-size: 24px;
  text-align: center;
`;

const SessionAloneDesc = styled.Text`
  color: white;
  font-weight: 400;
  font-size: 18px;
  text-align: center;
`;

const ContainerSessionAlone = styled.View`
  display: flex;
  width: 100%;
  padding-top: 50px;

  ${({ dimensionHeight }) => dimensionHeight
  && `
    height: ${parseInt((dimensionHeight), 10)}px;
  `}
`;

const ContainerTextSessionAlone = styled.View`
  width: 100%;
  flex: 1;
  align-items: center;
  gap: 16px;
  padding: 16px;
  ${({ isPresentationOpen }) => !isPresentationOpen
  && `
    justify-content: center;
  `}
`;

const NoPollsImage = styled.Image``;

const NoPollsLabelTitle = styled.Text`
  color: ${Colors.white};
  font-size: 21px;
  text-align: center;
  font-weight: 500;
`;

const NoPollsLabelSubtitle = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  text-align: center;
`;

const RenderSessionAlone = ({
  sessionAloneTitle, sessionAloneDesc, isPresentationOpen
}) => {
  return (
    <ContainerTextSessionAlone isPresentationOpen={isPresentationOpen}>
      <NoPollsImage
        source={require('../../../assets/application/service-off.png')}
        resizeMode="contain"
        style={{ width: 173, height: 130 }}
      />
      <NoPollsLabelTitle>
        {sessionAloneTitle}
      </NoPollsLabelTitle>
      <NoPollsLabelSubtitle>
        {sessionAloneDesc}
      </NoPollsLabelSubtitle>
    </ContainerTextSessionAlone>
  );
};

export default {
  VideoListItem,
  ContentArea,
  styles,
  Item,
  GridContainer,
  ContainerViewItem,
  SessionAloneTitle,
  RenderSessionAlone,
  ContainerSessionAlone,
  SessionAloneDesc
};
