/* eslint-disable no-undef */
import {
  ArcRotateCamera,
  ColorCurves,
  ColorGradingTexture,
  Constants,
  CubeTexture,
  DefaultRenderingPipeline,
  DirectionalLight,
  DynamicTexture,
  Effect,
  Engine,
  GlowLayer,
  HDRCubeTexture,
  HemisphericLight,
  Matrix,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  PhotoDome,
  PointLight,
  PointerEventTypes,
  Quaternion,
  RawTexture,
  RenderTargetTexture,
  ShaderMaterial,
  ShadowGenerator,
  Sound,
  SpotLight,
  Texture,
  Tools,
  UniversalCamera,
  Vector2,
  Vector3,
  VertexBuffer,
  VertexData,
  VideoTexture,
} from "@babylonjs/core";
import { ShadowOnlyMaterial } from "@babylonjs/materials";
import earcut from "earcut";
import fallbackTexture from "../fallbackTexture";

import {
  PBRMaterialProps,
  arcRotateCameraProps,
  collectionProps,
  colorGradingtextureProps,
  controlNodeProps,
  cubeTextureProps,
  diamondMaterialProps,
  directionalLightProps,
  dynamicTextureProps,
  gSplatProps,
  hdrCubeTextureProps,
  hemisphericLightProps,
  meshProps,
  overlayProps,
  photoDomeProps,
  pointLightProps,
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
import { getNodeData, setNodeProps } from "../setNodeProps";
import { attachActionManagers } from "./loadAssets";

function findClosestAngleInRadians(angleInRadians) {
  // Convert the angle to the equivalent angle in the range [0, 2π]
  const wrappedAngle = angleInRadians % (2 * Math.PI);

  // If the wrapped angle is negative, add 2π to find the equivalent positive angle
  if (wrappedAngle < 0) {
    return wrappedAngle + 2 * Math.PI;
  }

  return wrappedAngle;
}

export const createGSplat = async (scene, sceneData, url, name) => {
  const engine = scene.getEngine();
  const id = name || "GSplat_" + Date.now();
  var vertexCount;
  var positions;
  var u_buffer;
  var covA, covB;

  const vertexShaderSource = `
  precision mediump float;
  attribute vec2 position;

  attribute vec4 world0;
  attribute vec4 world1;
  attribute vec4 world2;
  attribute vec4 world3;

  uniform mat4 projection, view;
  uniform vec2 focal;
  uniform vec2 viewport;

  varying vec4 vColor;
  varying vec2 vPosition;
  void main () {
    vec3 center = world0.xyz;
    vec4 color = world1;
    vec3 covA = world2.xyz;
    vec3 covB = world3.xyz;

    vec4 camspace = view * vec4(center, 1);
    vec4 pos2d = projection * camspace;

    float bounds = 1.2 * pos2d.w;
    if (pos2d.z < -pos2d.w || pos2d.x < -bounds || pos2d.x > bounds
		 || pos2d.y < -bounds || pos2d.y > bounds) {
        gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
        return;
    }

    mat3 Vrk = mat3(
        covA.x, covA.y, covA.z, 
        covA.y, covB.x, covB.y,
        covA.z, covB.y, covB.z
    );
	
    mat3 J = mat3(
        focal.x / camspace.z, 0., -(focal.x * camspace.x) / (camspace.z * camspace.z), 
        0., focal.y / camspace.z, -(focal.y * camspace.y) / (camspace.z * camspace.z), 
        0., 0., 0.
    );

    mat3 invy = mat3(1,0,0, 0,-1,0,0,0,1);

    mat3 T = invy * transpose(mat3(view)) * J;
    mat3 cov2d = transpose(T) * Vrk * T;

    float mid = (cov2d[0][0] + cov2d[1][1]) / 2.0;
    float radius = length(vec2((cov2d[0][0] - cov2d[1][1]) / 2.0, cov2d[0][1]));
    float lambda1 = mid + radius, lambda2 = mid - radius;

    if(lambda2 < 0.0) return;
    vec2 diagonalVector = normalize(vec2(cov2d[0][1], lambda1 - cov2d[0][0]));
    vec2 majorAxis = min(sqrt(2.0 * lambda1), 1024.0) * diagonalVector;
    vec2 minorAxis = min(sqrt(2.0 * lambda2), 1024.0) * vec2(diagonalVector.y, -diagonalVector.x);

    vColor = color;
    vPosition = position;
    vec2 vCenter = vec2(pos2d);
    gl_Position = vec4(
        vCenter 
        + (position.x * majorAxis * 1. / viewport 
        + position.y * minorAxis * 1. / viewport) * pos2d.w, pos2d.zw);
  }
`;

  const fragmentShaderSource = `
  precision highp float;
  varying vec4 vColor;
  varying vec2 vPosition;
  void main () {    
	float A = -dot(vPosition, vPosition);
    if (A < -4.0) discard;
    float B = exp(A) * vColor.a;
    gl_FragColor = vec4(vColor.rgb, B);
  }
`;

  function createWorker(self) {
    var viewProj;
    let lastProj = [];
    var depthMix = new BigInt64Array();
    var vertexCount = 0;
    var positions;

    const runSort = (viewProj) => {
      vertexCount = positions.length;
      if (depthMix.length !== vertexCount) {
        depthMix = new BigInt64Array(vertexCount);
        const indices = new Uint32Array(depthMix.buffer);
        for (let j = 0; j < vertexCount; j++) {
          indices[2 * j] = j;
        }
      }
      let dot = lastProj[2] * viewProj[2] + lastProj[6] * viewProj[6] + lastProj[10] * viewProj[10];
      if (Math.abs(dot - 1) < 0.01) {
        return;
      }

      const floatMix = new Float32Array(depthMix.buffer);
      indexMix = new Uint32Array(depthMix.buffer);
      for (let j = 0; j < vertexCount; j++) {
        let i = indexMix[2 * j];
        floatMix[2 * j + 1] = -10000 - (viewProj[2] * positions[3 * i + 0] + viewProj[6] * positions[3 * i + 1] + viewProj[10] * positions[3 * i + 2]);
      }
      lastProj = viewProj;

      depthMix.sort();

      self.postMessage({ depthMix }, [depthMix.buffer]);
    };

    const throttledSort = () => {
      if (!sortRunning) {
        sortRunning = true;
        let lastView = viewProj;
        runSort(lastView);
        setTimeout(() => {
          sortRunning = false;
          if (lastView !== viewProj) {
            throttledSort();
          }
        }, 0);
      }
    };

    let sortRunning;
    self.onmessage = (e) => {
      viewProj = e.data.view;
      positions = e.data.positions;
      throttledSort();
    };
  }

  function setData(binaryData) {
    const rowLength = 3 * 4 + 3 * 4 + 4 + 4;
    vertexCount = binaryData.length / rowLength;
    positions = new Float32Array(3 * vertexCount);
    covA = new Float32Array(3 * vertexCount);
    covB = new Float32Array(3 * vertexCount);

    const f_buffer = new Float32Array(binaryData.buffer);
    u_buffer = new Uint8Array(binaryData.buffer);

    let matrixRotation = Matrix.Zero();
    let matrixScale = Matrix.Zero();
    let quaternion = Quaternion.Identity();
    for (let i = 0; i < vertexCount; i++) {
      positions[3 * i + 0] = f_buffer[8 * i + 0];
      positions[3 * i + 1] = -f_buffer[8 * i + 1];
      positions[3 * i + 2] = f_buffer[8 * i + 2];

      quaternion.set(
        (u_buffer[32 * i + 28 + 1] - 128) / 128,
        (u_buffer[32 * i + 28 + 2] - 128) / 128,
        (u_buffer[32 * i + 28 + 3] - 128) / 128,
        -(u_buffer[32 * i + 28 + 0] - 128) / 128
      );
      quaternion.toRotationMatrix(matrixRotation);

      Matrix.ScalingToRef(f_buffer[8 * i + 3 + 0] * 2, f_buffer[8 * i + 3 + 1] * 2, f_buffer[8 * i + 3 + 2] * 2, matrixScale);

      const M = matrixRotation.multiply(matrixScale).m;

      covA[i * 3 + 0] = M[0] * M[0] + M[1] * M[1] + M[2] * M[2];
      covA[i * 3 + 1] = M[0] * M[4] + M[1] * M[5] + M[2] * M[6];
      covA[i * 3 + 2] = M[0] * M[8] + M[1] * M[9] + M[2] * M[10];
      covB[i * 3 + 0] = M[4] * M[4] + M[5] * M[5] + M[6] * M[6];
      covB[i * 3 + 1] = M[4] * M[8] + M[5] * M[9] + M[6] * M[10];
      covB[i * 3 + 2] = M[8] * M[8] + M[9] * M[9] + M[10] * M[10];
    }
  }

  const data = await Tools.LoadFileAsync(url, true);

  setData(new Uint8Array(data));

  Effect.ShadersStore[id + "VertexShader"] = vertexShaderSource;
  Effect.ShadersStore[id + "FragmentShader"] = fragmentShaderSource;

  const shaderMaterial = new ShaderMaterial(
    id + "_GSplatMaterial",
    scene,
    {
      vertex: id,
      fragment: id,
    },
    {
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
    }
  );

  shaderMaterial.getClassName = () => {
    return "GSplatMaterial";
  };

  const gSplat = new Mesh(id, scene);
  var vertexData = new VertexData();
  vertexData.positions = [-2, -2, 0, 2, -2, 0, 2, 2, 0, -2, 2, 0];
  vertexData.indices = [0, 1, 2, 0, 2, 3];

  vertexData.applyToMesh(gSplat);

  shaderMaterial.setVector2("focal", new Vector2(1132, 1132));
  shaderMaterial.setVector2("viewport", new Vector2(engine.getRenderWidth(), engine.getRenderHeight()));

  gSplat.material = shaderMaterial;
  shaderMaterial.backFaceCulling = false;
  shaderMaterial.alpha = 0.9999;
  gSplat.alwaysSelectAsActiveMesh = true;
  var matricesData = new Float32Array(vertexCount * 16);
  var firstTime = true;

  const updateInstances = function (idxMix) {
    for (let j = 0; j < vertexCount; j++) {
      const i = idxMix[2 * j];
      const index = j * 16;
      matricesData[index + 0] = positions[i * 3 + 0];
      matricesData[index + 1] = positions[i * 3 + 1];
      matricesData[index + 2] = positions[i * 3 + 2];

      matricesData[index + 4] = u_buffer[32 * i + 24 + 0] / 255;
      matricesData[index + 5] = u_buffer[32 * i + 24 + 1] / 255;
      matricesData[index + 6] = u_buffer[32 * i + 24 + 2] / 255;
      matricesData[index + 7] = u_buffer[32 * i + 24 + 3] / 255;

      matricesData[index + 8] = covA[i * 3 + 0];
      matricesData[index + 9] = covA[i * 3 + 1];
      matricesData[index + 10] = covA[i * 3 + 2];

      matricesData[index + 12] = covB[i * 3 + 0];
      matricesData[index + 13] = covB[i * 3 + 1];
      matricesData[index + 14] = covB[i * 3 + 2];
    }

    if (firstTime) {
      gSplat.thinInstanceSetBuffer("matrix", matricesData, 16, false);
    } else {
      gSplat.thinInstanceBufferUpdated("matrix");
    }
    firstTime = false;
  };

  // console.log("ready");

  const worker = new Worker(
    URL.createObjectURL(
      new Blob(["(", createWorker.toString(), ")(self)"], {
        type: "application/javascript",
      })
    )
  );

  worker.onmessage = (e) => {
    const indexMix = new Uint32Array(e.data.depthMix.buffer);
    updateInstances(indexMix);
  };

  scene.onBeforeRenderObservable.add(() => {
    worker.postMessage({ view: scene.activeCamera.getViewMatrix().m, positions: positions });
  });

  gSplat.getClassName = () => {
    return "GSplat";
  };
  scene.badAssets[id] = gSplat;
  gSplat.name = id;
  gSplat.displayName = id;
  gSplat.isCustom = true;

  setNodeProps(scene, sceneData ? sceneData.nodes : null, gSplat, gSplatProps);
  return gSplat;
};

export const createCollection = (scene, sceneData, name) => {
  const id = name || "Collection_" + Date.now();

  const collection = {};
  collection.name = id;
  collection.displayName = "Collection";
  collection.nodes = [];
  collection.getClassName = () => {
    return "Collection";
  };

  scene.collections[id] = collection;
  setNodeProps(scene, sceneData ? sceneData.collections : null, collection, collectionProps);

  return collection;
};

export const createOverlay = (scene, sceneData, name) => {
  const id = name || "Overlay_" + Date.now();

  const overlay = {};
  overlay.name = id;
  overlay.displayName = "Overlay";
  overlay.enabled = true;
  overlay.zIndex = 1;
  overlay.getClassName = () => {
    return "Overlay";
  };

  scene.overlays[id] = overlay;
  setNodeProps(scene, sceneData ? sceneData.overlays : null, overlay, overlayProps);

  return overlay;
};

export const createControlNode = (scene, sceneData, name) => {
  const id = name || "ControlNode_" + Date.now();

  const controlNode = {};
  controlNode.name = id;
  controlNode.displayName = "Control Node";
  controlNode.nodes = {};
  controlNode.getClassName = () => {
    return "ControlNode";
  };

  scene.controlNodes[id] = controlNode;
  setNodeProps(scene, sceneData ? sceneData.controlNodes : null, controlNode, controlNodeProps);
  return controlNode;
};

export const createEffects = (scene, sceneData) => {
  // if (scene.effects.hasOwnProperty("defaultRenderingPipeline")) return;
  scene.effects = {};

  // scene.effects.fogEnabled = scene.fogEnabled;
  // scene.effects.fogColor = scene.fogColor;
  // scene.effects.fogStart = scene.fogStart;
  // scene.effects.fogEnd = scene.fogEnd;

  scene.effects.imageProcessingConfiguration = scene.imageProcessingConfiguration;

  // scene.effects.scene = scene;
  scene.effects.name = "effects";

  scene.effects.getClassName = () => {
    return "Effects";
  };

  if (window.location.search.indexOf("vr=true") === -1) {
    scene.effects.defaultRenderingPipeline = new DefaultRenderingPipeline(
      "defaultRenderingPipeline",
      false, // is HDR?
      scene,
      scene.cameras
    );
  }

  if (window.location.search.indexOf("vr=true") === -1) {
    scene.effects.imageProcessingConfiguration.colorCurvesEnabled = true;
    scene.effects.imageProcessingConfiguration.colorCurves = new ColorCurves();
    scene.effects.gl = new GlowLayer("glow", scene);
    scene.effects.gl.isEnabled = false;
    scene.effects.gl.intensity = 0.5;
  }

  //  console.log(scene.effects, sceneData.effects);
};

export const createEnvironment = (scene, sceneData) => {
  // if (1 - 1 === 0) {
  //   return;
  // }
  if (scene.getMeshByName("Mesh_Skybox")) {
    return;
  }

  const environmentTexture = new CubeTexture("/assets/studio.env", scene, null, false, null, null, null, Constants.TEXTUREFORMAT_RGBA, false);
  environmentTexture.name = "CubeTexture_SceneEnvironment";
  environmentTexture.displayName = "Environment";
  environmentTexture.rotationY = 0;

  scene.environmentTexture = environmentTexture;

  // if (window.location.pathname === "/sandbox" || window.location.pathname === "/viewer") {
  // } else {
  const plane = MeshBuilder.CreatePlane("Mesh_EnvironmentPlane", { height: 10, width: 10 });
  plane.displayName = "Plane";
  plane.receiveShadows = true;
  plane.isPickable = false;
  plane.rotation.x = Math.PI / 2;
  scene.badAssets["Mesh_EnvironmentPlane"] = plane;
  attachActionManagers(scene, plane);

  const planeMaterial = new PBRMaterial("Material_Mesh_EnvironmentPlane", scene);
  planeMaterial.displayName = "Plane";
  planeMaterial.albedoTexture = new Texture("/assets/ground.webp", scene);
  planeMaterial.albedoTexture.hasAlpha = true;
  planeMaterial.metallic = 0;
  planeMaterial.roughness = 1;
  planeMaterial.useAlphaFromAlbedoTexture = true;

  plane.material = planeMaterial;

  const skybox = MeshBuilder.CreateBox("Mesh_Skybox", { size: 1000, sideOrientation: Mesh.BACKSIDE }, scene);
  skybox.displayName = "Skybox";
  skybox.isPickable = false;

  scene.badAssets["Mesh_EnvironmentSkybox"] = skybox;

  const skyboxMaterial = new PBRMaterial("PBRMaterial_Mesh_EnvironemntSkybox", scene);
  skyboxMaterial.displayName = "Skybox";
  skyboxMaterial.metallic = 0.5;
  skyboxMaterial.roughness = 0.5;

  const skyboxTexture = new CubeTexture("/assets/studio.env", scene, null, false, null, null, null, Constants.TEXTUREFORMAT_RGBA, false);
  skyboxTexture.name = "CubeTexture_Mesh_EnvironmentSkybox";
  skyboxTexture.displayName = "Skybox";
  skyboxTexture.rotationY = 0;
  skyboxMaterial.disableLighting = true;
  skyboxMaterial.reflectionTexture = skyboxTexture;

  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

  skybox.material = skyboxMaterial;

  plane.fromAsset = true;
  planeMaterial.fromAsset = true;
  environmentTexture.fromAsset = true;
  skybox.fromAsset = true;
  skyboxMaterial.fromAsset = true;
  skyboxTexture.fromAsset = true;
  //  }
};
export const createPointLight = (scene, sceneData, name) => {
  const id = name || "Light_" + Date.now();
  const light = new PointLight(id, new Vector3(0, 0, 0), scene);
  light.displayName = id;

  light.shadowGenerator = new ShadowGenerator(1024, light);

  light.shadowGenerator.useKernelBlur = true;
  light.shadowGenerator.useBlurExponentialShadowMap = true;

  setNodeProps(scene, sceneData ? sceneData.lights : null, light, pointLightProps);

  return light;
};
export const createDirectionalLight = (scene, sceneData, name) => {
  const id = name || "Light_" + Date.now();
  const light = new DirectionalLight(id, new Vector3(0, -1, 0), scene);
  light.displayName = id;

  light.shadowGenerator = new ShadowGenerator(1024, light);

  light.shadowGenerator.useKernelBlur = true;
  light.shadowGenerator.useBlurExponentialShadowMap = true;

  setNodeProps(scene, sceneData ? sceneData.lights : null, light, directionalLightProps);

  return light;
};
export const createSpotLight = (scene, sceneData, name) => {
  const id = name || "Light_" + Date.now();
  const light = new SpotLight(id, new Vector3(0, 0, 0), new Vector3(0, -1, 0), Math.PI / 3, scene);
  light.displayName = id;

  light.shadowGenerator = new ShadowGenerator(1024, light);

  light.shadowGenerator.useKernelBlur = true;
  light.shadowGenerator.useBlurExponentialShadowMap = true;

  setNodeProps(scene, sceneData ? sceneData.lights : null, light, spotLightProps);

  return light;
};
export const createHemisphericLight = (scene, sceneData, name) => {
  const id = name || "Light_" + Date.now();
  const light = new HemisphericLight(id, new Vector3(0, 1, 0), scene);
  light.displayName = id;

  setNodeProps(scene, sceneData ? sceneData.lights : null, light, hemisphericLightProps);
  return light;
};
export const createPBRMaterial = (scene, sceneData, name) => {
  const id = name || "Material_" + Date.now();
  const material = new PBRMaterial(id, scene);
  material.metallic = 0;
  material.roughness = 0;
  material.enableSpecularAntiAliasing = true;

  material.displayName = id;
  material.isCustom = true;

  setNodeProps(scene, sceneData ? sceneData.materials : null, material, PBRMaterialProps);
  return material;
};

export const createShaderMaterial = (scene, sceneData, name, vertex, fragment) => {
  const id = name || "Material_" + Date.now();

  Effect.ShadersStore[id + "VertexShader"] = vertex ? vertex : sceneData ? sceneData.materials[id].vertex : null;

  Effect.ShadersStore[id + "FragmentShader"] = fragment ? fragment : sceneData ? sceneData.materials[id].fragment : null;

  const material = new ShaderMaterial(
    id,
    scene,
    {
      vertex: id,
      fragment: id,
    },
    {
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
    }
  );
  material.setFloat("time", 0);
  var time = 0;
  scene.registerAfterRender(() => {
    time++;
    material.setFloat("time", time / 100);
  });
  material.displayName = sceneData?.materials[id].displayName || id;
  material.isCustom = true;
  // setNodeProps(scene, sceneData ? sceneData.materials : null, material, shaderMaterialProps);
  return material;
};

export const createTransmissionMaterial = (scene, sceneData, name) => {
  const vertexShaderCode = `
  attribute vec3 position;
  attribute vec3 normal;

  varying vec3 worldNormal;
  varying vec3 eyeVector;

  uniform mat4 world;           // Model Matrix
  uniform mat4 view;            // View Matrix
  uniform mat4 viewProjection;  // Projection * View Matrix
  uniform vec3 vEyePosition;    // Camera Position

  void main(void) {
      vec4 worldPos = world * vec4(position, 1.0);
      gl_Position = viewProjection * worldPos;

      worldNormal = normalize(vec3(world * vec4(normal, 0.0)));
      eyeVector = normalize(worldPos.xyz - vEyePosition);
  }`;

  const fragmentShaderCode = `
  uniform int samples;
  uniform float uIorR;
uniform float uIorY;
uniform float uIorG;
uniform float uIorC;
uniform float uIorB;
uniform float uIorP;

uniform float rChannel;
uniform float gChannel;
uniform float bChannel;


uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform float uFresnelPower;
uniform float uShininess;
uniform float uDiffuseness;
uniform vec3 uLight;

uniform vec2 winResolution;
uniform sampler2D uTexture;

varying vec3 worldNormal;
varying vec3 eyeVector;

vec3 sat(vec3 rgb, float adjustment) {
const vec3 W = vec3(0.2125, 0.7154, 0.0721);
vec3 intensity = vec3(dot(rgb, W));
return mix(intensity, rgb, adjustment);
}

float fresnel(vec3 eyeVector, vec3 worldNormal, float power) {
float fresnelFactor = abs(dot(eyeVector, worldNormal));
float inversefresnelFactor = 1.0 - fresnelFactor;

return pow(inversefresnelFactor, power);
}


float specular(vec3 light, float shininess, float diffuseness) {
vec3 normal = worldNormal;
vec3 lightVector = normalize(-light);
vec3 halfVector = normalize(eyeVector + lightVector);

float NdotL = dot(normal, lightVector);
float NdotH =  dot(normal, halfVector);
float kDiffuse = max(0.0, NdotL);
float NdotH2 = NdotH * NdotH;

float kSpecular = pow(NdotH2, shininess);
return  kSpecular + kDiffuse * diffuseness;
}



void main() {
float iorRatioRed = 1.0/uIorR;
float iorRatioGreen = 1.0/uIorG;
float iorRatioBlue = 1.0/uIorB;

vec2 uv = gl_FragCoord.xy / winResolution.xy;
vec3 normal = worldNormal;
vec3 color = vec3(0.0);

for ( int i = 0; i < samples; i ++ ) {
  float slide = float(i) / float(samples) * 0.1;

  vec3 refractVecR = refract(eyeVector, normal,(1.0/uIorR));
  vec3 refractVecY = refract(eyeVector, normal, (1.0/uIorY));
  vec3 refractVecG = refract(eyeVector, normal, (1.0/uIorG));
  vec3 refractVecC = refract(eyeVector, normal, (1.0/uIorC));
  vec3 refractVecB = refract(eyeVector, normal, (1.0/uIorB));
  vec3 refractVecP = refract(eyeVector, normal, (1.0/uIorP));

  float r = texture2D(uTexture, uv + refractVecR.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 0.5;

  float y = (texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 2.0 +
              texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).y * 2.0 -
              texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).z) / 6.0;

  float g = texture2D(uTexture, uv + refractVecG.xy * (uRefractPower + slide * 2.0) * uChromaticAberration).y * 0.5;

  float c = (texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).y * 2.0 +
              texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).z * 2.0 -
              texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).x) / 6.0;
        
  float b = texture2D(uTexture, uv + refractVecB.xy * (uRefractPower + slide * 3.0) * uChromaticAberration).z * 0.5;

  float p = (texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).z * 2.0 +
              texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 2.0 -
              texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).y) / 6.0;

  float R = r + (2.0*p + 2.0*y - c)/rChannel;
  float G = g + (2.0*y + 2.0*c - p)/gChannel;
  float B = b + (2.0*c + 2.0*p - y)/bChannel;

  color.r += R;
  color.g += G;
  color.b += B;

  color = sat(color, uSaturation);
}

// Divide by the number of layers to normalize colors (rgb values can be worth up to the value of samples)
color /= float( samples );

// Specular
//   float specularLight = specular(uLight, uShininess, uDiffuseness);
//   color += specularLight;
float f = fresnel(eyeVector, normal, uFresnelPower);
color.rgb += f * vec3(1.0);
gl_FragColor = vec4(color, 1);


}
`;

  const id = name || "Material_" + Date.now();
  Effect.ShadersStore[id + "VertexShader"] = vertexShaderCode;
  Effect.ShadersStore[id + "FragmentShader"] = fragmentShaderCode;
  const material = new ShaderMaterial(
    id,
    scene,
    {
      vertex: id,
      fragment: id,
    },
    {
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "viewProjection", "vEyePosition"],
    }
  );
  material.displayName = id;

  material.isCustom = true;

  material.getClassName = () => {
    return "TransmissionMaterial";
  };

  let isRenderingToTexture = false;
  let mainTargetTexture = new RenderTargetTexture(id + "_mrtt", 1024, scene);
  let winResolution = new Vector2(document.getElementById("renderCanvas")?.offsetWidth, document.getElementById("renderCanvas")?.offsetHeight).scale(
    Math.min(window.devicePixelRatio, 2)
  );

  window.addEventListener("resize", function () {
    winResolution = new Vector2(document.getElementById("renderCanvas")?.offsetWidth, document.getElementById("renderCanvas")?.offsetHeight).scale(
      Math.min(window.devicePixelRatio, 2)
    );
  });
  scene.registerBeforeRender(() => {
    if (isRenderingToTexture) {
      return;
    }

    material.getBindedMeshes().forEach((m) => {
      m.isVisible = false;
    });
    isRenderingToTexture = true;

    scene.activeCamera.outputRenderTarget = mainTargetTexture;
    scene.render();

    isRenderingToTexture = false;

    material.setTexture("uTexture", mainTargetTexture);

    scene.activeCamera.outputRenderTarget = null;

    material.getBindedMeshes().forEach((m) => {
      m.isVisible = true;
    });

    material.setVector2("winResolution", winResolution);
    material.setInt("samples", material.hasOwnProperty("samples") ? material.samples : 2);
    material.setFloat("uIorR", material.hasOwnProperty("uIorR") ? material.uIorR : 1.2);
    material.setFloat("uIorG", material.hasOwnProperty("uIorG") ? material.uIorG : 1.3);
    material.setFloat("uIorB", material.hasOwnProperty("uIorB") ? material.uIorB : 1.4);
    material.setFloat("uIorC", material.hasOwnProperty("uIorC") ? material.uIorC : 1.5);
    material.setFloat("uIorP", material.hasOwnProperty("uIorP") ? material.uIorP : 1.6);
    material.setFloat("uIorY", material.hasOwnProperty("uIorY") ? material.uIorY : 1.7);
    material.setFloat("rChannel", material.hasOwnProperty("rChannel") ? material.rChannel : 3.0);
    material.setFloat("gChannel", material.hasOwnProperty("gChannel") ? material.gChannel : 3.0);
    material.setFloat("bChannel", material.hasOwnProperty("bChannel") ? material.bChannel : 3.0);
    material.setFloat("uSaturation", material.hasOwnProperty("uSaturation") ? material.uSaturation : 1);
    material.setFloat("uChromaticAberration", material.hasOwnProperty("uChromaticAberration") ? material.uChromaticAberration : 0.2);
    material.setFloat("uRefractPower", material.hasOwnProperty("uRefractPower") ? material.uRefractPower : 0.1);
    material.setFloat("uShininess", material.hasOwnProperty("uShininess") ? material.uShininess : 40.0);
    material.setFloat("uDiffuseness", material.hasOwnProperty("uDiffuseness") ? material.uDiffuseness : 0.0);
    material.setFloat("uFresnelPower", material.hasOwnProperty("uFresnelPower") ? material.uFresnelPower : 50);
  });
  setNodeProps(scene, sceneData ? sceneData.materials : null, material, transmissionMaterialProps);
  return material;
};

export const createDiamondMaterial = (scene, sceneData, name) => {
  const vertexShaderCode = `
    precision highp float;
    attribute vec3 position;
    attribute vec3 normal;
    uniform mat4 world;
    uniform mat4 worldViewProjection;
    varying vec3 vPositionW;
    varying vec3 vNormalW;
    void main(void) {
        gl_Position = worldViewProjection * vec4(position, 1.0);
        vPositionW = (world * vec4(position, 1.0)).xyz;
        vNormalW = normalize(vec3(world * vec4(normal, 0.0)));
        vNormalW = normalize(vec3(world * vec4(normal.xy, -normal.z, 0.0)));
    }
  `;

  const fragmentShaderCode = `
precision highp float;

varying vec3 vPositionW;
varying vec3 vNormalW;

uniform vec3 cameraPosition;
uniform samplerCube reflectionCubeSampler;
uniform mat4 world;
uniform sampler2D meshDataTexture;
uniform sampler2D indexDataTexture;
uniform int vertexCount;
uniform int indexCount;
uniform vec2 meshDataTextureSize;
uniform vec3 meshMin;
uniform vec3 meshMax;

// Uniforms to replace constants
uniform float u_MIX;
uniform int u_BLEND_MODE;
uniform float u_IOR;
uniform float u_BRIGHTNESS;
uniform float u_R_IOR;
uniform float u_G_IOR;
uniform float u_B_IOR;
uniform int u_MAX_BOUNCES;
uniform float u_MAX_DISTANCE;
uniform float u_EPSILON;

vec3 getVertexFromTexture(int index) {
    float y = float(index) / meshDataTextureSize.x;
    float x = mod(float(index), meshDataTextureSize.x);
    return texture2D(meshDataTexture, vec2(x, y) / meshDataTextureSize).xyz;
}

int getIndexFromTexture(int index) {
    return int(texture2D(indexDataTexture, vec2(float(index) / float(indexCount), 0.5)).r);
}

vec3 refract2(vec3 I, vec3 N, float ior) {
    float cosi = clamp(-1.0, 1.0, dot(I, N));
    float etai = 1.0, etat = ior;
    vec3 n = N;
    if (cosi < 0.0) {
        cosi = -cosi;
    } else {
        float temp = etai;
        etai = etat;
        etat = temp;
        n = -N;
    }
    float eta = etai / etat;
    float k = 1.0 - eta * eta * (1.0 - cosi * cosi);
    return k < 0.0 ? vec3(0.0) : eta * I + (eta * cosi - sqrt(k)) * n;
}

bool rayTriangleIntersect(vec3 rayOrigin, vec3 rayDir, vec3 v0, vec3 v1, vec3 v2, out float t, out vec3 normal) {
    vec3 e1 = v1 - v0;
    vec3 e2 = v2 - v0;
    vec3 h = cross(rayDir, e2);
    float a = dot(e1, h);

    if (abs(a) < u_EPSILON)
        return false;

    float f = 1.0 / a;
    vec3 s = rayOrigin - v0;
    float u = f * dot(s, h);

    if (u < 0.0 || u > 1.0)
        return false;

    vec3 q = cross(s, e1);
    float v = f * dot(rayDir, q);

    if (v < 0.0 || u + v > 1.0)
        return false;

    t = f * dot(e2, q);

    if (t > u_EPSILON) {
        normal = -normalize(cross(e1, e2));
        return true;
    }

    return false;
}

bool intersectMesh(vec3 rayOrigin, vec3 rayDir, out float nearestT, out vec3 nearestNormal) {
    nearestT = u_MAX_DISTANCE;
    bool hit = false;

    for (int i = 0; i < indexCount; i += 3) {
        if (i >= indexCount) break;
        vec3 v0 = (world * vec4(getVertexFromTexture(getIndexFromTexture(i)), 1.0)).xyz;
        vec3 v1 = (world * vec4(getVertexFromTexture(getIndexFromTexture(i + 1)), 1.0)).xyz;
        vec3 v2 = (world * vec4(getVertexFromTexture(getIndexFromTexture(i + 2)), 1.0)).xyz;

        float t;
        vec3 normal;
        if (rayTriangleIntersect(rayOrigin, rayDir, v0, v1, v2, t, normal)) {
            if (t < nearestT) {
                nearestT = t;
                nearestNormal = normal;
                hit = true;
            }
        }
    }

    return hit;
}

vec3 rayMarch(vec3 ro, vec3 rd, float ior) {
    vec3 accumulatedColor = vec3(0.0);
    vec3 throughput = vec3(1.0);
    bool inside = false;

    for (int bounce = 0; bounce < u_MAX_BOUNCES; bounce++) {
        float t;
        vec3 normal;

        if (intersectMesh(ro, rd, t, normal)) {
            vec3 intersectionPoint = ro + rd * t;

            // Determine if we're entering or exiting the medium
            float cosTheta = dot(rd, normal);
            if (cosTheta > 0.0) {
                normal = -normal;
                inside = !inside;
            }

            float eta = inside ? ior : 1.0 / ior;
            float r0 = (1.0 - eta) / (1.0 + eta);
            r0 = r0 * r0;
            float fresnel = r0 + (1.0 - r0) * pow((1.0 - abs(cosTheta)), 5.0);

            vec3 reflectedDir = reflect(rd, normal);
            vec3 refractedDir = refract2(rd, normal, eta);

            // Sample environment for both reflection and refraction
            vec3 reflectionColor = textureCube(reflectionCubeSampler, reflectedDir).rgb;

            // Add reflection contribution
            accumulatedColor += throughput * fresnel * reflectionColor;

            // Simplified ray termination
            if (bounce > 2 && max(throughput.r, max(throughput.g, throughput.b)) < 0.1)
                break;

            // Continue with refracted ray
            if (dot(refractedDir, refractedDir) > 0.0) {
                throughput *= (1.0 - fresnel);
                ro = intersectionPoint + refractedDir * u_EPSILON;
                rd = refractedDir;
            } else {
                // Total internal reflection
                ro = intersectionPoint + reflectedDir * u_EPSILON;
                rd = reflectedDir;
            }
        } else {
            // Ray missed the geometry, sample environment
            accumulatedColor += throughput * textureCube(reflectionCubeSampler, rd).rgb;
            break;
        }
    }

    return accumulatedColor;
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return mix(
        2.0 * base * blend,
        1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
        step(0.5, base)
    );
}

vec3 blendMultiply(vec3 base, vec3 blend) {
    return base * blend;
}

void main(void) {
    vec3 viewDir = normalize(vPositionW - cameraPosition);

    vec3 colorR = rayMarch(vPositionW, viewDir, u_IOR * u_R_IOR);
    vec3 colorG = rayMarch(vPositionW, viewDir, u_IOR * u_G_IOR);
    vec3 colorB = rayMarch(vPositionW, viewDir, u_IOR * u_B_IOR);

    vec3 refractedColor = vec3(colorR.r, colorG.g, colorB.b);
    vec3 reflectedColor = textureCube(reflectionCubeSampler, reflect(viewDir, normalize(vNormalW))).rgb;

    float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormalW))), 5.0);
    vec3 finalColor = mix(refractedColor, reflectedColor, fresnel);

    if (u_BLEND_MODE == 1) {
        finalColor = mix(refractedColor, reflectedColor, u_MIX);
    }

    if (u_BLEND_MODE == 2) {
        finalColor = blendOverlay(finalColor, reflectedColor);
    }

    if (u_BLEND_MODE == 3) {
        finalColor = blendMultiply(finalColor, reflectedColor);
    }

    finalColor *= u_BRIGHTNESS;

    gl_FragColor = vec4(finalColor, 1.0);
}
  `;

  const id = name || "DiamondMaterial_" + Date.now();
  Effect.ShadersStore[id + "VertexShader"] = vertexShaderCode;
  Effect.ShadersStore[id + "FragmentShader"] = fragmentShaderCode;

  let material = new ShaderMaterial(
    id,
    scene,
    {
      vertex: id,
      fragment: id,
    },
    {
      attributes: ["position", "normal"],
      uniforms: [
        "world",
        "worldView",
        "worldViewProjection",
        "view",
        "projection",
        "cameraPosition",
        "vertexCount",
        "indexCount",
        "meshDataTextureSize",
        "meshMin",
        "meshMax",
        "u_MIX",
        "u_BLEND_MODE",
        "u_IOR",
        "u_R_IOR",
        "u_G_IOR",
        "u_B_IOR",
        "u_MAX_BOUNCES",
        "u_MAX_DISTANCE",
        "u_EPSILON",
      ],
    }
  );

  material.displayName = id;
  material.isCustom = true;
  material.getClassName = () => "DiamondMaterial";

  let rendered = false;

  scene.registerBeforeRender(() => {
    if (material.getBindedMeshes()[0]) {
      const mesh = material.getBindedMeshes()[0];

      material.setVector3("cameraPosition", scene.activeCamera.position);
      material.setMatrix("world", mesh.getWorldMatrix());

      if (!rendered) {
        const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
        const indices = mesh.getIndices();

        const vertexCount = positions.length / 3;
        const indexCount = indices.length;

        // Create a texture to store mesh data
        const textureSize = Math.ceil(Math.sqrt(vertexCount));
        const meshDataArray = new Float32Array(textureSize * textureSize * 4);

        // Find the bounding box of the mesh
        let minX = Infinity,
          minY = Infinity,
          minZ = Infinity;
        let maxX = -Infinity,
          maxY = -Infinity,
          maxZ = -Infinity;
        for (let i = 0; i < positions.length; i += 3) {
          minX = Math.min(minX, positions[i]);
          minY = Math.min(minY, positions[i + 1]);
          minZ = Math.min(minZ, positions[i + 2]);
          maxX = Math.max(maxX, positions[i]);
          maxY = Math.max(maxY, positions[i + 1]);
          maxZ = Math.max(maxZ, positions[i + 2]);
        }

        // Store vertex positions directly
        for (let i = 0; i < vertexCount; i++) {
          meshDataArray[i * 4] = positions[i * 3];
          meshDataArray[i * 4 + 1] = positions[i * 3 + 1];
          meshDataArray[i * 4 + 2] = positions[i * 3 + 2];
          meshDataArray[i * 4 + 3] = 1.0; // W component
        }

        const meshDataTexture = RawTexture.CreateRGBATexture(
          meshDataArray,
          textureSize,
          textureSize,
          scene,
          false,
          false,
          Texture.NEAREST_SAMPLINGMODE,
          Engine.TEXTURETYPE_FLOAT
        );

        // Create a texture to store index data
        const indexDataArray = new Float32Array(indexCount);
        for (let i = 0; i < indexCount; i++) {
          indexDataArray[i] = indices[i];
        }

        const indexDataTexture = RawTexture.CreateRTexture(
          indexDataArray,
          indexCount,
          1,
          scene,
          false,
          false,
          Texture.NEAREST_SAMPLINGMODE,
          Engine.TEXTURETYPE_FLOAT
        );

        material.setTexture("reflectionCubeSampler", scene.environmentTexture);
        material.setTexture("meshDataTexture", meshDataTexture);
        material.setTexture("indexDataTexture", indexDataTexture);
        material.setInt("vertexCount", vertexCount);
        material.setInt("indexCount", indexCount);
        material.setVector2("meshDataTextureSize", new Vector2(textureSize, textureSize));
        material.setVector3("meshMin", new Vector3(minX, minY, minZ));
        material.setVector3("meshMax", new Vector3(maxX, maxY, maxZ));

        // SET
        material.setInt("u_BLEND_MODE", 1);
        material.setFloat("u_MIX", 0.5);
        material.setFloat("u_BRIGHTNESS", 1);
        material.setFloat("u_IOR", 2.4);
        material.setFloat("u_R_IOR", 0.99);
        material.setFloat("u_G_IOR", 1);
        material.setFloat("u_B_IOR", 1.01);
        material.setInt("u_MAX_BOUNCES", 3);
        material.setFloat("u_MAX_DISTANCE", 10.0);
        material.setFloat("u_EPSILON", 0.001);

        setNodeProps(scene, sceneData ? sceneData.materials : null, material, diamondMaterialProps);

        rendered = true;
      }
    }
  });

  return material;
};

// export const createDiamondMaterial = (scene, sceneData, name) => {
//   const vertexShaderCode = `
//     precision highp float;
//     attribute vec3 position;
//     attribute vec3 normal;
//     uniform mat4 world;
//     uniform mat4 worldViewProjection;
//     varying vec3 vPositionW;
//     varying vec3 vNormalW;
//     void main(void) {
//         gl_Position = worldViewProjection * vec4(position, 1.0);
//         vPositionW = (world * vec4(position, 1.0)).xyz;
//         vNormalW = normalize(vec3(world * vec4(normal, 0.0)));
//         vNormalW = normalize(vec3(world * vec4(normal.xy, -normal.z, 0.0)));
//     }
//   `;

//   const fragmentShaderCode = `
// precision highp float;

// varying vec3 vPositionW;
// varying vec3 vNormalW;

// uniform vec3 cameraPosition;
// uniform samplerCube reflectionCubeSampler;
// uniform mat4 world;
// uniform sampler2D meshDataTexture;
// uniform sampler2D indexDataTexture;
// uniform sampler2D bvhDataTexture;
// uniform int vertexCount;
// uniform int indexCount;
// uniform int bvhNodeCount;
// uniform vec2 meshDataTextureSize;
// uniform vec2 bvhDataTextureSize;
// uniform vec3 meshMin;
// uniform vec3 meshMax;

// // Uniforms to replace constants
// uniform float u_MIX;
// uniform int u_BLEND_MODE;
// uniform float u_IOR;
// uniform float u_BRIGHTNESS;
// uniform float u_R_IOR;
// uniform float u_G_IOR;
// uniform float u_B_IOR;
// uniform int u_MAX_BOUNCES;
// uniform float u_MAX_DISTANCE;
// uniform float u_EPSILON;

// struct BVHNode {
//     vec3 min;
//     vec3 max;
//     int leftChild;
//     int rightChild;
//     int triangleCount;
//     int triangleOffset;
// };

// vec3 getVertexFromTexture(int index) {
//     float y = float(index) / meshDataTextureSize.x;
//     float x = mod(float(index), meshDataTextureSize.x);
//     return texture2D(meshDataTexture, vec2(x, y) / meshDataTextureSize).xyz;
// }

// int getIndexFromTexture(int index) {
//     return int(texture2D(indexDataTexture, vec2(float(index) / float(indexCount), 0.5)).r);
// }

// BVHNode getBVHNode(int index) {
//     float y = float(index) / bvhDataTextureSize.x;
//     float x = mod(float(index), bvhDataTextureSize.x);
//     vec4 data1 = texture2D(bvhDataTexture, vec2(x, y) / bvhDataTextureSize);
//     vec4 data2 = texture2D(bvhDataTexture, vec2(x + 1.0, y) / bvhDataTextureSize);

//     BVHNode node;
//     node.min = data1.xyz;
//     node.max = data2.xyz;
//     node.leftChild = int(data1.w);
//     node.rightChild = int(data2.w);
//     node.triangleCount = int(data2.w) >> 16;
//     node.triangleOffset = int(data2.w) & 0xFFFF;
//     return node;
// }

// vec3 refract2(vec3 I, vec3 N, float ior) {
//     float cosi = clamp(-1.0, 1.0, dot(I, N));
//     float etai = 1.0, etat = ior;
//     vec3 n = N;
//     if (cosi < 0.0) {
//         cosi = -cosi;
//     } else {
//         float temp = etai;
//         etai = etat;
//         etat = temp;
//         n = -N;
//     }
//     float eta = etai / etat;
//     float k = 1.0 - eta * eta * (1.0 - cosi * cosi);
//     return k < 0.0 ? vec3(0.0) : eta * I + (eta * cosi - sqrt(k)) * n;
// }

// bool rayTriangleIntersect(vec3 rayOrigin, vec3 rayDir, vec3 v0, vec3 v1, vec3 v2, out float t, out vec3 normal) {
//     vec3 e1 = v1 - v0;
//     vec3 e2 = v2 - v0;
//     vec3 h = cross(rayDir, e2);
//     float a = dot(e1, h);

//     if (abs(a) < u_EPSILON)
//         return false;

//     float f = 1.0 / a;
//     vec3 s = rayOrigin - v0;
//     float u = f * dot(s, h);

//     if (u < 0.0 || u > 1.0)
//         return false;

//     vec3 q = cross(s, e1);
//     float v = f * dot(rayDir, q);

//     if (v < 0.0 || u + v > 1.0)
//         return false;

//     t = f * dot(e2, q);

//     if (t > u_EPSILON) {
//         normal = -normalize(cross(e1, e2));
//         return true;
//     }

//     return false;
// }

// bool intersectAABB(vec3 rayOrigin, vec3 rayDir, vec3 boxMin, vec3 boxMax) {
//     vec3 tMin = (boxMin - rayOrigin) / rayDir;
//     vec3 tMax = (boxMax - rayOrigin) / rayDir;
//     vec3 t1 = min(tMin, tMax);
//     vec3 t2 = max(tMin, tMax);
//     float tNear = max(max(t1.x, t1.y), t1.z);
//     float tFar = min(min(t2.x, t2.y), t2.z);
//     return tNear <= tFar && tFar > 0.0;
// }

// bool intersectBVH(vec3 rayOrigin, vec3 rayDir, out float nearestT, out vec3 nearestNormal) {
//     int stack[32];
//     int stackPtr = 0;
//     stack[stackPtr++] = 0;  // Push root node

//     bool hit = false;
//     nearestT = u_MAX_DISTANCE;

//     while (stackPtr > 0) {
//         int nodeIndex = stack[--stackPtr];
//         BVHNode node = getBVHNode(nodeIndex);

//         if (!intersectAABB(rayOrigin, rayDir, node.min, node.max)) {
//             continue;
//         }

//         if (node.triangleCount > 0) {
//             // Leaf node, intersect with triangles
//             for (int i = 0; i < 32; i++) {
//                 if (i >= node.triangleCount) break;
//                 int triIndex = node.triangleOffset + i;
//                 vec3 v0 = (world * vec4(getVertexFromTexture(getIndexFromTexture(triIndex * 3)), 1.0)).xyz;
//                 vec3 v1 = (world * vec4(getVertexFromTexture(getIndexFromTexture(triIndex * 3 + 1)), 1.0)).xyz;
//                 vec3 v2 = (world * vec4(getVertexFromTexture(getIndexFromTexture(triIndex * 3 + 2)), 1.0)).xyz;

//                 float t;
//                 vec3 normal;
//                 if (rayTriangleIntersect(rayOrigin, rayDir, v0, v1, v2, t, normal)) {
//                     if (t < nearestT) {
//                         nearestT = t;
//                         nearestNormal = normal;
//                         hit = true;
//                     }
//                 }
//             }
//         } else {
//             // Internal node, push children
//             stack[stackPtr++] = node.leftChild;
//             stack[stackPtr++] = node.rightChild;
//         }
//     }

//     return hit;
// }

// vec3 rayMarch(vec3 ro, vec3 rd, float ior) {
//     vec3 accumulatedColor = vec3(0.0);
//     vec3 throughput = vec3(1.0);
//     bool inside = false;

//     for (int bounce = 0; bounce < u_MAX_BOUNCES; bounce++) {
//         float t;
//         vec3 normal;

//         if (intersectBVH(ro, rd, t, normal)) {
//             vec3 intersectionPoint = ro + rd * t;

//             // Determine if we're entering or exiting the medium
//             float cosTheta = dot(rd, normal);
//             if (cosTheta > 0.0) {
//                 normal = -normal;
//                 inside = !inside;
//             }

//             float eta = inside ? ior : 1.0 / ior;
//             float r0 = (1.0 - eta) / (1.0 + eta);
//             r0 = r0 * r0;
//             float fresnel = r0 + (1.0 - r0) * pow((1.0 - abs(cosTheta)), 5.0);

//             vec3 reflectedDir = reflect(rd, normal);
//             vec3 refractedDir = refract2(rd, normal, eta);

//             // Sample environment for both reflection and refraction
//             vec3 reflectionColor = textureCube(reflectionCubeSampler, reflectedDir).rgb;

//             // Add reflection contribution
//             accumulatedColor += throughput * fresnel * reflectionColor;

//             // Simplified ray termination
//             if (bounce > 2 && max(throughput.r, max(throughput.g, throughput.b)) < 0.1)
//                 break;

//             // Continue with refracted ray
//             if (dot(refractedDir, refractedDir) > 0.0) {
//                 throughput *= (1.0 - fresnel);
//                 ro = intersectionPoint + refractedDir * u_EPSILON;
//                 rd = refractedDir;
//             } else {
//                 // Total internal reflection
//                 ro = intersectionPoint + reflectedDir * u_EPSILON;
//                 rd = reflectedDir;
//             }
//         } else {
//             // Ray missed the geometry, sample environment
//             accumulatedColor += throughput * textureCube(reflectionCubeSampler, rd).rgb;
//             break;
//         }
//     }

//     return accumulatedColor;
// }

// vec3 blendOverlay(vec3 base, vec3 blend) {
//     return mix(
//         2.0 * base * blend,
//         1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
//         step(0.5, base)
//     );
// }

// vec3 blendMultiply(vec3 base, vec3 blend) {
//     return base * blend;
// }

// void main(void) {
//     vec3 viewDir = normalize(vPositionW - cameraPosition);

//     vec3 colorR = rayMarch(vPositionW, viewDir, u_IOR * u_R_IOR);
//     vec3 colorG = rayMarch(vPositionW, viewDir, u_IOR * u_G_IOR);
//     vec3 colorB = rayMarch(vPositionW, viewDir, u_IOR * u_B_IOR);

//     vec3 refractedColor = vec3(colorR.r, colorG.g, colorB.b);
//     vec3 reflectedColor = textureCube(reflectionCubeSampler, reflect(viewDir, normalize(vNormalW))).rgb;

//     float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormalW))), 5.0);
//     vec3 finalColor = mix(refractedColor, reflectedColor, fresnel);

//     if (u_BLEND_MODE == 1) {
//         finalColor = mix(refractedColor, reflectedColor, u_MIX);
//     }

//     if (u_BLEND_MODE == 2) {
//         finalColor = blendOverlay(finalColor, reflectedColor);
//     }

//     if (u_BLEND_MODE == 3) {
//         finalColor = blendMultiply(finalColor, reflectedColor);
//     }

//     finalColor *= u_BRIGHTNESS;

//     gl_FragColor = vec4(finalColor, 1.0);
// }
//   `;

//   const id = name || "DiamondMaterial_" + Date.now();
//   Effect.ShadersStore[id + "VertexShader"] = vertexShaderCode;
//   Effect.ShadersStore[id + "FragmentShader"] = fragmentShaderCode;

//   let material = new ShaderMaterial(
//     id,
//     scene,
//     {
//       vertex: id,
//       fragment: id,
//     },
//     {
//       attributes: ["position", "normal"],
//       uniforms: [
//         "world",
//         "worldView",
//         "worldViewProjection",
//         "view",
//         "projection",
//         "cameraPosition",
//         "vertexCount",
//         "indexCount",
//         "bvhNodeCount",
//         "meshDataTextureSize",
//         "bvhDataTextureSize",
//         "meshMin",
//         "meshMax",
//         "u_MIX",
//         "u_BLEND_MODE",
//         "u_IOR",
//         "u_R_IOR",
//         "u_G_IOR",
//         "u_B_IOR",
//         "u_MAX_BOUNCES",
//         "u_MAX_DISTANCE",
//         "u_EPSILON",
//         "u_BRIGHTNESS",
//       ],
//     }
//   );

//   material.displayName = id;
//   material.isCustom = true;
//   material.getClassName = () => "DiamondMaterial";

//   let rendered = false;

//   scene.registerBeforeRender(() => {
//     if (material.getBindedMeshes()[0]) {
//       const mesh = material.getBindedMeshes()[0];

//       material.setVector3("cameraPosition", scene.activeCamera.position);
//       material.setMatrix("world", mesh.getWorldMatrix());

//       if (!rendered) {
//         const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
//         const indices = mesh.getIndices();

//         const vertexCount = positions.length / 3;
//         const indexCount = indices.length;

//         // Create a texture to store mesh data
//         const textureSize = Math.ceil(Math.sqrt(vertexCount));
//         const meshDataArray = new Float32Array(textureSize * textureSize * 4);

//         // Find the bounding box of the mesh
//         let minX = Infinity,
//           minY = Infinity,
//           minZ = Infinity;
//         let maxX = -Infinity,
//           maxY = -Infinity,
//           maxZ = -Infinity;
//         for (let i = 0; i < positions.length; i += 3) {
//           minX = Math.min(minX, positions[i]);
//           minY = Math.min(minY, positions[i + 1]);
//           minZ = Math.min(minZ, positions[i + 2]);
//           maxX = Math.max(maxX, positions[i]);
//           maxY = Math.max(maxY, positions[i + 1]);
//           maxZ = Math.max(maxZ, positions[i + 2]);
//         }

//         // Store vertex positions directly
//         for (let i = 0; i < vertexCount; i++) {
//           meshDataArray[i * 4] = positions[i * 3];
//           meshDataArray[i * 4 + 1] = positions[i * 3 + 1];
//           meshDataArray[i * 4 + 2] = positions[i * 3 + 2];
//           meshDataArray[i * 4 + 3] = 1.0; // W component
//         }

//         const meshDataTexture = RawTexture.CreateRGBATexture(
//           meshDataArray,
//           textureSize,
//           textureSize,
//           scene,
//           false,
//           false,
//           Texture.NEAREST_SAMPLINGMODE,
//           Engine.TEXTURETYPE_FLOAT
//         );

//         // Create a texture to store index data
//         const indexDataArray = new Float32Array(indexCount);
//         for (let i = 0; i < indexCount; i++) {
//           indexDataArray[i] = indices[i];
//         }

//         const indexDataTexture = RawTexture.CreateRTexture(
//           indexDataArray,
//           indexCount,
//           1,
//           scene,
//           false,
//           false,
//           Texture.NEAREST_SAMPLINGMODE,
//           Engine.TEXTURETYPE_FLOAT
//         );

//         // Create BVH
//         const bvh = createBVH(positions, indices);

//         // Create BVH texture
//         const bvhTextureSize = Math.ceil(Math.sqrt(bvh.nodes.length));
//         const bvhDataArray = new Float32Array(bvhTextureSize * bvhTextureSize * 8);

//         for (let i = 0; i < bvh.nodes.length; i++) {
//           const node = bvh.nodes[i];
//           const baseIndex = i * 8;
//           bvhDataArray[baseIndex] = node.min.x;
//           bvhDataArray[baseIndex + 1] = node.min.y;
//           bvhDataArray[baseIndex + 2] = node.min.z;
//           bvhDataArray[baseIndex + 3] = node.leftChild;
//           bvhDataArray[baseIndex + 4] = node.max.x;
//           bvhDataArray[baseIndex + 5] = node.max.y;
//           bvhDataArray[baseIndex + 6] = node.max.z;
//           bvhDataArray[baseIndex + 7] = (node.triangleCount << 16) | node.triangleOffset;
//         }

//         const bvhDataTexture = RawTexture.CreateRGBATexture(
//           bvhDataArray,
//           bvhTextureSize * 2,
//           bvhTextureSize,
//           scene,
//           false,
//           false,
//           Texture.NEAREST_SAMPLINGMODE,
//           Engine.TEXTURETYPE_FLOAT
//         );

//         material.setTexture("reflectionCubeSampler", scene.environmentTexture);
//         material.setTexture("meshDataTexture", meshDataTexture);
//         material.setTexture("indexDataTexture", indexDataTexture);
//         material.setTexture("bvhDataTexture", bvhDataTexture);
//         material.setInt("vertexCount", vertexCount);
//         material.setInt("indexCount", indexCount);
//         material.setInt("bvhNodeCount", bvh.nodes.length);
//         material.setVector2("meshDataTextureSize", new Vector2(textureSize, textureSize));
//         material.setVector2("bvhDataTextureSize", new Vector2(bvhTextureSize * 2, bvhTextureSize));
//         material.setVector3("meshMin", new Vector3(minX, minY, minZ));
//         material.setVector3("meshMax", new Vector3(maxX, maxY, maxZ));

//         // Set default values
//         material.setInt("u_BLEND_MODE", 1);
//         material.setFloat("u_MIX", 0.5);
//         material.setFloat("u_BRIGHTNESS", 1);
//         material.setFloat("u_IOR", 2.4);
//         material.setFloat("u_R_IOR", 0.99);
//         material.setFloat("u_G_IOR", 1);
//         material.setFloat("u_B_IOR", 1.01);
//         material.setInt("u_MAX_BOUNCES", 3);
//         material.setFloat("u_MAX_DISTANCE", 10.0);
//         material.setFloat("u_EPSILON", 0.001);

//         // Apply any custom properties from sceneData
//         setNodeProps(scene, sceneData ? sceneData.materials : null, material, diamondMaterialProps);

//         rendered = true;
//       }
//     }
//   });

//   return material;
// };

// Helper function to create BVH
function createBVH(positions, indices) {
  const nodes = [];
  const rootNode = {
    min: new Vector3(Infinity, Infinity, Infinity),
    max: new Vector3(-Infinity, -Infinity, -Infinity),
    leftChild: 0,
    rightChild: 0,
    triangleCount: indices.length / 3,
    triangleOffset: 0,
  };

  for (let i = 0; i < indices.length; i += 3) {
    for (let j = 0; j < 3; j++) {
      const index = indices[i + j];
      const x = positions[index * 3];
      const y = positions[index * 3 + 1];
      const z = positions[index * 3 + 2];

      rootNode.min.x = Math.min(rootNode.min.x, x);
      rootNode.min.y = Math.min(rootNode.min.y, y);
      rootNode.min.z = Math.min(rootNode.min.z, z);
      rootNode.max.x = Math.max(rootNode.max.x, x);
      rootNode.max.y = Math.max(rootNode.max.y, y);
      rootNode.max.z = Math.max(rootNode.max.z, z);
    }
  }

  nodes.push(rootNode);

  // Implement a more sophisticated BVH construction here
  // This could involve recursively subdividing the mesh and creating a tree structure

  return { nodes };
}
export const createShadowOnlyMaterial = (scene, sceneData, name) => {
  const id = name || "Material_" + Date.now();
  const material = new ShadowOnlyMaterial(id, scene);

  material.displayName = id;
  material.isCustom = true;
  setNodeProps(scene, sceneData ? sceneData.materials : null, material, shadowOnlyMaterialProps);
  return material;
};

export const create3DText = async (scene, sceneData, options, name) => {
  const id = name || "3DText_" + Date.now();

  const res = await fetch(options.font);

  const parsedFont = await res.json();
  const node = MeshBuilder.CreateText(
    id,
    options.text,
    parsedFont,
    {
      size: 1,
      resolution: options.resolution,
      depth: 1,
    },
    scene,
    earcut
  );
  node.getClassName = () => {
    return "3DText";
  };
  scene.badAssets[id] = node;
  attachActionManagers(scene, node);
  node.name = id;
  node.displayName = id;
  node.isCustom = true;

  setNodeProps(scene, sceneData ? sceneData.nodes : null, node, meshProps);

  // if (sceneData && sceneData.textures[name] && sceneData.textures[name].decals) {
  //   Object.entries(sceneData.textures[name].decals).forEach(([k, v]) => {
  //     if (scene.getMeshByName(v.mesh)) {
  //       createDecal(scene, null, k, scene.getMeshByName(v.mesh), texture, v.position, v.scale);
  //     }
  //   });
  // }

  return node;
};

export const createTexture = (scene, sceneData, url, name) => {
  const id = name || "Texture_" + Date.now();
  const texture = new Texture(url || fallbackTexture, scene, false, false);

  texture.name = id;
  texture.displayName = id;
  texture.isCustom = true;

  setNodeProps(scene, sceneData ? sceneData.textures : null, texture, textureProps);

  // if (sceneData && sceneData.textures[name] && sceneData.textures[name].decals) {
  //   Object.entries(sceneData.textures[name].decals).forEach(([k, v]) => {
  //     if (scene.getMeshByName(v.mesh)) {
  //       createDecal(scene, null, k, scene.getMeshByName(v.mesh), texture, v.position, v.scale);
  //     }
  //   });
  // }

  return texture;
};

export const createPhotoDome = (scene, sceneData, url, name) => {
  const id = name || "PhotoDome_" + Date.now();
  const dome = new PhotoDome(id, url || fallbackTexture, { resolution: 32, size: 100 }, scene);
  dome.getClassName = () => {
    return "PhotoDome";
  };
  scene.badAssets[id] = dome;
  dome.scaling.x = -1;
  dome.name = id;
  dome.displayName = id;
  dome.isCustom = true;
  setNodeProps(scene, sceneData ? sceneData.nodes : null, dome, photoDomeProps);
  return dome;
};
export const createCubeTexture = (scene, sceneData, url, name) => {
  const id = name || "Texture_" + Date.now();

  const texture = new CubeTexture(url || fallbackTexture, scene, null, false, null, null, null, Constants.TEXTUREFORMAT_RGBA, false);

  texture.name = id;
  texture.displayName = id;
  texture.isCustom = true;
  setNodeProps(scene, sceneData ? sceneData.textures : null, texture, cubeTextureProps);
  return texture;
};

export const crerateColorGradingTexture = (scene, sceneData, url, name) => {
  const id = name || "Texture_" + Date.now();

  const texture = new ColorGradingTexture(url || fallbackTexture, scene);
  texture.getClassName = () => {
    return "ColorGradingTexture";
  };
  texture.name = id;
  texture.displayName = id;
  texture.isCustom = true;
  setNodeProps(scene, sceneData ? sceneData.textures : null, texture, colorGradingtextureProps);
  return texture;
};

export const createHDRCubeTexture = (scene, sceneData, url, name) => {
  const id = name || "Texture_" + Date.now();

  const texture = new HDRCubeTexture(url || fallbackTexture, scene, 128, false, true, false, true);

  texture.name = id;
  texture.displayName = id;
  texture.isCustom = true;
  setNodeProps(scene, sceneData ? sceneData.textures : null, texture, hdrCubeTextureProps);
  return texture;
};

export const createVideoTexture = (scene, sceneData, url, name) => {
  const id = name || "Texture_" + Date.now();

  const video = document.createElement("video");
  video.src = url;
  video.autoplay = false;
  video.muted = true;
  video.loop = false;
  video.currenTime = 0;

  // var playPromise = video.play();

  // if (playPromise !== undefined) {
  //   playPromise
  //     .then((_) => {
  //       // Automatic playback started!
  //       // Show playing UI.
  //       // We can now safely pause video...
  //       video.pause();
  //     })
  //     .catch((error) => {
  //       // Auto-play was prevented
  //       // Show paused UI.
  //     });
  // }

  const texture = new VideoTexture(id, video, scene, false, true, undefined, { autoPlay: false });
  // texture.video.autoplay = false;
  // texture.video.muted = true;
  // texture.video.loop = false;
  // texture.video.currentTime = 0;
  // texture.muted = true;
  texture.name = id;
  texture.displayName = id;
  texture.isCustom = true;

  setNodeProps(scene, sceneData ? sceneData.textures : null, texture, videoTextureProps);

  return texture;
};

export const createDynamicTexture = (scene, sceneData, name) => {
  const id = name || "Texture_" + Date.now();
  const texture = new DynamicTexture(id, { width: 1024, height: 1024 }, scene);
  texture.hasAlpha = true;
  texture.name = id;
  texture.displayName = id;
  texture.isCustom = true;
  setNodeProps(scene, sceneData ? sceneData.textures : null, texture, dynamicTextureProps);
  return texture;
};

// export const createDecal = (scene, sceneData, name, mesh, texture, position, scaling) => {
//   if (!texture.hasOwnProperty("decals")) {
//     texture.decals = {};
//   }

//   var decalMaterial = scene.getMaterialByName(texture.name + "_Decal" + "_Material")
//     ? scene.getMaterialByName(texture.name + "_Decal" + "_Material")
//     : new StandardMaterial(texture.name + "_Decal" + "_Material", scene);
//   decalMaterial.isCustom = true;
//   decalMaterial.diffuseTexture = texture;
//   decalMaterial.diffuseTexture.hasAlpha = true;
//   decalMaterial.zOffset = -2;

//   var decalSize = new Vector3(scaling.x, scaling.y, scaling.z);
//   var decalPosition = new Vector3(position.x, position.y, position.z);

//   var id = texture.name + "_Decal_" + Date.now();

//   texture.decals[id] = MeshBuilder.CreateDecal(id, mesh, {
//     position: decalPosition,
//     // normal: scene.activeCamera.getForwardRay().direction.negateInPlace().normalize(),
//     localMode: true,
//     size: decalSize,
//   });

//   texture.decals[id].material = decalMaterial;

//   texture.decals[id].setParent(mesh);
//   return texture.decals[id];
// };
export const createSound = (scene, sceneData, url, name) => {
  const id = name || "Sound_" + Date.now();
  const sound = new Sound(id, url || null, scene, null);
  sound.displayName = id;
  sound.isCustom = true;
  setNodeProps(scene, sceneData ? sceneData.sounds : null, sound, soundProps);
  return sound;
};

export const createMeshInstance = (scene, sceneData, node, name) => {
  const id = name || "MeshInstance_" + Date.now();

  const instance = node.createInstance(id);

  instance.instanceOf = node.name;

  instance.displayName = node.name + " Instance";
  if (node.parent) {
    instance.setParent(node.parent);
  } else {
    scene.badAssets[id] = instance;
  }

  instance.position = node.position.clone();
  instance.rotation = node.rotation.clone();
  instance.scaling = node.scaling.clone();

  setNodeProps(scene, sceneData ? sceneData.nodes : null, instance, transformNodeProps);

  return instance;
};

export const createMeshClone = (scene, sceneData, node, name) => {
  const id = name || "MeshClone_" + Date.now();

  const clone = node.clone(id, null, true);
  clone.makeGeometryUnique();
  clone.cloneOf = node.name;

  clone.displayName = node.name + " Clone";

  if (clone.rotationQuaternion) {
    clone.rotation = clone.rotationQuaternion.toEulerAngles();
    clone.rotationQuaternion = null;
  }

  if (clone.getClassName() === "Mesh") {
    attachActionManagers(scene, clone);
  }

  clone.getDescendants(false).forEach((child, i) => {
    if (child.rotationQuaternion) {
      child.rotation = child.rotationQuaternion.toEulerAngles();
      child.rotationQuaternion = null;
    }

    if (child.getClassName() === "Mesh") {
      attachActionManagers(scene, child);
    }
  });

  if (node.parent) {
    clone.setParent(node.parent);
  } else {
    scene.badAssets[id] = clone;
  }

  if (clone.isAsset) {
    clone.isAsset = false;
  }
  setNodeProps(scene, sceneData ? sceneData.nodes : null, clone, meshProps);

  return clone;
};

export const createTransformNodeClone = (scene, sceneData, node, name) => {
  const id = name || "TransformNodeClone_" + Date.now();

  const clone = node.clone(id);

  clone.cloneOf = node.name;

  clone.displayName = node.name + " Clone";
  clone.badChanges = {};
  if (clone.rotationQuaternion) {
    clone.rotation = clone.rotationQuaternion.toEulerAngles();
    clone.rotationQuaternion = null;
  }

  if (node.badChanges) {
    clone.badChanges = node.badChanges;
  }

  clone.badChanges.displayName = clone.displayName;

  clone.getDescendants(false).forEach((child, i) => {
    if (child.rotationQuaternion) {
      child.rotation = child.rotationQuaternion.toEulerAngles();
      child.rotationQuaternion = null;
    }

    if (child.getClassName() === "Mesh") {
      attachActionManagers(scene, child);
    }
  });

  if (node.parent) {
    clone.setParent(node.parent);
  } else {
    scene.badAssets[id] = clone;
  }

  setNodeProps(scene, sceneData ? sceneData.nodes : null, clone, transformNodeProps);

  return clone;
};

export const createMaterialClone = (scene, sceneData, node, name) => {
  const id = name || "MaterialClone_" + Date.now();

  const clone = node.clone(id);

  clone.cloneOf = node.name;

  clone.displayName = node.name + " Clone";

  let matProps = null;

  if (node.getClassName() === "PBRMaterial") {
    matProps = PBRMaterialProps;
  }

  if (node.getClassName() === "ShadowOnlyMaterial") {
    matProps = shadowOnlyMaterialProps;
  }

  setNodeProps(scene, sceneData ? sceneData.materials : null, clone, matProps);

  return clone;
};

export const createMaterialCopy = (scene, sceneData, node) => {
  const id = node.name + "_copy_" + Date.now();

  let matProps = null;
  let copy = null;

  if (node.getClassName() === "PBRMaterial") {
    matProps = PBRMaterialProps;

    copy = new PBRMaterial(id, scene);
  }

  if (node.getClassName() === "ShadowOnlyMaterial") {
    matProps = shadowOnlyMaterialProps;

    copy = new ShadowOnlyMaterial(id, scene);
  }
  const nodeData = getNodeData(node, matProps);
  console.log(nodeData);
  setNodeProps(scene, { [id]: nodeData }, copy, matProps);
  copy.badChanges = nodeData;
  copy.displayName = node.displayName + " Copy";
  copy.badChanges.displayName = node.displayName + " Copy";

  return copy;
};

export const createLightClone = (scene, sceneData, node, name) => {
  const id = name || "LightClone_" + Date.now();

  const clone = node.clone(id);

  clone.cloneOf = node.name;

  clone.displayName = node.name + " Clone";

  let lightProps = null;

  if (node.getClassName() === "PointLight") {
    lightProps = pointLightProps;
  }
  if (node.getClassName() === "DirectionalLight") {
    lightProps = directionalLightProps;
  }
  if (node.getClassName() === "SpotLight") {
    lightProps = spotLightProps;
  }
  if (node.getClassName() === "HemisphericLight") {
    lightProps = hemisphericLightProps;
  }

  setNodeProps(scene, sceneData ? sceneData.lights : null, clone, lightProps);

  return clone;
};

export const createLightCopy = (scene, sceneData, node) => {
  const id = node.name + "_copy_" + Date.now();

  let lightProps = null;
  let copy = null;

  if (node.getClassName() === "PointLight") {
    lightProps = pointLightProps;

    copy = new PointLight(id, new Vector3(0, 0, 0), scene);
  }
  if (node.getClassName() === "DirectionalLight") {
    lightProps = directionalLightProps;

    copy = new DirectionalLight(id, new Vector3(0, -1, 0), scene);
  }
  if (node.getClassName() === "SpotLight") {
    lightProps = spotLightProps;

    copy = new SpotLight(id, new Vector3(0, 0, 0), new Vector3(0, -1, 0), Math.PI / 3, scene);
  }
  if (node.getClassName() === "HemisphericLight") {
    lightProps = hemisphericLightProps;

    copy = new HemisphericLight(id, new Vector3(0, 1, 0), scene);
  }
  const nodeData = getNodeData(node, lightProps);

  copy.shadowGenerator = new ShadowGenerator(1024, copy);

  copy.shadowGenerator.useKernelBlur = true;
  copy.shadowGenerator.useBlurExponentialShadowMap = true;

  setNodeProps(scene, { [id]: nodeData }, copy, lightProps);
  copy.badChanges = nodeData;
  copy.displayName = node.displayName + " Copy";
  copy.badChanges.displayName = node.displayName + " Copy";
  console.log(copy);
  return copy;
};

export const createVariable = (scene, sceneData, name) => {
  const id = name || "Variable_" + Date.now();

  const variable = (scene.variables[id] = {
    name: id,
    displayName: "Variable",
    type: "Variable",
  });

  variable.getClassName = () => {
    return "Variable";
  };

  setNodeProps(scene, sceneData ? sceneData.variables : null, variable, variableProps);
  return variable;
};

export const createArcRotateCamera = (scene, sceneData, name) => {
  const id = name || "Camera_" + Date.now();
  const camera = new ArcRotateCamera(id, 1, 1, 1, new Vector3(0, 0, 0), scene);
  camera.radius = 10;
  camera.displayName = id;
  if (sceneData && sceneData.hasOwnProperty("zoomSensitivity")) {
    camera.zoomSensitivity = sceneData.zoomSensitivity;
  } else {
    camera.zoomSensitivity = 0.5;
  }
  if (sceneData && sceneData.hasOwnProperty("panSensitivity")) {
    camera.panSensitivity = sceneData.panSensitivity;
  } else {
    camera.panSensitivity = 0.5;
  }

  camera.useNaturalPinchZoom = true;

  scene.onBeforeRenderObservable.add(() => {
    camera.wheelPrecision = (100 / camera.radius / camera.zoomSensitivity) * 2 + 100;

    if (camera.zoomSensitivity === 0) camera.wheelPrecision = 999999999;

    camera.panningSensibility = (2000 / camera.radius / camera.panSensitivity) * 2 + 100;

    if (camera.panSensitivity === 0) camera.panningSensibility = 0;

    // function findClosestAngleInRadians(angleInRadians) {
    //   // Convert the angle to the equivalent angle in the range [0, 2π]
    //   const wrappedAngle = angleInRadians % (2 * Math.PI);

    //   // If the wrapped angle is negative, add 2π to find the equivalent positive angle
    //   if (wrappedAngle < 0) {
    //     return wrappedAngle + 2 * Math.PI;
    //   }

    //   return wrappedAngle;
    // }

    // camera.alpha = findClosestAngleInRadians(camera.alpha);
    // camera.beta = findClosestAngleInRadians(camera.beta);
  });

  try {
    if (sceneData && sceneData.cameras && sceneData.cameras[id] && !sceneData.cameras[id].hasOwnProperty("alpha") && !camera.autoset) {
      scene.meshes.forEach((a) => {
        if (a.isAsset) {
          let descendants = a.getDescendants();
          let worldMatrices = descendants.map((descendant) => descendant.computeWorldMatrix(true));
          let minPoint = null;
          let maxPoint = null;

          descendants.forEach((descendant) => {
            try {
              let boundingInfo = descendant.getBoundingInfo();
              let boundingBox = boundingInfo.boundingBox;
              let minWorld = boundingBox.minimumWorld;
              let maxWorld = boundingBox.maximumWorld;

              if (!minPoint || !maxPoint) {
                minPoint = minWorld.clone();
                maxPoint = maxWorld.clone();
              } else {
                minPoint = Vector3.Minimize(minPoint, minWorld);
                maxPoint = Vector3.Maximize(maxPoint, maxWorld);
              }
            } catch (error) {
              console.warn(error);
            }
          });

          // If the node itself is a mesh with geometry, include its bounding box in the calculation
          if (a.getBoundingInfo) {
            let nodeMinWorld = a.getBoundingInfo().boundingBox.minimumWorld;
            let nodeMaxWorld = a.getBoundingInfo().boundingBox.maximumWorld;
            minPoint = minPoint ? Vector3.Minimize(minPoint, nodeMinWorld) : nodeMinWorld.clone();
            maxPoint = maxPoint ? Vector3.Maximize(maxPoint, nodeMaxWorld) : nodeMaxWorld.clone();
          }

          // Now we have minPoint and maxPoint representing the combined bounding box
          // Calculate the center
          let center = minPoint.add(maxPoint).scale(0.5);
          camera.target = center;

          let size = maxPoint.subtract(minPoint);
          let maxDimension = Math.max(size.x, size.y, size.z);
          camera.radius = maxDimension * 2; // Adjust as needed

          // const mesh = a.getDescendants().filter((m) => m.getClassName() === "Mesh")[0];

          // var boundingBox = mesh.getBoundingInfo().boundingBox;

          // var center = boundingBox.centerWorld.clone();
          // camera.setTarget(center);

          // var size = boundingBox.maximumWorld.subtract(boundingBox.minimumWorld);

          // var radius = size.length() * 1;

          // camera.radius = radius;
          camera.autoset = true;
        }
      });
    }
  } catch (error) {
    console.error(error);
  }

  setNodeProps(scene, sceneData ? sceneData.cameras : null, camera, arcRotateCameraProps);

  return camera;
};

export const createUniversalCamera = (scene, sceneData, name) => {
  const id = name || "Camera_" + Date.now();

  const camera = new UniversalCamera(id, new Vector3(0, 0, 0), scene);
  camera.displayName = id;

  camera.keysUp = [87];
  camera.keysDown = [83];
  camera.keysLeft = [65];
  camera.keysRight = [68];
  camera.inputs.remove(camera.inputs.attached.touch);
  camera.inputs.remove(camera.inputs.attached.mouse);

  //The Mouse Manager to use the mouse (touch) to search around including above and below
  var FreeCameraSearchInput = function (touchEnabled) {
    if (touchEnabled === void 0) {
      touchEnabled = true;
    }
    this.touchEnabled = touchEnabled;
    this.buttons = [0, 1, 2];
    this.angularSensibility = 1500;
    this.restrictionX = 100000;
    this.restrictionY = 100000;
  };
  //add attachment control which also contains the code to react to the input from the mouse
  FreeCameraSearchInput.prototype.attachControl = function (noPreventDefault) {
    var _this = this;
    var engine = this.camera.getEngine();
    var element = engine.getInputElement();
    var angle = { x: 0, y: 0 };
    if (!this._pointerInput) {
      this._pointerInput = function (p, s) {
        var evt = p.event;
        if (!_this.touchEnabled && evt.pointerType === "touch") {
          return;
        }
        if (p.type !== PointerEventTypes.POINTERMOVE && _this.buttons.indexOf(evt.button) === -1) {
          return;
        }
        if (p.type === PointerEventTypes.POINTERDOWN) {
          try {
            evt.srcElement.setPointerCapture(evt.pointerId);
          } catch (e) {
            //Nothing to do with the error. Execution will continue.
          }
          _this.previousPosition = {
            x: evt.clientX,
            y: evt.clientY,
          };
          if (!noPreventDefault) {
            evt.preventDefault();
            element.focus();
          }
        } else if (p.type === PointerEventTypes.POINTERUP) {
          try {
            evt.srcElement.releasePointerCapture(evt.pointerId);
          } catch (e) {
            //Nothing to do with the error.
          }
          _this.previousPosition = null;
          if (!noPreventDefault) {
            evt.preventDefault();
          }
        } else if (p.type === PointerEventTypes.POINTERMOVE) {
          if (!_this.previousPosition || engine.isPointerLock) {
            return;
          }
          var offsetX = evt.clientX - _this.previousPosition.x;
          var offsetY = evt.clientY - _this.previousPosition.y;
          angle.x += offsetX;
          angle.y -= offsetY;
          if (Math.abs(angle.x) > _this.restrictionX) {
            angle.x -= offsetX;
          }
          if (Math.abs(angle.y) > _this.restrictionY) {
            angle.y += offsetY;
          }
          if (_this.camera.getScene().useRightHandedSystem) {
            if (Math.abs(angle.x) < _this.restrictionX) {
              _this.camera.cameraRotation.y -= offsetX / _this.angularSensibility;
            }
          } else {
            if (Math.abs(angle.x) < _this.restrictionX) {
              _this.camera.cameraRotation.y += offsetX / _this.angularSensibility;
            }
          }
          if (Math.abs(angle.y) < _this.restrictionY) {
            _this.camera.cameraRotation.x += offsetY / _this.angularSensibility;
          }
          _this.previousPosition = {
            x: evt.clientX,
            y: evt.clientY,
          };

          if (!noPreventDefault) {
            evt.preventDefault();
          }
        }
        camera.rotation.y = findClosestAngleInRadians(camera.rotation.y);
      };
    }
    this._onSearchMove = function (evt) {
      if (!engine.isPointerLock) {
        return;
      }

      var offsetX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || evt.msMovementX || 0;
      var offsetY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || evt.msMovementY || 0;
      if (_this.camera.getScene().useRightHandedSystem) {
        _this.camera.cameraRotation.y -= offsetX / _this.angularSensibility;
      } else {
        _this.camera.cameraRotation.y += offsetX / _this.angularSensibility;
      }

      _this.camera.cameraRotation.x += offsetY / _this.angularSensibility;

      _this.previousPosition = null;
      if (!noPreventDefault) {
        evt.preventDefault();
      }
    };
    this._observer = this.camera
      .getScene()
      .onPointerObservable.add(this._pointerInput, PointerEventTypes.POINTERDOWN | PointerEventTypes.POINTERUP | PointerEventTypes.POINTERMOVE);
    element.addEventListener("mousemove", this._onSearchMove, false);
  };

  //Add detachment control
  FreeCameraSearchInput.prototype.detachControl = function () {
    var engine = this.camera.getEngine();
    var element = engine.getInputElement();
    if (this._observer && element) {
      this.camera.getScene().onPointerObservable.remove(this._observer);
      element.removeEventListener("mousemove", this._onSearchMove);
      this._observer = null;
      this._onSearchMove = null;
      this.previousPosition = null;
    }
  };

  //Add the two required functions for names
  FreeCameraSearchInput.prototype.getClassName = function () {
    return "FreeCameraSearchInput";
  };

  FreeCameraSearchInput.prototype.getSimpleName = function () {
    return "MouseSearchCamera";
  };

  //Add the new mouse input manager to the camera
  camera.inputs.add(new FreeCameraSearchInput());

  setNodeProps(scene, sceneData ? sceneData.cameras : null, camera, universalCameraProps);

  return camera;
};
