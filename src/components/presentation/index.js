import Styled from './styles';

const Presentation = (props) => {
  const { source, style } = props;

  return (
    <Styled.PresentationImage
      source={source}
      style={style}
      resizeMode="contain"
    />
  );
};

export default Presentation;
