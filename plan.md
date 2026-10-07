# Badvisor Viewer Conversion Plan: Babylon.js to Three.js

This plan is based on the two design documents in this workspace:
- Scenes Viewer Guide
- Viewer Feature Guide

The goal is to convert the current Badvisor viewer from a Babylon.js-based runtime into a Three.js-based runtime while preserving scene compatibility, editor behavior, interactivity, public embedding, and asset workflows.

---

## 1. Conversion objective

The existing viewer is a full scene runtime and editor built around Babylon.js. It handles:
- scene parsing and data upgrade
- GLB asset loading and object renaming
- mesh/material overrides and editor-driven property edits
- camera navigation, movement, and controls
- action-based interactivity and overlays
- public embed API and editor-in-iframe messaging
- loading screens, thumbnails, and security gates

The conversion should keep the product functionality intact while swapping the underlying rendering engine from Babylon.js to Three.js.

---

## 2. Conversion strategy

1. Preserve the existing scene data contract.
   - The data model is already the main compatibility boundary.
   - The Three.js version should read the same saved scene JSON.

2. Build a compatibility layer, not a feature rewrite.
   - Map Babylon names and scene concepts to Three.js equivalents.
   - Keep visual editor behavior stable while migrating internals.

3. Convert the runtime in slices rather than all at once.
   - Core engine and scene lifecycle first
   - Then objects, materials, cameras, interactions, and editor features
   - Final phase is QA, performance tuning, and migration validation

4. Validate against the current product footprint.
   - Use real scene data and feature checks from the existing viewer as acceptance criteria.

---

## 3. High-level timeline

| Phase | Time Estimate | Focus | Main Deliverable |
| --- | ---: | --- | --- |
| Phase 1: Discovery and architecture | 1 week | Review current runtime, data model, and risk areas | Conversion blueprint and architecture decisions |
| Phase 2: Foundation and engine bootstrap | 2 weeks | Three.js app shell, renderer, scene lifecycle, asset pipeline | Scene renders successfully in Three.js |
| Phase 3: Scene object and property model | 3 weeks | Nodes, mesh creation, material mapping, transforms | Basic object graph matches Babylon behavior |
| Phase 4: Cameras and navigation | 2 weeks | Orbit camera, first-person camera, floor movement, collisions | User navigation works |
| Phase 5: Materials, textures, lighting, effects | 3 weeks | PBR, environment, lighting, shadows, post-processing | Visual parity with existing scenes |
| Phase 6: Interaction layer | 4 weeks | Triggers, actions, variables, collections, overlays | No-code scenes work in runtime |
| Phase 7: Editor integration and save flow | 3 weeks | Edit mode, property inspector, save/serialise logic | Editor can modify scenes |
| Phase 8: API, embedding, and export | 2 weeks | postMessage API, screenshot, GLB export, scene swap | External contracts preserved |
| Phase 9: QA, optimisation, and migration | 3 weeks | Browser compatibility, performance, real-scene validation | Stable release candidate |

Total realistic timeline: 23 to 28 weeks for a production-quality conversion.

If the team is lean and needs a faster MVP, the same work can be staged into a 12 to 16 week path focused on core viewer functionality first, with editor and advanced interaction delivered afterwards.

---

## 4. Module-by-module plan

The project is organized around the existing Babylon viewer, especially these runtime areas:
- src/sceneFunctions/
- src/sceneComponents/
- src/modules/editor/
- src/constants.js
- src/nodesProps.js
- src/helpers.js

### Module 1: Runtime architecture and Three.js bootstrap

Functionality:
- Set up the Three.js app shell
- Create renderer, scene, camera, timeline loop, resize handling
- Add runtime switching between public player and editor mode
- Match the current scene lifecycle and route handling

Current code areas mapped to this work:
- src/sceneComponents/Scene.jsx
- src/sceneFunctions/initGLEngine.js
- src/sceneFunctions/initGPUEngine.js
- src/Router.jsx
- src/App.jsx

Estimated effort:
- 5 to 7 working days

Why it matters:
- This is the foundation for everything else.
- It defines the new engine API and rendering lifecycle.

---

### Module 2: Scene data parsing and compatibility layer

Functionality:
- Read and normalise the existing saved scene JSON
- Upgrade older shapes when needed
- Merge URL overrides such as data and nodes
- Resolve object and material names consistently for matching

Current code areas mapped to this work:
- src/helpers.js
- src/setNodeProps.js
- src/nodesProps.js
- src/sceneFunctions/createSceneData.js

Estimated effort:
- 6 to 8 working days

Why it matters:
- The saved scene contract is the biggest compatibility risk.
- If parsing is wrong, the whole viewer breaks even before rendering.

---

### Module 3: Asset pipeline and GLB loading

Functionality:
- Load GLB/GLTF assets from the scene data
- Resolve asset refs and file URLs
- Rename imported objects to generated names used by override logic
- Stop imported animations on load and keep them in the scene graph
- Support model replacement and scene asset queues

Current code areas mapped to this work:
- src/sceneFunctions/loadAssets.js
- src/sceneFunctions/initScene.js
- src/sceneFunctions/createSceneElements.js

Estimated effort:
- 7 to 10 working days

Why it matters:
- Asset loading is central to every commercial scene.
- The model pipeline directly affects loading UX and scene correctness.

---

### Module 4: Scene graph and object factory layer

Functionality:
- Build meshes, transforms, clones, instances, groups, and text objects
- Create scene-level objects like skybox, environment plane, and helper objects
- Maintain object names and object ids needed by editor and override logic
- Attach metadata for pickability, hidden state, and runtime movement

Current code areas mapped to this work:
- src/sceneFunctions/createSceneElements.js
- src/nodesProps.js
- src/setNodeProps.js

Estimated effort:
- 8 to 12 working days

Why it matters:
- Most of the project functionality depends on this layer.
- This is the bridge between stored scene data and actual Three.js objects.

---

### Module 5: Materials, textures, environment, and post-processing

Functionality:
- Port PBR materials and custom material types
- Map Babylon material props to Three.js material properties
- Implement textures, video textures, dynamic textures, cube maps, and HDR environment support
- Add shadows, post-processing stacks, reflections, and scene fog
- Implement background and transparent scene modes

Current code areas mapped to this work:
- src/sceneFunctions/setScene.js
- src/sceneFunctions/runtimeMaterialControls.js
- src/fallbackTexture.js
- src/sceneFunctions/onSceneReady.js

Estimated effort:
- 10 to 14 working days

Why it matters:
- Visual fidelity is one of the main product differentiators.
- Material conversion is where mismatch between Babylon and Three.js is most visible.

---

### Module 6: Cameras, navigation, and controls

Functionality:
- Port orbit camera behavior with target, zoom, pan, constraints, and autorotation
- Port first-person camera for walkthrough scenes
- Support walkable floor logic, collisions, gravity, and camera height
- Support camera switching via Action or scene settings
- Match pointer controls and viewport behavior

Current code areas mapped to this work:
- src/nodesProps.js
- src/sceneFunctions/createSceneElements.js
- src/sceneFunctions/setScene.js

Estimated effort:
- 7 to 10 working days

Why it matters:
- Camera behavior drives the whole “product viewer” experience.
- It is especially important for e-commerce and configurator use cases.

---

### Module 7: Lighting, shadows, and scene composition

Functionality:
- Port point, directional, spot, and hemispheric lights
- Implement shadow maps, softness, bias, target, and object filtering
- Add environmental lighting and global settings
- Support debug views, wireframe, and bounding box probes

Current code areas mapped to this work:
- src/sceneFunctions/setScene.js
- src/nodesProps.js
- src/sceneFunctions/createSceneElements.js

Estimated effort:
- 5 to 7 working days

Why it matters:
- Visual realism and scene readability depend on lighting.
- Realistic materials cannot be trusted without proper shadow and lighting support.

---

### Module 8: Interaction system and action dispatcher

Functionality:
- Convert triggers: scene load, frame events, pointer events, object pick events, drag, hover
- Port action system: Animate, Timeline, Sequencer, Condition, Math, Expression, Overlays, ExternalLink, ChangeScene, Screenshot, SaveConfig, EnterAR, EnterVTO
- Implement variable state, control nodes, and collections
- Preserve end actions and chaining behavior

Current code areas mapped to this work:
- src/sceneFunctions/actionDispatcher.js
- src/sceneFunctions/onSceneReady.js
- src/constants.js
- src/sceneFunctions/safeExpressionEvaluator.js

Estimated effort:
- 12 to 16 working days

Why it matters:
- This is the heart of the no-code product experience.
- It is also the most logic-heavy part and the highest risk in conversion.

---

### Module 9: Overlays, UI controls, and canvas layering

Functionality:
- Implement overlay layer system above the canvas
- Support action buttons, colour pickers, texture inputs, number sliders, and dynamic text controls
- Allow overlays to be hidden, revealed, and animated
- Preserve scroll-driven animation and product story patterns

Current code areas mapped to this work:
- src/sceneComponents/Overlay.jsx
- src/modules/editor/
- src/styles/
- src/constants.js

Estimated effort:
- 8 to 10 working days

Why it matters:
- Overlays are part of the creator experience, not just runtime decoration.
- They are highly visible to customers and easy to regress.

---

### Module 10: Editor mode and scene editing workflow

Functionality:
- Enable edit mode from the admin iframe
- Keep the same postMessage integration between admin and viewer
- Make live object modifications and save flow work in the new runtime
- Preserve screenshot generation and serialisation before save

Current code areas mapped to this work:
- src/modules/editor/
- src/sceneFunctions/postMessageApi.js
- src/sceneFunctions/createSceneData.js
- src/App.jsx

Estimated effort:
- 10 to 14 working days

Why it matters:
- The editor is a second product surface with different performance and UX requirements.
- Its conversion must be validated with real scene editing workflows.

---

### Module 11: Embedding API, messaging, and public viewer runtime

Functionality:
- Support iframe embedding messages: setNodeProp, startAction, animateOnScroll, getSceneData, takeScreenShot, removeAsset
- Post scene lifecycle events and action events to parent pages
- Keep Analytics hooks and GA4 event behavior intact
- Support password, preview, watermark, and admin gating logic

Current code areas mapped to this work:
- src/sceneFunctions/postMessageApi.js
- src/App.jsx
- src/sceneComponents/LoadingScreen.jsx
- src/sceneComponents/Thumbnail.jsx

Estimated effort:
- 6 to 8 working days

Why it matters:
- It preserves the external integration contract expected by the platform.

---

### Module 12: Screenshot, export, and file/scene output

Functionality:
- Export current scene as GLB
- Support screenshot capture at chosen quality and size
- Preserve save configuration, scene duplication, and preview generation
- Keep object filtering for export and viewer output

Current code areas mapped to this work:
- actionDispatcher.js
- createSceneData.js
- editor save workflow

Estimated effort:
- 5 to 7 working days

Why it matters:
- These features are customer-facing and often used in commercial scenes.

---

### Module 13: QA, compatibility, and performance tuning

Functionality:
- Verify all current scene features against the Babylon baseline
- Compare rendering output, interactions, editor behavior, and saved data output
- Optimise render cost, asset loading, raycasting, and scene update loops
- Handle browser-specific issues on iOS, Safari, Chrome, and WebGPU/WebGL fallbacks

Estimated effort:
- 8 to 12 working days

Why it matters:
- This is where the conversion becomes production safe.
- A runtime can look correct but still fail in performance or compatibility.

---

## 5. Suggested delivery sequence

A practical sequence for implementation is:

1. Runtime shell + scene lifecycle
2. Data parsing and compatibility layer
3. GLB loading and object creation
4. Materials and textures
5. Cameras and navigation
6. Lighting and shadows
7. Action dispatcher and triggers
8. Overlays and controls
9. Editor integration and save flow
10. QA, compatibility, and performance pass

This allows the team to validate real rendering progress as early as week 3 or 4 instead of waiting for the full conversion.

---

## 6. Risk areas to treat early

The most likely technical risks are:

- Scene schema mismatch between Babylon names and Three.js property names
- Material property drift between Babylon and Three.js
- Dynamic override logic for objects created from imported files
- No-code interaction logic being too coupled to Babylon event patterns
- Performance regressions from large scenes, many meshes, or heavy post-processing
- Editor compatibility and capture/screenshot save workflow

These should be treated as milestone gates rather than left until the end.

---

## 7. Recommended staffing model

For a small-to-medium team, a realistic conversion team would include:

- 1 Lead engineer: architecture, scene compatibility, runtime decisions
- 1 Three.js render engineer: renderer, scene graph, materials, lighting
- 1 Scene/data engineer: parsing, overrides, save/load contract, migration logic
- 1 Interaction/editor engineer: actions, editor integration, overlay behaviors
- 1 QA/validation engineer: browser testing, regression testing, performance checks

A smaller team can still complete the conversion, but the schedule will be longer and risk will rise.

---

## 8. Final recommendation

The best conversion path is not a full rewrite in one pass. It should be a staged migration that keeps the current saved scene format stable while replacing the rendering and update engine beneath it.

If the project is treated as a compatibility conversion rather than a fresh implementation, the team can keep product quality high while reducing risk.

A realistic production target is:
- MVP viewer conversion in 12 to 16 weeks
- Full editor, interactivity, and feature parity in 23 to 28 weeks

---

## 9. Summary of effort

| Area | Estimated time |
| --- | ---: |
| Core runtime and renderer | 1 to 2 weeks |
| Scene parsing and compatibility | 1 to 2 weeks |
| Asset pipeline and object graph | 2 to 3 weeks |
| Cameras and navigation | 1 to 2 weeks |
| Materials and textures | 2 to 3 weeks |
| Interactivity system | 2 to 3 weeks |
| Editor and save flow | 2 to 3 weeks |
| QA and optimisation | 2 to 3 weeks |

Total: approximately 13 to 19 weeks for a solid working conversion, or 23 to 28 weeks for a complete product-parity release.

This is the safest and most realistic timeline for converting the existing Babylon-based Badvisor viewer into a Three.js-based version without breaking production behavior.
