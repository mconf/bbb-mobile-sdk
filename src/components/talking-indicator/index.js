import { useSelector, useDispatch } from 'react-redux';
import { useSubscription } from '@apollo/client';
import Styled from './styles';
import { setIsPresentationOpen } from '../../store/redux/slices/wide-app/layout';
import Queries from './queries';

const TalkingIndicator = () => {
  const isPresentationOpen = useSelector((state) => state.layout.isPresentationOpen);
  const { data } = useSubscription(Queries.TALKING_INDICATOR_SUBSCRIPTION);
  const dispatch = useDispatch();

  const callersTalking = data?.user_voice ?? [];

  return (
    <>
      <Styled.ShowPresentationIcon
        isPresentationOpen={isPresentationOpen}
        onPress={() => dispatch(setIsPresentationOpen(true))}
      />
      <Styled.Container>
        {callersTalking.map((userObj, idx) => {
          if (userObj.talking) {
            if (idx < 2) {
              return (
                <Styled.TextContainer key={userObj.userId}>
                  <Styled.MicIcon />
                  <Styled.Text numberOfLines={1}>{userObj.user.name}</Styled.Text>
                </Styled.TextContainer>
              );
            }
            if (idx === 2) {
              return (
                <Styled.TextContainer key="more-users">
                  <Styled.Text numberOfLines={1}>...</Styled.Text>
                </Styled.TextContainer>
              );
            }
          }
          return null;
        })}
      </Styled.Container>
    </>
  );
};

export default TalkingIndicator;
