import React, { useCallback, useRef, useMemo, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { ActionsBarContext } from '../../../store/context/actions-bar-context';
import Styled from './styles';
import UserAvatar from '../../../components/UserAvatar';
import TextInput from '../../../components/TextInput';
import IconButtonComponent from '../../../components/IconButton';

const BottomSheetChat = (props) => {
  const { messages } = props;

  // hooks
  const sheetRef = useRef(null);
  const actionsBarCtx = useContext(ActionsBarContext);

  // variables
  const snapPoints = useMemo(() => ['25%', '60%', '95%'], []);

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      actionsBarCtx.triggerButton('chatBottomSheet', false);
    }
  }, []);

  // render
  const renderItem = ({ item }) => {
    return (
      <Styled.ContainerItem>
        <UserAvatar userName={item.author} />
        <Styled.Card>
          <Styled.MessageAuthor>{item.author}</Styled.MessageAuthor>
          <Styled.MessageContent>{item.message}</Styled.MessageContent>
        </Styled.Card>
      </Styled.ContainerItem>
    );
  };

  return (
    <Styled.Container>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
      >
        <BottomSheetFlatList data={messages} renderItem={renderItem} />
        <Styled.SendMessageContainer>
          <Styled.TextInput />
          <IconButtonComponent
            icon="send"
            iconColor="#FFFFFF"
            containerColor="#003399"
            animated
            onPress={() => {}}
          />
        </Styled.SendMessageContainer>
      </BottomSheet>
    </Styled.Container>
  );
};

export default BottomSheetChat;
