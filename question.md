# Where the textures and materials are coming from

Short answer: they are mainly coming from the scene JSON data, not from a separate material API. The viewer first fetches the scene from Firestore, then reads the `materials` and `textures` sections from that JSON, and finally creates Babylon.js material/texture objects from those values.

## 1) Scene data is loaded from Firestore

In [src/App.jsx](src/App.jsx), the app calls `getSceneData(...)`:

- `setSceneData()` gets the scene data from Firestore.
- Then it calls `parseSceneData(sceneData)`.

That `getSceneData` function is in [src/helpers.js](src/helpers.js#L856-L944). It queries:

- `/organizations`
- `/projects`
- `/scenes`

using Firebase Firestore, and returns the `sceneData` document.

So the source is not a special texture/material API. The scene itself is stored as JSON in Firestore.

## 2) Materials and textures are inside the scene JSON

The scene JSON contains `materials` and `textures` objects. You can see that in the scene creation flow:

- [src/sceneFunctions/setScene.js](src/sceneFunctions/setScene.js#L182-L244) checks `sceneData.materials` and `sceneData.textures`.
- `createMaterials()` creates material instances from each entry in `sceneData.materials`.
- `createTextures()` creates texture instances from each entry in `sceneData.textures`.

For example:

- PBR materials are created in [src/sceneFunctions/createSceneElements.js](src/sceneFunctions/createSceneElements.js#L573-L585)
- Textures are created in [src/sceneFunctions/createSceneElements.js](src/sceneFunctions/createSceneElements.js#L1768-L1820)

This is the actual code that does it:

- `new PBRMaterial(...)`
- `new Texture(url || fallbackTexture, scene, false, false)`
- `new CubeTexture(...)`

So the material/texture metadata is coming from JSON, and the engine creates Babylon objects from it.

## 3) Asset references can be resolved from Firestore

The JSON sometimes stores asset IDs instead of direct URLs. That is handled by `getAssetREF()` in [src/helpers.js](src/helpers.js#L1006-L1024):

- it takes an asset ID
- looks it up in Firestore in the `assets` collection
- returns the asset metadata

Then `parseSceneData()` calls `processObject()` and resolves any `...REF` values into real URLs using `getAssetREF()` and `cleanFirebaseUrl(...)` in [src/helpers.js](src/helpers.js#L337-L398).

## 4) Final image URL comes from Firebase CDN / storage URL

The actual file URL is normalized here:

- [src/helpers.js](src/helpers.js#L1062-L1074) => `cleanFirebaseUrl(url)`
- [src/Router.jsx](src/Router.jsx#L17-L18) => `storageUrl` is set to the CDN base URL

In this project, `storageUrl` is:

- localhost: `http://127.0.0.1:9199/cdn.badvisor.io`
- production: `https://cdn.badvisor.io`

So the pipeline is:

1. scene JSON is loaded from Firestore
2. material/texture entries are read from the JSON
3. if needed, asset IDs are resolved from Firestore `assets`
4. URLs are turned into CDN URLs
5. Babylon loads the texture images from those URLs

## Conclusion

This app is not taking textures/materials from a custom API per object at runtime. It is mostly taking them from the scene JSON stored in Firestore, with optional asset metadata lookup from the Firestore `assets` collection, and then loading the final image files from the Firebase CDN (`cdn.badvisor.io`).

So the right answer is: primarily from JSON + Firestore asset references, not from a separate texture/material API.

# API and Firestore usage in this app

## 1) What is actually used here?

This app uses Firestore as the main backend/data source, and uses a few API-style endpoints only for specific things.

### Main data source: Firestore
The app stores its content in Firebase Firestore, especially:

- organizations
- projects
- scenes
- assets

You can see it in [src/helpers.js](src/helpers.js#L856-L944), where `getSceneData()` queries Firestore for the organization, project, and scene. That is the main flow for loading the scene and related content.

The app also looks up asset records in Firestore via `getAssetREF()` in [src/helpers.js](src/helpers.js#L1006-L1024).

### API usage
There is also a `functionsUrl` in [src/Router.jsx](src/Router.jsx#L17-L23), which points to Cloud Functions:

- `http://127.0.0.1:5001/badvisor/europe-west6` in local mode
- `https://europe-west6-badvisor.cloudfunctions.net` in production

This is used for server-side functions, not for loading the main scene materials/textures.

For example, in [src/helpers.js](src/helpers.js#L429-L438), the app calls `fetch(functionsUrl + "/addVisit", ...)` to send visit tracking data. This shows that Cloud Functions are used for backend actions, but not as the core source of the 3D scene data.

## 2) Why Firestore is used here

Firestore is used because the app stores structured scene content as JSON, such as:

- nodes
- cameras
- lights
- materials
- textures
- effects
- overlays

Then the app loads that JSON and reconstructs the 3D scene runtime. This is exactly what the `parseSceneData()` function does in [src/helpers.js](src/helpers.js#L291-L426): it loads JSON, merges data, resolves references, and prepares the scene for Babylon.js.

FireStore is good for this because:

- data is structured and queryable
- scenes can be edited in admin panels
- assets and scenes can be linked by ID
- the app can fetch only the needed scene instead of hardcoding everything in the frontend

## 3) Why API/Cloud Functions are used here

Cloud Functions are used for backend logic and actions, not for the scene rendering itself. Typical examples:

- add visit analytics
- custom server logic
- backend processing that should not happen in the browser

This is a cleaner architecture: front-end viewer only renders the scene, while Firestore stores the scene data and Cloud Functions handle extra actions.

## 4) Final conclusion

This app mainly uses:

- Firestore for scene data, assets, and metadata
- Cloud Functions for backend actions and API-like endpoints
- CDN/storage URLs for actual image files

So the app is not built around a custom materials API that returns textures on every request. Instead, it uses Firestore as the main source of truth, then uses URLs from storage/CDN for the actual image files.

In simple words:

- Firestore = where the app keeps the scene and asset metadata
- API/Cloud Functions = for backend actions like analytics or extra operations
- CDN/Storage = where the actual texture/image files are loaded from

# Type of animation used in the Elements section

The animations in the Elements section are not CSS or GSAP animations. They are Babylon.js native keyframe/property animations.

## Why this is the case

In [src/sceneFunctions/actionDispatcher.js](src/sceneFunctions/actionDispatcher.js#L690-L887), when an action type is `Animate`, the code creates a Babylon `Animation` object like this:

- `new Animation("Animation_...", k, 60, dataType)`
- `anim.setKeys(keyFrames)`
- `anim.setEasingFunction(easingFun)`

It also uses Babylon animation data types such as:

- `Animation.ANIMATIONTYPE_FLOAT`
- `Animation.ANIMATIONTYPE_VECTOR3`
- `Animation.ANIMATIONTYPE_VECTOR2`
- `Animation.ANIMATIONTYPE_COLOR3`

This means the animation is based on keyframes and property interpolation, which is the normal Babylon.js animation system.

## Easing type

The same code also uses Babylon easing classes like:

- `CircleEase`
- `CubicEase`
- `QuadraticEase`
- `QuarticEase`
- `QuinticEase`
- `SineEase`
- `BounceEase`

So the element animation is essentially a Babylon.js keyframe animation with easing functions.

## Conclusion

The animation used in the Elements section is a Babylon.js animation system (keyframe-based property animation), not HTML/CSS animation and not a separate framework like GSAP/Framer Motion. It is built directly into the 3D scene engine.

# All animation types used in this app and where they are used

## 1) Babylon.js keyframe property animation (`Animate` action)

Where it is used:

- [src/modules/editor/Elements.jsx](src/modules/editor/Elements.jsx#L214-L245) defines the `Animate` element type.
- [src/sceneFunctions/actionDispatcher.js](src/sceneFunctions/actionDispatcher.js#L681-L887) handles the actual animation logic.

Purpose:

- To animate scene properties over time, for example position, rotation, scale, color, or numeric values.
- It creates a Babylon `Animation` object with keyframes and updates the target property frame by frame.
- It supports easing and looping behavior.

This is the main animation system used for scene logic.

## 2) Timeline-based action sequencing (`Timeline` action)

Where it is used:

- [src/modules/editor/Elements.jsx](src/modules/editor/Elements.jsx#L230-L245) defines the `Timeline` element.
- [src/sceneFunctions/actionDispatcher.js](src/sceneFunctions/actionDispatcher.js#L580-L646) implements the timeline runner.

Purpose:

- To schedule multiple actions over a defined time and run them in a sequence.
- It uses `registerAfterRender()` and calculates elapsed time from `performance.now()`.
- It can loop forever or repeat a fixed number of times.
- It is useful when several actions must happen in order, such as move, change color, then trigger another event.

This is an animation/control system for choreography of actions.

## 3) Imported asset animation groups (`AnimationGroup` / Play/Pause/Stop)

Where it is used:

- [src/modules/editor/Buttons/AnimationGroupButton.jsx](src/modules/editor/Buttons/AnimationGroupButton.jsx)
- [src/modules/editor/Nodes/AnimationGroupNode.jsx](src/modules/editor/Nodes/AnimationGroupNode.jsx)
- [src/sceneFunctions/actionDispatcher.js](src/sceneFunctions/actionDispatcher.js#L647-L677)
- [src/sceneFunctions/loadAssets.js](src/sceneFunctions/loadAssets.js#L372-L379)

Purpose:

- When a 3D asset is imported, Babylon may load `AnimationGroup` objects from the model.
- The app stores those animation groups on the loaded mesh or root object.
- `PlayAnimationGroup`, `PauseAnimationGroup`, and `StopAnimationGroup` let the scene control imported model animations.
- This is used for characters, rigged models, or imported animations attached to a mesh.

This is the animation type used for external 3D model animations.

# Snapshot functionality: whole scene or only part of canvas?

This is not a screenshot of the canvas area. The function in [src/sceneFunctions/createSceneSnapshot.js](src/sceneFunctions/createSceneSnapshot.js#L61-L171) is a scene snapshot/export utility. It does this:

- creates a deep clone of the Babylon scene with `const scene = cloneDeep(s);`
- builds a `sceneData` object with sections like `nodes`, `materials`, `textures`, `lights`, `cameras`, `effects`, `sounds`, and `actions`
- loops through `scene.meshes`, `scene.transformNodes`, `scene.materials`, and other collections
- calls `setChanges(...)` to capture only the relevant properties of each object
- stores them as JSON-like data, not pixel data from the canvas

So the answer is: it covers the whole scene state, not just a part of the canvas.

It is not doing anything like `canvas.toDataURL()`, `getImageData()`, or cropping a viewport region. There is no screen-capture logic in this function. The function is interested in object/property data for the entire scene, which is why it iterates over all scene objects and saves their properties.

In short:

- whole canvas? No, this is not a pixel snapshot of the viewport.
- part of canvas? No, there is no region selection or crop logic here.
- whole scene? Yes, this is a full scene-state snapshot of the current 3D model configuration.

The definition point is here: [src/sceneFunctions/createSceneSnapshot.js](src/sceneFunctions/createSceneSnapshot.js#L61-L171).

## 4) Scroll-driven animation (`animateOnScroll`)

Where it is used:

- [src/modules/pages/Page.jsx](src/modules/pages/Page.jsx#L13-L62) sends a scroll message to the iframe.
- [src/sceneFunctions/postMessageApi.js](src/sceneFunctions/postMessageApi.js#L50-L60) listens for `animateOnScroll`.
- [src/sceneFunctions/actionDispatcher.js](src/sceneFunctions/actionDispatcher.js#L681-L887) runs the action with `totalHeight` and `scrollPos`.
- [src/sceneComponents/Overlay.jsx](src/sceneComponents/Overlay.jsx#L25-L82) handles overlay scroll motion.

Purpose:

- To animate things based on the page/overlay scroll position.
- It calculates interpolation with a `lerp` function and updates scene values when the user scrolls.
- This is used for parallax-like or scroll-reactive animation in pages and overlays.

## 5) Overlay/UI motion using Framer Motion

Where it is used:

- [src/sceneComponents/Overlay.jsx](src/sceneComponents/Overlay.jsx#L1-L82) imports `motion` from `framer-motion`.

Purpose:

- For 2D overlay elements, not the 3D Babylon scene itself.
- It animates overlay properties like opacity, x, y, scale, and rotate.
- It also supports transition timing, delay, and ease.

This is used mainly for UI element motion and page overlay transitions.

## 6) CSS animations and transition effects

Where it is used:

- [src/Router.jsx](src/Router.jsx#L89-L91) defines CSS animation styles.
- [src/sceneComponents/Scene.scss](src/sceneComponents/Scene.scss) contains CSS keyframe animations.

Purpose:

- Used for loading screens, spinner effects, and general UI polish.
- This is not the main 3D scene animation system, but a secondary UI/visual effect layer.

# Final conclusion

The app uses multiple animation systems together:

1. Babylon.js keyframe animations for object/property animation in the scene.
2. Timeline actions for time-based action sequencing.
3. Animation groups for imported 3D asset motion.
4. Scroll-based animation for reactive motion on page/overlay scroll.
5. Framer Motion and CSS transitions for UI overlay effects.

So the main animation used in the Elements section is Babylon.js keyframe animation, while the app also uses imported animation groups, scroll-triggered actions, and UI motion libraries for other effects.

# Direct answer for the element animation

The animation used in the element section is mainly Babylon.js native keyframe animation.

It is created in [src/sceneFunctions/actionDispatcher.js](src/sceneFunctions/actionDispatcher.js#L681-L887), where the code does:

- `new Animation(...)`
- `anim.setKeys(...)`
- `anim.setEasingFunction(...)`

The purpose of this animation is to change scene properties over time such as:

- position
- rotation
- scale
- color
- numbers and values

It is used for the `Animate` action in the editor, which is defined in [src/modules/editor/Elements.jsx](src/modules/editor/Elements.jsx#L214-L245).

So the answer is: the app uses Babylon.js keyframe-based animation for the element animation system, with support for easing and timeline-based sequencing.

# Why gSplat is used in this project and its purpose

This project supports Gaussian splats because it is a 3D scene viewer for realistic digital experiences, not only for traditional polygon meshes. In this codebase, a Gaussian splat is treated as a first-class scene element, and the viewer has a dedicated `createGSplat` function in [src/sceneFunctions/createSceneElements.js](src/sceneFunctions/createSceneElements.js#L85-L366).

The project scope is to display various types of 3D content such as:

- standard 3D models (`glb`, `obj`, etc.)
- material and texture-based scenes
- photo domes and environments
- 3D text and effects
- Gaussian splat assets (`.splat`)

The feature guide describes Gaussian splats as: "Photo-captured 3D, rendered as splats rather than triangles" in [VIEWER-FEATURE-GUIDE.md](VIEWER-FEATURE-GUIDE.md#L140-L170), and as "A captured object or space" in the object list. That matches the real purpose of gSplat in this app: representing real-world scanned spaces or objects more naturally than a triangle mesh.

Why use gSplat here:

- It captures realistic surfaces, lighting, and color from real-world photography.
- It is excellent for visualizing scanned rooms, products, interiors, or environments.
- It avoids the heavy work of building dense polygon models for every detail.
- It gives a more natural, photoreal result for immersive viewer experiences.
- It fits the app's role as a visual presentation and scene-building tool for marketing, architecture, property tours, and showroom visualization.

From a technical point of view, the project does not just load a generic image; it builds a custom Babylon.js GSplat mesh with shader-based rendering and depth sorting. In [src/sceneFunctions/createSceneElements.js](src/sceneFunctions/createSceneElements.js#L85-L366), the code creates a custom shader program, processes Gaussian point data, and renders each splat as a colored, view-dependent point cloud element. This is useful because Gaussian splats are efficient for representing massive visual detail while still running in a browser-based 3D viewer.

So the purpose of using gSplat in this project is to support realistic captured 3D content, especially when the scene needs to show a real object or environment with high visual fidelity without converting it into a heavy traditional mesh. It is used as a realistic asset type for immersive viewer scenes.

# Final answer

The project uses gSplat to represent photorealistic, captured 3D content in the scene viewer. Its main purpose is to display real-world scanned objects or spaces efficiently and realistically, especially where conventional triangle meshes are too heavy or too limited. In this project, gSplat is part of the viewer's core asset support for immersive, high-detail 3D experiences.

# Asset upload file and supported upload types

The actual upload entry point in the app is the asset library modal that opens from the editor UI. In [src/modules/editor/Prompt/AddAssetPrompt.jsx](src/modules/editor/Prompt/AddAssetPrompt.jsx#L122-L170), there is a button labeled “Upload Asset” that opens:

- https://admin.badvisor.io/assets

This is the file/library upload path used by the app for adding assets to the organization library. The project does not have an internal local upload file like a dedicated uploader component; it redirects to the admin asset library for uploading.

## Supported asset types in this project

The allowed extensions are defined in [src/constants.js](src/constants.js#L21-L33):

- 3D model assets: glb, obj, stl, vrm
- Gaussian splats: splat
- Textures/images: jpg, jpeg, png, webp, bmp, tiff, gif, svg, ktx, ktx2
- Colour grading textures: 3dl
- Environment maps: env
- HDR environment maps: hdr
- Video textures: mp4, webm
- Audio files: mp3, ogg, wav

This means that in this project:

- FBX is not listed as an allowed upload type.
- GLB is supported.
- GLTF is not explicitly listed in the accepted extensions for asset upload.
- OBJ, STL, and VRM are supported as 3D model assets.
- SPLAT is supported as a Gaussian splat asset.

The code also confirms asset categorization in [src/helpers.js](src/helpers.js#L184-L286), where the app checks file extensions and routes them to different loaders, such as mesh assets, textures, video textures, sounds, and Gaussian splats.

## Final answer

The asset upload flow is through the admin asset library, opened from the UI in [src/modules/editor/Prompt/AddAssetPrompt.jsx](src/modules/editor/Prompt/AddAssetPrompt.jsx#L122-L170). The accepted file types in this project are mainly:

- GLB, OBJ, STL, VRM for 3D models
- SPLAT for Gaussian splat scenes
- JPG, PNG, WEBP, GIF, SVG, KTX, etc. for textures
- MP4, WEBM for videos
- MP3, OGG, WAV for sounds
- ENV, HDR, 3DL for environment and grading assets

So the project supports GLB, OBJ, STL, VRM, and SPLAT, but not FBX or GLTF as part of the listed upload extensions.

# Exactly where Gaussian splats are used

These are the exact places where Gaussian splats are implemented and used in this project:

1. Core GSplat creation and rendering
   - [src/sceneFunctions/createSceneElements.js](src/sceneFunctions/createSceneElements.js#L85-L366)
   - This is the main implementation. It creates the custom Babylon.js GSplat mesh, shader program, depth sorting, and rendering logic.

2. Allowed asset type definition
   - [src/constants.js](src/constants.js#L21-L33)
   - `splatExtensions = ["splat"]` declares `.splat` as a supported asset type.

3. Asset import and routing
   - [src/helpers.js](src/helpers.js#L184-L286)
   - When an uploaded asset has extension `splat`, it calls `createGSplat(...)` and opens it as a mesh.

4. Editor-created GSplat node
   - [src/modules/editor/createNode.jsx](src/modules/editor/createNode.jsx#L138-L161)
   - This is the editor flow for creating a GSplat from the asset library.

5. Scene reconstruction from saved scene data
   - [src/sceneFunctions/setScene.js](src/sceneFunctions/setScene.js#L370-L397)
   - `createGSplats()` recreates all GSplat nodes from `sceneData.nodes` when the scene loads.

6. Save/load scene property handling
   - [src/sceneFunctions/createSceneData.js](src/sceneFunctions/createSceneData.js#L185-L186)
   - [src/sceneFunctions/createSceneSnapshot.js](src/sceneFunctions/createSceneSnapshot.js#L129-L130)
   - These files treat GSplat as a node type with its own property set.

7. Editor UI support
   - [src/modules/editor/Buttons/MeshButton.jsx](src/modules/editor/Buttons/MeshButton.jsx#L58-L58)
   - [src/modules/editor/NodeFields.jsx](src/modules/editor/NodeFields.jsx#L519-L522)
   - [src/modules/editor/Nodes/MeshNode.jsx](src/modules/editor/Nodes/MeshNode.jsx#L269-L269)
   - The editor recognizes GSplat as a mesh-like object and shows its custom properties.

In short: Gaussian splats are used as a real scene object type, not just as a file format. They are created in the rendering layer, recognized in the import layer, saved in scene data, and displayed in the editor as a special mesh node.

# Shadow effects in this project

The project does not use a large set of custom shadow effects. Most of the actual shadow logic is built into Babylon.js light/material settings, and the CSS shadows are mostly minimal UI styling.

## 1) Real 3D shadow system in the scene editor

The main shadow configuration is in `src/nodesProps.js`.

- `shadowEnabled` toggles shadows for a light.
- `shadowMinZ` and `shadowMaxZ` set the shadow distance range.
- `shadowGenerator.frustumEdgeFalloff` controls how the shadow fades at the edge.
- `shadowGenerator.bias` adjusts shadow acne correction.
- `shadowGenerator.useBlurExponentialShadowMap` and `shadowGenerator.useBlurCloseExponentialShadowMap` enable blurred shadow maps.
- `shadowGenerator.blurKernel` and `shadowGenerator.blurScale` control blur intensity.
- `shadowGenerator.darkness` adjusts shadow darkness.
- `shadowGenerator.casters` defines which meshes cast shadows.

These are the main in-scene shadow effects used by the viewer/editor.

## 2) Mesh receive-shadow setting

Also in `src/nodesProps.js`:

- `receiveShadows: { group: "Advanced", label: "Receive Shadows", type: "Boolean" }`

This is the mesh-level property that makes an object receive light-generated shadows.

## 3) Shadow-only material

The project includes a dedicated material type named `Shadow Only Material`:

- `shadowOnlyMaterialProps` is defined in `src/nodesProps.js`
- It contains `shadowColor` with default value `#dedede`
- The docs also mention this material in `element.md` / `functionality.md` as a material type that is visible only in the shadow pass

This is a real shadow-specific material effect, not a CSS effect.

## 4) Post-processing shadow color adjustments

There are also image-processing controls for shadow tone in `src/nodesProps.js`:

- `imageProcessingConfiguration.colorCurves.shadowsHue`
- `imageProcessingConfiguration.colorCurves.shadowsDensity`
- `imageProcessingConfiguration.colorCurves.shadowsSaturation`

These change the look of shadows after rendering, rather than changing the actual shadow geometry.

## 5) CSS/UI box-shadow usage

There are very few visible CSS shadow effects:

- `src/modules/editor/Editor.scss` contains repeated `box-shadow: 0px 0px 0px $color-black;` declarations for slider track/thumb styling. These are effectively zero-size shadows, so they do not create a visible shadow effect.
- `src/sceneComponents/Scene.scss` has one real minor UI shadow:
  `box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);`
  on `.runtime-material-control-dirty-dot`

## Final summary

The project’s actual shadow effects are:

1. Light-based 3D shadows controlled by Babylon.js shadow generators (`shadowEnabled`, blur, bias, darkness, casters).
2. Mesh receive-shadow support (`receiveShadows`).
3. Shadow-only material (`shadowOnlyMaterialProps`).
4. Shadow color grading in image processing (`shadowsHue`, `shadowsDensity`, `shadowsSaturation`).

The CSS `box-shadow` usage is minor and mostly zeroed-out, so the important shadow behavior comes from the Babylon.js scene and material system, not from DOM styling.

# Scene settings slider ranges

For the scene-level numeric controls, the project does not define explicit `min` and `max` values in the property metadata.

Relevant definitions are in [src/nodesProps.js](src/nodesProps.js):

- `environmentIntensity: { label: "Env Intensity", type: "Number" }`
- `fogStart: { group: "Fog", label: "Fog Start", type: "Number", unit: "meters" }`
- `fogEnd: { group: "Fog", label: "Fog End", type: "Number", unit: "meters" }`

There are no `min`, `max`, or `step` properties set for these fields, and the number input component in [src/modules/editor/Components/NumberInput.jsx](src/modules/editor/Components/NumberInput.jsx) does not add any range limit itself. It simply renders a free-form `<input type="number">` without any bounds.

So the real answer is:

- `environmentIntensity`: no enforced min/max in this project
- `fogStart`: no enforced min/max in this project
- `fogEnd`: no enforced min/max in this project

The sliders are effectively open-ended numeric inputs rather than bounded range sliders. If a range is needed later, it would have to be added explicitly in the property config, for example with `min: ...` and `max: ...` in [src/nodesProps.js](src/nodesProps.js).
