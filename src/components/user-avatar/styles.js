import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const Background = styled.View`
  width: 52px;
  height: 52px;
  border: ${Colors.white} solid 2px;
  border-radius: 50px;
  background-color: ${Colors.orange};
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ userRole }) => userRole === 'MODERATOR' && `
     border-radius: 12px;
  `}

  ${({ isTalking }) => isTalking
    && `
      border: ${Colors.green} solid 3px;
  `}

  ${({ userColor }) => userColor
          && `
     background-color: ${userColor};
  `}

  ${({ mini }) => mini && `
    margin: 0 0 0 -7px;
    width: 24px;
    height: 24px;
    font-size: 8px;
  `}
`;

const ImageBackground = styled.Image`
  width: 45px;
  height: 45px;
  border-radius: 45px;
  object-fit: cover;
  overflow: hidden;

  ${({ userRole }) => userRole === 'MODERATOR' && `
     border-radius: 8px;
  `}
`;

const ImageContainer = styled.View`
  border-radius: 50px;
  overflow: hidden;

  ${({ userRole }) => userRole === 'MODERATOR' && `
     border-radius: 8px;
  `}
`;

const UserName = styled.Text`
  color: ${Colors.white};
  font-size: 18px;

  ${({ mini }) => mini && `
    font-size: 11px;
  `}
`;

export default {
  Background,
  UserName,
  ImageBackground,
  ImageContainer,
};
