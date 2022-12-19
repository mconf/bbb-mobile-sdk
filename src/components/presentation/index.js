import { useState } from 'react';
import Styled from './styles';

const Presentation = (props) => {
  const { source, style } = props;
  const [loading, setLoading] = useState(true);

  return (
    <Styled.PresentationView>
      {loading && <Styled.PresentationSkeleton />}
      <Styled.PresentationImage
        source={source}
        style={style}
        resizeMode="contain"
        onLoadEnd={() => { setLoading(false); }}
      />
    </Styled.PresentationView>
  );
};

export default Presentation;
