# Environment Intensity in Scene Settings

## What it is

Environment intensity is the strength multiplier for the scene’s environment map and its visual contribution to lighting and reflections. In this project, the app exposes it as a scene-level setting under the Environment Map panel in the editor UI, as shown in [src/modules/editor/EssentialsViews/LightningsView.jsx](src/modules/editor/EssentialsViews/LightningsView.jsx#L118-L134).

The UI reads and edits the scene property called environmentIntensity from the scene property metadata defined in [src/nodesProps.js](src/nodesProps.js#L190-L203):

- environmentIntensity: label = Env Intensity, type = Number
- environmentTexture: label = Environment Texture, type = Texture

This means the scene setting is not a separate renderer feature; it is a Babylon-style environment property exposed through the app’s editor.

## Where it is defined

The scene environment itself is created in [src/sceneFunctions/createSceneElements.js](src/sceneFunctions/createSceneElements.js#L443-L517):

- a CubeTexture is created from /assets/studio.env
- it is assigned to scene.environmentTexture
- the texture is named CubeTexture_SceneEnvironment
- the texture rotates via rotationY, which is also editable in the same UI

The editor connects the UI to that property here:

- [src/modules/editor/EssentialsViews/LightningsView.jsx](src/modules/editor/EssentialsViews/LightningsView.jsx#L126-L134)

This is the direct user-facing place where the environment intensity is edited.

## What it affects visually

Environment intensity is mainly used to control how strong the environment lighting/reflection contribution feels in the scene. In Babylon.js terms, it is a multiplier on the environment effect that is applied to materials and the scene’s environment lighting response.

So, in practice, increasing the value makes the scene feel:

- brighter from the environment map
- more reflective / more “lit” by the environment
- stronger in specular highlights and ambient response

Decreasing it makes the scene feel:

- darker and more neutral
- less reflective
- more dependent on direct lights and material properties

It is not the same as a light source like a DirectionalLight, PointLight, or SpotLight. Those lights add direct illumination from specific directions. Environment intensity is a global intensity control for the surrounding environment texture.

## Material-level version

This project also supports a material-level version of the same concept. In [src/nodesProps.js](src/nodesProps.js#L2316-L2325), the PBR material property is defined as:

- environmentIntensity: group = Lightning, label = Env Intensity, type = Number

This matters because materials can have their own environment influence. For example, the gem material explicitly sets a value in [src/nodesProps.js](src/nodesProps.js#L4602-L4635):

- outerMaterial.environmentIntensity = 2
- environmentIntensity: 2 is also stored in the material’s badChanges metadata

That shows the project uses environment intensity both as:

1. a scene-wide setting for the environment map
2. a per-material setting for how strongly a particular material responds to that environment

## Why this is useful in a 3D viewer

This setting is valuable because real scenes often need a subtle or dramatic environment contribution. For example:

- a neutral showroom often wants a moderate environment strength
- a reflective gold or chrome material may need a stronger environment response
- a dark interior can be visually improved by balancing the environment intensity against light sources

Without this control, the viewer would rely only on direct lights and material settings, making the environment feel flat or too harsh.

## Important distinction

Environment intensity is not:

- the intensity of the whole scene lighting in a general sense
- a replacement for the directional lights
- a screenshot or canvas capture setting

It is specifically the intensity of the environment map contribution that affects reflections and scene ambient response.

## In one sentence

The Environment Intensity setting in this project is the global multiplier for the scene’s environment cubemap, controlling how strongly the environment lighting and reflections affect the overall scene and individual materials.

# Common functionality across Elements, Essentials, and Outliner

The same real feature is often exposed in more than one panel in this editor. The important thing is that the UI is just a different entry point to the same underlying engine logic.

## Example: Screenshot / Capture

The same screenshot functionality appears in two places:

1. In the action list inside the Elements panel: [src/modules/editor/Elements.jsx](src/modules/editor/Elements.jsx#L340-L349)
2. In the Capture panel opened from the Outliner: [src/modules/editor/Outliner.jsx](src/modules/editor/Outliner.jsx#L184-L196)

### 1) In Elements

The action palette defines a Screenshot action type in the editor list:

- [src/modules/editor/Elements.jsx](src/modules/editor/Elements.jsx#L344-L349)

This is a UI action item that represents a scene operation. It is not a separate custom engine implementation. It just registers the action as a named type: `Screenshot`.

Later, when that action is executed, the runtime dispatcher handles it:

- [src/sceneFunctions/actionDispatcher.js](src/sceneFunctions/actionDispatcher.js#L416-L421)

The dispatcher calls:

- `takeScreenshot(scene, props.width, props.height, props.quality)`

That function is defined here:

- [src/helpers.js](src/helpers.js#L523-L544)

This is the actual place where the screenshot is captured:

- it gets the render canvas
- it temporarily swaps width and height
- calls `scene.render()`
- uses `canvas.toDataURL("image/webp", quality)`
- restores original canvas size and rerenders

So the Elements action is just a trigger for the same shared screenshot utility.

### 2) In Outliner -> Capture

The Outliner has a dedicated Capture button that opens a node UI:

- [src/modules/editor/Outliner.jsx](src/modules/editor/Outliner.jsx#L184-L196)

That opens the CaptureNode component:

- [src/modules/editor/Nodes/CaptureNode.jsx](src/modules/editor/Nodes/CaptureNode.jsx#L12-L23)

Inside that node, the actual screenshot button is implemented here:

- [src/modules/editor/Nodes/CaptureNode.jsx](src/modules/editor/Nodes/CaptureNode.jsx#L97-L105)

It calls the same helper:

- `takeScreenshot(scene, null, null, 0.8)`

So again, the Outliner capture panel is not a different screenshot system; it is just another front-end trigger pointing to the same helper in [src/helpers.js](src/helpers.js#L523-L544).

## Why the same feature appears in multiple tabs

This app follows a pattern where the editor exposes the same capability through multiple UI surfaces:

- Elements tab: action-based workflow for scene logic
- Outliner tab: object-level management and tool panels
- Essentials tab: quick property editing and common scene controls

The real logic stays centralized in shared helper functions, scene functions, or action dispatchers. The tabs are just different entry points.

## In practical terms

For screenshot functionality, the real implementation is centralized in one function:

- [src/helpers.js](src/helpers.js#L523-L544)

The duplication is visual and organizational, not functional:

- Elements exposes it as an action
- Outliner exposes it as a capture panel
- both eventually invoke the same helper and produce the same scene capture

## Same pattern for other editor features

This is not unique to screenshot. The editor often follows the same design pattern:

- a property is defined once in metadata, such as in [src/nodesProps.js](src/nodesProps.js)
- that property is displayed in Essentials and other inspector views
- the same value can also be edited through a node, action, or button UI when relevant

So if a feature appears in Elements, Essentials, and Outliner, it usually means:

- the same underlying scene capability exists once in code
- different tabs simply surface it in different ways for the user

## Final conclusion

The screenshot feature is the same function reused across editor surfaces. It is not implemented separately in each tab. The actual engine capture happens in [src/helpers.js](src/helpers.js#L523-L544), while the Elements action and Outliner Capture UI are just wrappers around that shared logic.

This is the key idea behind the app’s editor architecture: the functionality is centralized; the interface is duplicated by design.

# Shared helper patterns used in multiple tabs

Yes — the same pattern repeats across this editor. The app usually does this:

- a UI tab exposes a button or action
- that button calls a shared scene helper or action dispatcher
- the actual logic lives in one central file
- several tabs just act as different entry points to the same feature

Below is the list of the main shared helper/function patterns I found.

## 1) Screenshot capture

This is the clearest example.

The real implementation is centralized in:

- [src/helpers.js](src/helpers.js#L523-L544) — `takeScreenshot(scene, width, height, quality)`

It is triggered from multiple places:

- Elements action: [src/sceneFunctions/actionDispatcher.js](src/sceneFunctions/actionDispatcher.js#L416-L421)
- Outliner capture panel: [src/modules/editor/Nodes/CaptureNode.jsx](src/modules/editor/Nodes/CaptureNode.jsx#L97-L105)
- PostMessage API call: [src/sceneFunctions/postMessageApi.js](src/sceneFunctions/postMessageApi.js#L27-L33)

This means the same screenshot capability is reused by several UI surfaces, but the actual capture logic is not duplicated.

## 2) Prompt-based object creation

The editor uses a central creation function for many scene objects:

- [src/modules/editor/createNode.jsx](src/modules/editor/createNode.jsx#L19-L155)

This file handles many item types such as:

- Asset
- 3DText
- PhotoDome
- GSplat
- Camera
- Light
- Material
- Texture
- Sound
- Action

And the app calls this creation flow from different tabs and components:

- [src/modules/editor/Editor.jsx](src/modules/editor/Editor.jsx#L257-L292)
- [src/modules/editor/Outliner.jsx](src/modules/editor/Outliner.jsx#L282-L504)
- [src/modules/editor/EssentialsViews/ThreeDView.jsx](src/modules/editor/EssentialsViews/ThreeDView.jsx)
- [src/modules/editor/EssentialsViews/LightningsView.jsx](src/modules/editor/EssentialsViews/LightningsView.jsx#L140-L140)

So the “add light”, “add camera”, “add material”, “add action”, and similar commands are all routed through the same central creation system, even though they appear in different places in the UI.

## 3) Action execution dispatcher

This is another shared system.

All action-type logic is routed through one place:

- [src/sceneFunctions/actionDispatcher.js](src/sceneFunctions/actionDispatcher.js#L1-L1038)

It centralizes cases such as:

- Screenshot
- ExportScene
- ExternalLink
- Timeline
- Animate
- PlayAnimationGroup
- PauseAnimationGroup
- StopAnimationGroup
- SaveConfig
- Expression

The action definitions themselves appear in Elements, but the actual execution logic is in the dispatcher.

## 4) Asset loading and asset conversion

Asset handling also follows the same pattern.

The app uses helper logic to load and resolve different asset types:

- [src/helpers.js](src/helpers.js#L240-L278) — asset type branching for textures, sounds, and GSplat files
- [src/helpers.js](src/helpers.js#L523-L544) — screenshot helper
- [src/helpers.js](src/helpers.js#L856-L1042) — Firestore/scene asset loading and resolution

This is not duplicated per UI panel. Instead, the asset import UI leads to the same shared loader flow and the same type checks.

## 5) Scene data serialization and restoration

The scene snapshot and scene build process are also centralized. The main snapshot logic is here:

- [src/sceneFunctions/createSceneSnapshot.js](src/sceneFunctions/createSceneSnapshot.js#L61-L171)

This is used to export the complete scene state, and it is independent of whether the user is looking at the editor UI or an internal runtime flow. The scene restoration path is also centralized in the scene-setup functions such as:

- [src/sceneFunctions/setScene.js](src/sceneFunctions/setScene.js#L370-L399)
- [src/sceneFunctions/setScene.js](src/sceneFunctions/setScene.js#L649-L740)

## 6) Environment and lighting setup

Scene-wide environment settings are created once and exposed through multiple panels:

- Environment setup: [src/sceneFunctions/createSceneElements.js](src/sceneFunctions/createSceneElements.js#L443-L517)
- UI field in Essentials: [src/modules/editor/EssentialsViews/LightningsView.jsx](src/modules/editor/EssentialsViews/LightningsView.jsx#L118-L134)
- Property schema: [src/nodesProps.js](src/nodesProps.js#L190-L203)

This is another case where different tabs show the same underlying scene data without creating separate implementations.

## 7) Material and texture property editing

The property definitions live in one schema file:

- [src/nodesProps.js](src/nodesProps.js)

Then they are rendered in different editor views and surfaces. This is how the app keeps one source of truth while exposing controls in multiple tabs.

## Final pattern to remember

The app’s architecture is:

- UI tabs are front-end entry points
- shared helpers and centralized functions contain the real logic
- editor panels only provide different ways to trigger or configure that logic

So the “same functionality in Elements, Essentials, and Outliner” pattern is not accidental. It is the app’s core design pattern.

The most important shared helper examples are:

1. `takeScreenshot` — capture logic
2. `createNode` — creation flow for new items
3. `actionsDispatcher` — action execution logic
4. asset resolution/loaders — upload and import flow
5. scene snapshot + setScene — scene state export and restore
6. property metadata system — settings exposed in multiple views

# Bounding box color used here

There is no custom bounding-box color defined anywhere in this project code.

The only actual bounding-box-related setting in the app is the toggle for visibility in [src/nodesProps.js](src/nodesProps.js#L381-L384):

- forceShowBoundingBoxes: { group: "Utilities", label: "Show Bounding Boxes", type: "Boolean" }

I searched for any explicit bounding-box color property such as `boundingBoxColor`, `showBoundingBox`, `outlineColor`, or a custom `Color3` assignment, and there is no such custom value set in this repo.

That means the project is not hardcoding a hex color like `#FF0000` or `#00FFFF` for the bounding box. It simply enables Babylon’s default box rendering, which is the engine default neutral color — effectively white, or `#FFFFFF` in hex.

So the practical answer is:

- Custom color in this project: none
- Effective color used: Babylon default, approximately white (`#FFFFFF`)
- Related source: [src/nodesProps.js](src/nodesProps.js#L381-L384)
