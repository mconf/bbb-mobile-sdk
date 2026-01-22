import { Modal, Checkbox } from 'react-native-paper';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOrientation } from '../../../hooks/use-orientation';
import { hide } from '../../../store/redux/slices/wide-app/modal';
import PrimaryButton from '../../buttons/primary-button';
import Styled from './styles';


const ModalCard = (props) => {
  const {
    title,
    alert,
    description,
    checkbox = false,
    checkboxText,
    confirmButton,
    onConfirm,
    cancelButton,
    onCancel,
  } = props;

  const [checked, setChecked] = useState(false);
  const orientation = useOrientation();
  const modalCollection = useSelector((state) => state.modal);
  const dispatch = useDispatch();

  const handleConfirm = () => {
    if (onConfirm && typeof onConfirm === 'function') {
      onConfirm();
    }
    dispatch(hide());
  };

  const handleCancel = () => {
    if (onCancel && typeof onCancel === 'function') {
      onCancel();
    }
    dispatch(hide());
  };

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => {
        dispatch(hide());
      }}
    >
      <Styled.Container orientation={orientation}>
        <Styled.Header>
          {alert && (
            <Styled.AlertIcon />
          )}
          <Styled.TitleModal>
            {title}
          </Styled.TitleModal>
        </Styled.Header>
        <Styled.TitleDesc>
          {description}
        </Styled.TitleDesc>
        {checkbox && (
          <Styled.CheckboxContainer>
            <Checkbox
              status={checked ? 'checked' : 'unchecked'}
              onPress={() => setChecked(!checked)}
            />
            <Styled.CheckboxText>
              {checkboxText}
            </Styled.CheckboxText>
          </Styled.CheckboxContainer>
        )}
        <Styled.BottomButtonContainer>
          {cancelButton && (
            <PrimaryButton
              onPress={handleCancel}
              variant="secondary"
              mode="darkText"
              fullWidth={false}
            >
              {cancelButton}
            </PrimaryButton>
          )}

          {confirmButton && (
            <PrimaryButton
              onPress={handleConfirm} variant="primary"
              disabled={checkbox && !checked}
              fullWidth={false}
            >
              {confirmButton}
            </PrimaryButton>
          )}
        </Styled.BottomButtonContainer>

      </Styled.Container>
    </Modal>
  );
};

export default ModalCard;
