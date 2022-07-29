import { SafeAreaView, View } from 'react-native';

import Styled from './styles';
import { useOrientation } from '../../hooks/use-orientation';
import IconButton from '../../components/icon-button';

const ManagePresentationScreen = () => {
  const orientation = useOrientation();

  const renderItem = (fileName) => (
    <Styled.ContainerPresentationList>
      <Styled.ContainerFileView>
        <IconButton icon="file" size={16} />
        <Styled.FileNameText>{fileName}</Styled.FileNameText>
      </Styled.ContainerFileView>
      <Styled.ContainerButtonView>
        <IconButton icon="download" size={16} onPress={() => {}} />
        <IconButton
          icon="check"
          size={16}
          iconColor="green"
          onPress={() => {}}
        />
        <IconButton icon="delete" size={16} onPress={() => {}} />
      </Styled.ContainerButtonView>
    </Styled.ContainerPresentationList>
  );

  return (
    <SafeAreaView>
      <Styled.ContainerView orientation={orientation}>
        <Styled.ContainerPresentationCard>
          <Styled.Title>Apresentações disponíveis</Styled.Title>
          <View>
            {renderItem('default.pdf')}
            {renderItem('ElosDefault.pdf')}
            {renderItem('BBBDefault.pdf')}
          </View>

          <Styled.ConfirmButton onPress={() => {}}>
            Adicionar arquivo
          </Styled.ConfirmButton>
        </Styled.ContainerPresentationCard>

        <Styled.ActionsBarContainer orientation={orientation}>
          <Styled.ActionsBar orientation={orientation} />
        </Styled.ActionsBarContainer>
      </Styled.ContainerView>
    </SafeAreaView>
  );
};

export default ManagePresentationScreen;
