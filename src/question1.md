# Badvisor Functional Documentation

This document describes the functional behavior of the original Badvisor application as used by creators and viewers. It is written from a product perspective and focuses on what the user sees, what actions are available, what happens after each action, and what data is saved.

This is not a React or Babylon implementation guide. It is a feature specification for the real application behavior.

---

## 1. Application Overview

### What Badvisor is used for
Badvisor is a browser-based 3D scene creation and publishing platform. It allows organizations to:
- upload 3D assets and media
- build interactive product scenes and showrooms
- adjust lighting, materials, cameras, and transforms
- add behaviors such as hover, click, and animation triggers
- save scenes for reuse and later editing
- publish scenes for public viewing or embedding
- support viewer, editor, and immersive experiences

### What a user can create inside Badvisor
Users can create or assemble:
- 3D models from uploaded assets
- 3D text objects
- lights
- cameras
- materials and textures
- sound sources
- overlays (buttons, images, html, hotspots)
- actions and interaction logic
- groups, collections, and control nodes
- scene environment, post-processing, and effects
- product configurator states

### What a user can view/edit
A creator can:
- view a 3D scene in a viewport
- select objects in the viewport or outliner
- inspect properties in the editor panel
- move/rotate/scale objects
- edit visual properties such as color, material, intensity, camera position, and scene background
- show/hide objects
- add or remove elements
- connect actions to objects and overlays
- change environment, lighting, fog, camera, and FX

### What a user can save
A user can save:
- object transforms and states
- materials and textures
- cameras and light settings
- overlays and actions
- animation configuration
- scene environment settings
- asset references and generated scene JSON
- versioned scene records and previews

### What a user can export/publish
The app supports exporting scene data and publishing scenes for viewing. Common outputs include:
- GLB export
- GLTF/OBJ-style model workflows
- USDZ where supported
- embedded web viewer experience
- public share URL or admin-controlled published scene

### Difference between Viewer and Editor
The same runtime can be used in two modes:
- Viewer: a read-only or interactive presentation mode for customers
- Editor: a full authoring mode with scene manipulation tools, inspector panels, and save flow

The editor is typically opened from the admin workflow with an edit-mode URL flag. In edit mode, the user can manipulate live objects and then save the scene back to storage.

### Main workflow
User opens a scene
↓
Scene loads
↓
User adds 3D assets or generated objects
↓
User modifies objects and transforms
↓
User configures materials/lights/camera/environment
↓
User adds interactions/actions
↓
User saves scene
↓
User publishes or exports scene

---

## 2. Application Layout

Badvisor uses a split editor layout with a main 3D canvas and side panels.

Typical layout:

-------------------------------------------------
|                 3D VIEWPORT                   |
|                                               |
|                                               |
|                                               |
|                                  |------------|
|                                  | Elements   |
|                                  | Essentials |
|                                  | Outliner   |
|                                  |------------|
|                                  |            |
|                                  | Properties |
|                                  |            |
|                                  |------------|
|                                  | Footer     |
-------------------------------------------------

### Main viewport
The viewport is the central 3D canvas. It displays:
- 3D models
- imported assets
- added meshes and objects
- lights
- cameras
- overlays
- outlines/gizmos for selected objects
- environment and background color
- optional grid, axis, helper overlays

Camera behavior usually includes:
- orbit camera for product inspection
- pan / zoom control
- drag to orbit or move
- right-drag for panning in many scenes
- scroll or pinch zoom
- selection via click/tap
- targetable camera focus around objects
- default camera plus alternative cameras in the scene

The viewport may show:
- grid lines
- axis helpers in editor mode
- selection outlines
- transform gizmos for move/rotate/scale
- shadows and environment reflections
- background color or transparent canvas for embedding

### Sidebar
The sidebar is the main editor panel. It includes:
- Elements tab: object library and creation tools
- Essentials tab: simplified inspector for common editing tasks
- Outliner: object hierarchy and selection tree
- Properties or full inspector: detailed object controls

### Elements
The Elements section is the object library. It lists all available scene-building blocks and lets the user create them. Users can often:
- double-click to insert
- drag and drop into the viewport
- pick from grouped categories
- select assets from upload dialogs

### Essentials
Essentials is the simplified editing panel. It exposes the most common controls for scene setup and selected objects without showing every advanced value. It is a filtered view of the full node schema. Common tabs include:
- Scene
- 3D
- Lightning
- FX

### Outliner
The Outliner lists all scene objects in a hierarchical tree. It allows:
- object selection
- visibility toggling
- expand/collapse hierarchy
- naming/renaming
- parent-child structure inspection
- deletion and duplication actions

### Footer
The footer contains workflow actions such as:
- Exit / close editor
- Grid toggle
- Camera mode / view options
- Save
- Export
- Publish
- Pause / play / stop
- AR / VR / immersive launch buttons
- selected object actions

Each button has an effect on the scene, the editor state, or the saved scene data.

---

## 3. Elements Tab

This is the application’s content library. It groups scene-building blocks by type.

### Main categories
3D Elements
- 3D Asset
- 3D Text
- Photo Dome

Cameras
- Orbit Camera
- First Person Camera

Lights
- Point Light
- Directional Light
- Spot Light
- Hemispheric Light

Materials
- PBR Material
- Shadow Only Material
- Transmission Material
- Shader-based custom material

Textures
- Texture
- Cube Texture
- HDR Cube Texture
- Video Texture
- Dynamic Texture
- Color Grading Texture

Actions
- Animate
- Timeline
- Condition
- Math
- Sequencer
- Overlays
- External link
- Change scene
- Save configuration
- AR / VR action

Sounds
- Sound
- Spatial sound

Utilities
- Transform node
- Collection
- Variable
- Control node
- Highlight
- Measure
- Gem
- Instance / clone
- Decal

### General insertion flow
A selected element usually follows this path:
User clicks or double-clicks element → modal or prompt appears → user enters configuration → object is created → object appears in viewport → object appears in Outliner → object becomes selected → inspector opens

---

## 4. Element-by-Element Documentation

### 4.1 3D Asset

#### How it is added
- User clicks “3D Asset” in Elements
- File picker opens
- User selects one or more assets
- The app loads models into the scene
- Asset appears in the viewport and Outliner

#### Supported formats
Actual runtime support includes models such as:
- GLB
- GLTF
- OBJ
- FBX
- STL
- VRM
- SPLAT
- plus texture and environment file types such as env, hdr, png, jpg, webp, mp4, mp3, wav, ogg

#### Upload process
- Files can be selected from local disk
- Some scenes also allow drag-and-drop or admin-managed asset import
- Model files are resolved by asset reference and loaded by the renderer
- Textures and environment files may be loaded separately

#### After loading
The asset is created as a scene object, added to the scene graph, placed into the hierarchy, and assigned default transforms. It typically appears selected and becomes editable in the inspector.

#### Asset properties
Editable after loading typically include:
- name
- position
- rotation
- scale
- visibility
- material assignment
- animation playback (if the model has clips)
- collision / walkable flags
- highlight and effects
- selection state and parent-child relationships

#### Scene object result
The runtime object is typically a mesh or transform-based object hierarchy created from imported geometry. Internally it is a Babylon-like mesh / node tree, often with multiple nested meshes and materials.

---

### 4.2 3D Text

#### How it is added
User double-clicks “3D Text” or adds it through the element menu.

Flow:
User selects 3D Text
↓
Modal opens
↓
User enters text and chooses style settings
↓
User confirms
↓
3D text mesh is created in scene
↓
Object appears in Outliner and becomes selected

#### Configuration modal
Typical fields include:
- Text: string content
- Font: font family or uploaded font
- Resolution: mesh quality / detail level
- Size: object scale or text height
- Alignment: left / center / right
- Material: assigned material or base color
- Color: text color
- Extrusion or bevel: if supported
- Visibility: on/off
- Name: object name

#### Resulting scene object
A 3D Text object becomes a mesh with:
- geometry generated based on text
- material applied to the mesh
- transform node or mesh in the scene graph
- often stored with its own generated ID and name

#### Editing after creation
Users can edit:
- text content
- alignment
- scale and position
- material
- visibility
- name
- font and resolution if reconfigured in the editor

---

### 4.3 Photo Dome

#### How it is added
User selects Photo Dome from 3D Elements and chooses an environment image or 360 media file.

#### Resulting object
A dome or skybox-like panoramic object is created around the scene to surround it with an image or video backdrop.

#### Typical properties
- texture URL
- intensity
- rotation
- visibility
- mapping / panorama control

---

### 4.4 Cameras

#### Orbit Camera
Creation:
- User adds Orbit Camera from the Elements panel
- Default camera is created with orbit controls and target focus

Typical default values:
- position around target
- target at object center
- FOV around 45–60 degrees depending on scene
- min/max distance restrictions
- default movement on pointer drag and scroll

Editable properties:
- position / target
- radius / distance
- alpha / beta angle
- FOV
- target offset
- min/max clip
- lock state
- auto-rotation
- panning and zoom sensitivity
- lens / device-specific focal length

#### First Person Camera
Creation:
- User adds First Person Camera
- Camera is placed in the scene with walk/fly behavior enabled

Typical defaults:
- position at scene origin or default starter point
- rotation set to the initial facing direction
- movement via keyboard, pointer drag, or clicked walkable areas

Properties include:
- position and rotation
- target direction
- walkable surfaces
- collisions and gravity
- speed and inertia
- FOV and clip planes

#### Active camera behavior
A scene can contain multiple cameras, but one is active. The active camera is what the user sees. Switching cameras can happen via:
- scene camera selection
- action triggers
- UI camera choose button
- direct assignment through logic

---

### 4.5 Lights

#### Point Light
- emits radial light in all directions
- position-based
- used for local illumination, accents, lamps

Typical properties:
- position
- intensity
- color
- range
- shadow settings

#### Directional Light
- acts like sunlight
- direction-based, not position-based in appearance
- often used for global illumination and shadows

Typical properties:
- direction / rotation
- intensity
- color
- shadow distance, bias, blur

#### Spot Light
- cone-shaped beam
- used for highlights, stage lighting, working lights

Typical properties:
- position
- direction / rotation
- angle
- penumbra
- intensity
- range
- shadows

#### Hemispheric Light
- soft ambient-like light
- used to gently fill the scene with color

Typical properties:
- direction
- intensity
- ground and sky color

---

## 5. Settings and Essentials

The Outliner has a **Settings** group with three buttons. Each button opens its settings node in the editor:

### Engine Settings
- **Resolution:** HD, Medium (MD), or SD. Lower resolution can improve performance; changing it requires a reload.
- **Enable WebGPU:** switches the rendering backend when supported. Requires a reload.
- **Notes:** optional text saved with the settings node.

### Scene Settings
- **Background Color:** sets the scene canvas color.
- **Transparent:** removes the solid canvas background so the page behind the viewer can show through.
- **Env Intensity:** adjusts the strength of environment lighting/reflections.
- **Environment Texture:** chooses the scene environment texture.
- **Notes:** optional text field.

### Effects
- **Image Processing:** enable effects; adjust exposure, contrast, global/highlight/shadow hue, density and saturation; enable color grading and choose its texture; choose Standard, ACES, or Khronos PBR Neutral tone mapping; configure vignette enable, color, weight, and stretch.
- **Fog:** enable fog and set its color, start distance, and end distance.
- **SSAO:** enable ambient contact shadows and tune base, samples, soften, tolerance, depth range, radius, and strength.
- **Screen Reflections (SSR):** enable reflections and tune thickness, reflectivity, roughness, distance, steps, sampling, smoothing, and related controls.
- **Glow:** enable glow and adjust intensity and blur.
- **Utilities:** enable order-independent transparency, show bounding boxes, or show wireframe.

### Essentials quick settings
- **Scene:** quick controls for Transparent Background and Background Color, plus fields for the active camera.
- **3D:** lists scene meshes and provides object/material editing, including attaching a material when one is missing.
- **Lightning:** provides the editor's light and environment controls.
- **FX:** exposes the supported effects fields in a simplified view.

Only fields implemented for the selected scene or object appear. Fog and other controls should not be assumed to exist in every panel; use the actual Effects fields for those options.

---

## 6. Essentials → 3D

The 3D tab focuses on the scene’s objects and their material connections.

When an object is selected, Essentials displays the key properties of that object.

### Transform panel for selected object
- Position X / Y / Z
- Rotation X / Y / Z
- Scale X / Y / Z

Typical behavior:
- values update live while dragging
- some values can be edited numerically
- values are stored in the scene data
- default coordinate units are scene units, commonly treated as meters or abstract scene units depending on the scene design

### Object info
Typical entries include:
- Name
- Object ID
- Type
- Parent
- Visibility
- Material assignment
- Children / hierarchy

### Mesh/material workflow
If a mesh has no material, the UI can attach a new material directly. If the mesh has child meshes or imported model materials, the editor shows sub-materials so the user can edit each material individually.

---

## 7. Material System

### Supported material types
Badvisor includes a realistic material system and certain special materials.

Common materials include:
- PBR material
- Transmission material
- Shadow Only material
- Diamond / gemstone material
- Shader material
- unlit visual variants where supported

### General material properties
Typical property groups include:
- General: name, unlit, culling, visibility, double-sided control
- Base Color: color, texture, tint
- Metalness / Roughness
- Normal Map
- Opacity / transparency
- Transmission / IOR
- Emissive
- Ambient / environment response
- Bump or height properties
- Clear coat / sheen / anisotropy in advanced PBR workflows

### Texture support in materials
Materials can use:
- base color texture
- normal map
- roughness map
- metallic map
- ambient occlusion map
- emissive map
- environment map

### Effect of material settings
- Base color affects the main visible surface tint
- Roughness changes micro-surface reflectivity
- Metalness changes how reflective the material is
- Opacity and transmission control visibility and glass behavior
- Emissive adds self-lighting
- Normal maps add surface detail

### Saved state
Material settings are stored as scene data so they survive reload.

---

## 8. Textures

Textures are used to modify material surfaces or environment reflections.

### Supported types
- image textures
- cube textures
- HDR environment textures
- video textures
- dynamic textures
- LUT / color grade textures

### Texture workflow
- User uploads an image or media file
- Texture is assigned to a material or environment
- Texture may be remapped to the UV channels
- Some textures serve as environment reflections, not just albedo maps

### Editable texture properties
Typical properties include:
- URL / file reference
- UV scale / repeat
- offset
- rotation
- wrapping mode
- filtering
- alpha usage
- level or intensity
- channel assignment (albedo, reflection, normal)

### Saving behavior
Textures are saved by referencing the asset or file URL, and the scene stores material assignments that reference those textures.

---

## 9. Essentials → Lighting

Lighting controls include:
- scene ambient / environment lighting
- light list of all lights in the scene
- intensity and color controls
- environment map preview and rotation
- shadows configuration
- exposure and tone mapping settings

### Lighting settings commonly exposed
- environment intensity
- environment rotation
- shadow cast/receive toggles
- light color and intensity
- light range and angle
- contact shadow or bias values
- exposure / tone mapping adjustments

These settings directly affect material appearance, scene realism, and post-processing outcome.

---

## 10. Essentials → FX

FX refers to post-processing and rendering effects applied at the end of the scene render.

Common effect categories include:
- bloom
- DOF / depth of field
- SSAO / ambient occlusion
- fog
- color grading
- post-processing stack
- exposure and contrast
- tone mapping
- vignette
- grain
- sharpen
- anti-aliasing / FXAA

### Behavior
The user can enable or tune FX in the editor. Some are global scene effects while others are controlled per scene. These settings are saved in the scene document and affect the rendered output for the viewer.

---

## 11. Outliner and Help

The Outliner is the editor's searchable list of scene content and settings. Click a section heading to expand or collapse it. The number beside a heading is its item count; some sections only appear when the scene contains matching items.

### Search and scene tree
- **Search:** filters entries by name and expands groups while a search is active.
- **3D Elements:** lists meshes and imported models. Expand/collapse controls show or hide child meshes; the eye toggles visibility; the focus icon frames the object with the active camera; the object button opens its editor.
- **Camera visibility icon:** activates that camera as the scene view. Orbit and First Person cameras are listed separately.
- **Help:** opens tutorial videos, keyboard shortcuts, and the external documentation link.
- **Action Console:** displays recent action logs; **Clean Console** clears the log.
- **Capture:** opens the capture editor for scene output.
- **Settings:** opens Engine Settings, Scene Settings, and Effects; see Section 5 for each option.

### Content groups
- **Collections:** organizes scene items into reusable groups. Use the plus button to add one (Alt+K).
- **Control Nodes:** creates and edits control nodes used by scene logic (Alt+N).
- **Cameras:** lists and switches between cameras; plus adds a camera (Alt+C).
- **Lights:** lists lights; plus adds a light (Alt+L).
- **3D Elements:** lists scene meshes; plus opens the add-3D-element flow (Alt+D).
- **Materials:** lists editable/custom and imported materials; plus adds a material (Alt+M).
- **Textures:** lists editable/custom and imported textures; plus adds a texture (Alt+T).
- **Actions:** lists interaction and behavior actions; plus adds an action (Alt+A).
- **Variables:** lists scene variables; plus creates one (Alt+V).
- **Animation Groups:** appears when imported animation groups exist; use it to access those model animations.
- **Sounds:** lists scene audio; plus adds a sound (Alt+S).
- **Overlays:** lists 2D interface elements; plus creates an overlay (Alt+O). **Hide All** and **Show All** toggle every overlay.

### Help shortcuts
- **Open asset node:** Shift + left-click.
- **Open mesh node:** Shift + Ctrl + left-click.
- **Open material node:** Ctrl + Alt + left-click.
- **Move nodes:** hold Space and drag.
- **Reorganize nodes:** Alt+1. **Close nodes:** Alt+3.
- **Add collection:** Alt+K; other add shortcuts are listed with their matching groups above.

Names and available actions depend on the contents of the current scene. The source confirms visibility, focus, hierarchy expansion, camera switching, and opening nodes; it does not confirm general drag-to-reorder, reparenting, or multi-select behavior, so those should not be presented as guaranteed Outliner options.

---

## 12. Selection System

Selection is one of the key editor behaviors.

### Selection flow
Click object in viewport
↓
Object becomes selected
↓
Outliner highlights it
↓
Essentials or Properties panel shows object data

### Selection rules
- single click selects object
- double click often focuses or opens an object editor
- deselection occurs when clicking empty space
- object outline or gizmo appears for the selected object
- transform gizmo is shown for active object
- selected mesh can be modified with move/rotate/scale controls

### Multi-selection
Some editor actions support selecting multiple objects at once, especially when grouping or batch transforming. However many scene tasks are designed around one selected object at a time.

---

## 13. Transform Controls

Badvisor supports standard object manipulation with gizmos.

### Modes
- Move
- Rotate
- Scale

### Supported behaviors
- use gizmo axes in viewport
- local or world transform mode depending on editor state
- axis constraints for X/Y/Z movement
- snapping in some operations
- numeric input in inspector
- reset to default transform values
- live transform updates

### Keyboard shortcuts
Common shortcuts include:
- Delete: delete selected object
- Ctrl/Cmd + Z: undo
- Ctrl/Cmd + Y: redo
- Ctrl/Cmd + C: copy
- Ctrl/Cmd + V: paste
- W / E / R: switch move / rotate / scale gizmo mode
- F: focus / frame object in view

---

## 14. Actions

Actions are the engine of scene behavior and interactivity.

### Trigger types
Actions can be triggered by:
- scene load
- pointer down / up / move
- click or tap
- hover / pointer over
- double-click / double-tap
- animation end
- scroll position
- host page messaging
- another action completion

### Common action types
- Animate
- Timeline animation playback
- Play / pause / stop animation group
- Condition
- Math / variable update
- Expression
- Show/hide overlay
- Open external link
- Add or replace scene content
- Change scene
- Screenshot export
- Export scene
- Save configuration
- Enter AR / VR / VTO

### Behavioral logic
Actions can:
- target objects or whole collections
- compare variable values
- chain one action after another
- use end actions to continue flow
- modify transforms, visibility, materials, cameras, sounds, and scene state
- trigger navigation or open external pages

### Important note
Most customer scenes are built from actions. This is how scenes become interactive without writing code.

---

## 15. Overlays

Overlays are 2D UI elements placed above the canvas.

### Types
- text blocks
- image overlays
- HTML overlays
- buttons
- tooltips
- hotspots
- interactive UI panels

### Common behavior
- overlays can be positioned in screen space or attached to 3D objects
- visibility can be toggled by actions
- style and animation can be configured
- overlays can react to clicks and pointer gestures
- they are saved with the scene configuration

---

## 16. Sounds / Audio

Badvisor supports sounds and audio assets.

### Supported formats
- MP3
- OGG
- WAV

### Behavior
- 2D audio for UI or ambient sound
- 3D / spatial audio for positioned sound sources
- loop option
- autoplay option when allowed by browser constraints
- volume control
- mute / pause / play states
- interaction triggers for sound playback

### Saving
Audio sources and their parameters are saved as scene data and referenced by scene objects.

---

## 17. Animation

If imported models include animations, the scene may expose them.

### Typical animation features
- imported animation clips from GLB/FBX content
- list of animation names
- play / pause / stop
- loop / non-loop behavior
- speed settings
- timeline or scrubbing behavior
- trigger based playback via actions

### Timeline actions
Animation can be initiated by:
- scene load
- action trigger
- user interaction
- overlay click
- camera or object state change

---

## 18. Configurator

Badvisor supports configuration workflows for product personalization.

### Typical configurator features
- variations or product states
- material choices
- colors
- visible or hidden options
- mesh or part swapping
- environment options
- product states saved in scene configuration
- links that save the current configuration

### Common use
A user can choose a color, finish, or accessory and then save or share the result. This is often implemented with actions, variables, and collections.

---

## 19. AR / VR / VTO

### AR
- opens a product in the device’s native AR viewer
- often used for product placements or room previews
- requires supported mobile browser or device
- uses the scene content and selected camera state

### VR
- supported through immersive mode
- scene can be entered in VR and navigated with controllers or movement system
- may include camera movement, teleportation, and object interaction depending on the scene

### VTO (Virtual Try-On)
- face or body tracking mode
- often used for makeup, glasses, accessories, or try-on experiences
- requires a live camera and supported browser/device setup
- interacts with a selected product and camera system

---

## 20. Saving

Saving is critical to editor behavior.

### What happens when Save is pressed
The editor serializes the live scene state into a structured document. This includes:
- object IDs
- object names
- transforms
- materials
- textures
- cameras
- lights
- actions
- overlays
- animations
- environment settings
- FX settings
- asset URLs
- scene settings and metadata

### Typical JSON structure
The document is a JSON object with top-level sections such as:
- engine
- scene
- assets
- nodes
- materials
- textures
- lights
- cameras
- effects
- sounds
- actions
- variables
- overlays
- collections
- animationGroups

### Example scene JSON

```json
{
  "engine": { "hardwareScalingLevel": "HD" },
  "scene": { "clearColor": "#dedede" },
  "cameras": {
    "defaultCamera": {
      "type": "ArcRotateCamera",
      "name": "defaultCamera",
      "isDefault": true,
      "fov": 0.927,
      "radius": 10
    }
  },
  "nodes": {
    "Mesh_EnvironmentPlane": { "enabled": false }
  },
  "lights": {
    "Light_1": { "type": "DirectionalLight", "intensity": 1 }
  }
}
```

### Save behavior
- data is persisted as a serialized scene document
- preview or thumbnail may be captured
- updated document is stored with versioning or overwritten depending on editor state
- save triggers writing object metadata and references to the backend

---

## 21. Loading a Saved Scene

### Load pipeline
Saved JSON
↓
Scene loader reads the document
↓
Assets are fetched and resolved
↓
Objects are recreated
↓
Materials are created or mapped
↓
Lights and cameras are rebuilt
↓
Actions and overlays are attached
↓
Scene is finally active in the viewer/editor

### Missing data handling
If:
- asset is missing → object may not render or placeholder is shown
- texture is missing → material appears flat or broken
- URL fails → item may not load and an error message can appear
- unsupported format → file is rejected
- invalid scene JSON → scene may fail to load or fallback to an empty state

---

## 22. Export

Badvisor supports exporting scene assets in several supported formats.

### Typical export formats
- GLB
- GLTF
- OBJ
- USDZ
- STL

### Export behavior
When exporting:
- geometry is included with scene hierarchy
- materials are included when supported
- textures are embedded or referenced depending on format
- animations are preserved when valid
- lights and cameras may be included or omitted depending on export target
- hidden objects can be excluded
- metadata may be simplified or not preserved

### UI flow
The user clicks Export in the UI, chooses export options if necessary, and downloads the scene asset. This can be used for packaging, external 3D use, or asset delivery.

---

## 23. Publish / Viewer

After editing, a scene can be published or made viewable.

### Flow
Editor
↓
Save scene data
↓
Publish or share scene
↓
Viewer route or public URL becomes active

### Publisher behavior
- scene may become public or private
- links can be shared with authorized viewers
- embedding via iframe can occur
- published state may be updated after republishing
- viewer routes use URL structures that resolve organization, project, and scene

---

## 24. Admin / Editor / Viewer Differences

| Feature | Admin | Editor | Viewer |
| --- | --- | --- | --- |
| View scene | Yes | Yes | Yes |
| Add object | Usually Yes | Yes | No |
| Edit materials | Yes | Yes | No |
| Save scene | Yes | Yes | No |
| Export scene | Yes | Yes | Maybe |
| Publish scene | Yes | Usually No | No |
| Open scene in editor | Yes | Yes | No |
| Interact with scene logic | Some | Yes | Yes |

### Admin
The admin is the control layer for scenes, projects, permissions, publishing, and assets.

### Editor
The editor is the authoring mode in which objects and settings are manipulated live.

### Viewer
The viewer is the presentation layer, intended for public browsing, embedding, and interaction but not for authoring or saving.

---

## 25. Responsive Behavior

Badvisor UI must behave across different screen sizes and device classes.

### Desktop
- wider viewport and side panels
- full object inspector visible
- multiple toolbars and panels remain open

### Laptop
- similar to desktop but with more compact layout
- sidebars may be reduced in width

### Tablet
- touch-friendly controls
- move and orbit interactions are rebalanced for touch
- inspector may collapse or stack

### Mobile
- viewport focuses on product viewing
- UI is simplified
- sidebars may collapse into drawers or bottom sheets
- on-screen gestures replace some desktop interactions

### Sidebar behavior
- panels can collapse and expand
- toolbars can condense depending on width
- modals remain useable without blocking the viewport completely

---

## 26. Performance

Badvisor includes a number of design choices intended to keep scenes fast.

### Typical optimizations
- only pickable objects respond to pointer interactions
- imported assets and textures can be cached
- GPU memory is cleaned when scenes change
- heavy effects may be configurable
- model optimization and mesh simplification are used where possible
- shadows are configurable to reduce cost
- environment textures may be prefiltered
- textures may be compressed and sized for browser delivery

### Rendering-related performance concerns
- shadow maps and light count affect performance
- bloom and post-processing can be expensive
- high-resolution textures may be large
- large imported models need optimization

---

## 27. Babylon.js → Three.js Mapping

The original app was Babylon-based, and the new migration targets Three.js. The most relevant equivalent types are:

- BABYLON.Mesh → THREE.Mesh
- BABYLON.TransformNode → THREE.Group / THREE.Object3D
- BABYLON.PBRMaterial → THREE.MeshStandardMaterial / MeshPhysicalMaterial
- BABYLON.PointLight → THREE.PointLight
- BABYLON.DirectionalLight → THREE.DirectionalLight
- BABYLON.SpotLight → THREE.SpotLight
- BABYLON.HemisphericLight → THREE.HemisphereLight
- BABYLON.ArcRotateCamera → THREE.PerspectiveCamera with orbit logic
- BABYLON.UniversalCamera → THREE.PerspectiveCamera with movement logic

The mapping is useful when recreating the features in a Three.js implementation while preserving the scene logic and saved data model.

---

## 28. IDs and Naming

Each object in the scene has a unique ID and a display name.

### ID behavior
Typical IDs look like:
- Material_1718000000000
- 3DText_1718000000001
- Asset_1718000000002

These IDs are used to:
- distinguish objects in scene JSON
- map materials and overrides
- maintain references between nodes and materials
- support saved state

### Naming rules
- object names are user-visible
- IDs are internal scene identifiers
- user may rename objects in the outliner and inspector
- IDs are usually generated when objects are created
- IDs are commonly globally unique within a scene

---

## 29. Delete / Duplicate / Copy / Paste

Common object actions include:
- Delete object
- Duplicate object
- Copy / Paste
- Clone
- Reset transform
- Undo / Redo

### Behavior
- Delete removes the object from scene and saved hierarchy
- Duplicate creates a new object with same properties and new ID
- Copy/Paste duplicates object configuration or scene state
- Clone is similar but can be used for generated object copies
- Undo/Redo restores previous state

---

## 30. Keyboard Shortcuts

Common shortcuts include:
- Delete: remove selected object
- Ctrl/Cmd + Z: undo
- Ctrl/Cmd + Y: redo
- Ctrl/Cmd + C: copy
- Ctrl/Cmd + V: paste
- W: move tool
- E: rotate tool
- R: scale tool
- F: focus / frame selected object

These shortcuts serve editor workflows and speed up object manipulation.

---

## 31. Error Handling

Badvisor should inform the user when something fails.

### Common errors
- invalid model or unsupported file type
- failed upload or failed asset import
- missing or broken texture reference
- invalid scene JSON
- export failure
- save failure
- network failure
- asset file loading issue

### User feedback
The UI usually shows:
- inline errors
- toast notifications
- modal warnings
- failed asset banners
- invalid scene fallback state
- loading or failed upload indicator

---

## 32. Firebase / Backend

The original platform stores scene data and asset metadata in a backend service.

### Typical responsibilities
- authentication
- scene storage
- asset storage
- scene IDs and handles
- save/load operations
- publish state
- versioning
- permissions and access control
- API responses for embed and viewer use

### The scene record
A scene is a document that contains metadata plus a serialized `data` payload. This data is then read by the viewer and written by the editor. Asset references and media files are stored in backend storage, while the scene document holds the structure and state.

---

## 33. Viewer Communication / iframe / postMessage

The viewer and admin communicate using browser runtime messaging, especially when the editor is embedded in an iframe.

### Typical message flow
- viewer announces it has started
- admin asks viewer to save scene data
- viewer reports scene events and actions
- embed page can trigger actions or receive lifecycle events
- parent and viewer communicate through `postMessage`

### Common message types
- appHasStarted
- saveData
- insertAssets
- closeEditor
- actionHasBeenTriggered
- sceneHasStarted
- screenshot or preview generation requests

This is important for both editor integration and embedded marketing or product pages.

---

## 34. Public Viewer API

If the app exposes a public API for embedded use, it generally includes functions such as:
- loadScene()
- openConfigurator()
- setMaterial()
- setCamera()
- playAnimation()
- triggerAction()

### Purpose
These APIs make it possible for a host page or admin panel to:
- change the current scene state
- open additional UI or configurator states
- switch camera
- play animation clips
- trigger interaction logic programmatically

---

## 35. Current Implementation vs Original Application

### CURRENT THREE.JS IMPLEMENTATION STATUS

#### Already implemented
- GLB
- GLTF
- OBJ
- MTL
- STL
- FBX
- VRM
- SPLAT
- 3D Text
- Screenshot
- GLB Export
- USDZ Export
- Elements
- Essentials
- Outliner

#### Partially implemented
- Materials
- Lights
- Cameras
- Actions
- Overlays
- Save/load flow
- Post-processing FX
- Responsive editor layout

#### Not implemented yet
- full original admin/editor scene parity
- advanced full Badvisor interaction graph
- full old configurator workflow
- complete AR/VR/VTO feature parity
- original asset library and full asset publishing workflow
- complete save/load compatibility with legacy scene documents

---

## 36. Functional Summary of the Top Workflow

The most important user journey in Badvisor looks like this:

User opens a scene
↓
Scene loads and viewer/editor initializes
↓
User adds 3D asset, text, camera, lights, or overlays
↓
User edits transform, material, and environment
↓
User adds interaction by actions and conditions
↓
User saves scene state
↓
User can publish the result or export the scene asset
↓
Viewer loads scene and its saved configuration

This is the core loop from authoring to presentation.

---

## 37. Key Product Takeaways

Badvisor is best understood as a scene-authoring system built around:
- a viewport for visual composition
- an outliner for hierarchy and selection
- a properties/Essentials system for object and scene editing
- assets and textures as reusable scene resources
- actions as the way scenes become interactive
- saved JSON as the final scene contract between editor and viewer

The persistent scene state is the central product concept: the viewer reads it, the editor edits it, and the user reuses it later.

---

## 38. Babylon.js and Three.js Migration Guidance

When rebuilding this app in Three.js, the most important compatibility focus should be:
1. scene JSON conventions
2. object naming and ID mapping
3. material/shader behavior
4. camera and lighting parity
5. action system and collections
6. outliner hierarchy and selection flow
7. viewport transform controls
8. save/load round-trip fidelity

This preserves the user-facing behavior even when the underlying renderer changes from Babylon.js to Three.js.

---

End of document.
