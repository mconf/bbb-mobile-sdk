import styled from 'styled-components/native';

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
    align-items: center;
`;

const TextContainer = styled.View`
  padding: 8px 16px;
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
};
