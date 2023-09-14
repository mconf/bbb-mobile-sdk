import styled from 'styled-components/native';

const IndexContainer = styled.View`
  ${(props) => props.index === 1 && `
    bottom: 48%
  `}

  ${(props) => props.index === 0 && `
    bottom: 15%
  `}
  align-items: center;
`;

const Container = styled.View`
  padding: 10px;
`;

const NotificationContainer = styled.View`
    background-color: #000000aa;
    width: auto;
    border-radius: 8px;
    bottom: 5%;
    align-items: center;
`;

const TextContainer = styled.View`
  padding: 8px;
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
