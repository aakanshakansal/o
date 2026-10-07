# Element Section Functionalities

This document explains the main functional behavior of the element types in the Badvisor editor: Overlays, Notes / Control Notes, Collection, Variable, Control Node, and External Link. These are not just visual objects; they are logic-building blocks that connect the 3D scene with interactivity, organization, and runtime behavior.

---

## 1. What the Element section is for

The Element section is the library of scene-building elements. It is the place where a creator chooses what to add to a scene before editing its behavior. In the editor, the user can:

- add 3D objects and scene assets
- create lights, cameras, textures, and materials
- add overlays for UI placement
- attach logic through actions
- group objects with collections
- save reusable values through variables
- open external destinations through link actions
- attach notes and metadata to settings and nodes

The main creation flow is:

1. User selects an element from the Elements panel
2. The editor calls the creation function for that type
3. A runtime object or logic item is generated
4. The object is stored in scene data
5. The object appears in the editor and can be manipulated

---

## 2. Overlays

### Definition

Overlays are 2D UI layers placed above the main 3D canvas. They are not 3D meshes. They are interface elements such as text, buttons, hotspots, image panels, HTML blocks, or pop-up surfaces that sit on top of the scene.

They are used for:

- product information panels
- call-to-action buttons
- color swatches and configurators
- labels, text blocks, and instructions
- hotspots and scene annotations
- confirmation screens or alerts
- interactive UI for product storytelling

### Creation behavior

In the editor, an overlay is created from the Element panel as an "Overlay" item. Internally, the creation logic is:

- `createOverlay(scene, sceneData, name)`
- creates an object with:
  - `name`
  - `displayName = "Overlay"`
  - `enabled = true`
  - `zIndex = 1`
  - `getClassName() => "Overlay"`
- stores the object in `scene.overlays[id]`
- applies property metadata from `overlayProps`

The runtime structure is intentionally lightweight because overlays are mainly UI containers and interface state, not Babylon 3D meshes.

### Properties and behavior

The overlay metadata defines the typical controls:

- Name
- Enabled / visible state
- Z index
- notes / display information (where supported)

Important behavior:

- overlays can be shown or hidden through actions
- they are rendered in screen space over the canvas
- their visibility can be toggled at runtime
- they can be part of interaction workflows with actions
- updates are saved with the scene data

### Purpose in scene logic

Overlays are often used together with actions such as:

- show overlay when object is clicked
- hide overlay when another state is active
- open product info panel on hover
- toggle UI after scene load
- connect overlay buttons to external links or other actions

This makes overlays the visual layer of the interaction system.

### In the data model

The scene stores overlays under:

- `scene.overlays`
- `sceneData.overlays`

Each overlay is a named object with its own state, and the editor can later traverse and manipulate those objects as part of the scene state.

---

## 3. Notes / Control Notes

### Definition

"Notes" are text annotations attached to scene settings or node properties. They are not gameplay logic; they are metadata or documentation for the scene author. In this project they are represented by the `badNotes` property and displayed as a multiline text field labeled "Notes".

### Where they are used

The notes field appears in settings and node property definitions, including:

- engine settings
- scene settings
- actions
- other editor nodes where metadata is useful

The property schema in the editor is defined in `nodesProps.js`, where the field is declared as:

```js
badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" }
```

This means the editor displays a multiline text field for notes, organized under a "Notes" group.

### Functional purpose

The note field is used to:

- keep internal comments for the creator
- annotate configuration for design or QA
- record scene explanations or implementation context
- store extra data without affecting behavior
- document why a setting or action exists

### Important note

Notes are informational. They are not a runtime action engine by themselves. They do not drive animation, camera behavior, or conditional logic unless the creator manually uses the text for a custom workflow.

### Practical example

A scene designer may write in the engine notes:

- "Render scale reduced for mobile performance"
- "This camera is used for product demo mode"
- "Overlay behavior changed after user testing"

These notes remain attached to the scene configuration and help maintain clarity inside the editor.

---

## 4. Collection

### Definition

A Collection is a grouping object used to organize related scene elements into a reusable logical set. It is a container for nodes or objects that belong together.

Examples:

- all product options in a configurator
- all lighting objects used in a set
- all objects updated together by a state change
- a single group of nodes that should be manipulated as one unit

### Creation behavior

The editor creates a collection using:

- `createCollection(scene, sceneData, name)`

The resulting object contains:

- `name`
- `displayName = "Collection"`
- `nodes = []`
- `getClassName() => "Collection"`

Then it is stored in:

- `scene.collections[id]`
- `sceneData.collections`

### Why collections matter

Collections make logic scalable. Instead of selecting scenes one by one, a creator can assign many nodes to a collection and then refer to the collection in actions.

Typical use cases:

- hide multiple objects at once
- animate a group of meshes together
- apply the same state to several objects
- create reusable sets for product variants or viewer states

### Runtime behavior

The collection is not a visual mesh. It is an organizational object. The array `nodes` holds references or names of elements belonging to the collection. In actions, the collection can be targeted as a single unit and used to update many elements at once.

### Relation to other elements

Collections are especially useful with:

- Variables
- Conditions
- Math actions
- Overlays
- Configurator states

Together they create a no-code logic system for dynamic scenes.

---

## 5. Variable

### Definition

A Variable is a single named value used to store and reuse data during scene logic. It acts like a data slot that the editor can read and update during interaction.

Examples:

- selected material ID
- current product color
- product size or variant index
- toggle state for a UI panel
- camera mode
- numeric value for animation or condition logic

### Creation behavior

The editor creates a variable via:

- `createVariable(scene, sceneData, name)`

The created object has:

- `name`
- `displayName = "Variable"`
- `type = "Variable"`
- `getClassName() => "Variable"`

It is stored in:

- `scene.variables[id]`
- `sceneData.variables`

### Why variables are important

Variables are the data layer behind interactive scenes. They are used in logic conditions and computations. When a trigger fires, the scene can read the variable, modify it, compare it, or use it to decide what happens next.

### Typical usage

Variables are commonly used in:

- Condition actions
- Math actions
- Expression actions
- configurator choices
- toggling states
- linking multiple UI and scene elements together

### Example scenario

A product viewer can have:

- variable `selectedColor`
- variable `selectedSize`
- variable `isInfoVisible`

Then logic can do things like:

- if `selectedColor` equals "Blue", show blue materials
- if `isInfoVisible` is true, show overlay
- add 1 to `selectedIndex` when user clicks next

This is one of the core building blocks of no-code interactivity.

### Limitations and role

Variables are not visible 3D objects and should not be treated as meshes, lights, or textures. They are data containers used by the action system.

---

## 6. Control Node

### Definition

A Control Node is a logic helper that groups node properties together under one reusable structure. It is a more structured container for controlling multiple property values as a unit.

### Creation behavior

The editor creates a control node using:

- `createControlNode(scene, sceneData, name)`

The object has:

- `name`
- `displayName = "Control Node"`
- `nodes = {}`
- `getClassName() => "ControlNode"`

It is stored in:

- `scene.controlNodes[id]`
- `sceneData.controlNodes`

### Why it is useful

Complex scenes often need groups of related property values to be edited together. A control node lets the creator bundle several properties into one reusable control unit for action logic, configuration, or dynamic scene updates.

### Practical meaning

A control node is not an actual visible object like a camera or light. It is a logical abstraction that simplifies control over groups of values. It is especially useful in scenes that rely on dynamic behavior or parameter-driven updates.

---

## 7. External Link

### Definition

External Link is an action that opens a URL when triggered. It is used to send the viewer to another webpage, product page, external documentation, or related content.

### Editor creation

The element is created as an action type named `ExternalLink`.

When created, the action is initialized as:

- `name`
- `displayName = "External Link"`
- `type = "ExternalLink"`

### UI fields

The editor form contains:

- `newTab: Boolean` → choose whether the link opens in a new tab
- `url: String` → the destination URL

This is implemented in the action editor component:

- `src/modules/editor/Nodes/Actions/ExternalLink.jsx`

### Button Script in External Link

The "button script" in an external link is not a separate special element. It usually means the click handler or interaction logic attached to a button that triggers the External Link action. In practice, the button runs a script or action sequence, and that script tells the app to open a URL.

So the real meaning is:

- the button is the UI trigger
- the script/action is the logic behind the click
- the External Link action is the final step that opens the browser URL

In this project, the action does not contain custom JavaScript code by itself. It simply reads the `url` value and opens it with `window.open(...)`. If `newTab` is enabled, it opens in a new tab; otherwise it opens in the same tab.

This is why an external link is treated as an action rather than a visible scene object: it is a trigger for navigation logic, not a renderable 3D element.

### Runtime behavior

When the action is fired in `actionDispatcher.js`, the code checks:

- if the app is in edit mode, it exits early
- if a URL exists, it calls `window.open(...)`
- if `newTab` is true: target `_blank`
- otherwise: target `_self`

The logic is essentially:

```js
if (props.url) {
  if (props.newTab) {
    window.open(props.url, "_blank");
  } else {
    window.open(props.url, "_self");
  }
}
```

### Best use cases

External Link is used for:

- product landing pages
- checkout flows
- documentation pages
- brand or company websites
- external supports or tutorials
- transitions between scenes or environments

### Important behavior

When the scene is in editor mode, this action intentionally stops executing so the creator does not accidentally leave the editor while testing. This avoids confusion during authoring.

---

## 8. How these elements work together

These elements form the logic layer of the editor:

- Overlays provide the 2D visual interface layer
- Notes keep authoring context and scene metadata
- Collections group related elements into reusable sets
- Variables store dynamic values
- Control Nodes group configurable parameters together
- External Link connects the scene to outside content

Together, they allow the creator to build interactive scenes without writing code. They are the foundation for scene logic, config states, UI behavior, and dynamic product experiences.

---

## 9. Summary

The Element section is more than a list of objects. It is the connection between:

- the 3D scene
- the editor UI
- logic actions
- reusable groups
- runtime values
- external navigation

In short:

- Overlays = visual screen-space UI
- Notes = text metadata for scene and node documentation
- Collection = reusable grouping of related objects
- Variable = dynamic value container for logic
- Control Node = grouped property logic container
- External Link = runtime navigation action

These are the building blocks that let a creator transform a static 3D scene into an interactive, configurable, product-ready experience.
