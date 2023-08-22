import { StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import button from '../../button';
import Colors from '../../../constants/colors';

const fullscreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  indicatorStyle: {
    backgroundColor: 'white',
  },
  handleStyle: {
  },
  backgroundStyle: {
    backgroundColor: 'black',
    opacity: 0.5,
  },
  style: {
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#06172A',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0e2a50',
    padding: 8,
  },
  indicatorStyle: {
    backgroundColor: 'white',
  },
  handleStyle: {
    backgroundColor: '#0e2a50',
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
  },
  backgroundStyle: {
    backgroundColor: '#0e2a50',
  },
  style: {
  }
});

const OptionsButton = styled(button)`
  background-color: ${Colors.lightGray200}
  color: ${Colors.lightGray400};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 12px;
  width: 100%;

  ${({ selected }) => selected
  && `
      background-color: #003399;
      color: ${Colors.white};
  `}
`;

const ButtonContainer = styled.View`
  width: 100%;
  padding: 24px 0;
  margin: 0;
  border-radius: 16px;
`;

const DeviceSelectorTitle = styled.Text`
  color: white;
  text-align: center;
  font-size: 20px;
`;

export default {
  styles,
  fullscreenStyles,
  OptionsButton,
  ButtonContainer,
  DeviceSelectorTitle
};
