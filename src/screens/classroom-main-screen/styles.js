import styled from 'styled-components/native';
import contentArea from '../../components/content-area';
import BottomSheetActionsBar from '../../components/actions-bar/bottom-sheet-actions-bar';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;

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

export default {
  ContainerView,
  // grid stuffs
  ActionsBarGrid,
  ContentAreaGrid
};
