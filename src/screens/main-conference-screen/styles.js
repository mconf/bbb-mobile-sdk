import styled from 'styled-components/native';
import ContentLoader, { Rect } from 'react-content-loader/native';
import contentArea from '../../components/content-area';
import BottomSheetActionsBar from '../../components/actions-bar/bottom-sheet-actions-bar';
import Colors from '../../constants/colors';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;

  ${({ orientation }) => orientation === 'LANDSCAPE'
    && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const TopIndicatorBar = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 8px;
`;

// grid
const ActionsBarGrid = styled(BottomSheetActionsBar)``;
const ContentAreaGrid = styled(contentArea)`
`;

// skeleton loading
const GridItemSkeletonLoading = ({ DEVICE_HEIGHT, DEVICE_WIDTH }) => (
  <ContainerView>
    <ContentLoader
      speed={0.5}
      width="100%"
      height="100%"
      viewBox={`0 0 ${DEVICE_WIDTH} ${DEVICE_HEIGHT}`}
      backgroundColor={Colors.contentLetterboxColor}
      foregroundColor={Colors.contentForegroundColor}
    >
      <Rect
        x="5"
        y="5"
        rx="12"
        width={parseInt((DEVICE_WIDTH / 3) - 5, 10)}
        height="20"
      />
      <Rect
        x={parseInt((DEVICE_WIDTH / 3 + 5), 10)}
        y="5"
        rx="12"
        width={parseInt((DEVICE_WIDTH / 3) - 5, 10)}
        height="20"
      />
      <Rect
        x={parseInt(((DEVICE_WIDTH * 2) / 3 + 5), 10)}
        y="5"
        rx="12"
        width={parseInt((DEVICE_WIDTH / 3) - 10, 10)}
        height="20"
      />

      <Rect
        x="5"
        y="30"
        width={DEVICE_WIDTH - 10}
        height={parseInt((DEVICE_HEIGHT / 3), 10)}
      />
      <Rect
        x="5"
        y={parseInt(DEVICE_HEIGHT / 3 + 5 + 30, 10)}
        width={parseInt((DEVICE_WIDTH / 2) - 5, 10)}
        height={parseInt((DEVICE_HEIGHT / 3) - 5, 10)}
      />
      <Rect
        x={parseInt(DEVICE_WIDTH / 2 + 5, 10)}
        y={parseInt(DEVICE_HEIGHT / 3 + 5 + 30, 10)}
        width={parseInt((DEVICE_WIDTH / 2) - 10, 10)}
        height={parseInt((DEVICE_HEIGHT / 3) - 5, 10)}
      />
      <Rect
        x="5"
        y={parseInt((DEVICE_HEIGHT * 2) / 3 + 5 + 30, 10)}
        width={parseInt((DEVICE_WIDTH / 2) - 5, 10)}
        height={parseInt((DEVICE_HEIGHT / 3) - 5, 10)}
      />
      <Rect
        x={parseInt(DEVICE_WIDTH / 2 + 5, 10)}
        y={parseInt((DEVICE_HEIGHT * 2) / 3 + 5 + 30, 10)}
        width={parseInt((DEVICE_WIDTH / 2) - 10, 10)}
        height={parseInt((DEVICE_HEIGHT / 3) - 5 - 30, 10)}
      />
    </ContentLoader>
  </ContainerView>
);

export default {
  ContainerView,
  // grid stuffs
  TopIndicatorBar,
  ActionsBarGrid,
  ContentAreaGrid,
  // skeleton loading
  GridItemSkeletonLoading,
};
