import { Color3 } from "@babylonjs/core";
import {
  getIframeParentOrigin,
  getSceneElementByName,
  getSceneElementPropsByName,
  insertAssets,
  isTrustedParentMessageEvent,
  postToParentWindow,
  reportRuntimeDiagnostic,
  sanitizeFiniteNumber,
  setDeep,
  takeScreenshot,
} from "../helpers";
import { actionsDispatcher } from "./actionDispatcher";
import { createSceneData } from "./createSceneData";

export const postMessageApi = (e, scene) => {
  if (!isTrustedParentMessageEvent(e)) {
    reportRuntimeDiagnostic("postMessage rejected due to origin mismatch", {
      expectedOrigin: getIframeParentOrigin(),
      receivedOrigin: e?.origin,
      messageType: e?.data?.type,
    });
    return;
  }

  if (e.data.type === "takeScreenShot") {
    takeScreenshot(scene, 2048, 2048, 0.8).then((dataUrl) => {
      setTimeout(() => {
        postToParentWindow({ type: "screenShot", data: dataUrl });
      }, 1);
    });
  }

  if (e.data.type === "getSceneData") {
    const newData = createSceneData(scene, scene.sceneData);

    postToParentWindow({ type: "sceneData", data: newData });

    scene.sceneData = newData;
  }

  if (e.data.type === "removeAsset") {
    const asset = getSceneElementByName(scene, e.data.nodeName);

    asset.dispose(false, true);

    scene.badAssets[asset.name] = null;
    delete scene.badAssets[asset.name];
  }

  if (e && e.data !== undefined && e.data.type === "insertAssets") {
    // console.log("admin updating sceneData with:", event.data.data);
    insertAssets(e.data.data, scene);
  }
  if (e && e.data && typeof e.data === "object") {
    if (e.data.type === "animateOnScroll") {
      Object.entries(scene.actions).forEach(([k, v]) => {
        if (v.displayName === e.data.animateName) {
          actionsDispatcher(scene, scene.actions[k], { totalHeight: e.data.totalHeight, scrollPos: e.data.scrollPos });
        }
      });
    }

    if (e.data.type === "setNodeProp") {
      try {
        const nodeName = e.data.nodeName;

        // const k = e.data.prop;
        const value = e.data.value;

        const node = getSceneElementByName(scene, nodeName);
        const props = getSceneElementPropsByName(scene, nodeName);

        if (!node || !props) {
          return;
        }

        const propToChange = Object.entries(props).filter(([k2, v2]) => k2 === e.data.prop);

        const k = propToChange[0][0];

        const propType = propToChange[0][1].type;

        if (!node.badChanges) {
          node.badChanges = {};
        }

        node.badChanges[k] = value;

        if (propToChange[0][1].onSet) {
          return propToChange[0][1].onSet(scene, node, value);
        }

        if (propType === "String" || propType === "Select") {
          if (value !== null) {
            return setDeep(node, k, value);
          }
        }

        if (propType === "Number" || propType === "Range") {
          if (value !== null) {
            return setDeep(node, k, sanitizeFiniteNumber(value, 0));
          }
        }
        if (propType === "AssetReference") {
          if (value !== null) {
            return setDeep(node, k, value);
          }
        }
        if (propType === "MeshesArrayReference") {
          if (value !== null) {
            const array = [];
            value.forEach((m, i2) => {
              if (scene.getMeshByName(m)) {
                array.push(scene.getMeshByName(m));
              }
            });
            return setDeep(node, k, array);
          }
        }

        if (propType === "Boolean") {
          if (value !== null) {
            return setDeep(node, k, Boolean(value));
          }
        }

        if (propType === "Color3") {
          if (value !== null) {
            return setDeep(node, k, Color3.FromHexString(value).toLinearSpace());
          }
        }

        if (propType === "Material") {
          if (value !== null) {
            if (value === "$NULL$") {
              return setDeep(node, k, null);
            }
            if (scene.getMaterialByName(value)) {
              return setDeep(node, k, scene.getMaterialByName(value));
            }
          }
        }
        if (propType === "Texture") {
          if (value !== null) {
            if (value === "$NULL$") {
              return (node[k] = null);
            }
            if (scene.getTextureByName(value)) {
              return setDeep(node, k, scene.getTextureByName(value));
            }
          }
        }
      } catch (error) {
        console.warn(error);
      }
    }

    if (e.data.type === "startAction") {
      Object.entries(scene.actions).forEach(([k, v]) => {
        if (v.displayName === e.data.name) {
          actionsDispatcher(scene, scene.actions[k], { trackEvent: true });
        }
      });
    }
  }
};
