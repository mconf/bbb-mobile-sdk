import { useTranslation } from 'react-i18next';
import ModalCard from '../../../modal/card';

const CantScreenshareModal = () => {
  const { t } = useTranslation();

  return (
    <ModalCard
      alert
      title={t('mobileSdk.screenshare.presenterOnly.title')}
      description={t('mobileSdk.screenshare.presenterOnly.message')}
      confirmButton={t('app.modal.close')}
    />
  );
};

export default CantScreenshareModal;
