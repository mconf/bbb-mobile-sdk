import * as React from 'react';
import { useCallback } from 'react';
import {
  useBlockNoteEditor,
  useComponentsContext,
  useDictionary,
  useEditorState,
} from '@blocknote/react';
import {
  blockHasType,
  defaultProps,
  editorHasBlockWithType,
  mapTableCell,
} from '@blocknote/core';
import { TableHandlesExtension } from '@blocknote/core/extensions';
import {
  RiAlignCenter,
  RiAlignJustify,
  RiAlignLeft,
  RiAlignRight,
} from 'react-icons/ri';
import { HiChevronDown } from 'react-icons/hi';

// Port of bigbluebutton-html5/imports/ui/components/bn-shared-notes/text-align-select.
// Upstream note kept for traceability: PR https://github.com/TypeCellOS/BlockNote/pull/2728
// has been sent to BlockNote to have this implemented there - if it is merged, both this
// and the web copy should be replaced by their native component.

const ALIGN_ITEMS = [
  { value: 'left', icon: <RiAlignLeft size={16} /> },
  { value: 'center', icon: <RiAlignCenter size={16} /> },
  { value: 'right', icon: <RiAlignRight size={16} /> },
  { value: 'justify', icon: <RiAlignJustify size={16} /> },
];

function TextAlignSelect() {
  const Components = useComponentsContext();
  const editor = useBlockNoteEditor();
  const dict = useDictionary();

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e.isEditable) return null;
      const blocks = e.getSelection()?.blocks ?? [e.getTextCursorPosition().block];
      const firstBlock = blocks[0];

      if (blockHasType(firstBlock, e, firstBlock.type, { textAlignment: defaultProps.textAlignment })) {
        return { alignment: firstBlock.props.textAlignment, blocks };
      }

      if (blocks.length === 1 && blockHasType(firstBlock, e, 'table')) {
        const cellSelection = e.getExtension(TableHandlesExtension)?.getCellSelection();
        if (!cellSelection || cellSelection.cells.length === 0) return null;
        const { row, col } = cellSelection.cells[0];
        const tableContent = firstBlock.content;
        const selectedCell = tableContent.rows[row]?.cells[col];
        if (!selectedCell) return null;
        return { alignment: mapTableCell(selectedCell).props.textAlignment, blocks };
      }

      return null;
    },
  });

  const setTextAlignment = useCallback(
    (alignment) => {
      if (!state) return;
      editor.focus();
      state.blocks.forEach((block) => {
        if (
          blockHasType(block, editor, block.type, { textAlignment: defaultProps.textAlignment })
          && editorHasBlockWithType(editor, block.type, { textAlignment: defaultProps.textAlignment })
        ) {
          editor.updateBlock(block, { props: { textAlignment: alignment } });
        } else if (block.type === 'table') {
          const cellSelection = editor.getExtension(TableHandlesExtension)?.getCellSelection();
          if (!cellSelection) return;

          const newTable = block.content.rows.map((row) => ({
            ...row,
            cells: row.cells.map((cell) => mapTableCell(cell)),
          }));

          cellSelection.cells.forEach(({ row, col }) => {
            newTable[row].cells[col] = {
              ...newTable[row].cells[col],
              props: {
                ...newTable[row].cells[col].props,
                textAlignment: alignment,
              },
            };
          });

          editor.updateBlock(block, {
            type: 'table',
            content: {
              ...block.content,
              type: 'tableContent',
              rows: newTable,
            },
          });

          editor.setTextCursorPosition(block);
        }
      });
    },
    [editor, state],
  );

  if (!state) return null;

  const currentItem = ALIGN_ITEMS.find((a) => a.value === state.alignment);
  if (!currentItem) return null;

  const TriggerButton = Components.FormattingToolbar.Button;

  return (
    <Components.Generic.Menu.Root>
      <Components.Generic.Menu.Trigger>
        <TriggerButton
          className="bn-button"
          label={dict.formatting_toolbar[`align_${state.alignment}`].tooltip}
          mainTooltip={dict.formatting_toolbar[`align_${state.alignment}`].tooltip}
          leftSection={currentItem.icon}
          rightSection={<HiChevronDown size={10} />}
        >
          <span />
        </TriggerButton>
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown className="bn-menu-dropdown">
        {ALIGN_ITEMS.map((a) => (
          <Components.Generic.Menu.Item
            key={a.value}
            icon={a.icon}
            checked={state.alignment === a.value}
            onClick={() => setTextAlignment(a.value)}
          >
            {dict.formatting_toolbar[`align_${a.value}`].tooltip}
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
}

export default TextAlignSelect;
