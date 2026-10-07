# Badvisor Keyboard and Mouse Controls

These are the application controls implemented in the editor code, based on the actual `keydown` / `keyup` listeners in the project, especially in `src/modules/editor/Editor.jsx` and the shortcut list in `src/modules/editor/HelpPopup.jsx`.

## Global shortcuts

- Esc — close the active prompt or dialog
- Ctrl/Cmd + Z — undo the last action
- Ctrl/Cmd + S — save scene data to admin
- Ctrl/Cmd + R — reload the page
- Alt + 1 — close all open nodes
- Alt + 2 — toggle the flow panel visibility
- Alt + 3 — rearrange / auto-layout all nodes

## Add node shortcuts

- Alt + V — add Variable node
- Alt + L — add Light node
- Alt + M — add Material node
- Alt + D — add 3D element / asset node
- Alt + C — add Camera node
- Alt + T — add Texture node
- Alt + A — add Action node
- Alt + S — add Sound node
- Alt + O — add Overlay node
- Alt + N — add Control Node
- Alt + K — add Collection node

## Mouse + key combinations

- Shift + left click — open asset node
- Shift + Ctrl + left click — open mesh node
- Ctrl + Alt + left click — open material node
- Space + mouse drag — move nodes around the canvas

## Important note

This app does not appear to use many additional global hotkeys beyond the ones above. The shortcut list in the Help popup and the actual editor key handlers match the control set above.
