# Scenes 

This guide describes how scenes work in the previous Badvisor system, on both the admin
side and the viewer side, and what already exists for scenes in the new platform.

---

## 1. Project overview

**Badvisor** is a platform on which organisations upload 3D assets, compose them into
interactive 3D scenes, and publish those scenes to the web. A published scene is embedded
on the customer's own website through an iframe, or opened through a link or QR code, and
can offer AR, VR and virtual try-on.

**The previous system** consists of three codebases:

| Codebase                | Role                                                                     | Stack                                                     |
| ----------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| `badvisor-makerkit`     | Admin: accounts, organisations, assets, projects, scene settings         | Next.js (Pages Router), Firebase Auth, Firestore, Storage |
| `badvisor-viewer-v4`    | Viewer: renders published scenes, and doubles as the scene editor        | React 18, Vite, **Babylon.js 7**                          |
| `draco-compression-api` | Asset optimisation service: Draco geometry compression, texture resizing | Express, `gltf-pipeline`, `draco3d`, `sharp`              |

**The rebuild** replaces the admin with a new platform application, `badvisor-admin`,
built on Next.js 16 (App Router), React 19, TypeScript and Supabase (Postgres with
row-level security, Auth and Storage), hosted in the EU. The work is split into two
lanes:

- **Platform** (`badvisor-admin`) owns everything outside the 3D canvas: accounts,
  organisations, permissions, assets, projects, scene records, publishing and billing.
- **Viewer** owns the renderer and the editor, and targets **Three.js**.

The two lanes meet at a set of written contracts. The most important of these is the
scene content format described in §3.

The approved phase order is: scene format → accounts and entitlements → assets → projects
and publishing → viewer runtime → editor → interactivity → configurator → immersive modes →
collaboration and insight.

**Platform modules complete:** authentication and onboarding, organisations and members,
the asset library, projects, the dashboard, and settings (profile, organisation, members).
**Remaining:** scenes, subscription, publishing, and the operator console.

---

## 2. The scene record

In the previous system a scene is a single Firestore document in the `scenes` collection.
It has two parts:

- **Settings**, which the admin edits through form fields.
- **`data`**, a JSON document stored as a **string**, which describes the 3D content. The
  viewer reads it and the editor writes it. The admin treats it as opaque.

| Group          | Fields                                                                                                | Purpose                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Identity       | `name`, `handle`, `description`, `tags`, `organizationId`, `projectId`                                | `handle` forms part of the public URL                   |
| Publishing     | `published`, `preview`, `favicon`                                                                     | Visibility flag, preview image, favicon                 |
| Thumbnail      | `enableThumbnail`, `thumbnailBackground`, `thumbnailButton`, `thumbnailBackgroundColor`               | A poster with a start button, shown before the 3D loads |
| Loading screen | `enableLoadingScreen`, `loadingScreenBackground`, `loadingScreenLogo`, `loadingScreenBackgroundColor` | Shown while files download                              |
| Access         | `enableScenePassword`, `scenePassword`                                                                | Password protection                                     |
| Other          | `ga4Id`, `fonts`                                                                                      | Google Analytics 4 property, custom fonts               |
| Bookkeeping    | `versions`, `activeUsersList`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`                     | Version counter and audit fields                        |

**Versions** are stored in a subcollection, `scenes/{id}/versions`. Each version holds
`{ data, preview, createdAt, createdBy }`, and a scene may have at most ten.

**Scene files** (the preview image, fonts and the loading-screen logo) are stored in
Firebase Storage under `/organizations/{org}/scenes/{scene}/…`.

---

## 3. The scene content format (`data`)

### Top-level keys

The serialiser (`createSceneData`) writes the following keys:

| Key               | Contents                                                                |
| ----------------- | ----------------------------------------------------------------------- |
| `engine`          | Engine settings, e.g. `hardwareScalingLevel`, `enableWebGPU`            |
| `scene`           | Scene-level settings, e.g. `clearColor`                                 |
| `assets`          | Model files placed in the scene, keyed by a scene-local asset key       |
| `nodes`           | Property overrides for meshes and transform nodes, keyed by object name |
| `materials`       | Materials created in the editor, and overrides for materials from files |
| `materialCatalog` | An index of materials per mesh, built at save time                      |
| `textures`        | Textures, including environment, video and dynamic textures             |
| `lights`          | Lights                                                                  |
| `cameras`         | Cameras                                                                 |
| `effects`         | Post-processing settings                                                |
| `sounds`          | Audio sources                                                           |
| `animationGroups` | Settings for animation clips imported from files                        |
| `actions`         | The interaction logic (§7)                                              |
| `variables`       | Named values used by actions                                            |
| `overlays`        | HTML layers displayed over the canvas                                   |
| `controlNodes`    | Logic nodes used by the interaction layer                               |
| `collections`     | Named groups of objects                                                 |

A newly created scene starts with the minimal document below
(`makerkit/src/lib/scenes/minimalSceneData.ts`):

```js
{
  engine:  { hardwareScalingLevel: 'HD' },
  cameras: {
    defaultCamera: {
      type: 'ArcRotateCamera', isDefault: true, name: 'defaultCamera', displayName: 'Camera',
      fov: 0.9272952180016122, lowerRadiusLimit: 0.1, upperRadiusLimit: 10000,
      panningSensibility: 5000, useAutoRotationBehavior: false,
    },
  },
  scene: { clearColor: '#dedede' },
  nodes: { Mesh_EnvironmentPlane: { enabled: false }, Mesh_Skybox: { enabled: false } },
}
```

### Conventions you need to know

- **The format is Babylon-shaped.** Object types (`ArcRotateCamera`, `PBRMaterial`,
  `TransformNode`) and property names are Babylon's. The list of properties saved for each
  object type is defined in `viewer-v4/src/nodesProps.js`, which serves as the schema.
- **Files are referenced by id, and resolved at load time.** Each entry in `assets` has the
  form `Asset_<timestamp>_<index>: { assetREF: <library asset id>, name }`. Any key ending
  in `REF` is looked up in the asset library while the scene is parsed, and the sibling key
  without the suffix (`asset`, `url`) is filled in with that asset's URL. Across the 28,201
  stored scenes there are 44,307 such references, `assetREF` and `urlREF` being the common
  ones, and 2,630 scenes also carry a literal URL written in by older save paths.
- **Objects from files are addressed by generated names.** When a GLB loads, every object
  inside it is renamed to `<ClassName>_<name in file>_<asset key>`, for example
  `Mesh_Seat_Asset_1718000000000_0`. Overrides in `nodes` and `materials` are keyed by
  these names. If a file is re-exported and an object inside it is renamed, the overrides
  for that object no longer match and are not applied.
- **Colours** are stored as sRGB hex strings and converted to linear space when applied.
- **Angles and field of view** are in radians. Babylon's `fov` is the vertical field of
  view in radians; Three.js `PerspectiveCamera.fov` is the vertical field of view in
  degrees. The arc-rotate camera stores its orbit as `alpha`, `beta` and `radius`.
- **Coordinates** are right-handed. The viewer sets `scene.useRightHandedSystem = true`,
  which matches glTF and Three.js; Babylon's default is left-handed.
- **The format has evolved.** The viewer upgrades older shapes when it loads a scene; for
  example, a top-level `defaultRenderingPipeline` is moved into `effects`. Stored scenes
  therefore do not all share one shape.
- **The document can be changed through the URL.** The viewer merges `?data=` and
  `?nodes=` query parameters into `data` for that page view.

---

## 4. The admin side

The admin (`makerkit/src/components/scenes/`) manages scenes as records. All reads and
writes go from the browser directly to Firestore and Storage.

| Operation     | Behaviour                                                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Create**    | Writes a new document with `data` set to the minimal document and `published: false`. Handle uniqueness and the plan's scene limit are checked in the browser.    |
| **Configure** | The detail page has one input per setting, each writing its own field. An advanced section contains a raw JSON editor that overwrites `data` directly.            |
| **Publish**   | A toggle that sets `published`. It changes visibility only.                                                                                                       |
| **Share**     | Embed code and QR code, both pointing at `https://app.badvisor.io/{org}/{project}/{scene}`.                                                                       |
| **Versions**  | Lists the `versions` subcollection; a version can be previewed in the viewer with `?version=<id>` and restored.                                                   |
| **Duplicate** | Copies the document and its preview, font and logo files. The handle becomes `<handle>-<timestamp>`. The version counter is copied; the versions are not.         |
| **Transfer**  | Moves a scene to another organisation: deletes all its versions, then updates `organizationId` and `projectId`. `data` continues to reference the original files. |
| **Delete**    | Deletes the versions, their preview images and the document.                                                                                                      |

The **Visual Editor** button opens the editor (§5). It is disabled until the scene belongs
to a project, because the viewer URL includes the project handle.

---

## 5. The admin–viewer bridge

The admin does not render 3D. The Visual Editor opens **the viewer application itself** in
a full-screen iframe with `?editmode=true`, and the viewer becomes the editor. The two
applications communicate with `window.postMessage`.

```
ADMIN                                         VIEWER (iframe, ?editmode=true)
─────                                         ───────────────────────────────
Opens /{org}/{project}/{scene}?editmode=true
                                              Loads the scene document from Firestore
                       ◄── appHasStarted ──── Editor ready
Hides its loading state
                                              User edits; each change is applied to the
                                              live object and recorded on node.badChanges
                                              User saves:
                                                • takes a 2048 × 2048 screenshot
                                                • serialises the live scene (createSceneData)
                       ◄── saveData { data, preview }
Uploads the preview image
Offers: Save / Save as new version / Cancel
  Save                → overwrites data and preview
  Save as new version → adds a versions document;
                        data is left unchanged
                       ◄── closeEditor ────── User closes the editor
```

**Adding files while editing** is a round trip, because uploads, quota and permissions
belong to the admin:

1. The user drops files onto the editor.
2. The viewer sends `insertAssets` with the files to the admin.
3. The admin validates the extensions, uploads the files and creates asset records.
4. The admin sends `insertAssets` back with `{ id, name, size, type, url }` for each asset.
5. The viewer adds them to `data.assets` or `data.textures` and loads them.

**Messages used between admin and viewer:**

| Direction      | Type                            | Purpose                                            |
| -------------- | ------------------------------- | -------------------------------------------------- |
| Viewer → admin | `appHasStarted`                 | The editor is ready                                |
| Viewer → admin | `saveData`                      | Serialised scene and preview image                 |
| Viewer → admin | `insertAssets`                  | Files for the admin to upload                      |
| Viewer → admin | `closeEditor`                   | Close the editor                                   |
| Admin → viewer | `insertAssets`                  | Uploaded asset records to place in the scene       |
| Admin → viewer | `takeScreenShot` → `screenShot` | Used on the asset page to generate a GLB thumbnail |

The serialiser walks every object in the live scene and writes the properties listed in
`nodesProps.js`. When models are present it retries for up to three seconds, waiting for
material data to become available, before sending `saveData`.

---

## 6. The viewer runtime pipeline

The viewer turns `data` into a rendered scene in five stages.

| Stage       | File                                               | What happens                                                                                                                                                                                                                                          |
| ----------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Engine   | `Scene.jsx`, `initGLEngine.js`, `initGPUEngine.js` | Creates a WebGPU engine when the scene enables it and the browser supports it, otherwise WebGL. Starts the render loop. The editor bundle is loaded only in edit mode.                                                                                |
| 2. Scene    | `initScene.js`                                     | Creates the Babylon `Scene`, sets the right-handed coordinate system, and creates two asset queues: one for the scene's own files (drives the loading-screen progress bar) and one for files added during editing.                                    |
| 3. Download | `loadAssets.js`                                    | Loads every entry in `data.assets` as a GLB, renames each imported object to its generated name, and stops imported animations.                                                                                                                       |
| 4. Apply    | `setScene.js`                                      | Runs about thirty steps in a fixed order. `create*` functions build objects that exist only in `data` (lights, cameras, materials, clones, 3D text, effects). `set*` functions find objects that came from files, by name, and apply their overrides. |
| 5. Go live  | `onSceneReady.js`                                  | Creates special materials, attaches triggers to frame and pointer events, starts listening for postMessage, runs on-load actions, hides the loading screen, and posts `sceneHasStarted` to the parent page.                                           |

**Device handling.** On iOS, outside edit mode, the viewer renders at half resolution with
antialiasing disabled to stay within memory limits. iOS uses WebGL rather than WebGPU
unless `forceWebGPU=true` is set. The router also
contains a compatibility gate for iOS 26.5. When the viewer switches scenes it disposes the
previous scene before loading the next, to free GPU memory first.

**Picking** is disabled on meshes by default for performance, and enabled only on meshes
that carry a pointer trigger or are walkable for a camera.

---

## 7. The interaction layer

On top of the rendered scene the viewer runs a no-code interaction system
(`actionDispatcher.js`). It is specific to Badvisor rather than to Babylon.

- **Triggers** start actions: scene load, before and after each frame, pointer down, up,
  move, pick and double-tap, and per-object triggers such as pick, pointer over, pointer
  out and drag.
- **Actions** include `Animate`, `Timeline`, `Sequencer`, `PlayAnimationGroup`,
  `PauseAnimationGroup`, `StopAnimationGroup`, `Condition`, `Math`, `Expression`,
  `AddReplace`, `ChangeScene`, `ExternalLink`, `Screenshot`, `ExportScene`, `SaveConfig`,
  `Overlays`, `EnterAR` and `EnterVTO`. Expressions are evaluated by a restricted
  evaluator (`safeExpressionEvaluator.js`).
- **Variables**, **control nodes** and **collections** hold state, logic and groups of
  objects used by actions.
- **Overlays** are HTML layers displayed over the canvas.

**The embed API.** Any page that embeds a scene in an iframe can control it with
postMessage once the scene is ready:

| Type              | Effect                                         |
| ----------------- | ---------------------------------------------- |
| `setNodeProp`     | Set a property on a named object               |
| `startAction`     | Run a named action                             |
| `animateOnScroll` | Drive a named animation from the page's scroll |
| `getSceneData`    | Return the serialised scene                    |
| `takeScreenShot`  | Return a screenshot                            |
| `removeAsset`     | Remove a named asset from the scene            |

The viewer also posts `sceneHasStarted` and `actionHasBeenTriggered` to the parent page.
When a GA4 property is set, it sends `sceneHasStarted`, `sceneUserInteraction` and
`actionHasBeenTriggered` events, including camera angles and position.

---

## 8. Public viewing

1. **Address.** A scene is served at `/{orgHandle}/{projectHandle}/{sceneHandle}`, with an
   `/ar` variant.
2. **Lookup.** The viewer resolves the organisation, the project and the scene by handle,
   and downloads the whole scene document.
3. **Access.** The scene is shown if it is published, or if the visitor arrived from an
   admin domain (checked through `document.referrer`). A scene password is compared in the
   browser, and is skipped for visitors arriving from the admin.
4. **Presentation.** The thumbnail poster is shown if enabled; otherwise the scene starts
   immediately behind the loading screen.
5. **Metering.** Each view records a visit through a backend call made from the browser.
   The browser then compares the visit count with the plan's limit and applies a watermark
   when the limit is exceeded or the organisation has no subscription.
6. **Immersive modes.** AR and VR use WebXR (`immersive-ar`, `immersive-vr`). Virtual try-on
   (`?vto=head`) uses MediaPipe face tracking.

**URL parameters recognised by the viewer:**

| Parameter                                | Effect                                   |
| ---------------------------------------- | ---------------------------------------- |
| `editmode=true`                          | Loads the editor                         |
| `version=<id>`                           | Loads a stored version's `data`          |
| `data=<json>`, `nodes=<json>`            | Merged into `data` for this view         |
| `forceWebGPU=true`, `disableWebGPU=true` | Override the engine choice               |
| `vto=head`                               | Enables head tracking for virtual try-on |
| `naked=true`                             | Disables picking                         |
| `parentOrigin=<origin>`                  | The origin used for postMessage          |

---

## 9. Babylon.js to Three.js reference

| Babylon.js (previous viewer)                 | Three.js equivalent                                              |
| -------------------------------------------- | ---------------------------------------------------------------- |
| `Engine` / `WebGPUEngine`                    | `WebGLRenderer` / `WebGPURenderer`                               |
| `engine.runRenderLoop`                       | `renderer.setAnimationLoop`                                      |
| `engine.setHardwareScalingLevel(n)`          | `renderer.setPixelRatio(devicePixelRatio / n)`                   |
| `Scene`                                      | `Scene`                                                          |
| `TransformNode`                              | `Object3D` / `Group`                                             |
| `Mesh`, instances, clones                    | `Mesh`, `InstancedMesh`, `object.clone()`                        |
| `PBRMaterial`                                | `MeshStandardMaterial` / `MeshPhysicalMaterial`                  |
| `ShaderMaterial`                             | `ShaderMaterial`                                                 |
| Shadow-only material                         | `ShadowMaterial`                                                 |
| `Texture`, `VideoTexture`, `DynamicTexture`  | `Texture`, `VideoTexture`, `CanvasTexture`                       |
| `CubeTexture`, `HDRCubeTexture`, `.env`      | `CubeTextureLoader`, HDR loaders with `PMREMGenerator`           |
| `PhotoDome`                                  | An equirectangular texture as `scene.background`                 |
| `ColorGradingTexture` (3D LUT)               | `LUTPass`                                                        |
| `ArcRotateCamera`                            | `PerspectiveCamera` with `OrbitControls`                         |
| `UniversalCamera`                            | `PerspectiveCamera` with first-person or pointer-lock controls   |
| Point, directional, spot, hemispheric lights | `PointLight`, `DirectionalLight`, `SpotLight`, `HemisphereLight` |
| `AnimationGroup`                             | `AnimationMixer` with `AnimationClip` / `AnimationAction`        |
| `Animation` with easing functions            | `KeyframeTrack`, or a tweening library                           |
| `AssetsManager.addMeshTask` (GLB)            | `GLTFLoader` with `DRACOLoader` and `KTX2Loader`                 |
| `DefaultRenderingPipeline`                   | `EffectComposer` with passes                                     |
| Pointer picking                              | `Raycaster`                                                      |
| `createDefaultXRExperienceAsync`             | `renderer.xr` with `ARButton` / `VRButton`                       |
| `GLTF2Export`                                | `GLTFExporter`                                                   |
| Gaussian splats (`GSplat`)                   | No core class; provided by community libraries                   |
| Observables (`onPointerObservable`, …)       | Event listeners and `EventDispatcher`                            |

---

## 10. Scenes in the new platform

The database for scenes already exists in `badvisor-admin`
(`supabase/migrations/20260826000400_content.sql`):

| Table                               | Purpose                                                                                                                             |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `scenes`                            | Every setting from §2 as a column; `data` as text; soft delete through `deleted_at`. A scene cannot be published without a project. |
| `scene_versions`                    | Version history, each holding `data`, a preview path and an optional label                                                          |
| `scene_asset_usage`                 | A real relationship between scenes and library assets. An asset in use by a scene cannot be permanently deleted.                    |
| `slug_history`                      | Previous handles of organisations, projects and scenes, so that old addresses can be redirected                                     |
| `visit_daily`, `scene_visit_totals` | Visit counts per scene per day, and all-time totals per scene                                                                       |

- **Public reads** go through one database function, `get_published_scene(org, project,
scene)`. It returns the published scene's content and presentation settings, with
  `requires_password` and `watermarked` as flags; `watermarked` is derived from the
  organisation's subscription status. The password itself is never sent to the browser.
- **Storage is private.** Files are served through signed URLs rather than public links.
- **The asset library** recognises models (`glb`, `gltf`), textures (`png`, `jpg`,
  `webp`, `ktx2`), environments (`hdr`, `env`), audio, video, splats (`ply`, `splat`) and
  fonts. Uploads keep version history and support replacing a file. Image thumbnails are
  generated on upload. Model optimisation is requested as a job with three operations:
  geometry compression, texture compression and texture resizing, with a maximum texture
  edge of 1024, 2048 or 4096 pixels.
- **Imported scenes** keep their `data` exactly as it was in the previous system, and link
  back to their original records through `legacy_id`.

The scene content format, the draft and publish model, the way the editor is integrated
with the platform, and the way the viewer loads private files are not yet defined in the
new platform.

---

## 11. Code map

| Area                      | Location                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| Scene type                | `badvisor-makerkit/src/lib/scenes/types/scene.ts`                                                |
| Minimal scene             | `badvisor-makerkit/src/lib/scenes/minimalSceneData.ts`                                           |
| Admin scene screens       | `badvisor-makerkit/src/components/scenes/`                                                       |
| Admin side of the editor  | `badvisor-makerkit/src/components/scenes/SceneIframeEditor.tsx`                                  |
| Viewer routes             | `badvisor-viewer-v4/src/Router.jsx`                                                              |
| Scene fetch and parse     | `badvisor-viewer-v4/src/helpers.js` (`getSceneData`, `parseSceneData`)                           |
| Engine and render loop    | `badvisor-viewer-v4/src/sceneFunctions/initGLEngine.js`, `initGPUEngine.js`                      |
| Scene lifecycle           | `badvisor-viewer-v4/src/sceneComponents/Scene.jsx`                                               |
| Loading and applying data | `badvisor-viewer-v4/src/sceneFunctions/` (`initScene`, `loadAssets`, `setScene`, `onSceneReady`) |
| Object factories          | `badvisor-viewer-v4/src/sceneFunctions/createSceneElements.js`                                   |
| Serialiser                | `badvisor-viewer-v4/src/sceneFunctions/createSceneData.js`                                       |
| Property schema           | `badvisor-viewer-v4/src/nodesProps.js`, `setNodeProps.js`                                        |
| Interaction layer         | `badvisor-viewer-v4/src/sceneFunctions/actionDispatcher.js`                                      |
| postMessage API           | `badvisor-viewer-v4/src/sceneFunctions/postMessageApi.js`                                        |
| Editor UI                 | `badvisor-viewer-v4/src/modules/editor/`                                                         |
| New scene schema          | `badvisor-admin/supabase/migrations/20260826000400_content.sql`                                  |
| Public scene function     | `badvisor-admin/supabase/migrations/20260826000900_public_api.sql`                               |
