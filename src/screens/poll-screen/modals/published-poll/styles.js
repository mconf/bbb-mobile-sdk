import styled from 'styled-components/native';

const Container = styled.Pressable`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  gap: 12px;
`;

const InsideContainer = styled.View`
  transform: scale(0.65);
`;

export default {
  Container,
  InsideContainer
};
