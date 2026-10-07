# Essential Section Documentation

This document explains the Essential panel in the editor, how it behaves, and what each section is designed to control. The goal is to make the logic of this editor mode understandable for a developer or product user who wants to know how the scene is being simplified for fast editing.

---

## 1. What the Essential section is

The Essential section is a simplified editing workspace designed to expose the most important scene controls without showing the full complexity of every object property.

Instead of showing all advanced node properties, it filters the scene down to the settings that are most useful in everyday editing:
- scene background and transparency
- active camera settings
- 3D object management
- lights and environment
- visual effects

This is implemented in:
- src/modules/editor/Essentials.jsx
- src/modules/editor/EssentialsViews/ThreeDView.jsx
- src/modules/editor/EssentialsViews/LightningsView.jsx
- src/modules/editor/NodeFields.jsx
- src/nodesProps.js

The core idea is simple:
- the full node schema still exists
- but in Essentials mode, only properties marked with `showInEssentials: true` are displayed

That is why the panel feels cleaner and more focused than the full inspector.

---

## 2. Where the logic is enforced

The filtering happens in `src/modules/editor/NodeFields.jsx`.

When the editor is in Essentials mode, each property is checked before it is rendered. The code says:

- if the editor is in Essentials mode, only fields with `showInEssentials === true` are rendered
- if the editor is not in Essentials mode, hidden properties are still allowed to appear where needed

This is the key mechanism behind the simplified editor layout.

This means the Essential panel does not have separate duplicate property definitions. It is a filtered view of the same property model already used in the main editor.

---

## 3. Structure of the Essential panel

The panel is built as a tab-based interface:

1. Scene
2. 3D
3. Lightning
4. FX

This is defined in `src/modules/editor/Essentials.jsx`.

Each tab switches the UI state and resets the open node list. This keeps the editor from showing stale object selections while switching contexts.

---

## 4. The Scene tab

The Scene tab is the top-level scene settings panel.

It contains:
- transparent background toggle
- background color control
- active camera properties

### 4.1 Transparent background

The first control in the Scene tab is:
- `clearColorTransparent`

This is a Boolean setting stored under `sceneProps` in `src/nodesProps.js`.

Its purpose is to let the scene background become transparent so the host page or container can show behind the 3D content.

If enabled, the editor sets:
- `scene.clearColorTransparent = true`
- `scene.clearColor = new Color4(0, 0, 0, 0)`

This allows a product shot or showroom object to sit over a custom page background instead of a flat solid color.

### 4.2 Background color

The second control is:
- `clearColor`

This is the scene background color, usually a solid color such as gray or white. It is still available in Essentials mode, but simplified for quick access.

### 4.3 Active camera settings

The Scene tab also displays the details of the currently active camera.

This is done through:
- `scene.activeCamera`
- `Fields node={scene.activeCamera}`

The active camera is the one the user is currently seeing. The interface focuses only on the current camera configuration so the user can quickly adjust:
- position
- target
- limits
- FOV
- zoom behavior
- camera movement settings

This is the quickest way for a user to adjust scene framing without opening the full camera inspector.

---

## 5. The 3D tab

The 3D tab is the most important part of the Essentials panel. It focuses on the actual objects in the scene and their material relationships.

It has two main responsibilities:
- show the list of 3D scene elements
- allow quick material attachment and editing

### 5.1 Add 3D Element button

There is a button labeled "Add 3D Element".

When clicked, it opens a prompt using:
- `scene.openPrompt("add3DElement")`

This is a quick path to add a mesh, asset, or imported 3D object into the scene.

### 5.2 Mesh list

The panel uses:
- `MeshesList nodes={scene.badAssets}`

This displays a list of meshes/assets already present in the scene. It is a compact list of scene objects that the user can inspect, select, and edit.

The list is expandable/collapsible via the expand/collapse buttons.

### 5.3 Open node list

The Essentials UI reads from `openNodes` and renders each opened object. This means the user can select a mesh and inspect its properties in context.

The code does this through:
- `Object.entries(openNodes).map(([key, node], i) => { ... })`

This is a key design pattern in the editor: objects selected from the scene are placed in an open-node state, and the panel renders them as editable cards.

### 5.4 Material management for meshes

For each open mesh, the UI checks whether it has a material:

- `node?.data?.node?.material !== undefined`

If it does, it renders a material section.

It also checks if the mesh has child nodes:
- `node?.data?.node?.getChildren()?.length`

If it does, it displays child materials so nested or imported model materials can be managed individually.

This matters because imported GLB and OBJ files often contain multiple meshes and each one can have its own material. The Essentials UI surfaces this neatly rather than requiring deep traversal in the full graph inspector.

### 5.5 Attach New Material

If a mesh has no material, a button appears:
- "Attach New Material"

The action does this:
- creates a new PBR material with `createPBRMaterial(scene, null, null)`
- assigns it to the selected mesh
- stores metadata under `node.data.node.badChanges.material`
- opens the mesh again so the user sees the change immediately

This is a fast editing shortcut for objects that are imported without a material.

### 5.6 SubMaterial and material panels

The `SubMaterial` component renders a collapsible block for each material used by a mesh or child mesh.

It shows:
- the material name
- a material icon
- a toggle for open/closed state
- the material properties via `Fields node={node.material}`

This is the Essentials version of the material inspector: compact, readable, and focused on essential material controls like color, intensity, reflectivity, and surface behavior.

---

## 6. The Lightning tab

The Lightning tab is focused on environmental lighting and light objects.

It contains two views:
- Lights
- Materials

### 6.1 Environment settings

The first section is the Environment Map panel.

It displays:
- preview image of the environment texture
- environment texture URL field
- environment intensity
- environment rotation

This is managed with:
- `scene.environmentTexture`
- `cubeTextureProps.url`
- `cubeTextureProps.rotationY`
- `sceneProps.environmentIntensity`

This lets the user quickly change the global scene lighting and reflections without opening the larger scene effects editor.

### 6.2 Light list

The panel also displays a list of all lights in the scene:
- `LightsList nodes={scene.lights}`

This gives users a compact list of all lights so they can inspect and adjust them one by one.

### 6.3 Add Light button

The user can also add a new light via:
- `scene.openPrompt("addLight")`

This opens the light creation prompt, which uses the same object factory pattern as the main editor.

### 6.4 Open light panel

When a light is selected, it renders a compact inspector card showing the light node properties using the shared `Fields` component.

### 6.5 Materials list in Lightning tab

The second mode of the Lightning tab is the materials view.

It shows material entries filtered to those that are:
- from an asset
- custom materials
- cloned materials
- PBR materials

The code filters them with:

```js
Object.values(scene.materials).filter(
  (m) => (m.fromAsset || m.isCustom || m.cloneOf) && typeof m.getClassName === "function" && m.getClassName() === "PBRMaterial"
)
```

This is useful because the user usually needs quick material access for lighting and shading adjustments rather than full property management.

---

## 7. The FX tab

The FX tab is intentionally minimal.

It does not show every post-processing setting separately. Instead, it displays:
- `Fields node={scene.effects}`

This means the panel exposes the current effect stack and its relevant properties in a simplified inspector format.

This is the place where the editor can manage things like:
- exposure
- contrast
- bloom
- glow
- depth of field
- tone mapping
- color grading
- other image-processing effects

The UI is simplified to avoid overwhelming the user while still letting them tune the final visual output.

---

## 8. Why this panel is “essential”

The Essentials panel reduces the editor to the settings that matter most for common scene composition tasks.

It is designed for:
- scene setup
- framing the product
- adding and adjusting lights
- assigning materials
- fine-tuning global visual look

This is not the full technical editor. It is the fast, high-value editing mode for common jobs.

---

## 9. `showInEssentials` filter mechanism

The filter is the secret behind the simplified UI.

In `src/nodesProps.js`, the property definitions often include flags like:
- `showInEssentials: true`

When the editor loads a node, `NodeFields.jsx` checks whether that property should be visible in Essentials mode.

Example logic:

```js
if (editorState === "essentials" && !v.showInEssentials) return null;
```

This means a property can exist in the schema but remain hidden in the Essentials mode if it is not a commonly used control.

This pattern is very important because it keeps the editor maintainable:
- one schema
- multiple UI views
- different complexity levels

---

## 10. The user mental model

A user should understand the Essential panel as a simplified scene control center.

### Scene tab
Controls the scene container and active camera framing.

### 3D tab
Controls the object layer, material assignment, and imported model details.

### Lightning tab
Controls environment lighting and the light/material setup of the scene.

### FX tab
Controls the final image processing and post-processing feel.

This is deliberately focused on the most common editing operations, which is why it feels more approachable than the full editor.

---

## 11. Summary

The Essential section is not a separate scene model. It is a filtered, task-focused view of the same underlying node system used elsewhere in the editor.

Its main purpose is to help the user do fast, high-impact scene work without being buried in advanced settings.

The logic works like this:
- the full node schema exists
- properties are marked with `showInEssentials`
- Essentials mode filters the property list
- the selected scene object or active camera is rendered in a compact layout
- the user can adjust the key scene constructs without overwhelming UI

This is why the Essential panel is practical for editing and still powerful enough for real scene composition work.
