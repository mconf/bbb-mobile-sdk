import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import withPortal from '../../components/high-order/with-portal';
import VideoGrid from '../../components/video/video-grid';
import BottomSheetActionsBar from '../../components/actions-bar/bottom-sheet-actions-bar';
import ChatPopupList from '../../components/chat/chat-popup';
import Styled from './styles';

const MainConferenceScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const loggingIn = useSelector((state) => state.client.sessionState.loggingIn);

  useEffect(() => {
    setIsLoading(loggingIn);
  }, [loggingIn]);

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

  if (isLoading) {
    return (
      <Styled.GridItemSkeletonLoading />
    );
  }

  return renderGridLayout();
};

export default withPortal(MainConferenceScreen);
