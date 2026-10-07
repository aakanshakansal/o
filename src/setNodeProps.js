import { Color3, Color4, Vector2, Vector3 } from "@babylonjs/core";
import { getDeep, setDeep } from "./helpers";
export const setNodeProps = (scene, parentData, node, props) => {
  if (node === null || node === undefined || node.wasSet) {
    return;
  }

  //
  //node.wasSet = true;
  if (!node.displayName && node.name) {
    node.displayName = node.name;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("badCollections")) {
    node.badCollections = parentData[node.name].badCollections;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onLoadTrigger")) {
    node.onLoadTrigger = parentData[node.name].onLoadTrigger;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onBeforeFrameTrigger")) {
    node.onBeforeFrameTrigger = parentData[node.name].onBeforeFrameTrigger;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onAfterFrameTrigger")) {
    node.onAfterFrameTrigger = parentData[node.name].onAfterFrameTrigger;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onPointerPickTrigger")) {
    node.onPointerPickTrigger = parentData[node.name].onPointerPickTrigger;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onPointerDownTrigger")) {
    node.onPointerDownTrigger = parentData[node.name].onPointerDownTrigger;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onPointerMoveTrigger")) {
    node.onPointerMoveTrigger = parentData[node.name].onPointerMoveTrigger;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onPointerUpTrigger")) {
    node.onPointerUpTrigger = parentData[node.name].onPointerUpTrigger;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onPointerDoubleTapTrigger")) {
    node.onPointerDoubleTapTrigger = parentData[node.name].onPointerDoubleTapTrigger;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onPickTrigger")) {
    node.onPickTrigger = parentData[node.name].onPickTrigger;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onDoublePickTrigger")) {
    node.onDoublePickTrigger = parentData[node.name].onDoublePickTrigger;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onPointerOverTrigger")) {
    node.onPointerOverTrigger = parentData[node.name].onPointerOverTrigger;
  }
  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onPointerOutTrigger")) {
    node.onPointerOutTrigger = parentData[node.name].onPointerOutTrigger;
  }

  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onDragStartTrigger")) {
    node.onDragStartTrigger = parentData[node.name].onDragStartTrigger;
  }
  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onDragTrigger")) {
    node.onDragTrigger = parentData[node.name].onDragTrigger;
  }
  if (parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty("onDragEndTrigger")) {
    node.onDragEndTrigger = parentData[node.name].onDragEndTrigger;
  }

  if (parentData && parentData.hasOwnProperty(node.name)) {
    Object.entries(parentData[node.name]).forEach(([key, value]) => {
      if (key.indexOf("REF") !== -1) {
        node[key] = value;
      }
    });
  }

  Object.entries(props).forEach(([k, v], i) => {
    try {
      const hasOverride = v.hasOwnProperty("override");

      let value =
        parentData && parentData.hasOwnProperty(node.name) && parentData[node.name].hasOwnProperty(k)
          ? parentData[node.name][k]
          : hasOverride
            ? v.override
            : null;

      if (node.hasOwnProperty("badChanges") && node.badChanges !== null && node.badChanges.hasOwnProperty(k)) {
        value = node.badChanges[k];
      }

      if (v.onSet) {
        return v.onSet(scene, node, value);
      }
      if (v.type === "String" || v.type === "Select") {
        if (value !== null) {
          return setDeep(node, k, value);
        }
      }

      if (v.type === "Number" || v.type === "Range") {
        if (value !== null) {
          const parsed = parseFloat(value);
          return setDeep(node, k, Number.isFinite(parsed) ? parsed : (Number.isFinite(v.default) ? v.default : 0));
        }
      }
      if (v.type === "AssetReference") {
        if (value !== null) {
          return setDeep(node, k, value);
        }
      }
      if (v.type === "MeshesArrayReference") {
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

      if (v.type === "Boolean") {
        if (value !== null) {
          return setDeep(node, k, Boolean(value));
        }
      }
      // if (v.type === "Object") {
      //   node[k].name = k;
      //   if (!parentData) {
      //     return;
      //   }
      //   return setNodeProps(scene, parentData[node.name], node[k], v.props);
      // }

      if (v.type === "Vector3") {
        if (value !== null) {
          const vx = parseFloat(value.x);
          const vy = parseFloat(value.y);
          const vz = parseFloat(value.z);
          return setDeep(node, k, new Vector3(
            Number.isFinite(vx) ? vx : 0,
            Number.isFinite(vy) ? vy : 0,
            Number.isFinite(vz) ? vz : 0
          ));
        }
      }

      if (v.type === "Vector2") {
        if (value !== null) {
          const vx = parseFloat(value.x);
          const vy = parseFloat(value.y);
          return setDeep(node, k, new Vector2(
            Number.isFinite(vx) ? vx : 0,
            Number.isFinite(vy) ? vy : 0
          ));
        }
      }

      if (v.type === "Color3") {
        if (value !== null) {
          return setDeep(node, k, Color3.FromHexString(value).toLinearSpace());
        }
      }
      if (v.type === "Color4") {
        if (value !== null) {
          return setDeep(node, k, Color4.FromHexString(value).toLinearSpace());
        }
      }

      if (v.type === "Material") {
        if (value !== null) {
          if (value === "$NULL$") {
            return setDeep(node, k, null);
          }
          if (scene.getMaterialByName(value)) {
            return setDeep(node, k, scene.getMaterialByName(value));
          }
        }
      }
      if (v.type === "Texture") {
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
      console.warn(k, v);
      console.warn(error);
    }
  });

  //  node.wasSet = true;
};

export const getNodeData = (node, props) => {
  const data = {};

  Object.entries(props).forEach(([propk, propv], i) => {
    try {
      if (node === null || node === undefined) {
        return;
      }

      if (getDeep(node, propk) === undefined) {
        return;
      }

      if (getDeep(node, propk) === null) {
        return (data[propk] = "$NULL$");
      }

      if (propv.type === "AssetReference") {
        return (data[propk + "REF"] = node[propk + "REF"]);
      }

      if (propv.type === "Color3") {
        return (data[propk] = getDeep(node, propk).toGammaSpace().toHexString());
      }

      if (propv.type === "Texture") {
        return (data[propk] = getDeep(node, propk).name);
      }

      if (propv.type === "Material") {
        return (data[propk] = getDeep(node, propk).name);
      }

      if (propv.type === "String" || propv.type === "Select" || propv.type === "Number" || propv.type === "Range" || propv.type === "Boolean") {
        return (data[propk] = getDeep(node, propk));
      }

      return;
    } catch (error) {
      console.warn(error);
    }
  });

  return data;
};
