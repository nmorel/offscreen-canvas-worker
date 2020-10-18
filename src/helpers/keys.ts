export const modifierKey = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  ? "meta"
  : "ctrl";

// For the complete list, see https://www.w3.org/TR/uievents-key/#named-key-attribute-values
export enum Key {
  /**
   * The Enter or ↵ key, to activate current selection or accept current input.
   * This key value is also used for the Return (Macintosh numpad) key.
   * This key value is also used for the Android KEYCODE_DPAD_CENTER.
   */
  ENTER = "Enter",

  /** The Horizontal Tabulation Tab key. */
  TAB = "Tab",

  /** The spacebar key. */
  SPACE = " ",

  SEMICOLON = ";",

  COMMA = ",",

  /** The down arrow key, to navigate or traverse downward. (KEYCODE_DPAD_DOWN) */
  ARROW_DOWN = "ArrowDown",

  /** The left arrow key, to navigate or traverse leftward. (KEYCODE_DPAD_LEFT) */
  ARROW_LEFT = "ArrowLeft",

  /** The right arrow key, to navigate or traverse rightward. (KEYCODE_DPAD_RIGHT) */
  ARROW_RIGHT = "ArrowRight",

  /** The up arrow key, to navigate or traverse upward. (KEYCODE_DPAD_UP) */
  ARROW_UP = "ArrowUp",

  /** The End key, used with keyboard entry to go to the end of content (KEYCODE_MOVE_END). */
  END = "End",

  /**
   * The Home key, used with keyboard entry, to go to start of content (KEYCODE_MOVE_HOME).
   * For the mobile phone Home key (which goes to the phone’s main screen), use "GoHome".
   */
  HOME = "Home",

  /** The Page Down key, to scroll down or display next page of content. */
  PAGE_DOWN = "PageDown",

  /** The Page Up key, to scroll up or display previous page of content. */
  PAGE_UP = "PageUp",

  /** The Backspace key. This key value is also used for the key labeled Delete on MacOS keyboards. */
  BACKSPACE = "Backspace",

  /** Remove the currently selected input. */
  CLEAR = "Clear",

  /** Copy the current selection. (APPCOMMAND_COPY) */
  COPY = "Copy",

  /** The Cursor Select (Crsel) key. */
  CR_SEL = "CrSel",

  /** Cut the current selection. (APPCOMMAND_CUT) */
  CUT = "Cut",

  /** The Delete (Del) Key. This key value is also used for the key labeled Delete on MacOS keyboards when modified by the Fn key. */
  DELETE = "Delete",

  /** The Erase to End of Field key. This key deletes all characters from the current cursor position to the end of the current field. */
  ERASE_EOF = "EraseEof",

  /** The Extend Selection (Exsel) key. */
  EX_SEL = "ExSel",

  /** The Insert (Ins) key, to toggle between text modes for insertion or overtyping. (KEYCODE_INSERT) */
  INSERT = "Insert",

  /** The Paste key. (APPCOMMAND_PASTE) */
  PASTE = "Paste",

  /** Redo the last action. (APPCOMMAND_REDO) */
  REDO = "Redo",

  /** Undo the last action. (APPCOMMAND_UNDO) */
  UNDO = "Undo",

  /** The Accept (Commit, OK) key. Accept current option or input method sequence conversion. */
  ACCEPT = "Accept",

  /** The Again key, to redo or repeat an action. */
  AGAIN = "Again",

  /** The Attention (Attn) key. */
  ATTN = "Attn",

  /** The Cancel key. */
  CANCEL = "Cancel",

  /** Show the application’s context menu. This key is commonly found between the right Meta key and the right Control key. */
  CONTEXT_MENU = "ContextMenu",

  /** The Esc key. This key was originally used to initiate an escape sequence, but is now more generally used to exit or "escape" the current context, such as closing a dialog or exiting full screen mode. */
  ESCAPE = "Escape",

  /** The Execute key. */
  EXECUTE = "Execute",

  /** Open the Find dialog. (APPCOMMAND_FIND) */
  FIND = "Find",

  /** Open a help dialog or toggle display of help information. (APPCOMMAND_HELP, KEYCODE_HELP) */
  HELP = "Help",

  /**
   * Pause the current state or application (as appropriate).
   * Do not use this value for the Pause button on media controllers. Use "MediaPause" instead.
   */
  PAUSE = "Pause",

  /**
   * Play or resume the current state or application (as appropriate).
   * Do not use this value for the Play button on media controllers. Use "MediaPlay" instead.
   */
  PLAY = "Play",

  /** The properties (Props) key. */
  PROPS = "Props",

  /** The Select key. */
  SELECT = "Select",

  /** The ZoomIn key. (KEYCODE_ZOOM_IN) */
  ZOOM_IN = "ZoomIn",

  /** The ZoomOut key. (KEYCODE_ZOOM_OUT) */
  ZOOM_OUT = "ZoomOut",

  /** The F1 key, a general purpose function key, as index 1. */
  F1 = "F1",

  /** The F2 key, a general purpose function key, as index 2. */
  F2 = "F2",

  /** The F3 key, a general purpose function key, as index 3. */
  F3 = "F3",

  /** The F4 key, a general purpose function key, as index 4. */
  F4 = "F4",

  /** The F5 key, a general purpose function key, as index 5. */
  F5 = "F5",

  /** The F6 key, a general purpose function key, as index 6. */
  F6 = "F6",

  /** The F7 key, a general purpose function key, as index 7. */
  F7 = "F7",

  /** The F8 key, a general purpose function key, as index 8. */
  F8 = "F8",

  /** The F9 key, a general purpose function key, as index 9. */
  F9 = "F9",

  /** The F10 key, a general purpose function key, as index 10. */
  F10 = "F10",

  /** The F11 key, a general purpose function key, as index 11. */
  F11 = "F11",

  /** The F12 key, a general purpose function key, as index 12. */
  F12 = "F12",

  /** General purpose virtual function key, as index 1. */
  SOFT1 = "Soft1",

  /** General purpose virtual function key, as index 2. */
  SOFT2 = "Soft2",

  /** General purpose virtual function key, as index 3. */
  SOFT3 = "Soft3",

  /** General purpose virtual function key, as index 4. */
  SOFT4 = "Soft4",
}
