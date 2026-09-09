import InSheetOverlay from '../in-sheet-overlay';
import Styled from './styles';

const MessageActions = ({ actions, onClose }) => (
  <InSheetOverlay onClose={onClose}>
    {actions.map(({
      id, icon, label, onPress,
    }) => (
      <Styled.Action
        key={id}
        accessibilityLabel={label}
        onPress={() => {
          onClose();
          onPress();
        }}
      >
        <Styled.ActionIcon name={icon} />
        <Styled.ActionLabel>{label}</Styled.ActionLabel>
      </Styled.Action>
    ))}
  </InSheetOverlay>
);

export default MessageActions;
