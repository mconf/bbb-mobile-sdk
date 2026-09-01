import { useSubscription } from '@apollo/client';
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';
import ScreenWrapper from '../../components/screen-wrapper';
import useCurrentUser from '../../graphql/hooks/useCurrentUser';
import useMeeting from '../../graphql/hooks/useMeeting';
import useMeetingSettings from '../../graphql/local-states/useMeetingSettings';
import logger from '../../services/logger';
import { trigDetailedInfo } from '../../store/redux/slices/wide-app/layout';
import Queries from './queries';
import Styled from './styles';

// BBB 4.0 replaced Etherpad with BlockNote, which is a library the web client
// bundles rather than a page the server hosts - there is no URL to point a WebView
// at. `editor-bundle.js` is our own build of it (see shared-notes-editor/).

const CONFIG_PLACEHOLDER = '/*__BBB_NOTES_CONFIG__*/';
const DEFAULT_NOTES_EXTERNAL_ID = 'notes';
const DEFAULT_MAX_DOCUMENT_CHARS = 99999;
const DEFAULT_MAX_LENGTH_FOR_CONTENT_UPDATE = 1500;
const ETHERPAD_EDITOR = 'etherpad';

// Escaped so a display name can never close the inline <script> it lands in.
const serializeForScript = (value) => JSON.stringify(value)
  .replace(/</g, '\\u003c')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

// `Intl.Locale` in the editor rejects the app's underscored codes (`pt_BR`).
const toBcp47 = (locale) => String(locale || 'en').replace(/_/g, '-');

// The drawer unmounts this screen on blur, so without a cache the 2+ MB document is
// rebuilt and re-sent over the bridge every time the notes are opened.
let cachedDocument = null;

const buildDocument = (config) => {
  const key = serializeForScript(config);
  if (cachedDocument?.key === key) return cachedDocument.html;
  // Lazy so the 2 MB string stays off the app's startup path.
  // eslint-disable-next-line global-require
  const editorHtml = require('./editor-bundle').default;
  if (!editorHtml.includes(CONFIG_PLACEHOLDER)) {
    logger.error({
      logCode: 'shared_notes_editor_bundle_placeholder_missing',
    }, 'The shared notes bundle has no config placeholder; rebuild it with npm run build:notes-editor');
    return null;
  }
  const html = editorHtml.replace(CONFIG_PLACEHOLDER, () => `window.__BBB_NOTES__=${key};`);
  cachedDocument = { key, html };
  return html;
};

const clearCachedDocument = () => { cachedDocument = null; };

const NotesEditorWebView = ({ initialConfig, liveConfig, onOpenActionsBar }) => {
  const webViewRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Frozen at mount: rebuilding it would reload the WebView and drop the Yjs
  // session, so mid-session changes go through injectJavaScript instead.
  const [html] = useState(() => buildDocument({ ...initialConfig, ...liveConfig }));

  useEffect(() => {
    if (!isLoaded || !webViewRef.current) return;
    webViewRef.current.injectJavaScript(
      `window.bbbNotesUpdate && window.bbbNotesUpdate(${serializeForScript(liveConfig)}); true;`,
    );
  }, [isLoaded, liveConfig]);

  // Backgrounding suspends the WebView's network, and the provider uses
  // maxAttempts: 1 (as on the web), so it never reconnects on its own.
  useEffect(() => {
    if (!isLoaded) return undefined;
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active' || !webViewRef.current) return;
      webViewRef.current.injectJavaScript(
        'window.bbbNotesRetryIfClosed && window.bbbNotesRetryIfClosed(); true;',
      );
    });
    return () => subscription.remove();
  }, [isLoaded]);

  // Navigating the WebView to a link would take the Yjs session with it.
  const openExternally = useCallback((url) => {
    if (!/^https?:/i.test(url)) return;
    Linking.openURL(url).catch((error) => {
      logger.warn({
        logCode: 'shared_notes_open_link_failed',
        extraInfo: { errorMessage: error?.message },
      }, 'Could not open a shared notes link in the browser');
    });
  }, []);

  const handleMessage = useCallback((event) => {
    let payload;
    try {
      payload = JSON.parse(event.nativeEvent.data);
    } catch (parseError) {
      return;
    }

    if (payload.type === 'event' && payload.event === 'openLink') {
      openExternally(payload.payload?.url);
      return;
    }

    if (payload.type === 'log') {
      const level = ['debug', 'info', 'warn', 'error'].includes(payload.level) ? payload.level : 'info';
      logger[level]({
        logCode: payload.logCode || 'shared_notes_editor',
        extraInfo: payload.extraInfo,
      }, payload.message);
      return;
    }

    // No toast surface here; the editor renders the ones the user must see.
    if (payload.type === 'notify') {
      logger.warn({
        logCode: 'shared_notes_editor_notification',
        extraInfo: { level: payload.level },
      }, payload.message);
    }
  }, [openExternally]);

  // Safety net; links already travel over the bridge. The document's own URL is
  // the page (re)loading itself, never a link.
  const handleShouldStartLoad = useCallback((request) => {
    if (!isLoaded || request.url.startsWith(initialConfig.baseUrl)) return true;
    if (/^https?:/i.test(request.url)) {
      openExternally(request.url);
      return false;
    }
    return true;
  }, [isLoaded, initialConfig.baseUrl, openExternally]);

  if (!html) return null;

  return (
    <Styled.ContainerScreen>
      <Styled.ToggleActionsBarIconButton onPress={onOpenActionsBar} />
      <WebView
        ref={webViewRef}
        source={{ html, baseUrl: initialConfig.baseUrl }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        keyboardDisplayRequiresUserAction={false}
        hideKeyboardAccessoryView
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onOpenWindow={(event) => {
          const url = event?.nativeEvent?.targetUrl;
          if (url && /^https?:/i.test(url)) openExternally(url);
        }}
        onLoadEnd={() => setIsLoaded(true)}
        onMessage={handleMessage}
        onRenderProcessGone={() => {
          logger.error({
            logCode: 'shared_notes_editor_render_process_gone',
          }, 'The shared notes WebView render process was killed');
        }}
      />
    </Styled.ContainerScreen>
  );
};

const UserNotesScreen = () => {
  const sessionToken = useSelector((state) => state.client.meetingData.sessionToken);
  const host = useSelector((state) => state.client.meetingData.host);
  const [meetingSettings] = useMeetingSettings();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const notesSettings = meetingSettings?.public?.notes;
  const sharedNotesSettings = meetingSettings?.public?.sharedNotes;
  const externalId = notesSettings?.id || DEFAULT_NOTES_EXTERNAL_ID;

  const {
    data: sharedNotesData,
    error: sharedNotesError,
  } = useSubscription(Queries.SHARED_NOTES_SUBSCRIPTION, {
    variables: { externalId },
  });
  const { data: currentUserData } = useCurrentUser();
  const { data: meetingData } = useMeeting();

  const sharedNotes = sharedNotesData?.sharedNotes?.[0];
  const padId = sharedNotes?.padId;
  const sharedNotesEditor = sharedNotes?.sharedNotesEditor;

  const currentUser = currentUserData?.user_current?.[0];
  const meeting = meetingData?.meeting?.[0];

  // As on the web: anything that is not 'etherpad' is BlockNote.
  const isEtherpadSharedNotes = sharedNotesEditor === ETHERPAD_EDITOR;

  const initialConfig = useMemo(() => ({
    padId,
    sessionToken,
    // Empty in settings.yml means "same host as the client".
    serverHostname: sharedNotesSettings?.serverHostname || host,
    // Keeps the BBB session cookie first-party for the Hocuspocus auth_request.
    baseUrl: `https://${host}/`,
    defaultLocale: 'en',
    staticFormattingToolbar: sharedNotesSettings?.staticFormattingToolbar ?? true,
    maxDocumentChars: sharedNotesSettings?.maxDocumentChars || DEFAULT_MAX_DOCUMENT_CHARS,
    maxLengthForContentUpdate: sharedNotesSettings?.maxLengthForContentUpdate
      || DEFAULT_MAX_LENGTH_FOR_CONTENT_UPDATE,
  }), [padId, sessionToken, host, sharedNotesSettings]);

  const liveConfig = useMemo(() => ({
    locale: toBcp47(i18n.language),
    messages: {
      payloadSizeError: t('app.notes.blocknote.payloadSizeError'),
      maxCharCountError: t('app.notes.blocknote.maxCharCountError'),
      dismiss: t('mobileSdk.sharedNotes.dismiss'),
      retry: t('mobileSdk.sharedNotes.retry'),
      connectionClosed: t('mobileSdk.sharedNotes.connectionClosed'),
      authenticationFailed: t('mobileSdk.sharedNotes.authenticationFailed'),
      securityViolation: t('mobileSdk.sharedNotes.securityViolation'),
    },
    userName: currentUser?.name || '',
    userColor: currentUser?.color || '',
    isModerator: !!currentUser?.isModerator,
    locked: !!currentUser?.locked,
    disableNotes: !!meeting?.lockSettings?.disableNotes,
  }), [
    i18n.language,
    t,
    currentUser?.name,
    currentUser?.color,
    currentUser?.isModerator,
    currentUser?.locked,
    meeting?.lockSettings?.disableNotes,
  ]);

  useEffect(() => {
    if (isEtherpadSharedNotes) {
      logger.warn({
        logCode: 'shared_notes_unsupported_editor',
        extraInfo: { sharedNotesEditor },
      }, 'This meeting uses the Etherpad shared notes, which the app no longer supports');
    }
  }, [isEtherpadSharedNotes, sharedNotesEditor]);

  useEffect(() => {
    if (sharedNotesError) {
      logger.error({
        logCode: 'shared_notes_subscription_error',
        extraInfo: { errorMessage: sharedNotesError.message },
      }, 'Could not subscribe to the shared notes');
    }
  }, [sharedNotesError]);

  useEffect(() => {
    if (!sessionToken) clearCachedDocument();
  }, [sessionToken]);

  const openActionsBar = useCallback(() => dispatch(trigDetailedInfo()), [dispatch]);

  const withChrome = (children) => (
    <ScreenWrapper renderWithView>
      <Styled.ContainerScreen>
        <Styled.ToggleActionsBarIconButton onPress={openActionsBar} />
        <Styled.CenteredContainer>
          {children}
        </Styled.CenteredContainer>
      </Styled.ContainerScreen>
    </ScreenWrapper>
  );

  if (isEtherpadSharedNotes) {
    return withChrome(
      <Styled.MessageText>{t('mobileSdk.sharedNotes.unsupportedEditor')}</Styled.MessageText>,
    );
  }

  if (sharedNotesError) {
    return withChrome(
      <Styled.MessageText>{t('mobileSdk.sharedNotes.loadFailed')}</Styled.MessageText>,
    );
  }

  if (!padId || !sessionToken || !host) {
    return withChrome(<Styled.Spinner animating size="large" />);
  }

  return (
    <ScreenWrapper renderWithView>
      <NotesEditorWebView
        initialConfig={initialConfig}
        liveConfig={liveConfig}
        onOpenActionsBar={openActionsBar}
      />
    </ScreenWrapper>
  );
};

export default UserNotesScreen;
