import { useState } from 'react';
import Styled from './styles';

const Presentation = (props) => {
  const { source, style } = props;
  const [loading, setLoading] = useState(false);

  return (
    <>
      {source?.uri && loading && <Styled.PresentationSkeleton />}
      {source?.uri && (
        <Styled.PresentationImage
          source={source}
          style={style}
          resizeMode="contain"
          onLoadStart={() => { setLoading(true); }}
          onLoadEnd={() => { setLoading(false); }}
        />
      )}
    </>
  );
};

export default Presentation;
