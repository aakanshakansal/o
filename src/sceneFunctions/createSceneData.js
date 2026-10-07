import { isLocalhost } from "../helpers";
import {
  PBRMaterialProps,
  arcRotateCameraProps,
  colorGradingtextureProps,
  cubeTextureProps,
  diamondMaterialProps,
  directionalLightProps,
  dynamicTextureProps,
  effectsProps,
  engineProps,
  gSplatProps,
  hdrCubeTextureProps,
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

import merge from "deepmerge";

const buildMaterialCatalog = (scene) => {
  const catalog = {};

  const registerMaterial = (material, mesh) => {
    if (!material || !material.name) {
      return;
    }

    if (!catalog[material.name]) {
      const sourceId = material.fromAsset || null;
      catalog[material.name] = {
        name: material.name,
        displayName: material.displayName || material.name,
        type: typeof material.getClassName === "function" ? material.getClassName() : "UnknownMaterial",
        fromAsset: sourceId,
        sourceType: sourceId ? "asset" : "scene",
        sourceId: sourceId || "scene",
        sourceLabel: sourceId ? sourceId : "Scene",
        meshNames: [],
        meshDisplayNames: [],
        meshCount: 0,
      };
    }

    if (mesh && mesh.name && !catalog[material.name].meshNames.includes(mesh.name)) {
      catalog[material.name].meshNames.push(mesh.name);
      catalog[material.name].meshDisplayNames.push(mesh.displayName || mesh.name);
      catalog[material.name].meshCount = catalog[material.name].meshNames.length;
    }
  };

  scene.meshes.forEach((mesh) => {
    const meshMaterial = mesh.material;

    if (!meshMaterial) {
      return;
    }

    if (meshMaterial.getClassName && meshMaterial.getClassName() === "MultiMaterial" && Array.isArray(meshMaterial.subMaterials)) {
      meshMaterial.subMaterials.forEach((subMaterial) => registerMaterial(subMaterial, mesh));
      return;
    }

    registerMaterial(meshMaterial, mesh);
  });

  scene.materials.forEach((material) => {
    registerMaterial(material, null);
  });

  Object.values(catalog).forEach((entry) => {
    entry.meshNames.sort();
    entry.meshDisplayNames.sort();
  });

  return catalog;
};

const setChanges = (data, node, props) => {
  Object.entries(props).forEach(([propk, propv], i) => {
    // if (propv.type === "Object" && node[propk].hasOwnProperty("badChanges")) {
    //   data[propk] = {};
    //   return setChanges(data[propk], node[propk], propv.props);
    // }
    if (node === null || node === undefined) {
      return;
    }

    if (node.hasOwnProperty("badChanges") && node.badChanges.hasOwnProperty(propk)) {
      if (propv.type === "Number") {
        return (data[propk] = parseFloat(node.badChanges[propk]));
      }
      if (propv.type === "Boolean") {
        return (data[propk] = Boolean(node.badChanges[propk]));
      }
      if (propv.type === "AssetReference") {
        //  data[propk] = node.badChanges[propk];
        data[propk] = node.badChanges[propk];
        return (data[propk + "REF"] = node.badChanges[propk + "REF"]);
      }

      return (data[propk] = node.badChanges[propk]);
    }
  });
};

export const createSceneData = (scene, prevSceneData) => {
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
        name: n.displayName,
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

    if (n.getClassName() === "InstancedMesh") {
      setChanges(sceneData.nodes[n.name], n, transformNodeProps);
      if (n.hasOwnProperty("instanceOf")) {
        sceneData.nodes[n.name].instanceOf = n.instanceOf;
      }
    }

    if (n.getClassName() === "GSplat") {
      setChanges(sceneData.nodes[n.name], n, gSplatProps);
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
        name: n.displayName,
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
    if (n.getClassName() === "DiamondMaterial") {
      setChanges(sceneData.materials[n.name], n, diamondMaterialProps);
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
    if (n.getClassName() === "HDRCubeTexture") {
      setChanges(sceneData.textures[n.name], n, hdrCubeTextureProps);
    }
    if (n.getClassName() === "ColorGradingTexture") {
      setChanges(sceneData.textures[n.name], n, colorGradingtextureProps);
    }
    if (n.getClassName() === "VideoTexture") {
      setChanges(sceneData.textures[n.name], n, videoTextureProps);
    }
    if (n.getClassName() === "DynamicTexture") {
      setChanges(sceneData.textures[n.name], n, dynamicTextureProps);
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

    if (n.hasOwnProperty("cloneOf")) {
      sceneData.lights[n.name].cloneOf = n.cloneOf;
    }
    if (n.hasOwnProperty("fromAsset")) {
      sceneData.lights[n.name].fromAsset = n.fromAsset;
    }

    if (Object.keys(sceneData.lights[n.name]).length === 0) {
      return delete sceneData.lights[n.name];
    }

    return (sceneData.lights[n.name].type = n.getClassName());
  });

  scene.mainSoundTrack.soundCollection.forEach((n, i) => {
    sceneData.sounds[n.name] = {};
    if (n.getClassName() === "Sound") {
      setChanges(sceneData.sounds[n.name], n, soundProps);
    }

    if (n.hasOwnProperty("fromAsset")) {
      sceneData.sounds[n.name].fromAsset = n.fromAsset;
    }

    if (Object.keys(sceneData.sounds[n.name]).length === 0) {
      return delete sceneData.sounds[n.name];
    }
    return (sceneData.sounds[n.name].type = n.getClassName());
  });

  Object.entries(scene.variables).forEach(([k, n], i) => {
    sceneData.variables[n.name] = {};

    setChanges(sceneData.variables[n.name], n, variableProps);

    if (Object.keys(sceneData.variables[n.name]).length === 0) {
      return delete sceneData.variables[n.name];
    }

    return (sceneData.variables[n.name].type = n.getClassName());
  });

  Object.entries(scene.animationGroups).forEach(([k, n], i) => {
    sceneData.animationGroups[n.name] = {};

    setChanges(sceneData.animationGroups[n.name], n, variableProps);

    if (Object.keys(sceneData.animationGroups[n.name]).length === 0) {
      return delete sceneData.animationGroups[n.name];
    }

    return (sceneData.animationGroups[n.name].type = n.getClassName());
  });

  sceneData.scene.type = scene.getClassName();
  if (scene.hasOwnProperty("onLoadTrigger") && scene.onLoadTrigger.length) {
    sceneData.scene.onLoadTrigger = scene.onLoadTrigger;
  }

  if (scene.hasOwnProperty("onBeforeFrameTrigger") && scene.onBeforeFrameTrigger.length) {
    sceneData.scene.onBeforeFrameTrigger = scene.onBeforeFrameTrigger;
  }

  if (scene.hasOwnProperty("onAfterFrameTrigger") && scene.onAfterFrameTrigger.length) {
    sceneData.scene.onAfterFrameTrigger = scene.onAfterFrameTrigger;
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
  // if (scene.effects) {
  sceneData.effects.type = scene.effects.getClassName();
  setChanges(sceneData.effects, scene.effects, effectsProps);
  // }
  const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;

  const mergedData = merge(prevSceneData, sceneData, { arrayMerge: overwriteMerge });

  mergedData.actions = scene.actions;
  Object.entries(mergedData.actions).forEach(([k, v]) => {
    // if (v.hasOwnProperty("nodePosition")) delete v.nodePosition;
    if (v.hasOwnProperty("getClassName")) delete v.getClassName;
    if (v.hasOwnProperty("badChanges")) delete v.badChanges;
  });
  mergedData.overlays = scene.overlays;
  Object.entries(mergedData.overlays).forEach(([k, v]) => {
    // if (v.hasOwnProperty("nodePosition")) delete v.nodePosition;
    if (v.hasOwnProperty("getClassName")) delete v.getClassName;
    if (v.hasOwnProperty("badChanges")) delete v.badChanges;
  });

  mergedData.controlNodes = scene.controlNodes;
  Object.entries(mergedData.controlNodes).forEach(([k, v]) => {
    // if (v.hasOwnProperty("nodePosition")) delete v.nodePosition;
    if (v.hasOwnProperty("getClassName")) delete v.getClassName;
    if (v.hasOwnProperty("badChanges")) delete v.badChanges;
  });

  mergedData.collections = scene.collections;
  Object.entries(mergedData.collections).forEach(([k, v]) => {
    // if (v.hasOwnProperty("nodePosition")) delete v.nodePosition;
    if (v.hasOwnProperty("getClassName")) delete v.getClassName;
    if (v.hasOwnProperty("badChanges")) delete v.badChanges;
  });

  // mergedData.variables = scene.variables;
  // Object.entries(mergedData.variables).forEach(([k, v]) => {
  //   // if (v.hasOwnProperty("nodePosition")) delete v.nodePosition;
  //   if (v.hasOwnProperty("badChanges")) delete v.badChanges;
  // });

  mergedData.assets = tmpAssets;
  mergedData.materialCatalog = buildMaterialCatalog(scene);
  // if (scene.sceneOverlayData) {
  //   mergedData.sceneOverlay = scene.sceneOverlayData;
  // }
  // if (scene.sceneLoadingData) {
  //   mergedData.sceneLoading = scene.sceneLoadingData;
  // }

  Object.entries(mergedData.nodes).forEach(([k, v], i) => {
    if (!scene.getMeshByName(k) && !scene.getTransformNodeByName(k)) {
      return delete mergedData.nodes[k];
    }
  });

  Object.entries(mergedData.materials).forEach(([k, v], i) => {
    if (!scene.getMaterialByName(k)) {
      return delete mergedData.materials[k];
    }
  });

  Object.entries(mergedData.textures).forEach(([k, v], i) => {
    if (!scene.getTextureByName(k)) {
      return delete mergedData.textures[k];
    }
  });
  Object.entries(mergedData.cameras).forEach(([k, v], i) => {
    if (!scene.getCameraByName(k)) {
      return delete mergedData.cameras[k];
    }
  });

  Object.entries(mergedData.lights).forEach(([k, v], i) => {
    if (!scene.getLightByName(k)) {
      return delete mergedData.lights[k];
    }
  });

  Object.entries(mergedData.variables).forEach(([k, v], i) => {
    if (scene.variables[k] === undefined) {
      return delete mergedData.variables[k];
    }
  });

  if (isLocalhost) {
    console.log("Scene Data Created:", mergedData);
  }
  return mergedData;
};
