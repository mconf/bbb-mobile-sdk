import { useState } from 'react';
import { FlatList, SafeAreaView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useOrientation } from '../../hooks/use-orientation';
import IconButton from '../../components/icon-button';
import Styled from './styles';

const ManagePresentationScreen = () => {
  const orientation = useOrientation();
  const [documents, setDocuments] = useState([
    {
      mimeType: 'application/pdf',
      name: 'default.pdf',
      size: 10527,
      type: 'success',
      uri: 'http://www.africau.edu/images/default/sample.pdf',
    },
  ]);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'cancel') return;

    setDocuments((oldArray) => [...oldArray, result]);
  };

  const removeDocument = (item) => {
    setDocuments((oldArray) =>
      oldArray.filter((document) => document.uri !== item.uri)
    );
  };

  const renderItem = ({ item }) => (
    <Styled.ContainerPresentationList>
      <Styled.ContainerFileView>
        <IconButton icon="file" size={16} />
        <Styled.FileNameText>{item.name}</Styled.FileNameText>
      </Styled.ContainerFileView>
      <Styled.ContainerButtonView>
        <IconButton icon="download" size={16} onPress={() => {}} />
        <IconButton
          icon="check"
          size={16}
          iconColor="green"
          onPress={() => {}}
        />
        <IconButton
          icon="delete"
          size={16}
          onPress={() => removeDocument(item)}
        />
      </Styled.ContainerButtonView>
    </Styled.ContainerPresentationList>
  );

  return (
    <SafeAreaView>
      <Styled.ContainerView orientation={orientation}>
        <Styled.ContainerPresentationCard>
          <Styled.Title>Apresentações disponíveis</Styled.Title>
          <FlatList data={documents} renderItem={renderItem} />
          <Styled.ConfirmButton onPress={pickDocument}>
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
