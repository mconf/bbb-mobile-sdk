import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Audio } from 'expo-av';
import { useState } from 'react';
import { View, Text, Button } from 'react-native';
import ScreenWrapper from '../../components/screen-wrapper';
import AudioSlider from '../../components/audio-player/AudioSlider';
import Styled from './styles';

const AudioPlayerScreen = () => {
  const uploadedFileCollection = useSelector(
    (state) => state.uploadedFileCollection.uploadedFileCollection
  );
  const uploadedFilesList = Object.values(uploadedFileCollection);
  const host = useSelector((state) => state.client.meetingData.host);
  const sessionToken = useSelector((state) => state.client.meetingData.sessionToken);

  if (uploadedFilesList.length === 0) {
    return (
      <ScreenWrapper>
        <Styled.ContainerCentralizedView>
          <Styled.NoPollsImage
            source={require('../../assets/application/service-off.png')}
            resizeMode="contain"
            style={{ width: 173, height: 130 }}
          />
          <Styled.NoPollsLabelTitle>
            Share audio files and make your classes more interactive!
          </Styled.NoPollsLabelTitle>
          <Styled.NoPollsLabelSubtitle>
            Multimedia content is a great ally to make your classes
            even more dynamic. This functionality allows for the sharing
            of synchronized audio during the session, which can be used in
            language classes, for example, or even to share music.
          </Styled.NoPollsLabelSubtitle>
        </Styled.ContainerCentralizedView>
      </ScreenWrapper>
    );
  }
  return (
    <Styled.ContainerCentralizedView>
      { uploadedFilesList.map((fileObj) => {
        const soundUri = {
          uri: `https://${host}/bigbluebutton/download/media/${fileObj?.uploadId}?filename=${fileObj.filename}&sessionToken=${sessionToken}`
        };
        return (
          <Styled.Card key={fileObj.uploadId}>
            <Text>
              {fileObj.filename}

            </Text>
            <View>

              <AudioSlider audioSource={soundUri} />
            </View>
          </Styled.Card>
        );
      })}
    </Styled.ContainerCentralizedView>

  );
};

export default AudioPlayerScreen;
