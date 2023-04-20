import { SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import withPortal from '../../components/high-order/with-portal';
import { useOrientation } from '../../hooks/use-orientation';
import Styled from './styles';
import VideoGrid from '../../components/video/video-grid';

const ClassroomMainScreen = () => {
  // variables
  const loggingIn = useSelector((state) => state.client.sessionState.loggingIn);
  const orientation = useOrientation();
  const [switchLandscapeLayout, setSwitchLandscapeLayout] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);

  useEffect(() => {
    setIsLoading(loggingIn);
  }, [loggingIn]);

  /* view components */
  const renderPortraitOrientation = () => {
    return (
      <SafeAreaView>
        <Styled.ContainerView>
          <VideoGrid />
          {detailedInfo && <Styled.ActionsBarGrid />}
        </Styled.ContainerView>
      </SafeAreaView>
    );
  };

  /*  return area  */
  if (isLoading) return Styled.renderSkeletonLoading();
  return renderPortraitOrientation();
};

export default withPortal(ClassroomMainScreen);
