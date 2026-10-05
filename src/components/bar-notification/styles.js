import styled from 'styled-components/native';
import IconButtonComponent from '../icon-button';

const IndexContainer = styled.View`
  ${(props) => props.index === 1 && `

  `}

  ${(props) => props.index === 0 && `
    bottom: 110px
  `}
  align-items: center;
`;

const Container = styled.View`
  align-items: center;
`;

const NotificationContainer = styled.View`
    background-color: #000000aa;
    border-radius: 8px;
    flex-direction: row;
    align-items: center;
`;

const TextContainer = styled.View`
  padding: 8px 16px;
  flex-shrink: 1;
`;

const DismissButton = styled(IconButtonComponent)`
  margin: 0px 4px 0px 0px;
`;

const Text = styled.Text`
  font-size: 12px;
  color: white;
`;

export default {
  IndexContainer,
  Container,
  NotificationContainer,
  TextContainer,
  Text,
  DismissButton,
};
