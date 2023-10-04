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

// grid
const ActionsBarGrid = styled(BottomSheetActionsBar)``;
const ContentAreaGrid = styled(contentArea)`
`;

// skeleton loading
const GridItemSkeletonLoading = () => (
  <ContainerView>
    <ContentLoader
      speed={1}
      width="100%"
      height="100%"
      viewBox="0 0 310 510"
      backgroundColor={Colors.contentLetterboxColor}
      foregroundColor={Colors.contentForegroundColor}
    >
      <Rect x="0" y="0" rx="0" ry="0" width="150" height="120" />
      <Rect x="160" y="0" rx="0" ry="0" width="150" height="120" />
      <Rect x="0" y="130" rx="0" ry="0" width="150" height="120" />
      <Rect x="160" y="130" rx="0" ry="0" width="150" height="120" />
      <Rect x="0" y="260" rx="0" ry="0" width="150" height="120" />
      <Rect x="160" y="260" rx="0" ry="0" width="150" height="120" />
      <Rect x="0" y="390" rx="0" ry="0" width="150" height="120" />
      <Rect x="160" y="390" rx="0" ry="0" width="150" height="120" />
    </ContentLoader>
  </ContainerView>
);

export default {
  ContainerView,
  // grid stuffs
  ActionsBarGrid,
  ContentAreaGrid,
  // skeleton loading
  GridItemSkeletonLoading,
};
