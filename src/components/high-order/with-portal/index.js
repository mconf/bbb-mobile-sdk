import BottomSheetChat from '../../chat/bottom-sheet-chat';
import LowConnectionModal from '../../low-connection-modal';
import NotificationBar from '../../notification-bar';

const withPortal = (Component) => {
  return (props) => (
    <>
      <Component {...props} />
      <NotificationBar />
      <BottomSheetChat />
      <LowConnectionModal />
    </>
  );
};

export default withPortal;
