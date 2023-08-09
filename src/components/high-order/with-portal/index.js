import BottomSheetChat from '../../chat/bottom-sheet-chat';
import NotificationBar from '../../notification-bar';
import BottomSheetActionsBar from '../../actions-bar/bottom-sheet-actions-bar';

const withPortal = (Component) => {
  return (props) => (
    <>
      <Component {...props} />
      <BottomSheetActionsBar />
      <NotificationBar />
      <BottomSheetChat />
    </>
  );
};

export default withPortal;
