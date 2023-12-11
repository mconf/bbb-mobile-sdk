import styled from 'styled-components/native';
import Colors from '../../../constants/colors';

const FileNameText = styled.Text`
  font-size: 14px;
  font-weight: 400;
  color: ${Colors.lightGray400}
`;

const DurationText = styled.Text`
  font-size: 10px;
  font-weight: 400;
  color: #B1B3B3;
`;

const SliderContainer = styled.View`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 16px;
`;

const Container = styled.View`
  display: flex;
  justify-content: center;
  gap: 16px;
`;

export default {
  FileNameText,
  DurationText,
  SliderContainer,
  Container
};
