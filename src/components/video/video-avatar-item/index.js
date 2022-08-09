import { useState } from 'react';
import { Alert } from 'react-native';
import Styled from './styles';
import IconButtonComponent from '../../icon-button';

const VideoAvatarItem = (props) => {
  const { source, userName, style } = props;
  const [showOptions, setShowOptions] = useState(false);

  return (
    <Styled.ContainerPressable
      style={style}
      onPress={() => setShowOptions((prevState) => !prevState)}
    >
      <Styled.UserAvatar source={source} />
      {!showOptions && (
        <Styled.NameLabelContainer>
          <Styled.NameLabel numberOfLines={1}>{userName}</Styled.NameLabel>
        </Styled.NameLabelContainer>
      )}
      {showOptions && (
        <Styled.PressableButton
          activeOpacity={0.6}
          onPress={() =>
            Alert.alert(
              'Currently under development',
              'This feature will be addressed soon, please check out our github page'
            )
          }
        >
          <IconButtonComponent
            icon="fullscreen"
            iconColor="white"
            size={16}
            containerColor="#00000000"
          />
          <Styled.NameLabel numberOfLines={2} style={{ flexShrink: 1 }}>
            Focar usuário
          </Styled.NameLabel>
        </Styled.PressableButton>
      )}
    </Styled.ContainerPressable>
  );
};

export default VideoAvatarItem;
