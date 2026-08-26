import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Trans } from 'react-i18next';
import Colors from '../../../../../constants/colors';
import Styled from './styles';

const SystemMessage = ({ icon, i18nKey, i18nValues }) => (
  <Styled.Card>
    <Styled.ServerContainer>
      <MaterialCommunityIcons name={icon} size={24} color={Colors.lightGray400} />
      <Styled.ServerMsg>
        <Trans i18nKey={i18nKey} values={i18nValues}>
          {i18nValues}
        </Trans>
      </Styled.ServerMsg>
    </Styled.ServerContainer>
  </Styled.Card>
);

export default SystemMessage;
