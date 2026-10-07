# Badvisor App Functionality Map

## Purpose and scope

This document maps the functionality present in this repository to its source sections, explains what each area is for, and gives an implementation status based on the code.

This repository is the **Badvisor viewer and scene editor**. It is a React 18/Vite application whose active 3D runtime is **Babylon.js 7**. It can display published scenes, provide an editor when opened in edit mode, and render published HTML pages. It does not contain the complete Badvisor administration platform.

### Status definitions

- **Implemented:** The main code path for the described scope exists in this repository.
- **Partially implemented:** The feature exists, but depends on another application, browser/device support, scene configuration, or has a known limitation.
- **Not implemented here:** No complete implementation was found in this repository; the feature belongs to another application or is a planned migration.

These statuses describe source-code coverage, not an end-to-end QA certification. The current automated test is only a starter placeholder, so interactive feature coverage has not been demonstrated by tests.

## Application map

| App area | Main source section | What it does | Status |
| --- | --- | --- | --- |
| Application entry and routes | `src/index.jsx`, `src/Router.jsx` | Starts React, initializes Firebase, selects the scene, sandbox, viewer, AR, or page route. | Implemented, with environment caveat |
| Shared app state | `src/badProvider/` | Shares scene data, load state, editor tabs, node panels, viewport settings, and mapping state. | Implemented |
| Scene loading and viewer | `src/App.jsx`, `src/sceneComponents/Scene.jsx` | Loads scene records, applies the startup gates, creates the render engine, and mounts the canvas and editor. | Implemented for the existing Babylon runtime |
| Scene construction | `src/sceneFunctions/` | Loads assets, creates Babylon objects, applies saved properties, starts triggers, and serializes scene data. | Implemented for supported scene schema |
| Editor UI | `src/modules/editor/` | Provides Elements, Essentials, Outliner, node inspectors, prompts, and graph workflow. | Partially implemented; feature-rich but not exhaustively tested |
| Published page rendering | `src/modules/pages/Page.jsx` | Loads and displays published HTML/CSS pages and forwards page scroll events to an embedded scene. | Partially implemented; page authoring is not included |
| Firebase/storage integration | `src/helpers.js`, `src/Router.jsx` | Resolves organizations, projects, scenes, assets, and pages; constructs file URLs. | Partially implemented; local emulator is hard-coded on |
| Admin, account, billing, publishing UI | Not in this repository | Owns account and organization management, scene administration, upload permissions, and final save/version decisions. | Not implemented here; external application responsibility |
| Three.js renderer migration | No Three.js runtime in scene pipeline | Replace Babylon scene/runtime while preserving the saved scene contract. | Not implemented; current rendering and editing use Babylon.js |

## Routes and modes

Routes are declared in `src/Router.jsx`; scene and startup decisions are in `src/App.jsx`.

| Route/mode | Use | Status |
| --- | --- | --- |
| `/{organization}/{project}/{scene}` | Loads a scene by its organization, project, and scene handles. Published scenes are available to public visitors; the admin referrer can preview unpublished scenes. | Implemented; Firestore and asset URLs must be configured for the target environment |
| Scene route with `?editmode=true` | Opens the same scene with editor UI. Typically embedded by the external admin. | Implemented; persistence/upload operations depend on parent messages |
| `/sandbox` | Opens an editable minimal scene without fetching a saved scene. Supports local file drop. | Implemented |
| `/viewer` | Opens an empty/minimal scene in viewer mode. | Implemented |
| `/{organization}/pages/{page}` | Loads a published page document and displays its HTML/CSS. | Partially implemented; no page builder/editor is present here |
| Scene route ending in `/ar` | Displays the configured AR handoff screen and QR flow. | Partially implemented; depends on device, platform, and AR action configuration |

Scene query parameters also control edit mode, saved-version selection, AR/VR buttons, head try-on (`vto=head`), naked/no-overlay presentation, scene-data overrides, WebGPU selection, parent origin, and caching. The parameter parsing and their effects are distributed across `src/App.jsx`, `src/sceneComponents/Scene.jsx`, and `src/helpers.js`; not every parameter creates a complete standalone feature.

## Scene startup and rendering

| Functionality | Source | Use | Status |
| --- | --- | --- | --- |
| Organization/project/scene lookup | `src/helpers.js` (`getSceneData`) | Resolves route handles through Firestore and retrieves the scene record/version. | Implemented, dependent on Firebase access/configuration |
| Scene data normalization | `src/helpers.js` (`parseSceneData`) | Normalizes scene JSON and resolves asset references before rendering. | Implemented for supported data shapes |
| Password gate | `src/App.jsx` | Prompts for the configured scene password before showing the thumbnail/scene to public visitors. | Partially implemented; simple client-side gate, not a replacement for authorization |
| Thumbnail/start screen | `src/sceneComponents/Thumbnail.jsx` | Displays the configured poster and waits for user input before loading the scene. | Implemented when configured |
| Loading screen | `src/sceneComponents/LoadingScreen.jsx`, `src/sceneFunctions/` | Shows loading/progress and scene setup states. | Implemented |
| WebGL engine | `src/sceneFunctions/initGLEngine.js` | Creates the primary Babylon renderer and render loop; includes device-specific settings and runtime diagnostics. | Implemented |
| WebGPU engine | `src/sceneFunctions/initGPUEngine.js`, `src/sceneComponents/Scene.jsx` | Attempts WebGPU when requested/configured and supported, falling back to WebGL if initialization fails. | Partially implemented; browser/device support required |
| Scene reconstruction | `src/sceneFunctions/initScene.js`, `loadAssets.js`, `setScene.js`, `createSceneElements.js` | Loads model assets, creates scene objects, then applies property overrides in order. | Implemented for supported assets and properties |
| Scene-ready triggers | `src/sceneFunctions/onSceneReady.js` | Installs scene/pointer triggers, starts on-load actions, hides loading UI, and informs the embedding page that the scene is ready. | Implemented |
| Scene cleanup/switching | `src/sceneComponents/Scene.jsx` | Disposes the prior Babylon scene before creating a new one to release resources. | Implemented |
| iOS compatibility handling | `src/Router.jsx`, `src/sceneComponents/Scene.jsx` | Shows a compatibility fallback for affected public iOS versions and uses low-memory/WebGL settings on iOS. | Implemented as a compatibility gate; requires product validation to remove |

The active scene format remains Babylon-shaped (for example `ArcRotateCamera`, `PBRMaterial`, and `TransformNode`). Scene data is not yet a Three.js object model.

## Viewer functionality

| Functionality | Source | Use | Status |
| --- | --- | --- | --- |
| 3D canvas and camera navigation | `src/sceneComponents/Scene.jsx`, `src/nodesProps.js` | Renders the scene and uses orbit or first-person camera controls configured in scene data. | Implemented for supported camera types |
| Scene overlays | `src/sceneComponents/Overlay.jsx` | Displays configured HTML/UI layers over the canvas. | Partially implemented; content and interactions depend on scene data |
| Runtime material controls | `src/sceneComponents/RuntimeMaterialControls.jsx`, `src/sceneFunctions/runtimeMaterialControls.js` | Shows public controls for configured material properties, with reset behavior. Hidden in edit mode and naked mode. | Partially implemented; only configured controls are shown |
| Grid, axes, and helpers | `src/modules/editor/Editor.jsx`, `SidebarButtonGroup.jsx` | Shows editor guides and provides a toggle; helper visibility is stored locally. | Implemented in editor |
| AR entry | `src/sceneComponents/ArButton.jsx`, `src/App.jsx` | Enters WebXR immersive AR when supported; the `/ar` flow can hand off GLB/USDZ content to a device viewer. | Partially implemented; hardware/browser and scene setup dependent |
| VR entry | `src/sceneComponents/VrButton.jsx` | Enters WebXR immersive VR where supported. | Partially implemented; hardware/browser dependent |
| Virtual try-on/head tracking | `src/sceneFunctions/initFaceMaskTracking.js`, `Scene.jsx` | Loads face tracking libraries and tracking data for the `vto=head` mode. | Partially implemented; camera permission, device support, and tracking setup required |
| Analytics | `src/App.jsx`, `src/sceneFunctions/onSceneReady.js`, `src/helpers.js` | Initializes configured GA4 and records selected scene lifecycle/interaction events; visit tracking calls a Cloud Function. | Partially implemented; external endpoint and GA configuration required |
| Published page scroll bridge | `src/modules/pages/Page.jsx` | Sends scroll position to an embedded scene to drive scroll-based actions. | Partially implemented; depends on the page document and embedded scene being configured |

## Editor functionality

The editor is loaded dynamically in `src/sceneComponents/Scene.jsx` for edit mode and sandbox routes. The sidebar lives in `src/modules/editor/Sidebar.jsx`; node graph state and editor state are managed through `src/badProvider/`.

| Editor section | Source | Function and use | Status |
| --- | --- | --- | --- |
| Elements | `src/modules/editor/Elements.jsx`, `createNode.jsx` | Search, drag, or double-click to add supported objects/actions to the scene. | Implemented for listed element types |
| Essentials | `Essentials.jsx`, `EssentialsViews/`, `NodeFields.jsx` | Simplified Scene, 3D, Lightning, and FX controls; shows selected object properties and quick material actions. | Implemented for fields marked for Essentials |
| Outliner | `Outliner.jsx`, `Lists/` | Search and manage scene groups: meshes, cameras, lights, materials, textures, actions, variables, animation groups, sounds, overlays, collections, and control nodes. | Implemented for listed groups; not a general-purpose tree editor for every entity |
| Inspector nodes | `Nodes/`, `NodeFields.jsx`, `NodeFields/`, `nodesProps.js` | Opens type-specific property editors; property schemas control labels, types, conversion, and editor visibility. | Implemented for declared properties; not every engine property is exposed |
| Visual node graph | `Flow/`, `Editor.jsx` | Places opened object/action nodes in a React Flow workspace; can zoom, hide, close, and arrange nodes. | Partially implemented; graph is an editor workspace, not a complete visual scripting replacement |
| Mapping mode | `Editor.jsx`, `badProvider/` | Selects source properties and targets for supported mapping workflows. | Partially implemented; mapping depends on supported property types and scene setup |
| Prompts and add flows | `Prompt/`, `createNode.jsx` | Configures assets, cameras, lights, materials, textures, actions, and other added nodes. | Implemented for available prompts |
| Drag/drop files | `Components/DropWrapper.jsx`, `helpers.js` | Accepts supported local files in edit mode/sandbox; in edit mode sends file data to the parent admin for upload and metadata response. | Partially implemented; production upload requires cooperating parent/admin |
| Capture | `Nodes/CaptureNode.jsx` | Opens capture-related editor controls. | Partially implemented; capture options depend on implementation and browser APIs |
| Performance meter | `PerformanceMeter.jsx` | Displays engine/scene performance instrumentation in the editor. | Implemented |
| Help | `HelpPopup.jsx` | Shows guides, editor shortcuts, and a documentation link. | Implemented |

### Elements library

The current creation palette is defined in `src/modules/editor/Elements.jsx`.

| Category | Available types in the palette | Use | Status |
| --- | --- | --- | --- |
| 3D Elements | 3D Asset, 3D Text, Photo Dome | Import a model, generate text geometry, or create a panoramic dome. | Implemented for supported asset types |
| Cameras | Orbit Camera, First Person Camera | Set product inspection or walk-through views. | Implemented |
| Lights | Point, Directional, Spot, Hemispheric | Add local, directional, cone, or ambient-style lighting. | Implemented |
| Materials | PBR, Shadow Only, Transmission | Assign realistic, shadow-catcher, or transmissive/glass-like materials. | Implemented for listed types |
| Textures | Image, Cube, HDR Cube, Video, Dynamic, Color Grading | Add surface/environment/media textures and grading data. | Implemented for listed types and supported files |
| Actions | Animate, Condition, Timeline, Math, Expression, Sequencer, Overlays, Enter AR, Enter VTO, External Link, Add/Replace, Save Config, Screenshot, Export Scene | Create interactions, animation, branching, scene changes, sharing, and output actions. | Partially implemented; each action depends on supported configuration and runtime conditions |
| Sound | Sound | Add audio sources to a scene. | Implemented for supported formats; browser autoplay rules apply |
| Utilities | Variable, Collection, Control Node | Store action state, group scene items, and expose grouped controls. | Implemented for supported editor/runtime flows |

The palette does not currently expose every type declared in `nodesProps.js`; for example, Diamond Material, Shader Material, and Gaussian Splat creation entries are commented out in `Elements.jsx` even though related schema/runtime code or dependencies may exist. Treat those as unavailable through the normal creation palette unless another path is provided.

## Scene content and interaction runtime

### Assets and scene objects

`src/constants.js`, `src/sceneFunctions/loadAssets.js`, and `createSceneElements.js` define supported content and creation paths. The editor's file drop lists 3D formats `glb`, `obj`, `stl`, `vrm`, and `splat`; image/texture formats include `jpg`, `jpeg`, `png`, `webp`, `bmp`, `tiff`, `gif`, `svg`, `ktx`, and `ktx2`; video formats are `mp4`/`webm`; audio formats are `mp3`/`ogg`/`wav`. Actual successful loading can depend on the Babylon loader, file validity, and asset URL.

Scene properties, imported-object overrides, material properties, textures, cameras, lights, sounds, overlays, and effects are declared in `src/nodesProps.js` and applied by `src/sceneFunctions/setScene.js`. Common object editing includes transforms, visibility, material assignment, and type-specific fields. The schema does not imply that every Babylon property is editable or saved.

### Actions and triggers

`src/sceneFunctions/actionDispatcher.js` executes actions; `onSceneReady.js` and `loadAssets.js` connect scene and object triggers. `src/constants.js` lists scene and mesh trigger fields.

- **Triggers:** scene load, scene pointer events, object pick/double-pick/hover, and drag lifecycle where configured; overlay and parent-page events are also wired in their respective modules.
- **Actions:** animation, timeline/sequencing, conditions, math/expressions, overlays, external links, adding/replacing content, scene changes, configuration saving, screenshots, scene export, AR, and VTO are represented in the editor/runtime.
- **Variables and collections:** store named values and target groups of objects for logic.
- **Control nodes:** group selected properties for editor workflows.
- **Action console:** displays action logs in the Outliner.

**Status: Partially implemented as a complete product feature.** Many action types have runtime handlers, but action behavior is configuration-dependent, there is no broad automated action test suite, and individual device/browser actions may not be available everywhere.

### Animation, audio, overlays, and effects

| Feature | Source | Use | Status |
| --- | --- | --- | --- |
| Property animation | `actionDispatcher.js`, action node components | Interpolates supported numeric, vector, and color properties with easing. | Implemented for supported property types |
| Imported animation groups | `animationGroups` runtime and editor list | Controls animation clips loaded with a model. | Implemented when the asset contains compatible clips |
| Timeline/sequencing | `actionDispatcher.js`, action nodes | Schedules or sequences actions. | Implemented for configured paths; requires scene testing |
| Audio | `nodesProps.js`, sound node/list, `createSceneElements.js` | Plays scene audio with source properties and action triggers. | Partially implemented; browser autoplay and media support apply |
| Overlays | `sceneComponents/Overlay.jsx`, editor overlay nodes | Displays HTML/2D controls above the 3D canvas. | Partially implemented; depends on overlay data and action wiring |
| Scene effects | `nodesProps.js` `effectsProps`, Effects/Essentials UI | Controls image processing and configured rendering effects. | Partially implemented; available effects depend on runtime and saved data |

## Saving, exporting, and embedding

| Functionality | Source | What happens | Status |
| --- | --- | --- | --- |
| Scene serialization | `src/sceneFunctions/createSceneData.js` | Reads live scene state and writes supported engine, scene, asset, node, material, texture, light, camera, effect, action, sound, variable, and animation data. | Implemented for declared schemas |
| Save from editor | `src/modules/editor/SidebarButtonGroup.jsx`, `src/helpers.js` | Sends serialized scene data and a screenshot to the parent using the `saveData` message. | Partially implemented; parent admin must persist it and offer save/version behavior |
| Exit editor | `SidebarButtonGroup.jsx` | Sends `closeEditor`; warns if serialized scene state differs from its baseline. | Implemented when embedded in a cooperating parent |
| Add assets while editing | `DropWrapper.jsx`, `postMessageApi.js`, `helpers.js` | Sends files to the parent for upload, then receives asset records and inserts them into the scene. | Partially implemented; upload permissions/storage belong to parent/admin |
| Export GLB/USDZ | `SidebarButtonGroup.jsx` | Exports enabled scene nodes to GLB; USDZ is produced through a GLB-to-USDZ conversion. | Implemented in editor; output fidelity should be checked per asset/material |
| Screenshot | `helpers.js`, `postMessageApi.js`, action dispatcher | Captures a canvas image for the admin or action flow. | Implemented; browser canvas and cross-origin texture restrictions can affect output |
| Parent-window API | `src/helpers.js`, `postMessageApi.js` | Handles scene data, screenshot, asset insertion/removal, property updates, scroll animation, and action-start messages. Incoming messages are origin-checked. | Partially implemented; requires a cooperating embed/admin and matching origin configuration |
| Public embed | `src/Router.jsx`, `src/App.jsx`, `src/sceneComponents/Scene.jsx` | Runs public scenes in the viewer and accepts supported parent integration messages. | Partially implemented; publishing/admin configuration is external |
| Saved versions | `src/helpers.js` | Can load a scene version selected by query parameter. | Partially implemented; version creation/restoration UI is external |

The viewer does not directly implement the complete Firestore save/version UI. An editor save is a request to its parent window; the parent application is responsible for storage and user confirmation.

## Data services and other surfaces

| Area | Source | Function | Status |
| --- | --- | --- | --- |
| Firebase initialization | `src/Router.jsx` | Initializes Firestore and Storage clients and exports storage/functions/admin URL bases. | Partially implemented for deployment: `isLocalhost` is currently hard-coded to `true`, and Firestore/Storage emulators are always connected in this file. Production endpoints therefore are not selected by default. |
| Firestore queries | `src/helpers.js` | Fetches organization, project, scene, page, and asset-reference data. | Implemented assuming appropriate Firebase data/rules and a non-emulator deployment configuration |
| Asset URLs | `src/helpers.js`, `src/Router.jsx` | Resolves asset references and builds storage/CDN URLs. | Implemented but environment-dependent |
| Cloud Functions | `src/helpers.js`, `src/Router.jsx` | Supports visit/analytics-related server calls. | Partially implemented; service endpoint must be reachable/configured |
| HTML page viewer | `src/modules/pages/Page.jsx` | Loads only published page data, injects its HTML/CSS, and forwards scroll interaction to an iframe. | Partially implemented; page creation/editing and sanitization policy are not owned here |
| Service worker/cache | `src/serviceWorkerRegistration.js`, `src/service-worker.js` | Provides optional caching/offline behavior. | Partially implemented; registration depends on URL/configuration and requires deployment validation |

## Implementation gaps and risks

1. **Three.js conversion is not implemented.** The package includes Three.js and some export utilities use Three.js, but the renderer, scene objects, editor controls, and property schemas import/use Babylon.js. This is not a Three.js viewer yet.
2. **Firebase production selection is blocked by a hard-coded flag.** `src/Router.jsx` sets `isLocalhost = true`, which selects local URLs and connects emulators. A production build needs an environment-based configuration and a verification pass.
3. **Admin workflows are outside this codebase.** Accounts, permissions, organization/project management, scene creation/editing records, upload authorization, publishing, billing, and Firestore save/version UI must be provided by the external admin.
4. **File upload in edit mode is a message handoff.** The viewer packages files and asks the parent to upload them; a standalone editor cannot complete the production asset-library flow by itself.
5. **Immersive modes are conditional.** AR, VR, and VTO rely on browser APIs, camera permissions, hardware, valid scene assets, and compatible configuration. Their presence in code does not guarantee operation on every device.
6. **Creation palette is narrower than the schema/runtime.** Some implemented or partially available types are not exposed by the standard Elements palette; commented-out palette entries include Diamond Material, Shader Material, and GSplat.
7. **Automated tests do not validate product functionality.** `src/App.test.js` is a starter test for the default React template. `package.json` defines build and lint scripts but no test script; scene loading, editor behavior, actions, exports, and immersive flows need targeted tests/manual acceptance checks.
8. **Security boundaries need deployment review.** The viewer reads Firebase data directly, accepts parent messages through origin validation, has a client-side scene password prompt, and renders page HTML. Production access must rely on correct Firebase rules and trusted embed origins; a client-side password check is not authorization.

## Key files by responsibility

| Path | Responsibility |
| --- | --- |
| `src/index.jsx` | React bootstrap |
| `src/Router.jsx` | Firebase setup, routes, environment URLs, compatibility gate |
| `src/App.jsx` | Scene data loading, password/thumbnail gates, AR splash, page title/GA setup |
| `src/helpers.js` | Firestore/storage helpers, URL parsing, asset reference resolution, screenshots, parent messaging |
| `src/badProvider/` | Shared reducer/context state and hooks |
| `src/sceneComponents/Scene.jsx` | Engine startup, scene lifecycle, canvas, editor mount, overlays, runtime controls |
| `src/sceneFunctions/initGLEngine.js`, `initGPUEngine.js` | Babylon renderer initialization |
| `src/sceneFunctions/initScene.js`, `loadAssets.js`, `setScene.js` | Scene build pipeline |
| `src/sceneFunctions/createSceneElements.js` | Babylon object/material/texture/light/action-related creation helpers |
| `src/sceneFunctions/createSceneData.js` | Serializes live scene data |
| `src/sceneFunctions/actionDispatcher.js`, `onSceneReady.js` | Trigger dispatch and action execution |
| `src/sceneFunctions/postMessageApi.js` | Parent-page API and incoming editor/runtime messages |
| `src/nodesProps.js` | Property schema for editor fields and serialization |
| `src/modules/editor/Sidebar.jsx`, `Editor.jsx` | Editor shell, shortcuts, graph workspace and toolbar |
| `src/modules/editor/Elements.jsx`, `Essentials.jsx`, `Outliner.jsx` | Main authoring panels |
| `src/modules/editor/Nodes/`, `NodeFields/`, `Prompt/`, `Lists/` | Property editors, field widgets, add flows, and categorized scene lists |
| `src/modules/pages/Page.jsx` | Published HTML page rendering and scroll bridge |
| `src/constants.js` | Supported extension lists and trigger field names |
| `src/App.test.js` | Current placeholder test |

## Validation commands

The repository declares these scripts in `package.json`:

```text
pnpm start   # Start Vite
pnpm build   # Build the app
pnpm serve   # Preview the production build
pnpm lint    # Lint source files
```

There is no declared `test` script. A successful build/lint would check compilation and style rules, not prove Firebase connectivity, scene compatibility, editor save handoff, or browser-specific AR/VR behavior.
