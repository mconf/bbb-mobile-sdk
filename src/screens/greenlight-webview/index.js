import { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { URL_TYPES, detectUrlType } from '../../utils/url-detection';
import Styled from './styles';

const GreenlightWebView = ({ roomUrl, onJoinUrl, onBack }) => {
  const [loading, setLoading] = useState(true);

  const handleShouldStartLoad = (request) => {
    const { type, url } = detectUrlType(request.url);
    if (type === URL_TYPES.BBB_JOIN) {
      onJoinUrl(url);
      return false; // Prevent WebView from loading the BBB URL
    }
    return true;
  };

  const handleNavigationChange = (navState) => {
    const { type, url } = detectUrlType(navState.url);
    if (type === URL_TYPES.BBB_JOIN) {
      onJoinUrl(url);
    }
  };

  return (
    <Styled.WebviewContainer>
      <Styled.Header>
        <Styled.BackButton onPress={onBack}>
          <Styled.BackButtonText>← Back</Styled.BackButtonText>
        </Styled.BackButton>
        <Styled.Title numberOfLines={1}>Greenlight</Styled.Title>
        {loading && <ActivityIndicator size="small" color="#ffffff" />}
      </Styled.Header>
      <WebView
        source={{ uri: roomUrl }}
        onNavigationStateChange={handleNavigationChange}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        // Security: restrict WebView capabilities
        allowFileAccess={false}
        allowUniversalAccessFromFileURLs={false}
        allowFileAccessFromFileURLs={false}
        mixedContentMode="compatibility"
        style={{ flex: 1 }}
      />
    </Styled.WebviewContainer>
  );
};

export default GreenlightWebView;
