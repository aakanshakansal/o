# Texture System in Badvisor

This document explains where texture data comes from, how the editor creates it, how it is stored, and how the texture options appear in both the Element section and the Outliner / node list.

---

## 1. What a texture is in this project

A texture is a Babylon.js image resource used to decorate or drive surface behavior in a 3D scene. In this app, textures are not only static image files; they also include:

- regular image textures
- cube / environment textures
- HDR environment textures
- video textures
- dynamically generated canvas textures
- color grading LUT textures

The main implementation is in:

- `src/sceneFunctions/createSceneElements.js`
- `src/nodesProps.js`
- `src/modules/editor/Elements.jsx`
- `src/modules/editor/Lists/TexturesList.jsx`
- `src/modules/editor/Nodes/TextureNode.jsx`
- `src/modules/editor/createNode.jsx`
- `src/sceneFunctions/setScene.js`

These are the actual sources for texture creation and editing.

---

## 2. Which library is used

The app uses Babylon.js, specifically its texture classes from `@babylonjs/core`.

Relevant classes used in this project:

- `Texture`
- `CubeTexture`
- `HDRCubeTexture`
- `DynamicTexture`
- `VideoTexture`
- `ColorGradingTexture`

The texture factory functions are created in `src/sceneFunctions/createSceneElements.js`.

Examples:

```js
const texture = new Texture(url || fallbackTexture, scene, false, false);
const texture = new CubeTexture(url || fallbackTexture, scene, null, false, null, null, null, Constants.TEXTUREFORMAT_RGBA, false);
const texture = new HDRCubeTexture(url || fallbackTexture, scene, 128, false, true, false, true);
const texture = new DynamicTexture(id, { width: 1024, height: 1024 }, scene);
```

So the runtime texture engine is Babylon.js, not a custom rendering library.

---

## 3. Where the texture file comes from

### 3.1 Not a separate texture table

This project does not appear to have a dedicated standalone texture database table such as `textures` in SQL or a separate collection solely for texture metadata. Instead, textures are stored as part of the scene data model.

The project keeps them in a structure like:

```js
sceneData.textures
```

and then rebuilds the Babylon texture objects at runtime with `createTextures(scene, sceneData)` in `src/sceneFunctions/setScene.js`.

That means the texture lives in the scene definition, not in a special database table.

### 3.2 Asset references are stored in scene data

When a user picks an asset from the asset picker, the app captures the URL and reference id in the scene object:

```js
node.badChanges.url = url;
node.badChanges.urlREF = ref;
```

This is done in `createNode.jsx` for every texture type.

### 3.3 Firebase / Firestore is used for asset metadata

There are clear signs the app uses Firebase for asset records and storage metadata.

In `TextureNode.jsx`:

```js
import { doc, getDoc } from "firebase/firestore";
import { badDB, storageUrl } from "../../../Router";
```

and:

```js
const assetRef = doc(badDB, "assets", assetId);
getDoc(assetRef).then((doc) => {
  if (doc.data() && doc.data().thumbnail) {
    return setImageData(storageUrl + doc.data().thumbnail);
  }
});
```

This means:

- asset records are in Firestore under the `assets` collection
- thumbnails are served from `storageUrl`
- the editor reads metadata for the asset record and fetches the thumbnail preview

### 3.4 The app also loads external URLs directly

When an asset is selected, the code often uses:

```js
const url = v.customUrl || cleanFirebaseUrl(v.url);
```

That means textures may come from:

- Firebase Storage / backend file URLs
- custom uploaded URLs
- direct public URLs

The conversion is done by `cleanFirebaseUrl` in `src/helpers.js`, which normalizes Firebase URLs for runtime loading.

---

## 4. Supported texture formats

The allowed upload extensions are defined in `src/constants.js`:

```js
export const textureExtensions = ["jpg", "jpeg", "png", "webp", "bmp", "tiff", "gif", "svg", "ktx", "ktx2"];
export const colorGradingTextureExtensions = ["3dl"];
export const cubeTextureExtensions = ["env"];
export const hdrCubeTextureExtensions = ["hdr"];
export const videoTextureExtensions = ["mp4", "webm"];
```

This is important because the UI only lets users choose files with those extensions.

---

## 5. Element section: texture options

The Element panel is defined in `src/modules/editor/Elements.jsx`.

The texture section contains these entries:

### 5.1 Texture

- type: `Texture`
- icon: `texture`
- tooltip: "Image used to customize PBR material properties"
- created with `createTexture(scene, null, url)`

### 5.2 Cube Texture

- type: `CubeTexture`
- icon: `deployed_code`
- tooltip: "Image used for reflections and skyboxes. IBL Format"
- created with `createCubeTexture(scene, null, url)`

### 5.3 HDRCube Texture

- type: `HDRCubeTexture`
- icon: `deployed_code`
- tooltip: "Image used for reflections and skyboxes. HDR Format"
- created with `createHDRCubeTexture(scene, null, url)`

### 5.4 Video Texture

- type: `VideoTexture`
- icon: `movie`
- tooltip: "Allows videos to be played back within a PBR material channel."
- created with `createVideoTexture(scene, null, url)`

### 5.5 Dynamic Texture

- type: `DynamicTexture`
- icon: `text_fields`
- tooltip: "A dynamic texture works by creating a canvas onto which you can write text, change font and colors."
- created with `createDynamicTexture(scene, null, null)`

### 5.6 Color Grading Texture

- type: `ColorGradingTexture`
- icon: `gradient`
- tooltip: "A color grading texture can be used to achieve color correction instead of using curves. you can connect this texture in the section Effects > Image Processing > Color Grading Texture. (.3dl)"
- created with `crerateColorGradingTexture(scene, null, url)`

The actual creation flow is in `src/modules/editor/createNode.jsx`.

Example:

```js
if (type === "Texture") {
  scene.openPrompt("addAsset", {
    extensions: textureExtensions,
    callback: (data) => {
      data.forEach((v, i) => {
        const ref = v.id;
        const url = v.customUrl || cleanFirebaseUrl(v.url);
        const node = createTexture(scene, null, url);
        node.displayName = v.name;
        node.badChanges.url = url;
        node.badChanges.urlREF = ref;
        scene.openNode("Texture", node);
      });
    }
  });
}
```

So the Element panel is the main entry point for creating a texture resource.

---

## 6. Outliner / texture list section

The Outliner groups texture nodes in `src/modules/editor/Lists/TexturesList.jsx`.

This list:

- groups by `node.getClassName()`
- creates section headers for:
  - `Texture`
  - `VideoTexture`
  - `HDRCubeTexture`
  - `CubeTexture`
  - `ColorGradingTexture`
  - `DynamicTexture`
- shows the item in the texture list only when `node.fromAsset || node.isCustom || node.cloneOf`

The grouping logic is:

```js
const groups = groupBy(nodes, (node) => node.getClassName());
```

Examples of icons used:

- `Texture` → `texture`
- `VideoTexture` → `smart_display`
- `CubeTexture` / `HDRCubeTexture` → `deployed_code`
- `DynamicTexture` → `text_fields`
- `ColorGradingTexture` → `gradient`

This means the Outliner presents textures as a dedicated group, separate from materials, lights, meshes, and other editor objects.

---

## 7. Texture node editor panel

The texture node itself is rendered by `TextureNode.jsx`.

This component:

- shows a preview image thumbnail
- computes the material relationships
- lists materials using the texture
- allows drag-connect to materials
- displays the node type and id

Key details:

```js
const internalTexture = node.getInternalTexture();
```

The node retrieves the underlying Babylon texture and shows a preview via:

```js
const url = URL.createObjectURL(new Blob([internalTexture._buffer], { type: "image/jpg" }));
```

or via:

```js
setImageData(internalTexture.url);
```

It also searches the scene for materials bound to that texture:

```js
scene.materials.forEach((m) => {
  if (typeof m.getActiveTextures === "function" && m.getActiveTextures().length) {
    m.getActiveTextures().forEach((t) => {
      if (t.name === node.name) bindedMaterialsArr.push(m);
    });
  }
});
```

This shows the dependency relationship between texture and material in the editor UI.

---

## 8. Texture properties and editor fields

The property definitions live in `src/nodesProps.js`.

### 8.1 Standard Texture fields

`textureProps` includes:

- `displayName` → name
- `url` → image asset reference
- `getAlphaFromRGB` → use as alpha texture
- `level`
- `uScale`, `vScale`
- `uOffset`, `vOffset`
- `uAng`, `vAng`
- `coordinatesIndex` → UV channel
- `badNotes` → notes metadata

The `url` field is special:

```js
onSet: (scene, node, value) => {
  if (value !== null) {
    node.updateURL(value);
    node.url = value;
  }
}
```

This updates the Babylon texture URL live.

### 8.2 Cube / HDR Cube texture fields

These have:

- `displayName`
- `url`
- `level`
- `rotationY`
- `coordinatesIndex`
- `badNotes`

This is relevant for environment / reflection maps.

### 8.3 Video texture fields

`videoTextureProps` includes controls for:

- `play` → calls `node.video.play()`
- `pause` → calls `node.video.pause()`
- `stop` → pauses and resets time to `0`
- `muted`
- `loop`
- `autoPlay`
- `url` → video asset reference
- `coordinatesIndex`
- `badNotes`

This shows that video textures behave like interactive media assets, not just static textures.

### 8.4 Dynamic texture fields

`dynamicTextureProps` includes:

- `text`
- `fontFamily`
- `fontStyle`
- `fontColor`
- `autoSize`
- `fontSize`
- `level`
- `uScale`, `vScale`, `uOffset`, `vOffset`, `uAng`, `vAng`
- `coordinatesIndex`
- `badNotes`

Dynamic textures are rendered as canvas-based textures using a `DynamicTexture`, then redrawn when text/font/color changes.

Example:

```js
const drawDynamicTexture = (node) => {
  const ctx = node.getContext();
  ctx.font = fontStyle + " " + size + "px " + node.fontFamily;
  node.drawText(node.text, null, null, font, node.fontColor, "transparent", false, true);
};
```

---

## 9. Runtime creation and reconstruction

When the app loads a saved scene, it rebuilds textures from `sceneData.textures`.

This is done in `src/sceneFunctions/setScene.js`:

```js
export const createTextures = (scene, sceneData) => {
  if (sceneData.textures) {
    return Object.entries(sceneData.textures).forEach(([k, v], i) => {
      if (scene.getTextureByName(k)) {
        return;
      }
      if (v.type === "Texture" && !v.fromAsset && v.url) {
        return createTexture(scene, sceneData, v.url, k);
      }
      if (v.type === "VideoTexture" && !v.fromAsset && v.url) {
        return createVideoTexture(scene, sceneData, v.url, k);
      }
      if (v.type === "CubeTexture" && !v.fromAsset && v.url) {
        return createCubeTexture(scene, sceneData, v.url, k);
      }
      if (v.type === "HDRCubeTexture" && !v.fromAsset && v.url) {
        return createHDRCubeTexture(scene, sceneData, v.url, k);
      }
      if (v.type === "ColorGradingTexture" && !v.fromAsset && v.url) {
        return crerateColorGradingTexture(scene, sceneData, v.url, k);
      }
      if (v.type === "DynamicTexture" && !v.fromAsset) {
        return createDynamicTexture(scene, sceneData, k);
      }
    });
  }
};
```

This shows the project intentionally reconstructs any texture from the saved scene definition rather than keeping a persistent runtime texture database.

---

## 10. Summary

The texture system in Badvisor is a Babylon.js-driven runtime asset system with scene-based storage, not a separate custom texture database.

Key points:

- textures are created in `createSceneElements.js`
- their appearance and properties are configured in `nodesProps.js`
- the user adds them from the Element section in `Elements.jsx`
- they appear in the Outliner under `TexturesList.jsx`
- they are represented as Babylon textures under the scene and stored in `sceneData.textures`
- actual asset references usually live in Firebase/asset metadata and are resolved via URL + assetId
- texture previews and references are displayed in `TextureNode.jsx`

In short:

- Source of texture content: asset URL + Firebase asset metadata or a generated canvas
- Runtime engine: Babylon.js
- Storage: scene data (`sceneData.textures`), not a dedicated texture DB table
- UI entry points: Element panel and Outliner texture list
