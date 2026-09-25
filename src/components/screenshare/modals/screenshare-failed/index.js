import { useTranslation } from 'react-i18next';
import ModalCard from '../../../modal/card';

const ScreenshareFailedModal = () => {
  const { t } = useTranslation();

  return (
    <ModalCard
      alert
      title={t('mobileSdk.screenshare.failed.title')}
      description={t('mobileSdk.screenshare.failed.message')}
      confirmButton={t('app.modal.close')}
    />
  );
};

export default ScreenshareFailedModal;
