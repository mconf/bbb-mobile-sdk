import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const OutsideBar = styled.View`
  background-color: ${Colors.lightGray200}
  border-radius: 90px;
  height: 8px;
  width: 100%;
`;

const InsideBar = styled.View`
  background-color: ${Colors.lightBlue}
  border-radius: 90px;
  height: 8px;
  width: 0%;
  ${({ width }) => width
  && `
    width: ${width};
  `}
`;

export default {
  OutsideBar,
  InsideBar
};
