# Settings and Help Guide

This guide explains where to find the editor's Settings and Help panels and what their options do.

## Find the panels

1. Open the scene in the editor.
2. In the right sidebar, select **Outliner**.
3. Scroll to **Settings** or **Help**, then click the heading/button to open it.

The Outliner Settings group has three buttons: **Engine Settings**, **Scene Settings**, and **Effects**. These open detailed editor panels. The **Essentials** tab is a separate simplified set of common controls.

## Engine Settings

- **Resolution:** selects the renderer's internal pixel scale. **HD** uses Babylon hardware scaling `0.5` (more rendered pixels and sharper output, with higher GPU cost); **Medium** uses `1`; **SD** uses `2` (fewer rendered pixels, usually faster, but softer). This is a performance/quality trade-off, not the CSS size of the viewport. The UI labels it as requiring a reload; reload/reopen to apply it consistently. Code: [Engine property schema](src/nodesProps.js), [Engine settings node](src/modules/editor/Nodes/EngineNode.jsx), [WebGL setup](src/sceneFunctions/initGLEngine.js).
- **Enable WebGPU:** asks the viewer to use Babylon's WebGPU renderer instead of its usual WebGL renderer. The choice is made when the scene engine starts, so reload/reopen the scene after changing this setting. WebGPU is attempted only when this saved setting is enabled, the browser exposes `navigator.gpu`, and head tracking is not active. It is normally skipped on iOS; `?forceWebGPU=true` can override that device check, while `?disableWebGPU=true` disables WebGPU. Browser support also depends on the operating system, GPU, and drivers. Initialization has an eight-second timeout. If WebGPU is unavailable or initialization fails/times out, the app falls back to WebGL. If WebGL is unavailable too, the scene cannot render. WebGPU may improve performance on supported devices, but is not guaranteed to be faster for every scene. Code: [WebGPU/WebGL selection](src/sceneComponents/Scene.jsx), [WebGPU setup and timeout](src/sceneFunctions/initGPUEngine.js), [WebGL fallback renderer](src/sceneFunctions/initGLEngine.js), [Engine property schema](src/nodesProps.js).
- **Notes:** free-text editor notes for the Engine settings node. They do not change rendering. Code: [Engine property schema](src/nodesProps.js), [Engine settings node](src/modules/editor/Nodes/EngineNode.jsx).

## Scene Settings

- **Background Color:** sets the scene's clear/background color. Choose a solid color for an opaque product backdrop. The scene stores the color as a hex value and converts it to Babylon's color representation when applying it. If Transparent is on, the transparent clear color takes precedence for the canvas. Code: [Scene property schema](src/nodesProps.js), [Scene settings node](src/modules/editor/Nodes/SceneNode.jsx).
- **Transparent:** toggles the canvas background alpha. When enabled, the scene clear color is set to transparent so the webpage behind an embedded viewer can show through; it does not make the 3D objects transparent. When disabled, the scene uses its normal clear color. The host page/layout must also allow the viewer to appear over its background. Code: [Transparency property behavior](src/nodesProps.js), [Babylon engine alpha setup](src/sceneFunctions/initGLEngine.js), [Essentials Scene controls](src/modules/editor/Essentials.jsx).
- **Env Intensity:** adjusts the strength of the scene's environment contribution, affecting how environment lighting/reflections influence materials. It is a numeric control; change it gradually and inspect reflective materials, since the result depends on the current environment map and material settings. Code: [Scene property schema](src/nodesProps.js), [environment controls](src/modules/editor/EssentialsViews/LightningsView.jsx), [environment creation](src/sceneFunctions/createSceneElements.js).
- **Environment Texture:** selects the environment texture assigned to the scene. Environment/cube textures provide the scene's surrounding image and can contribute lighting/reflections; this is not the same as assigning a base-color image to one material. The Essentials Lightning tab also exposes the environment URL and Y rotation. Code: [Scene property schema](src/nodesProps.js), [texture property schema](src/nodesProps.js), [environment controls](src/modules/editor/EssentialsViews/LightningsView.jsx), [environment creation](src/sceneFunctions/createSceneElements.js).
- **Notes:** free-text editor notes for the Scene settings node. They do not affect the rendered scene. Code: [Scene property schema](src/nodesProps.js), [Scene settings node](src/modules/editor/Nodes/SceneNode.jsx).

The full Scene Settings node is opened from **Outliner > Settings > Scene Settings**. The Essentials **Scene** tab is a quick subset: transparency, background color, and the active camera's fields. It does not duplicate every Scene Settings property. Code: [Outliner Settings buttons](src/modules/editor/Outliner.jsx), [Scene button](src/modules/editor/Buttons/SceneButton.jsx), [Essentials tabs and quick fields](src/modules/editor/Essentials.jsx).

## Effects

Effects are controls on the scene's shared post-processing object. Open **Outliner > Settings > Effects** for the full node, or **Essentials > FX** for fields marked for that simplified view. Group chips/sections organize related values; they are not separate effect presets. Effects can cost GPU time, especially SSAO and screen-space reflections. Some pipelines are intentionally not created while `?vr=true` is active. Code: [Effects panel/node](src/modules/editor/Effects.jsx), [Effects property schema](src/nodesProps.js), [Essentials FX view](src/modules/editor/Essentials.jsx), [effects pipeline creation](src/sceneFunctions/createSceneElements.js), [generic field rendering](src/modules/editor/NodeFields.jsx).

### Image Processing

- **Enable Effects:** enables/disables the scene's image-processing configuration. It is the master switch for image-processing controls, not a master switch for every separate pipeline such as SSAO or SSR.
- **Exposure:** changes overall image brightness after scene lighting/material calculations. Raise/lower carefully to avoid losing highlight or shadow detail.
- **Contrast:** increases/decreases separation between dark and light image values.
- **Global Hue, Density, Saturation:** adjusts color curves across the whole image: hue shifts color, density changes the curve's color strength, and saturation changes color intensity.
- **Where the result appears:** after you commit the number field (the editor applies numeric edits when the field loses focus), the change is visible in the live 3D viewport/render canvas. It affects the rendered scene as a whole, not just the Effects card or the selected object. **Global Density** changes the strength of the global color-curve adjustment; **Global Saturation** changes how vivid or muted the scene's colors look. Compare the canvas before and after changing the value. To keep the change for later viewers, save the scene through the editor's save flow; changing the field alone edits the current live scene. Code: [Global color-curve fields](src/nodesProps.js), [numeric field update behavior](src/modules/editor/NodeFields/NumberField.jsx), [color-curve setup](src/sceneFunctions/createSceneElements.js), [rendered scene canvas](src/sceneComponents/Scene.jsx).
- **Highlight Hue, Density, Saturation:** applies similar curve adjustments mainly to bright image areas.
- **Shadows Hue, Density, Saturation:** applies similar curve adjustments mainly to dark image areas.
- **Enable Color Grading / Color Grading Texture:** turns on a lookup-table color grade and selects the grading texture. This changes the final image's color mapping, rather than the source texture on a model. Code: [Image-processing fields](src/nodesProps.js), [image-processing setup](src/sceneFunctions/createSceneElements.js).
- **Enable Tone Mapping / Tone Mapping Type:** maps high-dynamic-range lighting values into the display range. Available types are **Standard**, **ACES**, and **Khronos PBR Neutral**. The enable toggle and type selector are separate controls. Code: [Tone-mapping fields](src/nodesProps.js).
- **Enable Vignette, Vignette Color, Weight, Stretch:** adds darkening toward image edges. Color selects the tint; weight controls strength; stretch changes the vignette shape. Code: [Vignette fields](src/nodesProps.js).

### Fog

- **Enable Fog:** turns scene fog on or off.
- **Fog Color:** sets the fog tint; matching it to the background helps hide the scene horizon.
- **Fog Start / Fog End:** set the distance range where fog begins and reaches its far/strong end. These are scene distances (labelled in meters in the schema). Code: [Fog property definitions](src/nodesProps.js), [Effects field rendering](src/modules/editor/Effects.jsx).

### SSAO (Screen-Space Ambient Occlusion)

SSAO adds local darkening at contacts, corners, and creases to make objects feel grounded. It is a screen-space approximation, so it can introduce artifacts and has a rendering cost.

- **Enable SSAO:** creates/enables the Babylon SSAO2 pipeline; turning it off disposes or disables that pipeline.
- **Base:** controls the baseline/background contribution used by the SSAO pipeline.
- **Bilateral Samples:** controls sampling used by edge-aware filtering; more samples can smooth noise but cost more.
- **Bilateral Soften / Bilateral Tolerance:** tune the edge-aware smoothing and how it preserves depth edges.
- **Max Z / Min Z Aspect:** tune depth range/aspect handling for the effect.
- **Radius:** controls the size of the local occlusion region.
- **Strength:** controls how visible the occlusion darkening is.

The editor initializes defaults for these pipeline values when SSAO is enabled. Some fields may not have an effect until SSAO exists. Code: [SSAO controls and initialization](src/nodesProps.js), [effects field rendering](src/modules/editor/Effects.jsx).

### Screen Reflections (SSR)

SSR approximates reflections using pixels visible to the camera. It cannot reflect objects outside the screen or hidden behind other objects, so it is not a replacement for a reflection probe/environment map.

- **Enable SSR:** creates/enables screen-space reflection processing.
- **Thickness / Automatic Thickness:** adjust ray thickness or let the pipeline estimate it; this affects missed/incorrect intersections.
- **Reflectivity Threshold:** controls which surfaces are reflective enough to be included.
- **Use Fresnel:** enables stronger reflection near grazing view angles.
- **Roughness Factor:** adjusts how surface roughness affects the reflection result.
- **Max Steps / Step / Max Distance:** control ray-march work and reach. More steps or distance can find more reflections but can be slower.
- **Smooth Reflections / Blur Downsample / Blur Dispersion Strength:** control smoothing and reflection blur behavior.
- **SSR Downsample:** lowers the resolution used for the reflection pass; this can improve performance while reducing detail.
- **Attenuate Screen Borders:** fades reflections near screen edges where the source is likely missing.
- **Self Collision Num Skip:** skips nearby depth samples to reduce self-intersection artifacts.
- **Samples:** controls sampling quality/cost.
- **Debug:** displays diagnostic output for tuning.

Code: [SSR controls and pipeline creation](src/nodesProps.js), [effects field rendering](src/modules/editor/Effects.jsx).

### Glow and Bloom

- **Glow - Enable Glow:** toggles the separate Babylon glow layer.
- **Glow - Intensity:** sets the glow contribution strength.
- **Glow - Blur:** controls the glow blur kernel size.
- **Bloom - Enable Bloom:** adds a halo to bright areas through the default rendering pipeline.
- **Bloom - Kernel:** controls the bloom blur kernel size.
- **Bloom - Scale:** controls the bloom pass resolution/scale and therefore its performance/detail trade-off.
- **Bloom - Threshold:** sets how bright a pixel must be before it blooms.
- **Bloom - Weight:** controls bloom's final contribution.

Glow and Bloom are separate effects; enabling one does not enable the other. Code: [Glow/Bloom fields](src/nodesProps.js), [pipeline creation](src/sceneFunctions/createSceneElements.js).

### Chromatic Aberration and Depth of Field

- **Enable Chromatic Aberration:** separates color channels near the image edges for a lens-like fringe.
- **Amount:** controls the separation distance/strength.
- **Enable DoF:** toggles depth-of-field blur based on focus distance.
- **Blur Level:** selects a blur quality/strength level (schema range 0-2).
- **fStop:** controls simulated aperture; lower f-stop generally means shallower focus.
- **Focal Length:** lens focal length in millimeters.
- **Focus Distance:** distance from the camera that should be sharp. The schema converts the display value to/from the pipeline's stored unit.
- **Lens Size:** simulated lens size in millimeters; affects blur appearance.

Code: [Chromatic aberration and depth-of-field fields](src/nodesProps.js).

### Anti-Aliasing, Grain, and Sharpen

- **Enable FXAA:** applies a post-process anti-aliasing pass to reduce jagged edges. It can soften fine detail slightly.
- **Enable Grain:** adds image grain/noise.
- **Intensity:** controls grain visibility.
- **Animated:** animates the noise over time rather than keeping a static grain pattern.
- **Enable Sharpen:** applies a sharpening pass.
- **Color Amount / Edge Amount:** tune color sharpening and edge sharpening separately; strong values can create halos or noise.

Code: [FXAA, grain, and sharpen fields](src/nodesProps.js).

### Utilities

- **Enable OIT (Order-Independent Transparency):** changes handling of overlapping transparent objects to improve sorting in supported cases; it may have a performance cost.
- **Show Bounding Boxes:** displays object bounds for debugging/inspection; this is a diagnostic view, not final artwork.
- **Show Wireframe:** displays mesh edges instead of the normal shaded surface for geometry inspection.
- **Notes:** optional editor-only notes on the Effects node.

Code: [Utility and notes fields](src/nodesProps.js), [Effects node](src/modules/editor/Effects.jsx).

## Essentials quick controls

Select **Essentials** in the sidebar for a simplified set of common controls. The filter is schema-driven: only fields marked `showInEssentials` are shown. It is not a second copy of the full settings schema.

- **Scene:** Transparent Background and Background Color, plus the active camera's declared fields. Changing tabs clears the currently opened node selection.
- **3D:** add/list meshes and assets; open object fields; manage assigned and child materials; attach a new PBR material when the selected mesh has none.
- **Lightning:** list/open lights and materials; add lights; view the environment map and edit its texture URL, scene environment intensity, and Y rotation. The editor uses this spelling for the tab.
- **FX:** shows only effect fields marked `showInEssentials`, including many image-processing and pipeline controls; advanced fields may remain available only in the full Effects node.

Use **Outliner > Settings** for the full Engine, Scene, and Effects nodes. Some values only work after the relevant pipeline/texture exists; controls may also be unavailable in VR mode. Code: [Essentials tabs and rendering](src/modules/editor/Essentials.jsx), [3D quick view](src/modules/editor/EssentialsViews/ThreeDView.jsx), [Lightning quick view](src/modules/editor/EssentialsViews/LightningsView.jsx), [Essentials field filter](src/modules/editor/NodeFields.jsx).

## Help panel

In **Outliner**, click **Help**. The popup contains:

- **Guides:** embedded Badvisor tutorial videos.
- **Shortcuts:** quick keyboard and mouse reference.
- **Documentation:** opens the Badvisor online user documentation.
- **Close:** click the X or press **Escape**.

### Shortcuts shown in Help

- Open asset node: **Shift + left-click**.
- Open mesh node: **Shift + Ctrl + left-click**.
- Open material node: **Ctrl + Alt + left-click**.
- Move nodes: hold **Space** and drag.
- Reorganize nodes: **Alt + 1**.
- Close nodes: **Alt + 3**.
- Add a collection: **Alt + K**.
- Add a control node: **Alt + N**.
- Add a camera: **Alt + C**.
- Add a light: **Alt + L**.
- Add a 3D element: **Alt + D**.
- Add a material: **Alt + M**.
- Add a texture: **Alt + T**.
- Add an action: **Alt + A**.
- Add a sound: **Alt + S**.
- Add an overlay: **Alt + O**.

## Quick help for the Outliner

- Click a section heading to expand or collapse it. Counts show how many items are in a group.
- Use the search field to find scene items by name; matching groups expand while searching.
- In **3D Elements**, use the arrow to expand child meshes, the eye to show/hide an object, and the focus icon to frame it in the viewport.
- In **Cameras**, click the visibility icon to make a camera active.
- In **Overlays**, use **Hide All** or **Show All** to toggle every overlay.
- Use the plus button next to a group to create or add that kind of item. Some groups appear only when the scene contains relevant items.


Main usage of GSplat
It is used mainly as a custom Babylon scene node for loading and rendering .splat Gaussian point-cloud assets.

Core implementation: createSceneElements.js:85-366

This is the real GSplat logic.
It creates a Mesh, loads the .splat file, builds the Gaussian data, sorts it by depth, and renders it with a custom shader.
Scene import/creation path: setScene.js:391-399

When the scene data contains a node of type GSplat, it creates the actual GSplat object.
Asset loading flow: helpers.js:255-278

If the asset type is a splat asset, it calls createGSplat and opens it as a mesh.
Editor creation flow: createNode.jsx:138-160

The editor can create a GSplat from an uploaded asset.
UI prompt entry: Add3DElementPrompt.jsx:70-90

There is a GSplat option in the prompt, though the card itself is commented out in this version.
So, in short: GSplat is mainly used in the scene/rendering layer and asset-import layer, not as a broad app utility.