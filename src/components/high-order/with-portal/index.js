import BottomSheetChat from '../../chat/bottom-sheet-chat';

const withPortal = (Component) => {
  return (props) => (
    <>
      <Component {...props} />
      <BottomSheetChat />
    </>
  );
};

export default withPortal;
