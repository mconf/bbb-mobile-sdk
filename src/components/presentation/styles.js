import ContentLoader, { Rect } from 'react-content-loader/native';
import styled from 'styled-components/native';

const PresentationImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const PresentationSkeleton = () => (
  <ContentLoader
    speed={1}
    width="100%"
    height="100%"
    viewBox="0 0 160 90"
    backgroundColor="#6e6e6e"
    foregroundColor="#505050"
    position="absolute"
  >
    <Rect x="0" y="0" rx="3" ry="3" width="160" height="90" />
  </ContentLoader>
);

export default {
  PresentationImage,
  PresentationSkeleton,
};
