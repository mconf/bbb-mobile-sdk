/**
 * One option of a {@link SelectorItem}.
 *
 * @public
 */
export interface SelectorOption {
  /** Identifies the option. Always a string; use `''` for a "none" option. */
  value: string;
  /** The text of the option. */
  label: string;
  /** What screen readers say for the option. Defaults to `label`. */
  accessibilityLabel?: string;
  /** A second line under the label. */
  description?: string;
  /** A short mark next to the label, such as "New". */
  badge?: string;
  /** A disabled option is shown but cannot be picked. */
  disabled?: boolean;
}

/**
 * A row in the actions sheet that opens a list where the user picks one option.
 * The host draws the row and the list from this description.
 *
 * @public
 */
export interface SelectorItem {
  /** Marks the item as a selector. */
  type: 'selector';
  /** Identifies the item among the plugin's items. */
  id: string;
  /** The name of the icon shown at the start of the row. */
  icon: string;
  /** The text of the row. */
  label: string;
  /**
   * What screen readers say for the row. The host reads it, then a colon and the label of
   * the selected option, so the plugin does not repeat the choice. Defaults to `label`.
   */
  accessibilityLabel?: string;
  /** The `value` of the selected option. */
  value: string;
  /** The options of the list, in the order shown. */
  options: readonly SelectorOption[];
  /** While true, the row shows a pending state and ignores taps. */
  pending?: boolean;
  /**
   * The text the row shows, and screen readers say, while it is pending. Without it, the
   * host uses its own text.
   */
  pendingLabel?: string;
  /** A short mark on the row, such as "New". */
  badge?: string;
  /** Called with the `value` of the option the user picked. */
  onChange(value: string): void;
}

/**
 * An item a plugin adds to the actions sheet. New item types may be added in later versions.
 *
 * @public
 */
export type ActionsSheetItem = SelectorItem;

/**
 * One button of a {@link ConfirmDialog}.
 *
 * @public
 */
export interface DialogAction {
  /** The text of the button. */
  label: string;
  /** What screen readers say for the button. Defaults to `label`. */
  accessibilityLabel?: string;
  /** How the button looks: a filled button, an outlined button or a text link. */
  kind: 'primary' | 'secondary' | 'link';
  /** Called when the user presses the button, after the host closes the dialog. */
  onPress(): void;
}

/**
 * A dialog that asks the user to choose an action. When the user dismisses it without a
 * button, by going back or tapping outside it, the host closes it and calls no action.
 *
 * @public
 */
export interface ConfirmDialog {
  /** Identifies the dialog among the plugin's dialogs. */
  id: string;
  /** The title of the dialog. */
  title: string;
  /** Paragraphs of the dialog body. */
  body: readonly string[];
  /**
   * The buttons of the dialog, in the order shown. There is at least one. A list built at
   * run time, such as the result of `map`, does not type-check here: write it as
   * `[first, ...rest]`.
   *
   * A host drops a confirm dialog with no buttons or no `actions` list, and logs an error to
   * the plugin's logger. Only a plugin that bypasses the type can send one.
   */
  actions: readonly [DialogAction, ...DialogAction[]];
  /** Asked when the dialog's turn comes; if it returns false, the dialog is dropped. */
  isStillRelevant?(): boolean;
}

/**
 * A dialog that only informs the user.
 *
 * @public
 */
export interface InfoDialog {
  /** Identifies the dialog among the plugin's dialogs. */
  id: string;
  /** The title of the dialog. */
  title: string;
  /** The text of the dialog. */
  body: string;
  /** Shows this user's avatar in the dialog. */
  avatarUserId?: string;
}

/**
 * A short free-text message shown to the user and read by screen readers.
 *
 * @public
 */
export interface Notice {
  /** The text of the notice. */
  message: string;
  /** Defaults to `'info'`. */
  level?: 'info' | 'error';
  /** A sticky notice stays until the user dismisses it. */
  sticky?: boolean;
}
