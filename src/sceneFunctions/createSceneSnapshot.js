import { getDeep } from "../helpers";
import {
  PBRMaterialProps,
  arcRotateCameraProps,
  cubeTextureProps,
  directionalLightProps,
  effectsProps,
  engineProps,
  gSplatProps,
  hemisphericLightProps,
  meshProps,
  photoDomeProps,
  pointLightProps,
  sceneProps,
  shaderMaterialProps,
  shadowOnlyMaterialProps,
  soundProps,
  spotLightProps,
  textureProps,
  transformNodeProps,
  transmissionMaterialProps,
  universalCameraProps,
  variableProps,
  videoTextureProps,
} from "../nodesProps";

import { cloneDeep } from "lodash";
const setChanges = (data, node, props) => {
  Object.entries(props).forEach(([propk, propv], i) => {
    if (node === null || node === undefined) {
      return;
    }

    if (getDeep(node, propk) === undefined) {
      return;
    }

    if (getDeep(node, propk) === null) {
      return (data[propk] = "$NULL$");
    }

    if (
      getDeep(node, propk).constructor.name === "String" ||
      getDeep(node, propk).constructor.name === "Number" ||
      getDeep(node, propk).constructor.name === "Boolean"
    ) {
      if (propv.type === "AssetReference") {
        return (data[propk + "REF"] = node[propk + "REF"]);
      }
      return (data[propk] = getDeep(node, propk));
    }

    if (getDeep(node, propk).constructor.name === "Color3") {
      return (data[propk] = getDeep(node, propk).toGammaSpace().toHexString());
    }

    return;
  });
};

export const createSceneSnapShot = (s) => {
  const scene = cloneDeep(s);

  const sceneData = {
    engine: {},
    scene: {},
    assets: {},
    nodes: {},
    materials: {},
    lights: {},
    textures: {},
    cameras: {},
    effects: {},
    actions: {},
    sounds: {},
    variables: {},
    animationGroups: {},
  };

  const tmpAssets = {};

  scene.meshes.forEach((n, i) => {
    if (n.isAsset) {
      tmpAssets[n.name] = {
        assetREF: n.REF,
        name: n.displayName || n.name,
      };
    }

    sceneData.nodes[n.name] = {};

    if (n.hasOwnProperty("onPickTrigger") && n.onPickTrigger.length) {
      sceneData.nodes[n.name].onPickTrigger = n.onPickTrigger;
    }
    if (n.hasOwnProperty("onDoublePickTrigger") && n.onDoublePickTrigger.length) {
      sceneData.nodes[n.name].onDoublePickTrigger = n.onDoublePickTrigger;
    }
    if (n.hasOwnProperty("onPointerOverTrigger") && n.onPointerOverTrigger.length) {
      sceneData.nodes[n.name].onPointerOverTrigger = n.onPointerOverTrigger;
    }
    if (n.hasOwnProperty("onPointerOutTrigger") && n.onPointerOutTrigger.length) {
      sceneData.nodes[n.name].onPointerOutTrigger = n.onPointerOutTrigger;
    }

    if (n.hasOwnProperty("onDragStartTrigger") && n.onDragStartTrigger.length) {
      sceneData.nodes[n.name].onDragStartTrigger = n.onDragStartTrigger;
    }
    if (n.hasOwnProperty("onDragTrigger") && n.onDragTrigger.length) {
      sceneData.nodes[n.name].onDragTrigger = n.onDragTrigger;
    }
    if (n.hasOwnProperty("onDragEndTrigger") && n.onDragEndTrigger.length) {
      sceneData.nodes[n.name].onDragEndTrigger = n.onDragEndTrigger;
    }

    if (n.getClassName() === "Mesh") {
      setChanges(sceneData.nodes[n.name], n, meshProps);
      if (n.hasOwnProperty("cloneOf")) {
        sceneData.nodes[n.name].cloneOf = n.cloneOf;
      }
    }

    if (n.getClassName() === "3DText") {
      setChanges(sceneData.nodes[n.name], n, meshProps);
      if (n.hasOwnProperty("cloneOf")) {
        sceneData.nodes[n.name].cloneOf = n.cloneOf;
      }
    }

    if (n.getClassName() === "GSplat") {
      setChanges(sceneData.nodes[n.name], n, gSplatProps);
      if (n.hasOwnProperty("cloneOf")) {
        sceneData.nodes[n.name].cloneOf = n.cloneOf;
      }
    }

    if (n.getClassName() === "InstancedMesh") {
      setChanges(sceneData.nodes[n.name], n, transformNodeProps);
      if (n.hasOwnProperty("instanceOf")) {
        sceneData.nodes[n.name].instanceOf = n.instanceOf;
      }
    }

    if (Object.keys(sceneData.nodes[n.name]).length === 0) {
      return delete sceneData.nodes[n.name];
    }
    if (n.hasOwnProperty("fromAsset")) {
      sceneData.nodes[n.name].fromAsset = n.fromAsset;
    }
    return (sceneData.nodes[n.name].type = n.getClassName());
  });

  scene.transformNodes.forEach((n, i) => {
    if (n.isAsset) {
      tmpAssets[n.name] = {
        assetREF: n.REF,
      };
    }

    sceneData.nodes[n.name] = {};

    if (n.getClassName() === "TransformNode") {
      setChanges(sceneData.nodes[n.name], n, transformNodeProps);
      if (n.hasOwnProperty("cloneOf")) {
        sceneData.nodes[n.name].cloneOf = n.cloneOf;
      }
    }

    if (n.getClassName() === "PhotoDome") {
      setChanges(sceneData.nodes[n.name], n, photoDomeProps);
      if (n.hasOwnProperty("cloneOf")) {
        sceneData.nodes[n.name].cloneOf = n.cloneOf;
      }
    }
    if (Object.keys(sceneData.nodes[n.name]).length === 0) {
      return delete sceneData.nodes[n.name];
    }
    if (n.hasOwnProperty("fromAsset")) {
      sceneData.nodes[n.name].fromAsset = n.fromAsset;
    }
    return (sceneData.nodes[n.name].type = n.getClassName());
  });

  scene.materials.forEach((n, i) => {
    sceneData.materials[n.name] = {};
    if (n.getClassName() === "PBRMaterial") {
      setChanges(sceneData.materials[n.name], n, PBRMaterialProps);
    }

    if (n.getClassName() === "ShadowOnlyMaterial") {
      setChanges(sceneData.materials[n.name], n, shadowOnlyMaterialProps);
    }

    if (n.getClassName() === "ShaderMaterial") {
      setChanges(sceneData.materials[n.name], n, shaderMaterialProps);
    }

    if (n.getClassName() === "TransmissionMaterial") {
      setChanges(sceneData.materials[n.name], n, transmissionMaterialProps);
    }
    if (Object.keys(sceneData.materials[n.name]).length === 0) {
      return delete sceneData.materials[n.name];
    }

    if (n.hasOwnProperty("cloneOf")) {
      sceneData.materials[n.name].cloneOf = n.cloneOf;
    }
    if (n.hasOwnProperty("fromAsset")) {
      sceneData.materials[n.name].fromAsset = n.fromAsset;
    }
    return (sceneData.materials[n.name].type = n.getClassName());
  });

  scene.textures.forEach((n, i) => {
    sceneData.textures[n.name] = {};
    if (n.getClassName() === "Texture") {
      setChanges(sceneData.textures[n.name], n, textureProps);
    }
    if (n.getClassName() === "CubeTexture") {
      setChanges(sceneData.textures[n.name], n, cubeTextureProps);
    }
    if (n.getClassName() === "VideoTexture") {
      setChanges(sceneData.textures[n.name], n, videoTextureProps);
    }

    if (Object.keys(sceneData.textures[n.name]).length === 0) {
      return delete sceneData.textures[n.name];
    }

    if (n.hasOwnProperty("fromAsset")) {
      sceneData.textures[n.name].fromAsset = n.fromAsset;
    }
    return (sceneData.textures[n.name].type = n.getClassName());
  });

  scene.cameras.forEach((n, i) => {
    sceneData.cameras[n.name] = {};
    if (n.getClassName() === "ArcRotateCamera") {
      setChanges(sceneData.cameras[n.name], n, arcRotateCameraProps);
    }
    if (n.getClassName() === "UniversalCamera" || n.getClassName() === "FreeCamera") {
      setChanges(sceneData.cameras[n.name], n, universalCameraProps);
    }
    if (Object.keys(sceneData.cameras[n.name]).length === 0) {
      return delete sceneData.cameras[n.name];
    }

    if (n.hasOwnProperty("cloneOf")) {
      sceneData.cameras[n.name].cloneOf = n.cloneOf;
    }

    if (n.hasOwnProperty("fromAsset")) {
      sceneData.cameras[n.name].fromAsset = n.fromAsset;
    }
    return (sceneData.cameras[n.name].type = n.getClassName());
  });

  scene.lights.forEach((n, i) => {
    sceneData.lights[n.name] = {};
    if (n.getClassName() === "PointLight") {
      setChanges(sceneData.lights[n.name], n, pointLightProps);
    }
    if (n.getClassName() === "DirectionalLight") {
      setChanges(sceneData.lights[n.name], n, directionalLightProps);
    }
    if (n.getClassName() === "SpotLight") {
      setChanges(sceneData.lights[n.name], n, spotLightProps);
    }
    if (n.getClassName() === "HemisphericLight") {
      setChanges(sceneData.lights[n.name], n, hemisphericLightProps);
    }
    if (Object.keys(sceneData.lights[n.name]).length === 0) {
      return delete sceneData.lights[n.name];
    }

    if (n.hasOwnProperty("cloneOf")) {
      sceneData.lights[n.name].cloneOf = n.cloneOf;
    }
    if (n.hasOwnProperty("fromAsset")) {
      sceneData.lights[n.name].fromAsset = n.fromAsset;
    }

    return (sceneData.lights[n.name].type = n.getClassName());
  });

  scene.mainSoundTrack.soundCollection.forEach((n, i) => {
    sceneData.sounds[n.name] = {};
    if (n.getClassName() === "Sound") {
      setChanges(sceneData.sounds[n.name], n, soundProps);
    }

    if (Object.keys(sceneData.sounds[n.name]).length === 0) {
      return delete sceneData.sounds[n.name];
    }
    if (n.hasOwnProperty("fromAsset")) {
      sceneData.sounds[n.name].fromAsset = n.fromAsset;
    }
    return (sceneData.sounds[n.name].type = n.getClassName());
  });

  Object.entries(scene.variables).forEach(([k, n], i) => {
    sceneData.variables[n.name] = {};

    setChanges(sceneData.variables[n.name], n, variableProps);

    if (Object.keys(sceneData.variables[n.name]).length === 0) {
      return delete sceneData.variables[n.name];
    }
    if (n.hasOwnProperty("fromAsset")) {
      sceneData.variables[n.name].fromAsset = n.fromAsset;
    }
    return (sceneData.variables[n.name].type = n.getClassName());
  });

  Object.entries(scene.animationGroups).forEach(([k, n], i) => {
    sceneData.animationGroups[n.name] = {};

    setChanges(sceneData.animationGroups[n.name], n, variableProps);

    if (Object.keys(sceneData.animationGroups[n.name]).length === 0) {
      return delete sceneData.animationGroups[n.name];
    }
    if (n.hasOwnProperty("fromAsset")) {
      sceneData.animationGroups[n.name].fromAsset = n.fromAsset;
    }
    return (sceneData.animationGroups[n.name].type = n.getClassName());
  });

  sceneData.scene.type = scene.getClassName();
  if (scene.hasOwnProperty("onLoadTrigger") && scene.onLoadTrigger.length) {
    sceneData.scene.onLoadTrigger = scene.onLoadTrigger;
  }
  if (scene.hasOwnProperty("onPointerPickTrigger") && scene.onPointerPickTrigger.length) {
    sceneData.scene.onPointerPickTrigger = scene.onPointerPickTrigger;
  }
  if (scene.hasOwnProperty("onPointerDownTrigger") && scene.onPointerDownTrigger.length) {
    sceneData.scene.onPointerDownTrigger = scene.onPointerDownTrigger;
  }
  if (scene.hasOwnProperty("onPointerMoveTrigger") && scene.onPointerMoveTrigger.length) {
    sceneData.scene.onPointerMoveTrigger = scene.onPointerMoveTrigger;
  }
  if (scene.hasOwnProperty("onPointerUpTrigger") && scene.onPointerUpTrigger.length) {
    sceneData.scene.onPointerUpTrigger = scene.onPointerUpTrigger;
  }
  if (scene.hasOwnProperty("onPointerDoubleTapTrigger") && scene.onPointerDoubleTapTrigger.length) {
    sceneData.scene.onPointerDoubleTapTrigger = scene.onPointerDoubleTapTrigger;
  }
  setChanges(sceneData.scene, scene, sceneProps);

  sceneData.engine.type = scene.getEngine().getClassName();
  setChanges(sceneData.engine, scene.getEngine(), engineProps);

  sceneData.effects.type = scene.effects.getClassName();
  setChanges(sceneData.effects, scene.effects, effectsProps);

  sceneData.actions = scene.actions;
  Object.entries(sceneData.actions).forEach(([k, v]) => {
    // if (v.hasOwnProperty("nodePosition")) delete v.nodePosition;
    if (v.hasOwnProperty("getClassName")) delete v.getClassName;
  });
  sceneData.overlays = scene.overlays;
  Object.entries(sceneData.overlays).forEach(([k, v]) => {
    // if (v.hasOwnProperty("nodePosition")) delete v.nodePosition;
    if (v.hasOwnProperty("getClassName")) delete v.getClassName;
  });
  sceneData.controlNodes = scene.controlNodes;
  Object.entries(sceneData.controlNodes).forEach(([k, v]) => {
    // if (v.hasOwnProperty("nodePosition")) delete v.nodePosition;
    if (v.hasOwnProperty("getClassName")) delete v.getClassName;
  });

  sceneData.collections = scene.collections;
  Object.entries(sceneData.collections).forEach(([k, v]) => {
    // if (v.hasOwnProperty("nodePosition")) delete v.nodePosition;
    if (v.hasOwnProperty("getClassName")) delete v.getClassName;
  });

  sceneData.assets = tmpAssets;

  // if (isLocalhost) {
  //   console.log(JSON.stringify(sceneData));
  //   console.log(sceneData);
  // }
  return sceneData;
};
