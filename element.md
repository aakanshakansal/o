# Element Section Documentation

This document explains the logic behind the Element panel in the editor, how it works in the UI, and how each element type is turned into runtime scene objects.

---

## 1. Purpose of the Element section

The Element section is the editor's object library. It gives the user a catalogue of scene-building blocks that can be inserted into the viewport without writing code.

It is not just a menu. It is the entry point for creating:
- 3D assets and models
- cameras
- lights
- materials and textures
- overlays
- interactive actions
- sounds
- variables, collections and control nodes

In this project, the main implementation is in:
- src/modules/editor/Elements.jsx
- src/modules/editor/createNode.jsx
- src/sceneFunctions/createSceneElements.js

---

## 2. Where the logic lives

### UI list
The editor panel is built in `src/modules/editor/Elements.jsx`.

This file:
- defines the list of all available element types
- groups them into categories
- renders the search panel
- supports drag-and-drop and double-click insertion
- shows each element as a card with icon, title, tooltip, and handle markers

### Creation logic
The actual instantiation work is delegated to `src/modules/editor/createNode.jsx`.

This file contains the `createNode({ scene, type })` function, which checks the selected element type and then:
- opens the appropriate prompt
- asks for user inputs if needed
- creates the scene object via a factory function from `createSceneElements.js`
- registers the created object in the scene graph
- opens the corresponding node editor panel

### Scene object factory
The low-level object creation is in `src/sceneFunctions/createSceneElements.js`.

This file contains functions such as:
- createPBRMaterial
- createPointLight
- createDirectionalLight
- createArcRotateCamera
- createUniversalCamera
- createTexture
- createVideoTexture
- createDynamicTexture
- createPhotoDome
- createSound
- createCollection
- createVariable
- createControlNode
- createOverlay
- create3DText
- createMeshClone
- createGSplat

This is the runtime source of truth for actual Babylon objects.

---

## 3. UI flow: from button click to scene object

The standard flow is:

1. The user opens the Element sidebar.
2. The panel displays categories and cards.
3. The user either:
   - drags the element into the viewport, or
   - double-clicks it
4. The element card fires `createNode({ scene, type })`.
5. `createNode` decides what to do based on `type`.
6. It opens a prompt or custom editor if needed.
7. It creates the corresponding Babylon scene entity.
8. It saves metadata such as `badChanges`.
9. It opens the node inspector for the newly created object.

### Example
If the user double-clicks "Orbit Camera":
- `type === "ArcRotateCamera"`
- `createNode` calls the camera factory function
- a Babylon `ArcRotateCamera` is created
- it is added to the current scene
- the editor shows the camera properties panel

---

## 4. The Element sidebar structure

The element list is grouped into sections:

### 4.1 3D Elements
These are scene assets and generated objects.

| Element | Purpose |
| --- | --- |
| 3D Asset | Import model assets such as GLB, OBJ, STL, VRM |
| 3D Text | Create 3D text mesh with font and resolution |
| Photo Dome | Create a 360° environment image dome |

#### 3D Asset logic
When the user adds a 3D Asset, the system:
- opens an asset picker prompt
- receives selected asset records
- creates asset references in the scene data
- calls `loadAssets(cleanData, scene, scene.defaultAssetManager)`

This is important because the actual 3D file is not immediately inserted manually. Instead, the system converts asset metadata into scene asset entries and loads them into the runtime.

#### 3D Text logic
The user enters:
- text
- font
- resolution

Then the system:
- creates the 3D text mesh using `create3DText`
- creates a `PBRMaterial` for it
- assigns it to the mesh
- stores display info under `badChanges`
- opens the mesh node inspector

#### Photo Dome logic
The user picks an image file, and the system:
- calls `createPhotoDome(scene, null, url)`
- assigns the file as a sky/background dome texture
- stores display name and URL on `badChanges`
- registers the object in `scene.badAssets`

---

### 4.2 Cameras
These are camera objects used for scene viewing and navigation.

| Element | Purpose |
| --- | --- |
| Orbit Camera | Common product viewer camera, rotates around a target |
| First Person Camera | Walkthrough, room exploration camera |

#### Orbit camera
This is the classic product viewer mode. It allows the user to orbit around a target while inspecting a model.

It maps directly to Babylon's `ArcRotateCamera`.

#### First person camera
This is used for room-like or walkthrough scenes. It maps to Babylon's `UniversalCamera`.

The editor stores movement-related settings and camera state in the scene object, so the viewer can navigate with pointer and keyboard controls.

---

### 4.3 Lights
Light types are added as scene objects that illuminate the 3D model.

| Element | Purpose |
| --- | --- |
| Point Light | Emits light from a point in all directions |
| Directional Light | Global light from a direction |
| Spot Light | Cone-shaped light toward a direction |
| Hemispheric Light | Soft ambient-style light |

These are created directly in the scene using the camera/light factory functions in `createSceneElements.js`.

They are especially important because lighting controls the realism of materials, shadows, and reflections.

---

### 4.4 Materials
Materials are the visual surfaces applied to meshes.

| Element | Purpose |
| --- | --- |
| PBR Material | Standard realistic material |
| Shadow Only Material | Visible only in shadow pass |
| Transmission Material | Glass-like, light-transmission material |

#### PBR material
This is the main material used in most realistic scenes. It provides base color, roughness, metallic settings, and shading fidelity.

#### Shadow only material
This material is used where a mesh should not be visibly shaded but should still cast or receive shadows.

#### Transmission material
This is used for glass, liquid, or translucent effects. It simulates light passing through the object and distortion effects.

---

### 4.5 Textures
Textures extend a material by providing surface detail or image information.

| Element | Purpose |
| --- | --- |
| Texture | Image texture |
| Cube Texture | Reflection/skybox texture |
| HDR Cube Texture | High dynamic range environment reflection |
| Video Texture | Play a video on a surface |
| Dynamic Texture | Canvas-based texture with runtime text or drawing |
| Color Grading Texture | LUT texture for post-processing color correction |

These are not only imported files; they are scene objects with runtime behavior. For example:
- `VideoTexture` can play a movie on a mesh
- `DynamicTexture` can write text or paint on a canvas
- `CubeTexture` and `HDRCubeTexture` are used for environment and reflections

---

### 4.6 Overlays
Overlays are 2D UI layers placed above the 3D canvas.

They are used for:
- menus
- product controls
- colour pickers
- info blocks
- interactive product stories

The Overlay node can be created in the Elements section, and the scene stores the overlay in the scene graph as an editor object.

This section is conceptually different from 3D mesh objects: it adds HTML/CSS-driven UI on top of the live 3D view.

---

### 4.7 Actions
Actions are the interaction logic layer. These are not render objects; they represent trigger-driven behavior.

| Element | Purpose |
| --- | --- |
| Animate | Interpolate node properties over time |
| Condition | Run one branch or another depending on truth value |
| Timeline | Sequence a model animation over time |
| Math | Change values with arithmetic |
| Expression | Compute object values or property relationships |
| Sequencer | Step through actions in order |
| Overlays | Show or hide overlay panels |
| EnterAR | Launch AR mode |
| EnterVTO | Launch virtual try-on mode |
| ExternalLink | Open a URL |
| AddReplace | Merge or replace scene parts |
| SaveConfig | Share current configuration |
| Screenshot | Capture the current scene |
| Export Scene | Download the scene as GLB |

#### Why actions are in the Element menu
This editor treats actions as first-class scene building blocks. They are created in code as entries in `scene.actions`.

For example, when the user creates an `Animate` action:
- a unique action name is generated, such as `Action_<timestamp>`
- an object is created in `scene.actions`
- it gets fields such as `name`, `displayName`, `duration`, `nodes`, and `type`
- the action editor opens so the logic can be configured

This makes the system no-code: the creator defines behavior without developing code.

---

### 4.8 Sound
The Sound element adds audio sources to the scene.

This is created through the `createSound` factory. Sound may be:
- background audio
- triggered by actions
- spatially located in the scene

This is part of the runtime audio system, not just the UI.

---

### 4.9 Utilities
These are scene logic helper elements.

| Element | Purpose |
| --- | --- |
| Variable | Stores a named value used by actions |
| Collection | Groups nodes or objects together |
| Control Node | Bundles property values into one controllable logic node |

These are used by the no-code logic system to make the scene stateful and reusable.

---

## 5. The drag-and-drop and double-click model

In `Elements.jsx`, each element card has two UI handlers:

### Drag start
```jsx
onDragStart={(e) => {
  e.dataTransfer.setData("node", node.type);
}}
```

This means the card is carrying the element type in the drag payload. The drag target can then read that type and create the requested object.

### Double click
```jsx
onDoubleClick={(e) => {
  createNode({ scene, type: node.type });
}}
```

This is the simpler editor path: when the user double-clicks an element, the system immediately creates it in the current scene.

This is the core user flow behind the visual editor.

---

## 6. How `createNode` decides what to build

The decision tree inside `createNode` is type-based.

Examples:

### Asset case
```js
if (type === "Asset") {
  scene.openPrompt("addAsset", {
    callback: (data) => {
      const cleanData = {};
      data.forEach((v, i) => {
        cleanData["Asset_" + Date.now() + "_" + i] = {
          name: v.name,
          asset: v.customUrl || cleanFirebaseUrl(v.url),
          assetREF: v.id,
        };
      });
      loadAssets(cleanData, scene, scene.defaultAssetManager);
    }
  });
}
```

The system converts asset selection into a scene data object and loads it.

### Text case
```js
if (type === "3DText") {
  const node = await create3DText(scene, null, { text, font, resolution });
  const textMaterial = createPBRMaterial(scene);
  node.material = textMaterial;
}
```

This means a 3D text object is created as a mesh and assigned a material.

### Action case
```js
if (type === "Animate") {
  action = scene.actions[actionName] = {
    name: actionName,
    displayName: "Animate",
    duration: 250,
    nodes: {},
    type: "Animate",
  };
  scene.openNode("Action", action);
}
```

This creates an action object, not a geometry object. The scene editor then uses the action node UI to define behavior.

---

## 7. The role of `badChanges`

After objects are created, the code often writes metadata into a property called `badChanges`.

Examples:
- `node.badChanges.displayName = v.name`
- `node.badChanges.material = node.material.name`
- `node.badChanges.text = text`
- `node.badChanges.font = font`

This is important because it lets the editor know:
- what was created
- what user custom values were set
- which values should be persisted back into scene data

This is the bridge between live runtime objects and the saved scene JSON.

---

## 8. How this fits into the bigger editor system

The Element section is one of the main entry points to the scene editor. It feeds the object graph and interacts with:
- the viewport
- scene properties panel
- outliner
- action graph
- saved scene data

In other words:

- the Element panel defines what can be created
- `createNode` decides how to create it
- `createSceneElements` builds the actual Babylon runtime node
- the object is then edited via the node inspector and event/action systems

This is the editor's core creation pipeline.

---

## 9. Practical mental model

A good way to think about the Element section is:

> The Element panel is a factory browser for scene content.

Every card is a template for an object or a behavior. When the user selects one, the editor does not instantly draw the final object by itself. Instead, it routes through the creation pipeline:

UI card -> `createNode` -> prompt/input collection -> factory method -> Babylon object -> editor node -> saved scene state

---

## 10. Summary

The Element section is the central creation system of the scene editor. It is designed to let non-technical users build complex interactive scenes by selecting pieces from a visual catalogue instead of writing code.

Its main logic is:
- show categories and cards
- capture element type
- branch on type in `createNode`
- open proper prompt or editor config
- create actual Babylon objects from `createSceneElements`
- register the object and save metadata for the scene

This is the foundation of the project’s no-code 3D authoring system.
