import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import withPortal from '../../components/high-order/with-portal';
import { useOrientation } from '../../hooks/use-orientation';
import Styled from './styles';
import VideoGrid from '../../components/video/video-grid';
import BottomSheetActionsBar from '../../components/actions-bar/bottom-sheet-actions-bar';

const ClassroomMainScreen = () => {
  // variables
  const loggingIn = useSelector((state) => state.client.sessionState.loggingIn);
  const orientation = useOrientation();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);

  useEffect(() => {

  }, [detailedInfo]);

  /* view components */
  const renderPortraitOrientation = () => {
    return (
      <Styled.ContainerView>
        <VideoGrid />
        <BottomSheetActionsBar />
      </Styled.ContainerView>
    );
  };

  /*  return area  */
  if (isLoading) return Styled.renderSkeletonLoading();
  return renderPortraitOrientation();
};

export default withPortal(ClassroomMainScreen);
