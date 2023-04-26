import { useState } from 'react';
import { FlatList, View, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../hooks/use-orientation';
import IconButton from '../../components/icon-button';
import withPortal from '../../components/high-order/with-portal';
import Styled from './styles';

const ManagePresentationScreen = () => {
  const orientation = useOrientation();
  const { t } = useTranslation();
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
        <IconButton
          icon="download"
          size={16}
          onPress={() =>
            Alert.alert(
              'Currently under development',
              'This feature will be addressed soon, please check out our github page'
            )
          }
        />
        <IconButton
          icon="delete"
          size={16}
          onPress={() => handleRemoveDocument(item)}
        />
      </Styled.ContainerButtonView>
    </Styled.ContainerPresentationList>
  );

  return (
    <View>
      <Styled.ContainerView orientation={orientation}>
        <Styled.ContainerPresentationCard>
          <Styled.Title>{t('mobileSdk.managePresentations.title')}</Styled.Title>
          <FlatList data={documents} renderItem={renderItem} />
          <Styled.ConfirmButton onPress={handlePickDocument}>
            {t('mobileSdk.managePresentations.confirmButton')}
          </Styled.ConfirmButton>
        </Styled.ContainerPresentationCard>

        <Styled.ActionsBarContainer orientation={orientation}>
          <Styled.ActionsBar orientation={orientation} />
        </Styled.ActionsBarContainer>
      </Styled.ContainerView>
    </View>
  );
};

export default withPortal(ManagePresentationScreen);
