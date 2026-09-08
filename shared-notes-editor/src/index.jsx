import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BlockNoteView } from '@blocknote/mantine';
import * as BlockNoteLocales from '@blocknote/core/locales';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
// As of BlockNote 0.53, `collaboration` is no longer a `BlockNoteEditorOptions` field:
// it ships as an extension behind the `@blocknote/core/yjs` subpath
import { withCollaboration } from '@blocknote/core/yjs';
import '@blocknote/mantine/style.css';
// Loaded after BlockNote's stylesheet so these rules win.
import './styles.css';
import { Awareness } from 'y-protocols/awareness';
import {
  BasicTextStyleButton,
  BlockNoteViewEditor,
  BlockTypeSelect,
  ColorStyleButton,
  ComponentsContext,
  FormattingToolbar,
  NestBlockButton,
  SuggestionMenuController,
  UnnestBlockButton,
  useComponentsContext,
  useCreateBlockNote,
} from '@blocknote/react';
import { Menu as MantineMenu } from '@mantine/core';

import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Extension } from '@tiptap/core';
import TextAlignSelect from './text-align-select';
import { useBlockNoteLocaleLanguage, useHocuspocusProvider } from './hooks';
import { useConfig, t } from './config';
import { logger, notify, emit } from './bridge';

// Port of bigbluebutton-html5/imports/ui/components/bn-shared-notes/component.tsx.
// Deliberate differences are marked "MOBILE:"; keep the rest close to the original.

// Force-retain `Awareness` against a webpack tree-shaking interaction that
// otherwise drops this class while keeping its `extends Observable` expression,
// producing `ReferenceError: observable is not defined` in the minified bundle.
globalThis.bbbAwarenessKeepalive = Awareness;

const maxDocumentCharsPluginKey = new PluginKey('maxDocumentChars');

const createMaxDocumentCharsExtension = (maxChars, onExceed) => Extension.create({
  name: 'bbbMaxDocumentChars',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: maxDocumentCharsPluginKey,
        filterTransaction(tr) {
          if (!tr.docChanged) return true;
          let charCount = 0;
          tr.doc.descendants((node) => {
            if (node.isText) charCount += node.text?.length ?? 0;
          });
          if (charCount > maxChars) {
            onExceed(charCount);
          }
          return charCount <= maxChars;
        },
      }),
    ];
  },
});

const escapeBlurExtension = Extension.create({
  name: 'bbbEscapeBlur',
  addKeyboardShortcuts() {
    return {
      Escape: () => {
        this.editor.commands.blur();
        return true;
      },
    };
  },
});

const shouldOpenSlashMenu = (transaction) => {
  const { $from } = transaction.selection;
  if ($from.parent.type.isInGroup('tableContent')) return false;

  const previousCharacter = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - 1),
    $from.parentOffset,
  );
  return previousCharacter === '' || /\s/.test(previousCharacter);
};

// TODO: remove this workaround once y-prosemirror's cursor decoration can set `marks: []`
// (the upstream-correct fix is `marks: []` on the cursor `Decoration.widget` in
// y-prosemirror/src/plugins/cursor-plugin.js; related: https://github.com/yjs/y-prosemirror/issues/174).
// The remote collaboration cursor is a ProseMirror *widget decoration*. y-prosemirror
// renders it with `side: 10` and no `marks`, so ProseMirror wraps the widget in the
// marks of the node that follows the caret. When a remote user's caret sits inside (or
// at the edge of) a link, that following node carries the `link` mark, so the cursor
// widget - and therefore the user's name and the U+2060 word-joiner separators around
// it - is rendered *inside* the <a>, polluting the link's visible text (issue #25225).
//
// y-prosemirror hardcodes the decoration spec and BlockNote exposes no hook for it, so
// we use BlockNote's supported `renderCursor` hook to render a cursor that carries no
// document text: the name lives in a `data-cursor-name` attribute shown via the CSS
// `::after` rule below (pseudo-content is never part of `textContent`), and the U+2060
// separators are omitted.
const renderCollaborationCursor = (user) => {
  const cursorElement = document.createElement('span');
  cursorElement.classList.add('bn-collaboration-cursor__base');

  const caret = document.createElement('span');
  caret.classList.add('bn-collaboration-cursor__caret');
  caret.setAttribute('style', `background-color: ${user.color}`);

  const label = document.createElement('span');
  label.classList.add('bn-collaboration-cursor__label');
  label.setAttribute('style', `background-color: ${user.color}`);
  label.setAttribute('data-cursor-name', user.name ?? '');

  caret.appendChild(label);
  cursorElement.appendChild(caret);
  return cursorElement;
};

const format = (template, values) => Object.entries(values).reduce(
  (text, [key, value]) => text.replaceAll(`{${key}}`, value),
  template,
);

// MOBILE: the web requires ctrl/meta to open a link, which a touch screen has not.
const isCoarsePointer = () => {
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch (error) {
    return true;
  }
};

// MOBILE: `window.open` can navigate this page away, taking the Yjs session with it.
const openLink = (url) => emit('openLink', { url });

// Mantine's Menu defaults to trapFocus:true, trapping Tab inside open dropdowns.
// Replace Generic.Menu.Root with this to let Tab exit the menu (WAI-ARIA pattern).
const AccessibleMenuRoot = ({ children, onOpenChange, position }) => (
  <MantineMenu
    withinPortal={false}
    middlewares={{
      flip: true, shift: true, inline: false, size: true,
    }}
    trapFocus={false}
    onChange={onOpenChange}
    position={position}
    returnFocus={false}
  >
    {children}
  </MantineMenu>
);

// Patches ComponentsContext so every Generic.Menu.Root in the toolbar uses
// AccessibleMenuRoot - fixes both ColorStyleButton and TextAlignSelect.
function ToolbarWithAccessibleMenus({ children }) {
  const components = useComponentsContext();
  const patchedComponents = React.useMemo(() => ({
    ...components,
    Generic: {
      ...components.Generic,
      Menu: { ...components.Generic.Menu, Root: AccessibleMenuRoot },
    },
  }), [components]);
  return <ComponentsContext.Provider value={patchedComponents}>{children}</ComponentsContext.Provider>;
}

function BlockNoteApp(props) {
  const { hocuspocusProvider } = props;

  const {
    userName,
    userColor,
    isModerator: currentUserIsModerator,
    locked: currentUserIsLocked,
    disableNotes,
    maxDocumentChars: MAX_DOCUMENT_CHARS,
    maxLengthForContentUpdate: MAX_UPDATE_SHARED_NOTES,
    staticFormattingToolbar: STATIC_FORMATTING_TOOLBAR_ENABLED,
  } = useConfig();

  const blockNoteLocale = useBlockNoteLocaleLanguage();
  const [notificationErrorMessage, setNotificationErrorMessage] = React.useState(null);
  const notificationErrorMessageRef = React.useRef(null);
  notificationErrorMessageRef.current = notificationErrorMessage;

  // Remove Media block types for now
  const {
    // eslint-disable-next-line no-unused-vars
    audio, image, file, video, ...remainingBlockSpecs
  } = defaultBlockSpecs;

  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...remainingBlockSpecs,
    },
  });

  const fragment = hocuspocusProvider.document.getXmlFragment('doc');

  const MAX_PASTE_SIZE = MAX_UPDATE_SHARED_NOTES * 1024;

  // MOBILE: no toast surface, and each call crosses the bridge into an HTTP log
  // POST - holding a key at the limit would flood it. Throttled and shown in-page.
  const lastCharLimitNoticeRef = React.useRef(0);
  const [charLimitMessage, setCharLimitMessage] = React.useState(null);
  const CHAR_LIMIT_NOTICE_INTERVAL_MS = 3000;

  const maxDocumentCharsExtension = React.useMemo(
    () => createMaxDocumentCharsExtension(MAX_DOCUMENT_CHARS, (charCount) => {
      const now = Date.now();
      if (now - lastCharLimitNoticeRef.current < CHAR_LIMIT_NOTICE_INTERVAL_MS) return;
      lastCharLimitNoticeRef.current = now;

      logger.warn({
        logCode: 'max_number_char_typed',
        extraInfo: {
          charCount,
          maxCharCount: MAX_DOCUMENT_CHARS,
        },
      }, 'User typed more characters than allowed');
      const message = format(
        t('maxCharCountError', 'The notes have reached the maximum of {maxCharCount} characters.'),
        { maxCharCount: MAX_DOCUMENT_CHARS },
      );
      notify(message, 'warning');
      setCharLimitMessage(message);
    }),
    [MAX_DOCUMENT_CHARS],
  );

  const editor = useCreateBlockNote(withCollaboration({
    tabBehavior: 'prefer-indent',
    collaboration: {
      provider: { awareness: hocuspocusProvider.awareness || undefined },
      fragment,
      user: {
        name: userName || '',
        color: userColor || '',
      },
      renderCursor: renderCollaborationCursor,
    },
    schema,
    links: {
      onClick: (event) => {
        if (event.ctrlKey || event.metaKey || isCoarsePointer()) {
          const anchor = event.target?.closest('a[data-inline-content-type="link"]');
          if (anchor?.href) openLink(anchor.href);
        }
        return true;
      },
    },
    dictionary: {
      ...BlockNoteLocales[blockNoteLocale],
      placeholders: {
        ...BlockNoteLocales[blockNoteLocale].placeholders,
        // Override the placeholders to allow placeholder only when the document is empty
        emptyDocument: BlockNoteLocales[blockNoteLocale].placeholders.default,
        default: '',
        heading: '',
      },
    },
    _tiptapOptions: {
      extensions: [maxDocumentCharsExtension, escapeBlurExtension],
    },
    pasteHandler: ({ event, defaultPasteHandler }) => {
      try {
        // Get the clipboard data
        const { clipboardData } = event;
        if (!clipboardData) {
          return defaultPasteHandler();
        }

        // Get text content from clipboard
        const textSize = new TextEncoder().encode(clipboardData.getData('text/plain')).length;
        const htmlSize = new TextEncoder().encode(clipboardData.getData('text/html')).length;

        // Calculate the size of the pasted content (use the larger of text or html)
        const pasteSize = Math.max(htmlSize, textSize);

        // Check if paste exceeds size limit
        if (pasteSize > MAX_PASTE_SIZE) {
          logger.warn({
            logCode: 'paste_too_large',
            extraInfo: {
              pasteSize,
              maxSize: MAX_PASTE_SIZE,
            },
          }, `Paste size ${pasteSize} bytes exceeds maximum allowed size of ${MAX_PASTE_SIZE} bytes`);

          // Show error to user
          const sizeKB = (pasteSize / 1024).toFixed(2);
          const maxKB = (MAX_PASTE_SIZE / 1024).toFixed(2);
          setNotificationErrorMessage(format(
            t('payloadSizeError', 'The content you pasted ({sizeKB} kB) is larger than the {maxKB} kB limit.'),
            { sizeKB, maxKB },
          ));

          // Return false to cancel the paste
          return false;
        }

        // Clear any previous errors
        if (notificationErrorMessageRef.current) {
          setNotificationErrorMessage(null);
        }

        // Allow the paste
        return defaultPasteHandler();
      } catch (error) {
        logger.error({
          logCode: 'paste_handler_error',
          extraInfo: { error: String(error) },
        }, 'Error in paste handler');
        return defaultPasteHandler();
      }
    },
  }), [blockNoteLocale]);

  const editable = !disableNotes || !currentUserIsLocked || currentUserIsModerator;

  // When read-only, clear local awareness so the provider's reconnect logic and
  // the 30 s refresh timer do not re-broadcast this user's cursor/presence.
  // setLocalState(null) also makes all future setLocalStateField calls no-ops,
  // so y-prosemirror and BlockNote cannot re-populate the state either.
  //
  // When editable again, restore awareness if it is still null. This handles a
  // race where the new provider syncs before GraphQL delivers the lock-removal
  // update: the useEffect fires with editable=false on the fresh Awareness,
  // nulling it out; later editable flips to true but BlockNote's init already
  // ran, so we must re-seed the state ourselves.
  React.useEffect(() => {
    const { awareness } = hocuspocusProvider;
    if (!awareness) return;
    if (!editable) {
      awareness.setLocalState(null);
    } else if (awareness.getLocalState() === null) {
      awareness.setLocalState({
        user: { name: userName || '', color: userColor || '' },
      });
    } else {
      // MOBILE: the editor is not recreated on a rename, so refresh what is
      // broadcast or other participants keep the stale cursor label.
      awareness.setLocalStateField('user', {
        name: userName || '',
        color: userColor || '',
      });
    }
  }, [editable, hocuspocusProvider.awareness, userName, userColor]);

  // Keep the editor's focus/selection when tapping a toolbar button by
  // cancelling the default focus move on mousedown.
  const toolbarRef = React.useRef(null);
  React.useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return undefined;
    const handler = (e) => e.preventDefault();
    el.addEventListener('mousedown', handler);
    return () => el.removeEventListener('mousedown', handler);
  }, [editable]);

  // Keep editor focus when clicking SideMenu/DragHandleMenu items.
  // Skip native editable controls and BlockNote form popovers so their focus is preserved.
  // Also skip draggable="true" elements - preventDefault on mousedown prevents drag.
  React.useEffect(() => {
    const { portalElement } = editor;
    if (!portalElement) return undefined;
    const mousedownHandler = (e) => {
      const target = e.target;
      const nativeEditableSelector = '[draggable="true"], input, textarea, select, [contenteditable="true"], .bn-form-popover';
      if (target.closest(nativeEditableSelector)) return;
      e.preventDefault();
      editor.focus();
    };
    // dragend bubbles from the drag handle after the drop - restore focus.
    const dragendHandler = () => editor.focus();
    portalElement.addEventListener('mousedown', mousedownHandler);
    portalElement.addEventListener('dragend', dragendHandler);
    return () => {
      portalElement.removeEventListener('mousedown', mousedownHandler);
      portalElement.removeEventListener('dragend', dragendHandler);
    };
  }, [editor]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {notificationErrorMessage && (
        <div className="bbb-notice" data-test="noteSizeError">
          <p className="bbb-notice__warning">{notificationErrorMessage}</p>
          <button
            type="button"
            className="bbb-notice__button"
            onClick={() => setNotificationErrorMessage(null)}
            data-test="dismissSizeErrorButton"
          >
            {t('dismiss', 'Dismiss')}
          </button>
        </div>
      )}
      {charLimitMessage && (
        <div className="bbb-banner" data-test="noteCharLimitError">
          <span className="bbb-banner__text">{charLimitMessage}</span>
          <button
            type="button"
            className="bbb-banner__button"
            onClick={() => setCharLimitMessage(null)}
            data-test="dismissCharLimitErrorButton"
          >
            {t('dismiss', 'Dismiss')}
          </button>
        </div>
      )}
      <BlockNoteView
        editable={editable}
        editor={editor}
        theme="light"
        formattingToolbar={!STATIC_FORMATTING_TOOLBAR_ENABLED}
        slashMenu={false}
        renderEditor={false}
      >
        {STATIC_FORMATTING_TOOLBAR_ENABLED && editable && (
          <ToolbarWithAccessibleMenus>
            <div
              ref={toolbarRef}
              role="toolbar"
              className="bn-toolbar-row"
              data-test="blockNoteToolbar"
              onKeyDown={(e) => { if (e.key === 'Escape') editor.focus(); }}
            >
              <FormattingToolbar>
                <BlockTypeSelect key="blockTypeSelect" />
                <BasicTextStyleButton basicTextStyle="bold" key="boldStyleButton" />
                <BasicTextStyleButton basicTextStyle="italic" key="italicStyleButton" />
                <BasicTextStyleButton basicTextStyle="underline" key="underlineStyleButton" />
                <BasicTextStyleButton basicTextStyle="strike" key="strikeStyleButton" />
              </FormattingToolbar>
              <FormattingToolbar>
                <ColorStyleButton key="colorStyleButton" />
                <TextAlignSelect key="textAlignSelect" />
                <NestBlockButton key="nestBlockButton" />
                <UnnestBlockButton key="unnestBlockButton" />
              </FormattingToolbar>
            </div>
          </ToolbarWithAccessibleMenus>
        )}
        <BlockNoteViewEditor>
          <SuggestionMenuController
            triggerCharacter="/"
            shouldOpen={shouldOpenSlashMenu}
          />
        </BlockNoteViewEditor>
      </BlockNoteView>
    </div>
  );
}

function BlockNoteContainer() {
  const {
    error, isAuthenticating, hocuspocusProvider, connectionClosed, handleRetry, isSynced,
  } = useHocuspocusProvider();

  const hasError = !!error;

  const renderBlockNote = !error && !isAuthenticating
    && hocuspocusProvider && !connectionClosed && isSynced;

  // MOBILE: backgrounding drops the socket and `maxAttempts: 1` (as on the web)
  // never reconnects, so the app calls this on resume. Only a plain close is
  // retried - `error` holds the security violations that must not reconnect.
  React.useEffect(() => {
    window.bbbNotesRetryIfClosed = () => {
      if (connectionClosed && !error) handleRetry();
    };
    return () => { delete window.bbbNotesRetryIfClosed; };
  }, [connectionClosed, error, handleRetry]);

  const errorMessage = React.useMemo(() => {
    if (!error) return null;
    if (error === 'authenticationFailed') {
      return t('authenticationFailed', 'Authentication failed');
    }
    if (error.startsWith('securityViolation:')) {
      return format(
        t('securityViolation', 'Security violation: {reason}'),
        { reason: error.slice('securityViolation:'.length) },
      );
    }
    return error;
  }, [error]);

  return (
    <div className="bbb-notes" id="bn-notes-scroll-container">
      {hasError && (
        <div className="bbb-notice" data-test="notesError">
          <p className="bbb-notice__error">{errorMessage}</p>
          <button type="button" className="bbb-notice__button" onClick={handleRetry} data-test="notesRetryButton">
            {t('retry', 'Retry')}
          </button>
        </div>
      )}
      {connectionClosed && !hasError && (
        <div className="bbb-notice" data-test="notesError">
          <p className="bbb-notice__warning">{t('connectionClosed', 'Connection closed.')}</p>
          <button type="button" className="bbb-notice__button" onClick={handleRetry} data-test="notesRetryButton">
            {t('retry', 'Retry')}
          </button>
        </div>
      )}
      {renderBlockNote && <BlockNoteApp hocuspocusProvider={hocuspocusProvider} />}
    </div>
  );
}

const mount = () => {
  const container = document.getElementById('root');
  createRoot(container).render(<BlockNoteContainer />);
};

window.addEventListener('error', (event) => {
  logger.error({
    logCode: 'shared_notes_editor_uncaught_error',
    extraInfo: { message: event.message, source: event.filename, line: event.lineno },
  }, 'Uncaught error in the shared notes editor');
});

mount();
