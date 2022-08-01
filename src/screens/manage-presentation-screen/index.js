import { useState } from 'react';
import { FlatList, SafeAreaView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useOrientation } from '../../hooks/use-orientation';
import IconButton from '../../components/icon-button';
import Styled from './styles';

const ManagePresentationScreen = () => {
  const orientation = useOrientation();
  const [activePresentation, setActivePresentation] = useState(
    'http://www.africau.edu/images/default/sample.pdf'
  );
  const [documents, setDocuments] = useState([
    {
      mimeType: 'application/pdf',
      name: 'default.pdf',
      size: 10527,
      type: 'success',
      uri: 'http://www.africau.edu/images/default/sample.pdf',
    },
  ]);

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'cancel') return;

    setDocuments((oldArray) => [...oldArray, result]);
  };

  const handleRemoveDocument = (item) => {
    setDocuments((oldArray) =>
      oldArray.filter((document) => document.uri !== item.uri)
    );
  };

  const handleSetActiveDocument = (item) => {
    setActivePresentation(item.uri);
  };

  const renderItem = ({ item }) => (
    <Styled.ContainerPresentationList>
      <Styled.ContainerFileView>
        <IconButton icon="file" size={16} />
        <Styled.FileNameText>{item.name}</Styled.FileNameText>
      </Styled.ContainerFileView>
      <Styled.ContainerButtonView>
        <IconButton
          icon={
            item.uri === activePresentation
              ? 'check'
              : 'checkbox-blank-circle-outline'
          }
          size={16}
          iconColor={item.uri === activePresentation ? 'green' : 'gray'}
          onPress={() => handleSetActiveDocument(item)}
          animated
        />
        <IconButton icon="download" size={16} onPress={() => {}} />
        <IconButton
          icon="delete"
          size={16}
          onPress={() => handleRemoveDocument(item)}
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
          <Styled.ConfirmButton onPress={handlePickDocument}>
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
