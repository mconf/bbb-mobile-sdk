import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import Styled from './styles';
import { selectScreenshare } from '../../store/redux/slices/screenshare';

const ContentArea = (props) => {
  const { style } = props;
  const slidesStore = useSelector((state) => state.slidesCollection);
  const presentationsStore = useSelector((state) => state.presentationsCollection);
  const screenshare = useSelector(selectScreenshare);

  const handleSlideAndPresentationActive = useCallback(() => {
    // TODO Review this collection after update the 2.6 code
    const currentPresentation = Object.values(
      presentationsStore.presentationsCollection
    ).filter((obj) => {
      return obj.current === true;
    });

    const currentSlideList = Object.values(slidesStore.slidesCollection).filter(
      (obj) => {
        return (
          obj.current === true &&
          obj.presentationId === currentPresentation[0]?.id
        );
      }
    );
    const imageUri = currentSlideList[0]?.imageUri;
    return imageUri?.replace('/svg/', '/png/');
  }, [presentationsStore, slidesStore]);

  if (!screenshare) {
    return (
      <Styled.Presentation
        width="100%"
        height="100%"
        source={{
          uri: handleSlideAndPresentationActive(),
        }}
      />
    );
  }

  return <Styled.Screenshare style={style} />;
};

export default ContentArea;
