import BottomSheetChat from '../../chat/bottom-sheet-chat';
import NotificationBar from '../../notification-bar';

const withPortal = (Component) => {
  return (props) => (
    <>
      <Component {...props} />
      <NotificationBar />
      <BottomSheetChat />
      {/* ActionsBar */}
    </>
  );
};

export default withPortal;
