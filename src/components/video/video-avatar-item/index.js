import Styled from './styles';

const VideoAvatarItem = (props) => {
  const { source, userName, style } = props;

  return (
    <Styled.ContainerView style={style}>
      <Styled.UserAvatar source={source} />
      <Styled.NameLabelContainer>
        <Styled.NameLabel numberOfLines={1}>{userName}</Styled.NameLabel>
      </Styled.NameLabelContainer>
    </Styled.ContainerView>
  );
};

export default VideoAvatarItem;
