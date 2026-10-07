import { ShadowGenerator, Tools } from "@babylonjs/core";

import fallbackTexture from "../fallbackTexture";
import {
  PBRMaterialProps,
  animationGroupProps,
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
  videoTextureProps,
} from "../nodesProps";
import { setNodeProps } from "../setNodeProps";

import { getSceneElementByName, getSceneElementPropsByName } from "../helpers";
import {
  create3DText,
  createArcRotateCamera,
  createCubeTexture,
  createDiamondMaterial,
  createDirectionalLight,
  createDynamicTexture,
  createEffects,
  createEnvironment,
  createGSplat,
  createHDRCubeTexture,
  createHemisphericLight,
  createLightClone,
  createMaterialClone,
  createMeshClone,
  createMeshInstance,
  createPBRMaterial,
  createPhotoDome,
  createPointLight,
  createShaderMaterial,
  createShadowOnlyMaterial,
  createSound,
  createSpotLight,
  createTexture,
  createTransformNodeClone,
  createTransmissionMaterial,
  createUniversalCamera,
  createVariable,
  createVideoTexture,
  crerateColorGradingTexture,
} from "./createSceneElements";

export const setNodes = (scene, parentData, nodes) => {
  if (!nodes) {
    return;
  }

  Object.entries(nodes).forEach(([key, node], i) => {
    if (node === null) {
      return;
    }
    const sceneNode = getSceneElementByName(scene, node.name);
    const nodeProps = getSceneElementPropsByName(scene, node.name);

    if (nodeProps) {
      var childNodes = null;
      if (typeof node.getDescendants === "function" && node.getDescendants(true).length) {
        childNodes = node.getDescendants(true);
      }

      if (parentData.cameras[node.name] && parentData.cameras[node.name].isDefault) {
        const canvas = node.getScene().getEngine().getRenderingCanvas();
        node.attachControl(canvas, true);
        scene.activeCamera = node;
      }

      if (node.getClassName() === "PointLight" || node.getClassName() === "DirectionalLight" || node.getClassName() === "SpotLight") {
        if (!node.hasOwnProperty("shadowGenerator")) {
          node.shadowGenerator = new ShadowGenerator(1024, node);
          node.shadowGenerator.useCloseExponentialShadowMap = true;
        }
      }

      setNodeProps(scene, parentData, sceneNode, nodeProps);

      if (childNodes) {
        setNodes(scene, parentData, childNodes);
      }
    }
  });
};

export const createCameras = (scene, sceneData) => {
  if (sceneData.camera) {
    if (sceneData.camera.type === "Orbit") {
      sceneData.camera.type = "ArcRotateCamera";
    }
    if (sceneData.camera.type === "FirstPerson") {
      sceneData.camera.type = "UniversalCamera";
    }
    sceneData.camera.isDefault = true;
    sceneData.cameras = { defaultCamera: sceneData.camera };

    if (sceneData.camera.additionalCameras) {
      Object.entries(sceneData.camera.additionalCameras).forEach(([k, v], i) => {
        sceneData.cameras[k] = v;
      });
    }
    delete sceneData.camera;
  }
  if (sceneData.cameras) {
    return Object.entries(sceneData.cameras).forEach(([k, v], i) => {
      if (scene.getCameraByName(k)) {
        return;
      }
      if (v.type === "ArcRotateCamera" && !v.fromAsset) {
        return createArcRotateCamera(scene, sceneData, k);
      }
      if (v.type === "UniversalCamera" && !v.fromAsset) {
        return createUniversalCamera(scene, sceneData, k);
      }
    });
  } else {
    return (sceneData.cameras = {});
  }
};
export const createLights = (scene, sceneData) => {
  if (sceneData.lights) {
    return Object.entries(sceneData.lights).forEach(([k, v], i) => {
      if (scene.getLightByName(k) || v.cloneOf) {
        return;
      }
      if (v.type === "PointLight" && !v.fromAsset) {
        return createPointLight(scene, sceneData, k);
      }
      if (v.type === "DirectionalLight" && !v.fromAsset) {
        return createDirectionalLight(scene, sceneData, k);
      }
      if (v.type === "HemisphericLight" && !v.fromAsset) {
        return createHemisphericLight(scene, sceneData, k);
      }
      if (v.type === "SpotLight" && !v.fromAsset) {
        return createSpotLight(scene, sceneData, k);
      }
    });
  } else {
    return (sceneData.lights = {});
  }
};
export const createSounds = (scene, sceneData) => {
  if (sceneData.sfx) {
    sceneData.sounds = sceneData.sfx;
  }
  if (sceneData.sounds) {
    return Object.entries(sceneData.sounds).forEach(([k, v], i) => {
      if (scene.getSoundByName(k)) {
        return;
      }
      if (v.type === "Sound" && !v.fromAsset && v.url) {
        return createSound(scene, sceneData, v.url, k);
      }
    });
  } else {
    return (sceneData.sounds = {});
  }
};

export const createMaterials = (scene, sceneData) => {
  if (sceneData.materials) {
    return Object.entries(sceneData.materials).forEach(([k, v], i) => {
      if (scene.getMaterialByName(k) || v.cloneOf) {
        return;
      }
      if (v.type === "PBRMaterial" && !v.fromAsset) {
        return createPBRMaterial(scene, sceneData, k);
      }
      if (v.type === "ShadowOnlyMaterial" && !v.fromAsset) {
        return createShadowOnlyMaterial(scene, sceneData, k);
      }
    });
  } else {
    return (sceneData.materials = {});
  }
};

export const createSpecialMaterials = (scene, sceneData) => {
  if (sceneData.materials) {
    return Object.entries(sceneData.materials).forEach(([k, v], i) => {
      if (scene.getMaterialByName(k) || v.cloneOf) {
        return;
      }

      if (v.type === "ShaderMaterial" && !v.fromAsset) {
        return createShaderMaterial(scene, sceneData, k);
      }
      if (v.type === "TransmissionMaterial" && !v.fromAsset) {
        return createTransmissionMaterial(scene, sceneData, k);
      }
      if (v.type === "DiamondMaterial" && !v.fromAsset) {
        return createDiamondMaterial(scene, sceneData, k);
      }
    });
  } else {
    return (sceneData.materials = {});
  }
};
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
  } else {
    return (sceneData.textures = {});
  }
};

export const createActions = (scene, sceneData) => {
  if (!scene.actions) {
    scene.actions = {};
  }
  if (sceneData.actions) {
    scene.actions = sceneData.actions;
  } else {
    sceneData.actions = {};
  }

  Object.values(scene.actions).forEach((a) => {
    a.getClassName = function () {
      return "Action";
    };
  });
};

export const createControlNodes = (scene, sceneData) => {
  if (!scene.controlNodes) {
    scene.controlNodes = {};
  }
  if (sceneData.controlNodes) {
    scene.controlNodes = sceneData.controlNodes;
  } else {
    sceneData.controlNodes = {};
  }

  Object.values(scene.controlNodes).forEach((a) => {
    a.getClassName = function () {
      return "ControlNode";
    };
  });
};

export const createVariables = (scene, sceneData) => {
  if (!scene.variables) {
    scene.variables = {};
  }
  if (sceneData.variables) {
    return Object.entries(sceneData.variables).forEach(([k, v], i) => {
      return createVariable(scene, sceneData, k);
    });
  } else {
    return (sceneData.variables = {});
  }
};

export const createCollections = (scene, sceneData) => {
  if (!scene.collections) {
    scene.collections = {};
  }
  if (sceneData.collections) {
    scene.collections = sceneData.collections;
  } else {
    sceneData.collections = {};
  }
  Object.values(scene.collections).forEach((a) => {
    a.getClassName = () => {
      return "Collection";
    };
  });
};

export const createOverlays = (scene, sceneData) => {
  if (!scene.overlays) {
    scene.overlays = {};
  }
  if (sceneData.overlays) {
    scene.overlays = sceneData.overlays;
  } else {
    sceneData.overlays = {};
  }
  Object.values(scene.overlays).forEach((a) => {
    a.getClassName = () => {
      return "Overlay";
    };
  });
};

export const setMeshes = (scene, sceneData, nodes) => {
  return Object.entries(nodes).forEach(([key, node], i) => {
    if (node === null) {
      return;
    }

    if (node.getClassName() === "Mesh") {
      console.log();
      if (window.location.search.indexOf("editmode=true") !== -1 || window.location.pathname === "/sandbox") {
      } else {
        node.isPickable = false;

        if (
          sceneData.nodes &&
          sceneData.nodes[node.name] &&
          (sceneData.nodes[node.name]["onPickTrigger"] ||
            sceneData.nodes[node.name]["onPointerOverTrigger"] ||
            sceneData.nodes[node.name]["onDoublePickTrigger"] ||
            sceneData.nodes[node.name]["onPointerOutTrigger"] ||
            sceneData.nodes[node.name]["onDragStartTrigger"] ||
            sceneData.nodes[node.name]["onDragTrigger"] ||
            sceneData.nodes[node.name]["onDragEndTrigger"])
        ) {
          node.isPickable = true;
        }

        if (window.location.search.indexOf("naked=true") !== -1) {
          node.isPickable = false;
        }

        Object.values(sceneData.cameras).forEach((c) => {
          if (c.hasOwnProperty("walkableMeshes") && c.walkableMeshes.includes(node.name)) {
            node.isPickable = true;
          }
        });
      }

      setNodeProps(scene, sceneData.nodes, node, meshProps);
    }

    if (node.getClassName() === "GSplat") {
      setNodeProps(scene, sceneData.nodes, node, gSplatProps);
    }
  });
};

export const setTransformNodes = (scene, sceneData, nodes) => {
  return Object.entries(nodes).forEach(([key, node], i) => {
    if (node === null) {
      return;
    }

    if (node.getClassName() === "TransformNode") {
      setNodeProps(scene, sceneData.nodes, node, transformNodeProps);
    }
    if (node.getClassName() === "PhotoDome") {
      setNodeProps(scene, sceneData.nodes, node, photoDomeProps);
    }
  });
};

export const createGSplats = (scene, sceneData) => {
  if (sceneData.nodes) {
    return Object.entries(sceneData.nodes).forEach(([k, v], i) => {
      if (v.type === "GSplat" && !scene.getTransformNodeByName(v)) {
        return createGSplat(scene, sceneData, v["url"], k);
      }
    });
  }
};

export const create3DTexts = (scene, sceneData) => {
  if (sceneData.nodes) {
    return Object.entries(sceneData.nodes).forEach(([k, v], i) => {
      if (v.type === "3DText" && !scene.getMeshByName(v)) {
        return create3DText(scene, sceneData, { text: v["text"], font: v["font"], resolution: v["resolution"] }, k);
      }
    });
  }
};

export const createPhotoDomes = (scene, sceneData) => {
  if (sceneData.nodes) {
    return Object.entries(sceneData.nodes).forEach(([k, v], i) => {
      if (v.type === "PhotoDome" && !scene.getTransformNodeByName(v)) {
        return createPhotoDome(scene, sceneData, v["photoTexture.url"], k);
      }
    });
  }
};

export const createNodeInstances = (scene, sceneData) => {
  if (sceneData.nodes) {
    return Object.entries(sceneData.nodes).forEach(([k, v], i) => {
      if (v.instanceOf && scene.getMeshByName(v.instanceOf)) {
        return createMeshInstance(scene, sceneData, scene.getMeshByName(v.instanceOf), k);
      }
    });
  }
};

export const createNodeClones = (scene, sceneData) => {
  if (sceneData.nodes) {
    return Object.entries(sceneData.nodes).forEach(([k, v], i) => {
      if (v.cloneOf && scene.getMeshByName(v.cloneOf)) {
        return createMeshClone(scene, sceneData, scene.getMeshByName(v.cloneOf), k);
      }

      if (v.cloneOf && scene.getTransformNodeByName(v.cloneOf)) {
        return createTransformNodeClone(scene, sceneData, scene.getTransformNodeByName(v.cloneOf), k);
      }
    });
  }
};

export const createMaterialClones = (scene, sceneData) => {
  if (sceneData.materials) {
    return Object.entries(sceneData.materials).forEach(([k, v], i) => {
      if (v.cloneOf && scene.getMaterialByName(v.cloneOf)) {
        return createMaterialClone(scene, sceneData, scene.getMaterialByName(v.cloneOf), k);
      }
    });
  }
};

export const createLightClones = (scene, sceneData) => {
  if (sceneData.lights) {
    return Object.entries(sceneData.lights).forEach(([k, v], i) => {
      if (v.cloneOf && scene.getLightByName(v.cloneOf)) {
        return createLightClone(scene, sceneData, scene.getLightByName(v.cloneOf), k);
      }
    });
  }
};

export const setMaterials = (scene, sceneData, nodes) => {
  if (!nodes) {
    return;
  }
  return Object.entries(nodes).forEach(([key, node], i) => {
    if (node === null) {
      return;
    }

    if (node.getClassName() === "PBRMaterial") {
      setNodeProps(scene, sceneData.materials, node, PBRMaterialProps);
    }

    if (node.getClassName() === "ShadowOnlyMaterial") {
      setNodeProps(scene, sceneData.materials, node, shadowOnlyMaterialProps);
    }

    // if (node.getClassName() === "ShaderMaterial") {
    //   setNodeProps(scene, sceneData.materials, node, shaderMaterialProps);
    // }

    // if (node.getClassName() === "TransmissionMaterial") {
    //   setNodeProps(scene, sceneData.materials, node, transmissionMaterialProps);
    // }
    // if (node.getClassName() === "DiamondMaterial") {
    //   setNodeProps(scene, sceneData.materials, node, diamondMaterialProps);
    // }
  });
};

export const setSpecialMaterials = (scene, sceneData, nodes) => {
  if (!nodes) {
    return;
  }
  return Object.entries(nodes).forEach(([key, node], i) => {
    if (node === null) {
      return;
    }

    if (node.getClassName() === "ShaderMaterial") {
      setNodeProps(scene, sceneData.materials, node, shaderMaterialProps);
    }

    if (node.getClassName() === "TransmissionMaterial") {
      setNodeProps(scene, sceneData.materials, node, transmissionMaterialProps);
    }

    if (node.getClassName() === "DiamondMaterial") {
      setNodeProps(scene, sceneData.materials, node, diamondMaterialProps);
    }
  });
};
export const setLights = (scene, sceneData, nodes) => {
  if (!nodes) {
    return;
  }
  return Object.entries(nodes).forEach(([key, node], i) => {
    if (node === null) {
      return;
    }

    if (node.getClassName() === "PointLight") {
      if (!node.hasOwnProperty("shadowGenerator")) {
        node.shadowGenerator = new ShadowGenerator(1024, node);
        node.shadowGenerator.useCloseExponentialShadowMap = true;
      }
      setNodeProps(scene, sceneData.lights, node, pointLightProps);
    }
    if (node.getClassName() === "DirectionalLight") {
      if (!node.hasOwnProperty("shadowGenerator")) {
        node.shadowGenerator = new ShadowGenerator(1024, node);
        node.shadowGenerator.useCloseExponentialShadowMap = true;
      }
      setNodeProps(scene, sceneData.lights, node, directionalLightProps);
    }
    if (node.getClassName() === "HemisphericLight") {
      setNodeProps(scene, sceneData.lights, node, hemisphericLightProps);
    }
    if (node.getClassName() === "SpotLight") {
      if (!node.hasOwnProperty("shadowGenerator")) {
        node.shadowGenerator = new ShadowGenerator(1024, node);
        node.shadowGenerator.useCloseExponentialShadowMap = true;
      }
      setNodeProps(scene, sceneData.lights, node, spotLightProps);
    }
  });
};
export const setCameras = (scene, sceneData, nodes) => {
  if (!nodes) {
    return;
  }
  let defaultWasSet = false;
  return Object.entries(nodes).forEach(([key, node], i) => {
    if (node === null) {
      return;
    }
    if (sceneData.cameras[node.name] && sceneData.cameras[node.name].isDefault && !defaultWasSet) {
      const canvas = node.getScene().getEngine().getRenderingCanvas();
      node.attachControl(canvas, true);
      scene.activeCamera = node;
      defaultWasSet = true;
      node.isDefault = true;
    }
    if (node.getClassName() === "ArcRotateCamera") {
      setNodeProps(scene, sceneData.cameras, node, arcRotateCameraProps);
    }
    if (node.getClassName() === "UniversalCamera" || node.getClassName() === "FreeCamera") {
      setNodeProps(scene, sceneData.cameras, node, universalCameraProps);
    }
  });
};
export const setTextures = (scene, sceneData, nodes) => {
  if (!nodes) {
    return;
  }
  return Object.entries(nodes).forEach(([key, node], i) => {
    if (node === null) {
      return;
    }
    if (node.getClassName() === "Texture") {
      setNodeProps(scene, sceneData.textures, node, textureProps);
    }
    if (node.getClassName() === "CubeTexture") {
      setNodeProps(scene, sceneData.textures, node, cubeTextureProps);
    }
    if (node.getClassName() === "HDRCubeTexture") {
      setNodeProps(scene, sceneData.textures, node, hdrCubeTextureProps);
    }
    if (node.getClassName() === "VideoTexture") {
      setNodeProps(scene, sceneData.textures, node, videoTextureProps);
    }

    if (node.getClassName() === "ColorGradingTexture") {
      setNodeProps(scene, sceneData.textures, node, colorGradingtextureProps);
    }

    if (node.getClassName() === "DynamicTexture") {
      setNodeProps(scene, sceneData.textures, node, dynamicTextureProps);
    }
  });
};
export const setSounds = (scene, sceneData, nodes) => {
  if (!nodes) {
    return;
  }
  return Object.entries(nodes).forEach(([key, node], i) => {
    if (node === null) {
      return;
    }
    if (node.getClassName() === "Sound") {
      setNodeProps(scene, sceneData.sounds, node, soundProps);
    }
  });
};

export const setAnimationGroups = (scene, sceneData, nodes) => {
  if (!nodes) {
    return;
  }
  return Object.entries(nodes).forEach(([key, node], i) => {
    if (node === null) {
      return;
    }

    if (node.getClassName() === "AnimationGroup") {
      setNodeProps(scene, sceneData.animationGroups, node, animationGroupProps);
    }
  });
};

const setScene = (scene) => {
  const sceneData = scene.sceneData;

  const engine = scene.getEngine();

  engine.name = "engine";

  Tools.fallbackTexture = fallbackTexture;

  createEnvironment(scene, sceneData);

  createCameras(scene, sceneData);
  createTextures(scene, sceneData);
  createPhotoDomes(scene, sceneData);
  createGSplats(scene, sceneData);

  createSounds(scene, sceneData);
  createMaterials(scene, sceneData);
  createMaterialClones(scene, sceneData);
  createLights(scene, sceneData);
  createLightClones(scene, sceneData);

  setNodeProps(scene, sceneData, engine, engineProps);
  setCameras(scene, sceneData, scene.cameras);
  setTextures(scene, sceneData, scene.textures);
  setSounds(scene, sceneData, scene.sounds);
  setMaterials(scene, sceneData, scene.materials);
  setTransformNodes(scene, sceneData, scene.transformNodes);

  createNodeInstances(scene, sceneData);
  createNodeClones(scene, sceneData);
  create3DTexts(scene, sceneData);
  setMeshes(scene, sceneData, scene.meshes);

  setAnimationGroups(scene, sceneData, scene.animationGroups);

  setLights(scene, sceneData, scene.lights);

  //GIRSM

  // const defaultRSMTextureRatio = 8;
  // const defaultGITextureRatio = 2;

  // const outputDimensions = {
  //   width: engine.getRenderWidth(true),
  //   height: engine.getRenderHeight(true),
  // };

  // const rsmTextureDimensions = {
  //   width: Math.floor(engine.getRenderWidth(true) / defaultRSMTextureRatio),
  //   height: Math.floor(engine.getRenderHeight(true) / defaultRSMTextureRatio),
  // };

  // const giTextureDimensions = {
  //   width: Math.floor(engine.getRenderWidth(true) / defaultGITextureRatio),
  //   height: Math.floor(engine.getRenderHeight(true) / defaultGITextureRatio),
  // };

  // scene.giRSMs = [];

  // scene.lights.forEach((light) => {
  //   if (light.getClassName() === "SpotLight" || light.getClassName() === "DirectionalLight") {
  //     scene.giRSMs.push(new GIRSM(new ReflectiveShadowMap(scene, light, rsmTextureDimensions)));
  //   }
  // });

  // //scene.giRSMs.forEach((girsm) => (girsm.rsm.forceUpdateLightParameters = true)); // for the demo, don't do this in production!

  // scene.giRSMMgr = new GIRSMManager(scene, outputDimensions, giTextureDimensions, 2048);

  // scene.giRSMMgr.addGIRSM(scene.giRSMs);

  // scene.giRSMMgr.enable = true;

  // scene.giRSMs.forEach((girsm) => girsm.rsm.addMesh());
  // scene.giRSMMgr.addMaterial(); // add all materials in the scene

  // scene.giRSMMgr.numSamples = 128;
  // scene.giRSMMgr.intensity = 0.1;
  // scene.giRSMMgr.edgeArtifactCorrection = 1;
  // scene.giRSMMgr.radius = 0.5;
  // scene.giRSMMgr.noiseFactor = 100;
  // scene.giRSMMgr.rotateSample = false;

  // scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //   giRSM.numSamples = scene.giRSMMgr.numSamples;
  //   giRSM.intensity = scene.giRSMMgr.intensity;
  //   giRSM.edgeArtifactCorrection = scene.giRSMMgr.edgeArtifactCorrection;
  //   giRSM.radius = scene.giRSMMgr.radius;
  //   giRSM.noiseFactor = scene.giRSMMgr.noiseFactor;
  //   giRSM.rotateSample = scene.giRSMMgr.rotateSample;
  // });

  // scene.giRSMMgr.enableBlur = true;

  // scene.giRSMMgr.blurKernel = 0;

  // const resize = () => {
  //   outputDimensions.width = engine.getRenderWidth(true);
  //   outputDimensions.height = engine.getRenderHeight(true);

  //   scene.giRSMs.forEach((girsm) => girsm.rsm.setTextureDimensions(rsmTextureDimensions));
  //   scene.giRSMMgr.setOutputDimensions(outputDimensions);
  //   scene.giRSMMgr.setGITextureDimensions(giTextureDimensions);
  // };

  // resize();

  // engine.onResizeObservable.add(() => {
  //   resize();
  // });

  // END GI

  setNodeProps(scene, sceneData, scene, sceneProps);

  createEffects(scene, sceneData);
  setNodeProps(scene, sceneData, scene.effects, effectsProps);

  createVariables(scene, sceneData);

  createActions(scene, sceneData);

  createOverlays(scene, sceneData);

  createControlNodes(scene, sceneData);

  createCollections(scene, sceneData);

  return;
};

export default setScene;
