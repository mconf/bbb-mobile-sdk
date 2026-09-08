import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import * as BlockNoteLocales from '@blocknote/core/locales';
import { useEffect, useState, useRef } from 'react';
import { logger } from './bridge';
import { getConfig, useConfig } from './config';

// Port of bigbluebutton-html5/imports/ui/components/bn-shared-notes/hooks.ts. The
// connection lifecycle is kept identical to the web client.

const hasSessionToken = (sessionToken) => sessionToken != null && sessionToken !== '';
const checkLockReason = (reason) => reason === 'Lock rules changed.' || reason === 'Role changed.';

const useHocuspocusProvider = () => {
  const [hocuspocusProvider, setHocuspocusProvider] = useState();
  const hocuspocusProviderRef = useRef();
  const wsProviderRef = useRef();
  const isAuthenticating = useRef(false);
  const autoRetryCount = useRef(0);
  const [error, setError] = useState(null);
  const [connectionClosed, setConnectionClosed] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [isSynced, setIsSynced] = useState(false);

  const { padId, sessionToken, serverHostname } = getConfig();

  const handleRetry = () => {
    if (hocuspocusProviderRef.current) {
      hocuspocusProviderRef.current.destroy();
    }
    if (wsProviderRef.current) {
      wsProviderRef.current.destroy();
    }
    setError(null);
    setConnectionClosed(false);
    hocuspocusProviderRef.current = undefined;
    wsProviderRef.current = undefined;
    setHocuspocusProvider(undefined);
    setIsSynced(false);
    setRetryTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (!hocuspocusProvider
      && padId
      && hasSessionToken(sessionToken)
      && !isAuthenticating.current
    ) {
      const documentName = padId;
      const blockNoteToken = sessionToken;

      logger.debug({
        logCode: 'hocuspocus_creating_provider',
        extraInfo: { documentId: documentName },
      }, 'Creating new HocuspocusProvider instance');

      const hocuspocusServerHostname = serverHostname || window.location.hostname;
      const hocuspocusServerUrl = `wss://${hocuspocusServerHostname}/hocuspocus/collaboration`;

      const wsProvider = new HocuspocusProviderWebsocket({
        url: `${hocuspocusServerUrl}?sessionToken=${sessionToken}`,
        maxAttempts: 1,
      });
      wsProviderRef.current = wsProvider;
      isAuthenticating.current = true;
      const provider = new HocuspocusProvider({
        name: documentName,
        token: blockNoteToken,
        websocketProvider: wsProvider,
        onConnect: () => {
          logger.debug({
            logCode: 'hocuspocus_connected',
            extraInfo: { documentId: documentName },
          }, 'Hocuspocus connection established');
          isAuthenticating.current = false;
        },
        onAuthenticated: () => {
          logger.debug({
            logCode: 'hocuspocus_authenticated',
            extraInfo: { documentId: documentName },
          }, 'Hocuspocus authentication successful');
          isAuthenticating.current = false;
        },
        onSynced: ({ state }) => {
          logger.debug({
            logCode: 'hocuspocus_synced',
            extraInfo: {
              documentId: documentName,
              synced: state,
            },
          }, 'Hocuspocus document synced');
          autoRetryCount.current = 0;
          setIsSynced(true);
          setHocuspocusProvider(provider);
        },
        onAuthenticationFailed: (data) => {
          setError('authenticationFailed');
          logger.error({
            logCode: 'hocuspocus_authentication_failed',
            extraInfo: {
              reason: data.reason,
              documentId: documentName,
            },
          }, `Authentication failed while trying to connect to hocuspocus server [${data.reason}]`);
        },
        onClose: (data) => {
          logger.debug({
            logCode: 'hocuspocus_closed_connection',
            extraInfo: {
              code: data.event.code,
              reason: data.event.reason,
              documentId: documentName,
            },
          }, `Hocuspocus server closed websocket connection, reason: ${data.event.reason}`);

          const { code, reason } = data.event;

          // Handle security violations - do not reconnect
          // 1003: Unsupported Data, 1005: No Status / Too many requests, 1009: Message Too Big
          const SECURITY_VIOLATION_CODES = [1003, 1005, 1009];
          if (SECURITY_VIOLATION_CODES.includes(code)) {
            let securityViolationReason = reason;
            if (!reason || reason === '') {
              switch (code) {
                case 1003:
                  securityViolationReason = 'Unsupported data';
                  break;
                case 1005:
                  securityViolationReason = 'Too many requests';
                  break;
                case 1009:
                  securityViolationReason = 'Payload too long';
                  break;
                default:
                  securityViolationReason = 'Unknown error - Contact administrators';
                  break;
              }
            }
            setError(`securityViolation:${securityViolationReason}`);
            isAuthenticating.current = false;
            // Destroy the provider to prevent reconnection attempts
            if (hocuspocusProviderRef.current) {
              hocuspocusProviderRef.current.destroy();
            }
            if (wsProviderRef.current) {
              wsProviderRef.current.destroy();
            }
            hocuspocusProviderRef.current = undefined;
            wsProviderRef.current = undefined;
          } else if (code === 1008 && checkLockReason(reason) && autoRetryCount.current < 1) {
            autoRetryCount.current += 1;
            logger.debug({
              logCode: 'hocuspocus_auto_retry',
              extraInfo: { documentId: documentName, attempt: autoRetryCount.current },
            }, `Hocuspocus connection closed (code ${code}), auto-retrying (attempt ${autoRetryCount.current})`);
            isAuthenticating.current = false;
            handleRetry();
          } else {
            setConnectionClosed(true);
            isAuthenticating.current = false;
          }
        },
      });
      hocuspocusProviderRef.current = provider;
      provider.attach();
    }
  }, [retryTrigger, sessionToken, padId]);

  useEffect(() => () => {
    // Run on unmount
    if (hocuspocusProviderRef.current) {
      hocuspocusProviderRef.current.destroy();
    }
    if (wsProviderRef.current) {
      wsProviderRef.current.destroy();
    }
  }, []);

  return {
    hocuspocusProvider,
    isAuthenticating: isAuthenticating.current,
    isSynced,
    error,
    connectionClosed,
    handleRetry,
  };
};

// e.g.: zh-TW -> zhTW (That's how block-note maps their available languages)
const convertIntlLocaleIntoBNLocale = (intlLocale) => {
  const locale = new Intl.Locale(intlLocale);
  return `${locale.language}${locale.region || ''}`;
};

// `Intl.Locale` throws on the app's underscored codes, taking the editor down.
const toBcp47 = (locale) => String(locale || '').replace(/_/g, '-');

const resolveBlockNoteLocale = (currentLocale, defaultLocale) => {
  const availableLanguages = Object.keys(BlockNoteLocales);
  try {
    const currentLocaleInBnFormat = convertIntlLocaleIntoBNLocale(toBcp47(currentLocale));
    const intlCurrentLanguage = new Intl.Locale(toBcp47(currentLocale)).language;
    const intlDefaultLanguage = new Intl.Locale(toBcp47(defaultLocale)).language;

    if (availableLanguages.includes(currentLocaleInBnFormat)) {
      return currentLocaleInBnFormat;
    }
    if (availableLanguages.includes(intlCurrentLanguage)) {
      return intlCurrentLanguage;
    }
    if (availableLanguages.includes(defaultLocale)) {
      return defaultLocale;
    }
    if (availableLanguages.includes(intlDefaultLanguage)) {
      return intlDefaultLanguage;
    }
  } catch (parseError) {
    logger.warn({
      logCode: 'shared_notes_locale_parse_failed',
      extraInfo: { currentLocale, defaultLocale },
    }, 'Could not resolve a BlockNote locale, falling back to English');
  }
  return 'en';
};

function useBlockNoteLocaleLanguage() {
  const { locale: currentLocale, defaultLocale } = useConfig();

  const [blockNoteLocale, setBlockNoteLocale] = useState(
    () => resolveBlockNoteLocale(currentLocale, defaultLocale),
  );

  useEffect(() => {
    const resolved = resolveBlockNoteLocale(currentLocale, defaultLocale);
    if (resolved !== blockNoteLocale) setBlockNoteLocale(resolved);
  }, [currentLocale, defaultLocale]);

  return blockNoteLocale;
}

export { useHocuspocusProvider, useBlockNoteLocaleLanguage };
