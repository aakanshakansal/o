# Scene Section in the Essential Tab

This document explains the Scene section in the Essential tab based on the actual code in this project, especially:

- `src/modules/editor/Essentials.jsx`
- `src/nodesProps.js`

The Essential tab is a simplified settings panel for the current scene and active camera. It is not a general-purpose world editor; it focuses on the most important scene-level options and the camera orbit controls used for product/viewer navigation.

---

## 1. Where the Scene section is rendered

In `src/modules/editor/Essentials.jsx`, the Essential tab has a Scene view and inside it renders:

1. `Settings`
   - Transparent Background
   - Background Color

2. Active Camera section
   - camera name
   - all camera settings for the current `scene.activeCamera`

The code specifically does this:

```jsx
{essentialsState === "scene" ? (
  <>
    <div className="nodeInner">
      <b>Settings</b>
      {NodeField(scene, "clearColorTransparent", { ...sceneProps.clearColorTransparent, label: "Transparent Background", showInEssentials: true })}
      {NodeField(scene, "clearColor", { ...sceneProps.clearColor, showInEssentials: true })}
    </div>

    <div className="nodeInner">
      <b>{scene.activeCamera.displayName || scene.activeCamera.name}</b>
      <Fields node={scene.activeCamera} />
    </div>
  </>
) : null}
```

This means the Scene panel is always tied to the active camera object. So the camera settings you see are properties of the currently selected/active Babylon `ArcRotateCamera`.

---

## 2. Transparent Background

This is controlled by `clearColorTransparent` in `sceneProps`.

```js
clearColorTransparent: {
  label: "Transparent",
  type: "Boolean",
  onSet: (scene, node, value) => {
    if (value !== null) {
      scene.clearColorTransparent = Boolean(value);
      if (value) {
        scene.clearColor = new Color4(0, 0, 0, 0);
      }
    } else {
      scene.clearColorTransparent = false;
    }
  },
  onChange: (e, scene, node, key) => {
    scene.clearColorTransparent = Boolean(e.target.checked);

    if (Boolean(e.target.checked) === true) {
      scene.clearColor = new Color4(0, 0, 0, 0);
    }
  },
},
```

### Functional meaning

- When enabled, the canvas background becomes fully transparent.
- It sets the Babylon scene color to `new Color4(0,0,0,0)`, which is RGBA transparent black.
- This is useful when the viewer is embedded into a webpage or product mockup and the background should not be a solid color.
- The option is scene-level, not camera-specific.

### Important note

This toggle only affects the scene background. It does not make the 3D model transparent; it makes the background transparent.

---

## 3. Background Color

This is controlled by `clearColor` in `sceneProps`.

```js
clearColor: {
  label: "Background Color",
  type: "Color3",
  onSet: (scene, node, value) => {
    if (value !== null) {
      node.clearColor = Color3.FromHexString(value);
    }
  },
  frontConversion: (value) => {
    return value.toHexString();
  },
  backConversion: (value) => {
    return Color3.FromHexString(value);
  },
},
```

### Functional meaning

- This is the solid background color behind the 3D scene.
- It uses a color picker, and the project converts between Babylon `Color3` objects and a hex string.
- This is the normal fallback when Transparent Background is turned off.
- It affects the viewport background, not the model itself.

### Example

If you choose a dark gray or white background, the whole canvas displays that color behind the model and assets.

---

## 4. Camera controls in the Scene tab

The camera section is rendered via `Fields node={scene.activeCamera}`. That means all fields shown under the camera are from the property schema for the active Babylon camera.

For orbit camera behavior, Badvisor is using Babylon `ArcRotateCamera`, whose properties include:

- `name` / `displayName`
- `radius` = distance from target
- `alpha` = horizontal angle
- `beta` = vertical angle
- `target` = center point the camera orbits around
- `targetScreenOffset` = offset of target on screen for parallax effects
- `lowerRadiusLimit`, `upperRadiusLimit`
- `lowerAlphaLimit`, `upperAlphaLimit`
- `lowerBetaLimit`, `upperBetaLimit`
- `fov` / `fovLarge` / `fovMedium` / `fovSmall`

The relevant schema is in `arcRotateCameraProps` within `src/nodesProps.js`.

---

## 5. Camera Name

The name shown in the camera section is:

```js
displayName: { label: "Name", type: "String", showInEssentials: true }
```

The UI renders:

```jsx
{scene.activeCamera.displayName || scene.activeCamera.name}
```

### Functional meaning

- This is how the user identifies the current camera in the Scene section.
- It is useful when multiple cameras exist.
- The name is a user-friendly camera label, not a rendering behavior toggle.

---

## 6. Set from View

This is a function button in the camera property schema:

```js
setFromView: {
  label: "Set From View",
  type: "FunctionButton",
  function: (e, scene, node) => {
    const alpha = parseFloat(node.alpha);
    const beta = parseFloat(node.beta);
    const radius = parseFloat(node.radius);
    const target = node.target;

    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }

    node.badChanges.alpha = alpha;
    node.badChanges.beta = beta;
    node.badChanges.radius = radius;

    node.badChanges["target.x"] = node.target.x;
    node.badChanges["target.y"] = node.target.y;
    node.badChanges["target.z"] = node.target.z;
    toast.success("Camera position registered");
  },
  showInEssentials: true,
},
```

### Functional meaning

This button stores the current camera pose as a snapshot in `node.badChanges`:

- current horizontal angle (`alpha`)
- current vertical angle (`beta`)
- current distance (`radius`)
- current target position (`target.x/y/z`)

It is essentially a way to “lock in” the current camera view so the app can restore or reapply it later.

### Why this matters

This is especially useful for presets or for making the current view the default camera position. The project later reuses `node.badChanges` when activating the camera:

```js
if (node.badChanges) {
  if (node.badChanges.alpha) node.alpha = node.badChanges.alpha;
  if (node.badChanges.beta) node.beta = node.badChanges.beta;
  if (node.badChanges.radius) node.radius = node.badChanges.radius;
}
```

So “Set from View” is a user action that captures the current orbit viewpoint.

---

## 7. Distance

The property is:

```js
radius: { label: "Distance", type: "Number", showInEssentials: true }
```

### Functional meaning

This is the camera distance from the target point.

In Orbit Camera terms:

- Small radius = camera is close to the subject
- Large radius = camera is far away

This is the main control for zooming the viewer in or out around the target object.

### What it does in practice

It changes the camera’s orbit radius, which means:

- you move closer to the model
- or pull back for a wider shot

This is the main “zoom” control in orbit-style navigation.

---

## 8. Horizontal Angle

```js
alpha: {
  label: "Horizontal Angle °",
  type: "Number",
  override: 1,
  frontConversion: (val) => {
    return radiantsToDegrees(val);
  },
  backConversion: (val) => {
    return degreesToRadiants(val);
  },
  showInEssentials: true,
},
```

### Functional meaning

- `alpha` is the camera’s horizontal orbit angle around the target.
- It controls the left/right rotation of the camera around the object.
- The UI displays it in degrees, but Babylon stores it internally in radians.

### Conversion logic

The app converts between display units and Babylon units:

- `radiantsToDegrees(val)` for display
- `degreesToRadiants(val)` for storing/internal use

This means the user sees a familiar degree value, but the camera logic works in radians internally.

### In practical terms

This is the horizontal pan/turn of the camera around the subject.

---

## 9. Vertical Angle

```js
beta: {
  label: "Vertical Angle °",
  type: "Number",
  frontConversion: (val) => {
    return radiantsToDegrees(val);
  },
  backConversion: (val) => {
    return degreesToRadiants(val);
  },
  override: 1,
  showInEssentials: true,
},
```

### Functional meaning

- `beta` is the vertical orbit angle.
- It controls the up/down tilt of the camera relative to the target.
- It determines whether the camera looks from above, below, or level.

### In practical terms

This is the up/down tilt control for the camera, used to frame the product from different vertical perspectives.

---

## 10. Target

```js
targetTitle: { label: "Target", type: "Title", showInEssentials: true },
"target.x": { label: "tX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
"target.y": { label: "tY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
"target.z": { label: "tZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },
```

### Functional meaning

These values are the 3D coordinates of the camera’s target point.

The `target` is the point the camera is orbiting around and looking at.

- `target.x` = X position
- `target.y` = Y position
- `target.z` = Z position

### Why it matters

- If the target is moved, the camera appears to orbit around a different point.
- This is the center of the view.
- It is often used when centering the product or adjusting the product framing.

This is one of the most important camera positioning settings in a 3D viewer.

---

## 11. Target Offset

```js
offTitle: { label: "Target Offset", type: "Title", showInEssentials: true },
"targetScreenOffset.x": { label: "oX", type: "Number", width: "half", labelColor: "#f55151", showInEssentials: true },
"targetScreenOffset.y": { label: "oY", type: "Number", width: "half", labelColor: "#00ff00", showInEssentials: true },
```

### Functional meaning

`targetScreenOffset` is a 2D offset of the camera focus point on the screen.

This does not move the 3D target in world space; it shifts how the camera targets relative to the screen.

- `x` controls left/right screen offset
- `y` controls up/down screen offset

This is especially useful for camera framing and subtle motion effects.

### Why the app uses it

The code later connects this to parallax behavior. The camera target is offset according to mouse position, which produces a small “hover” effect as the pointer moves across the viewport.

---

## 12. Effects section

The “Effects” settings are camera motion effects driven by mouse movement. They are defined under `arcRotateCameraProps` and are shown when the Essentials Scene view is active.

### A. Mouse Hover Parallax Effect

```js
targetScreenOffsetParallax: {
  group: "Effects",
  type: "Boolean",
  label: "Enable Mouse Hover Parallax Effect",
  onSet: ...
  onChange: ...
}
```

### Functional behavior

When enabled:

- it checks whether the device has hover support (`window.matchMedia("(hover: none)")`)
- it ignores the effect on touch-only devices or VR mode
- it listens to `mousemove`
- it calculates the pointer position relative to the center of the viewport
- it adjusts `node.targetScreenOffset.x` and `node.targetScreenOffset.y`
- the values are smoothed with an animation loop (`requestAnimationFrame`)

This creates a parallax-style camera target offset effect where the viewer “leans” slightly with the mouse.

### Sensitivity slider

```js
targetScreenParallaxSensitivity: {
  group: "Effects",
  label: "Mouse Hover Parallax Sensitivity",
  type: "Number",
  min: 0,
  max: 1,
  step: 0.01,
  override: 0.1,
  showInEssentials: true,
},
```

### Functional meaning

This controls how strongly the camera target shifts with mouse movement.

- 0 = almost no effect
- 1 = strong effect
- default is `0.1`

This is the “mouse hover” intensity control.

---

### B. Mouse Hover Orbit Effect

```js
orbitParallax: {
  group: "Effects",
  type: "Boolean",
  label: "Enable Mouse Hover Orbit Effect",
  onSet: ...
  onChange: ...
}
```

### Functional behavior

When enabled:

- it starts an animation loop to smoothly interpolate the camera angle
- it captures the mouse position relative to viewport center
- it updates `node.alpha` and `node.beta` based on pointer position
- the effect uses smoothing (`lerp`) to avoid jitter
- it stores and resets the center angle when mouseup occurs

This makes the camera orbit subtly with the cursor, as though the object is gently following the pointer.

### Sensitivity alpha and beta

```js
orbitParallaxSensitivityAlpha: {
  group: "Effects",
  label: "Mouse Hover Orbit Sensitivity Alpha",
  type: "Number",
  min: 0,
  max: 1,
  step: 0.01,
  override: 0.4,
  showInEssentials: true,
},

orbitParallaxSensitivityBeta: {
  group: "Effects",
  label: "Mouse Hover Orbit Sensitivity Beta",
  type: "Number",
  min: 0,
  max: 1,
  step: 0.01,
  override: 0.4,
  showInEssentials: true,
},
```

### Functional meaning

These tune how much the camera rotates horizontally and vertically as the mouse moves.

- Alpha controls horizontal orbit motion
- Beta controls vertical orbit motion
- Higher values = stronger motion
- Default is `0.4`

So the user can make the hover orbit very subtle or very dramatic.

---

## 13. Lens controls

The Lens section in the code is under the camera property schema and includes focal length and projection settings.

### A. Focal Length Desktop / Tablet / Mobile

```js
fovLarge: {
  group: "Lens",
  label: "Focal Length Desktop (mm)",
  type: "Number",
  frontConversion: (val) => {
    return radiantsToFocalLength(val);
  },
  backConversion: (val) => {
    return focalLengthToRadiants(val);
  },
  onSet: (scene, node, value) => {
    node.fovLarge = node.fov;
    const fun = () => {
      if (value !== null) {
        node.fovLarge = value;
        if (document.getElementById("renderCanvas")?.offsetWidth > 1024) {
          node.fov = node.fovLarge || node.fov;
        }
        if (document.getElementById("renderCanvas")?.offsetWidth <= 1024 && document.getElementById("renderCanvas")?.offsetWidth > 640) {
          node.fov = node.fovMedium || node.fov;
        }
        if (document.getElementById("renderCanvas")?.offsetWidth <= 640) {
          node.fov = node.fovSmall || node.fov;
        }
      }
    };
    fun();
  },
  showInEssentials: true,
},
```

Likewise for `fovMedium` and `fovSmall`:

- `Focal Length Tablet (mm)`
- `Focal Length Mobile (mm)`

### Functional meaning

These sliders are not arbitrary “zoom” values. They are focal length settings used to adapt the camera field-of-view based on viewport width.

Internally they are stored as radians, but the UI shows millimeters.

The code chooses the correct focal length based on screen width:

- Desktop: width > 1024
- Tablet: width between 641 and 1024
- Mobile: width <= 640

### Why this is useful

A 3D product viewer often needs different framing depending on the device size.

Examples:

- On desktop, a slightly wider shot may be preferred.
- On mobile, you may need a tighter framing or a different field of view.
- The app automatically swaps the active FOV based on the canvas width.

This is a responsive camera configuration.

---

### B. FOV Mode (Vertical / Horizontal)

```js
badFovMode: {
  group: "Lens",
  label: "Fov Mode",
  type: "Select",
  options: {
    FOVMODE_VERTICAL_FIXED: "Vertical",
    FOVMODE_HORIZONTAL_FIXED: "Horizontal",
  },
  onSet: (scene, node, value) => {
    if (value !== null) {
      if (value === "FOVMODE_HORIZONTAL_FIXED") {
        node.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED;
      }
      if (value === "FOVMODE_VERTICAL_FIXED") {
        node.fovMode = Camera.FOVMODE_VERTICAL_FIXED;
      }
      node.badFovMode = value;
    } else {
      node.fovMode = Camera.FOVMODE_VERTICAL_FIXED;
      node.badFovMode = "FOVMODE_VERTICAL_FIXED";
    }
  },
  showInEssentials: true,
},
```

### Functional meaning

This selects whether the camera keeps a fixed vertical or horizontal field of view.

- `Vertical` = the camera preserves the vertical FOV
- `Horizontal` = the camera preserves the horizontal FOV

This is important for product viewers where distortion or framing should remain consistent across different screen aspect ratios.

---

### C. Max Clip and Min Clip

```js
maxZ: { group: "Lens", label: "Max Clip", type: "Number", override: 10000, unit: "meters", showInEssentials: true },
minZ: { group: "Lens", label: "Min Clip", type: "Number", override: 0.1, unit: "meters", showInEssentials: true },
```

### Functional meaning

These are the far and near clipping planes of the camera.

- `Max Clip` = maximum distance visible by the camera; objects farther than this are not rendered
- `Min Clip` = minimum distance before objects disappear; very close objects may be clipped

This matters for:

- preventing extremely distant objects from being rendered
- controlling near-distance visibility
- managing performance and visual correctness

In a product viewer, this can be used to hide geometry that is too close or too far away from the active camera frame.

---

## 14. Limits section

The Limits controls constrain the camera’s orbit motion. They are essential for keeping users inside a safe 3D viewing range.

### A. Min Distance / Max Distance

```js
lowerRadiusLimit: { group: "Limits", label: "Min Distance", type: "Number", override: 0.1, showInEssentials: true },
upperRadiusLimit: { group: "Limits", label: "Max Distance", type: "Number", override: 10000, showInEssentials: true },
```

### Functional meaning

These constrain the camera `radius`:

- minimum allowed distance from the target
- maximum allowed distance from the target

This prevents a user from:

- zooming into the object too much
- zooming too far away so the object disappears or becomes tiny

This is one of the most important “viewer safety” settings.

---

### B. Min Horizontal Angle / Max Horizontal Angle

```js
lowerAlphaLimit: {
  group: "Limits",
  label: "Min Horizontal Angle °",
  type: "Number",
  frontConversion: (val) => {
    return radiantsToDegrees(val);
  },
  backConversion: (val) => {
    return degreesToRadiants(val);
  },
  showInEssentials: true,
},
upperAlphaLimit: {
  group: "Limits",
  label: "Max Horizontal Angle °",
  type: "Number",
  frontConversion: (val) => {
    return radiantsToDegrees(val);
  },
  backConversion: (val) => {
    return degreesToRadiants(val);
  },
  showInEssentials: true,
},
```

### Functional meaning

These set allowed horizontal orbital bounds.

- Minimum horizontal angle
- Maximum horizontal angle

This limits how far left/right the camera can spin around the target.

A product viewer often needs to prevent the user from rotating the camera too far around the back of the object or into awkward viewing angles.

### Clear button

```js
clearAlphaLimits: {
  group: "Limits",
  label: "Clear Horizonal Limits",
  type: "FunctionButton",
  function: (e, scene, node) => {
    node.upperAlphaLimit = null;
    node.lowerAlphaLimit = null;
  },
  showInEssentials: true,
},
```

### Meaning

This clears the horizontal angle limits, effectively allowing full rotation freedom again.

---

### C. Min Vertical Angle / Max Vertical Angle

```js
lowerBetaLimit: {
  group: "Limits",
  label: "Min Vertical Angle °",
  type: "Number",
  frontConversion: (val) => {
    return radiantsToDegrees(val);
  },
  backConversion: (val) => {
    return degreesToRadiants(val);
  },
  override: 0,
  showInEssentials: true,
},
upperBetaLimit: {
  group: "Limits",
  label: "Max Vertical Angle °",
  type: "Number",
  frontConversion: (val) => {
    return radiantsToDegrees(val);
  },
  backConversion: (val) => {
    return degreesToRadiants(val);
  },
  override: Math.PI,
  showInEssentials: true,
},
```

### Functional meaning

These define the allowed vertical orbit range.

- minimum vertical angle
- maximum vertical angle

This constrains the camera from going too high above or too low below the product.

### Default values

- `lowerBetaLimit = 0`
- `upperBetaLimit = Math.PI`

This means the default vertical limit is roughly from level to upside-down-ish viewing, but you can change it to keep the camera within a more controlled viewing window.

### Clear button

```js
clearBetaLimits: {
  group: "Limits",
  label: "Clear Vertical Limits",
  type: "FunctionButton",
  function: (e, scene, node) => {
    node.upperBetaLimit = Math.PI;
    node.lowerBetaLimit = 0;
  },
  showInEssentials: true,
},
```

### Meaning

This resets the vertical limit range back to its default safe values.

---

## 15. Your understanding: what is correct and what is slightly different

Your summary is close, but the actual codebase clarifies a few important details:

### Correct

- Transparent Background is a scene-level toggle.
- Background Color is the scene clear color.
- Camera controls are tied to the active camera.
- Distance = orbit radius.
- Horizontal angle = `alpha`.
- Vertical angle = `beta`.
- Target and target offset are real camera framing settings.
- Effects includes mouse hover parallax and mouse hover orbit behavior.
- Lens includes focal length for desktop/tablet/mobile and FOV mode.
- Limits include min/max orbit distance and angle clamps.

### Important nuance

The app does not treat these as generic UI labels only; they are directly binding to Babylon camera properties and live updating the camera object in real time.

For example:

- `alpha` and `beta` are converted from degrees to radians in the editor system.
- Focal length fields are displayed in mm but mapped to internal FOV values.
- The app dynamically switches focal length based on the canvas width.
- The camera target offset is not just a generic label; it is actively used for parallax effects.

---

## 16. Summary of the Scene section

The Scene section in the Essential tab is mainly a simplified control panel for:

1. background styling
2. active camera framing
3. camera motion behavior
4. lens / perspective settings
5. orbit range limits

In short, it is the controls for how the viewer sees the model and how much freedom the user has to orbit, zoom, and frame the object.

The key idea is that these are not decorative controls—they are real runtime camera and scene properties that directly affect how the 3D product viewer behaves.

---

## 17. Quick checklist

### Scene
- Transparent Background
- Background Color

### Camera
- Name
- Set From View
- Distance
- Horizontal Angle
- Vertical Angle
- Target
- Target Offset

### Effects
- Enable Mouse Hover Parallax Effect
- Mouse Hover Parallax Sensitivity
- Enable Mouse Hover Orbit Effect
- Orbit Sensitivity Alpha
- Orbit Sensitivity Beta

### Lens
- Focal Length Desktop
- Focal Length Tablet
- Focal Length Mobile
- FOV Mode: Vertical / Horizontal
- Max Clip
- Min Clip

### Limits
- Min Distance
- Max Distance
- Min Horizontal Angle
- Max Horizontal Angle
- Clear Horizontal Limits
- Min Vertical Angle
- Max Vertical Angle
- Clear Vertical Limits

That is the actual functional meaning of the Scene section in this codebase.
