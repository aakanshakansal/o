# Code-Checked Findings: Outliner Scene Settings and Effects

This review checks the Outliner **Settings** controls against the current source code. The main distinction is between a control being declared in the editor and that control actually changing the rendered scene.

## Current engine context

The scene renderer and editor use **Babylon.js**, not Three.js. Three.js is imported by an editor export path for GLB/USDZ conversion, but the scene engine is initialized with Babylon's `Engine`/`WebGPUEngine`. Therefore a statement about Three.js's WebGPU or transparency implementation does not describe the current runtime.

Code: [Outliner Settings group](src/modules/editor/Outliner.jsx), [scene renderer selection](src/sceneComponents/Scene.jsx), [WebGL engine](src/sceneFunctions/initGLEngine.js), [WebGPU engine](src/sceneFunctions/initGPUEngine.js), [Three.js export use](src/modules/editor/SidebarButtonGroup.jsx).

## Findings and corrections

### 1. Order-Independent Transparency (OIT)

**Short answer: No. OIT is not working as a rendering feature in this repository.** The Outliner may show an **Enable OIT** checkbox, but changing that checkbox does not currently enable order-independent rendering.

#### What OIT means

OIT means **Order-Independent Transparency**. It is a way to draw multiple transparent surfaces correctly even when their depth order is difficult to sort.

With ordinary alpha transparency, a renderer usually draws opaque geometry first and then draws transparent objects from far to near. This works for many simple scenes, but the sorting is often at whole-object level. If two transparent meshes overlap or intersect, one mesh may need to be in front of another at one pixel and behind it at a different pixel. A single whole-object order cannot satisfy both cases, so parts can appear in the wrong order, disappear, or blend with the wrong color.

An OIT renderer handles transparent fragments per pixel, rather than relying only on one global order for each mesh. Depending on the chosen technique, it can collect transparent fragments into intermediate buffers and composite them later, or use multiple depth passes. Some techniques are more exact but require extra passes and memory; others are faster approximations and can change the visual result. OIT is a rendering algorithm, not a synonym for WebGPU, and WebGPU support alone does not automatically turn it on.

#### Example: two panes of glass

Imagine a red object behind two semi-transparent glass panes. The panes cross each other in the camera view. In the left part of the image, pane A is closer; in the right part, pane B is closer.

- With ordinary object sorting, the renderer may draw all of pane A and then all of pane B. That order is correct on one side but wrong on the other, so the colors can blend incorrectly around the overlap.
- With OIT, the renderer tracks or accumulates the transparent contributions at each pixel and composites them according to that pixel's depth information. The overlap can then be blended more consistently, regardless of which pane's mesh was submitted first.
- OIT still has limits: the selected algorithm may be approximate, and extra buffers/passes can cost GPU time and memory. It should be tested with the actual materials, intersecting surfaces, and target devices.

This example describes the purpose of OIT; it is **not behavior currently supplied by the checkbox in this app**.

#### What happens in this codebase

1. `nodesProps.js` declares `useOrderIndependentTransparency` as a Boolean field in the Effects node's **Utilities** group.
2. The generic field setter can assign and save that Boolean on the JavaScript `scene.effects` object.
3. A repo-wide search finds no active runtime code that reads the property, changes a Babylon renderer setting, creates an OIT pipeline, or otherwise changes transparent rendering because of it.
4. The scene is rendered with Babylon.js `Engine` or `WebGPUEngine`. The mere availability of WebGPU does not make this Effects field functional.

Therefore the checkbox can look enabled and its value may be serialized, while transparent objects continue to use the renderer's normal transparency behavior. It is currently a **UI/schema placeholder**, not a confirmed OIT implementation.

The earlier statement about Three.js was not a valid description of this setting: this application does not use Three.js as its scene renderer, and a renderer migration or WebGPU switch would not by itself prove OIT support. A future implementation would need to select a concrete OIT method supported by the chosen runtime, connect the checkbox to create/enable/disable that method, serialize the state correctly, and test it with overlapping transparent geometry on supported devices.

**Status:** OIT control is exposed and its Boolean value can be stored; OIT rendering is **not implemented in this repo**.

Code: [OIT property declaration](src/nodesProps.js), [generic property setter](src/setNodeProps.js), [Effects serialization](src/sceneFunctions/createSceneData.js), [Effects creation](src/sceneFunctions/createSceneElements.js), [Babylon WebGL/WebGPU selection](src/sceneComponents/Scene.jsx), [WebGL renderer](src/sceneFunctions/initGLEngine.js), [WebGPU renderer](src/sceneFunctions/initGPUEngine.js).

### 2. Wireframe

**What this code does:** `forceWireframe` is declared as a Boolean Effects field. No active runtime code was found that applies it to meshes or their materials. Changing that field therefore should not be documented as a working scene-wide wireframe toggle.

**Status:** UI/schema field exists; renderer behavior is **not implemented**. A complete feature needs to define its scope (all meshes or selected meshes), apply wireframe safely, and restore original material/render states when turned off.

Code: [Wireframe field declaration](src/nodesProps.js), [generic property setter](src/setNodeProps.js), [mesh property schema](src/nodesProps.js).

### 3. Bounding boxes

**What this code does:** `forceShowBoundingBoxes` is declared as a Boolean Effects field. No active code was found that toggles Babylon mesh bounding boxes from this Effects property. The editor does have separate object-focus and helper behavior, but that is not the same as a global model/canvas bounding-box setting.

**Status:** UI/schema field exists; global bounding-box behavior is **not implemented**. A complete feature needs to set/reset bounding-box visibility on eligible meshes and decide whether editor helpers, hidden meshes, and imported child meshes are included.

Code: [Bounding-box field declaration](src/nodesProps.js), [generic property setter](src/setNodeProps.js), [Outliner mesh controls](src/modules/editor/Lists/MeshesList.jsx).

### 4. Fog

**Correction to the expected behavior:** Fog is not a background-color effect. When functioning, fog is applied to rendered geometry according to its distance from the camera; the clear/background color is a separate setting. For linear fog, Start and End represent depth/distance thresholds where fog begins and reaches its far/end influence. They are not positions of two objects or world-space points.

**What this code currently does:**

- `initScene.js` sets `scene.fogEnabled = false`, selects `FOGMODE_LINEAR`, and initializes `scene.fogColor` to `#ff3333` (linear-space Babylon color).
- The Effects schema exposes `fogEnabled`, `fogColor`, `fogStart`, and `fogEnd` on `scene.effects`.
- The code that would copy fog properties from the live scene to `scene.effects` is commented out in `createSceneElements.js`.
- The Effects property setter writes the declared fields to the Effects object. No active code was found that maps edits from `scene.effects.fog*` back onto `scene.fog*` or enables scene fog.

So the panel exposes Fog controls, but the current source does **not** connect them to the rendered Babylon scene. Start/End have the intended meaning described above, but changing them in this build is not confirmed to change the rendered fog. If the canvas changes during testing, the change should not be attributed to these fields without verifying the live scene properties.

**Status:** Fog defaults/mode exist; the Outliner Effects Fog controls are **not fully wired to rendering**.

Code: [Fog initialization](src/sceneFunctions/initScene.js), [Fog fields and schema](src/nodesProps.js), [Effects creation with commented fog mapping](src/sceneFunctions/createSceneElements.js), [Effects application during scene setup](src/sceneFunctions/setScene.js), [generic property setter](src/setNodeProps.js).

### 5. Background and Fog color input

**Background Color:** This is a real Scene setting. It writes `scene.clearColor`; it affects the canvas clear/background color, not fog on objects. The Essentials Scene tab exposes this same field.

**Fog Color:** The Effects schema declares it as a `Color3`, but due to the Fog wiring issue above, changing the Effects field is not currently shown to update `scene.fogColor` or the rendered fog.

**Picker vs. manual color code:** The shared `Color3Field` renders a browser `<input type="color">` and displays the current hex value next to it. The displayed hex text is not an editable text input. Therefore the current UI provides a color picker, but does **not** provide a separate manual `#RRGGBB` text-entry field. This applies to Background Color and Color3 settings such as Fog Color.

**Status:** Background color picker works through the scene property handler. Fog color field is declared but not connected to live scene fog. Manual hex entry is **not implemented**.

Code: [Scene background and transparency properties](src/nodesProps.js), [color field](src/modules/editor/NodeFields/Color3Field.jsx), [color picker control](src/modules/editor/Components/ColorInput.jsx), [Essentials Scene controls](src/modules/editor/Essentials.jsx).

### 6. Environment Intensity and the reported spot-like result

Environment Intensity is a separate Scene property. It adjusts the environment contribution used by scene materials/lighting; it is not the fog intensity, fog distance, or a spotlight. A strong environment can change the brightness/reflections visible on materials, but this property is not defined as a localized spot of light.

Because the current Fog controls are not connected to the live fog properties, the reported loss of fog color when Environment Intensity increases cannot be explained as the intended interaction of these two controls from this code alone. The spot-like visual could come from a light, a reflection/material response, the environment texture, or another scene effect; identifying the cause requires inspecting the scene and its live values. Do not describe Environment Intensity as creating a spot-light area.

Code: [Environment Intensity property](src/nodesProps.js), [Essentials environment controls](src/modules/editor/EssentialsViews/LightningsView.jsx), [environment creation](src/sceneFunctions/createSceneElements.js), [light property schemas](src/nodesProps.js).

## Correct implementation summary

| Setting | Exposed in UI/schema | Confirmed renderer behavior in current source | Finding |
| --- | --- | --- | --- |
| Background Color | Yes | Updates `scene.clearColor` | Implemented |
| Transparent Background | Yes | Sets transparent scene clear color when enabled | Implemented, subject to host page/compositing |
| Environment Intensity | Yes | Writes to the scene environment intensity property | Implemented; separate from fog/spot lights |
| Fog Enabled/Color/Start/End | Yes, under Effects | No active mapping from `scene.effects.fog*` to the live `scene.fog*` properties found | Partially exposed; not wired to rendering |
| Manual `#RRGGBB` entry | No; picker plus displayed hex only | No editable text field | Not implemented |
| OIT | Boolean field only | No runtime application found | Not implemented/verified |
| Force Wireframe | Boolean field only | No runtime application found | Not implemented |
| Force Show Bounding Boxes | Boolean field only | No runtime application found | Not implemented |

## Suggested work before calling these features complete

1. Wire Fog edits to Babylon's live scene fog properties (`fogEnabled`, `fogColor`, `fogStart`, `fogEnd`) and verify save/load serialization. Keep Start/End described as camera-depth thresholds for linear fog.
2. If manual hex input is required, add a text input beside the picker, validate/normalize `#RRGGBB`, and show invalid input feedback without applying malformed colors.
3. Implement wireframe and bounding-box toggles against the intended mesh set, with reliable restoration when disabled.
4. Decide whether OIT is required for the current Babylon renderer or a future Three.js renderer. Do not treat a renderer switch to WebGPU as proof that OIT is implemented.
5. Validate each control in the actual canvas and with save/reload. The presence of a field in `nodesProps.js` alone only proves that the editor schema exposes it.
