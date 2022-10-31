import BottomSheetChat from '../../chat/bottom-sheet-chat';
import FullscreenWrapper from '../../fullscreen-wrapper';

const withPortal = (Component) => {
  return (props) => (
    <>
      <Component {...props} />
      <BottomSheetChat />
      <FullscreenWrapper />
    </>
  );
};

export default withPortal;
