import styled from 'styled-components/native';
import { StyleSheet } from 'react-native';
import VideoContainer from '../video-container';
import contentArea from '../../content-area';
import Colors from '../../../constants/colors';

const VideoListItem = styled(VideoContainer)`
  width: 100%;
  height: 100%;
`;

const ContentArea = styled(contentArea)`
`;

const Item = styled.View`
  display: flex;
  background-color: #d0c4cb;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  ${({ dimensionHeight, isPresentationOpen }) => dimensionHeight // 1 user
    && isPresentationOpen
    && `
    height: ${parseInt((dimensionHeight * 2) / 3, 10)}px;
  `}

  ${({ dimensionHeight, usersCount, isPresentationOpen }) => dimensionHeight // 2 user
    && isPresentationOpen
    && usersCount === 2
    && `
    height: ${parseInt((dimensionHeight) / 3, 10)}px;
  `}


  ${({ usersCount, dimensionHeight, isPresentationOpen }) => usersCount % 2 === 0
    && isPresentationOpen
    && usersCount > 2
    && `
      width: 50%;
      height: ${parseInt((dimensionHeight) / 3, 10)}px;
  `}

  ${({ usersCount, dimensionHeight, isPresentationOpen }) => usersCount % 2 === 1
    && isPresentationOpen
    && usersCount > 2
    && `
      width: 50%;
      flex-grow: 1;
      flex-shrink: 1;
      flex-basis: 0;
      height: ${parseInt((dimensionHeight) / 3, 10)}px;
  `}

  ${({ dimensionHeight, isPresentationOpen }) => dimensionHeight // 1 user
    && !isPresentationOpen
    && `
    height: ${parseInt((dimensionHeight * 3) / 3, 10)}px;
  `}

  ${({ dimensionHeight, usersCount, isPresentationOpen }) => dimensionHeight // 2 user
    && !isPresentationOpen
    && usersCount === 2
    && `
    height: ${parseInt((dimensionHeight * 1.5) / 3, 10)}px;
  `}


  ${({ usersCount, dimensionHeight, isPresentationOpen }) => usersCount % 2 === 0
    && !isPresentationOpen
    && usersCount > 2
    && `
      width: 50%;
      height: ${parseInt((dimensionHeight * 1.5) / 3, 10)}px;
  `}

  ${({ usersCount, dimensionHeight, isPresentationOpen }) => usersCount % 2 === 1
    && !isPresentationOpen
    && usersCount > 2
    && `
      width: 50%;
      flex-grow: 1;
      flex-shrink: 1;
      flex-basis: 0;
      height: ${parseInt((dimensionHeight * 1.5) / 3, 10)}px;
  `}

  ${({ usersCount, dimensionHeight, isPresentationOpen }) => usersCount % 2 === 0
    && !isPresentationOpen
    && usersCount > 4
    && `
      width: 50%;
      height: ${parseInt((dimensionHeight * 1) / 3, 10)}px;
  `}

  ${({ usersCount, dimensionHeight, isPresentationOpen }) => usersCount % 2 === 1
    && !isPresentationOpen
    && usersCount > 4
    && `
      width: 50%;
      flex-grow: 1;
      flex-shrink: 1;
      flex-basis: 0;
      height: ${parseInt((dimensionHeight * 1) / 3, 10)}px;
  `}

`;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  }
});

const ContainerViewItem = styled.View`
  display: flex;
  background-color: #d0c4cb;
  align-items: center;
  justify-content: center;
  width: 100%;

  ${({ isPresentationOpen }) => !isPresentationOpen
    && `
      display: none;
  `}

  ${({ dimensionHeight }) => dimensionHeight
    && `
    height: ${parseInt(dimensionHeight / 3, 10)}px;
  `}
`;

const SessionAloneTitle = styled.Text`
  color: white;
  font-weight: 600;
  font-size: 24px;
  text-align: center;
`;

const SessionAloneDesc = styled.Text`
  color: white;
  font-weight: 400;
  font-size: 18px;
  text-align: center;
`;

const ContainerSessionAlone = styled.View`
  display: flex;
  width: 100%;
  padding-top: 50px;

  ${({ dimensionHeight }) => dimensionHeight
    && `
    height: ${parseInt((dimensionHeight), 10)}px;
  `}
`;

const ContainerTextSessionAlone = styled.View`
  width: 100%;
  flex: 1;
  align-items: center;
  gap: 16px;
  padding: 16px;
  ${({ isPresentationOpen }) => !isPresentationOpen
    && `
    justify-content: center;
  `}
`;

const NoPollsImage = styled.Image``;

const NoPollsLabelTitle = styled.Text`
  color: ${Colors.white};
  font-size: 21px;
  text-align: center;
  font-weight: 500;
`;

const NoPollsLabelSubtitle = styled.Text`
  color: ${Colors.white};
  font-size: 16px;
  text-align: center;
`;

const RenderSessionAlone = ({
  sessionAloneTitle, sessionAloneDesc, isPresentationOpen
}) => {
  return (
    <ContainerTextSessionAlone isPresentationOpen={isPresentationOpen}>
      <NoPollsImage
        source={require('../../../assets/application/service-off.png')}
        resizeMode="contain"
        style={{ width: 173, height: 130 }}
      />
      <NoPollsLabelTitle>
        {sessionAloneTitle}
      </NoPollsLabelTitle>
      <NoPollsLabelSubtitle>
        {sessionAloneDesc}
      </NoPollsLabelSubtitle>
    </ContainerTextSessionAlone>
  );
};

export default {
  VideoListItem,
  ContentArea,
  styles,
  Item,
  ContainerViewItem,
  SessionAloneTitle,
  RenderSessionAlone,
  ContainerSessionAlone,
  SessionAloneDesc
};
