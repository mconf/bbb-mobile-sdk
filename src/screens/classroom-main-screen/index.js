import withPortal from '../../components/high-order/with-portal';
import VideoGrid from '../../components/video/video-grid';
import BottomSheetActionsBar from '../../components/actions-bar/bottom-sheet-actions-bar';
import ChatPopupList from '../../components/chat/chat-popup';
import Styled from './styles';

const ClassroomMainScreen = () => {
  /* view components */
  const renderGridLayout = () => {
    return (
      <Styled.ContainerView>
        <VideoGrid />
        <BottomSheetActionsBar />
        <ChatPopupList />
      </Styled.ContainerView>
    );
  };

  return renderGridLayout();
};

export default withPortal(ClassroomMainScreen);
