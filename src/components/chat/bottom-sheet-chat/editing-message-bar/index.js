import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useTranslation } from 'react-i18next';
import Styled from './styles';

// Sits right above the message input while a message is being edited, the way
// the web client's chat-editing-warning does.
const EditingMessageBar = ({ onCancel }) => {
  const { t } = useTranslation();

  // Back cancels the edit before it gets to close the chat, mirroring the
  // web client, where escape cancels it.
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });

    return () => backHandler.remove();
  }, [onCancel]);

  return (
    <Styled.Container>
      <Styled.Info>
        <Styled.EditIcon />
        <Styled.Label numberOfLines={1}>
          {t('app.chat.toolbar.edit.editing')}
        </Styled.Label>
      </Styled.Info>
      <Styled.CancelButton
        accessibilityLabel={t('app.settings.main.cancel.label')}
        onPress={onCancel}
      >
        <Styled.CancelIcon />
      </Styled.CancelButton>
    </Styled.Container>
  );
};

export default EditingMessageBar;
