import { useCallback, useRef, useMemo, useContext } from 'react';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import Styled from './styles';
import UserAvatar from '../../user-avatar';
import IconButtonComponent from '../../icon-button';
import { BottomSheetContext } from '../../../store/context/bottom-sheet-context';
import Colors from '../../../constants/colors';

const BottomSheetChat = (props) => {
  const { messages } = props;

  const sheetRef = useRef(null);
  const bottomSheetCtx = useContext(BottomSheetContext);

  const snapPoints = useMemo(() => ['25%', '95%'], []);

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      bottomSheetCtx.triggerButton('chatBottomSheet', false);
    }
  }, []);

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
          <Styled.TextInput label="Send a message!" />
          <IconButtonComponent
            icon="send"
            iconColor={Colors.white}
            containerColor={Colors.blue}
            animated
            onPress={() => {}}
          />
        </Styled.SendMessageContainer>
      </BottomSheet>
    </Styled.Container>
  );
};

export default BottomSheetChat;
