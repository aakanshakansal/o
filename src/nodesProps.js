import {
  Camera,
  Color3,
  Color4,
  Constants,
  DynamicTexture,
  Engine,
  GizmoManager,
  LightGizmo,
  Mesh,
  MeshBuilder,
  MirrorTexture,
  PBRMaterial,
  Plane,
  PointerEventTypes,
  Quaternion,
  ReflectionProbe,
  RefractionTexture,
  SSAO2RenderingPipeline,
  SSRRenderingPipeline,
  Vector3,
} from "@babylonjs/core";

import { toast } from "sonner";
import {
  colorGradingTextureExtensions,
  cubeTextureExtensions,
  hdrCubeTextureExtensions,
  soundExtensions,
  textureExtensions,
  videoTextureExtensions,
} from "./constants";
import fallbackTexture from "./fallbackTexture";
import { degreesToRadiants, focalLengthToRadiants, getDeep, radiantsToDegrees, radiantsToFocalLength } from "./helpers";
import { createCubeTexture, createMeshClone, createPBRMaterial } from "./sceneFunctions/createSceneElements";
export const actionProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },
  // trackEvent: { label: "Track Event", type: "Boolean" },

  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const overlayProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },
  enabled: {
    label: "Enabled",
    type: "Boolean",
  },
  zIndex: { type: "Number", label: "Z Index", override: 1, forceInt: true },
  // badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const engineProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  hardwareScalingLevel: {
    label: "Resolution (reload required)",
    type: "Select",
    options: {
      HD: "HD",
      MD: "Medium",
      SD: "SD",
    },
    onSet: (scene, node, value) => {
      if (value !== null && (value === "HD" || value === "MD" || value === "SD")) {
        if (value === "HD") {
          node.setHardwareScalingLevel(0.5);
          node.hardwareScalingLevel = value;
        }
        if (value === "MD") {
          node.setHardwareScalingLevel(1);
          node.hardwareScalingLevel = value;
        }
        if (value === "SD") {
          node.setHardwareScalingLevel(2);
          node.hardwareScalingLevel = value;
        }
      } else {
        node.setHardwareScalingLevel(0.5);
        node.hardwareScalingLevel = "HD";
      }
    },
    onChange: (e, scene, node, key) => {
      if (e.target.value === "HD") {
        node.setHardwareScalingLevel(0.5);
        node.hardwareScalingLevel = "HD";
      }
      if (e.target.value === "MD") {
        node.setHardwareScalingLevel(1);
        node.hardwareScalingLevel = "MD";
      }
      if (e.target.value === "SD") {
        node.setHardwareScalingLevel(2);
        node.hardwareScalingLevel = "SD";
      }
    },
  },
  // framerate: { label: "Framerate", type: "Number", override: 120 },
  enableWebGPU: {
    label: "Enable WebGPU (reload required)",
    type: "Boolean",
  },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const sceneProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  // ambientColor: { group: "Basic", label: "Ambient Color", type: "Color3", tip: "This is the color of the ambient" },
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

  //
  // clearColorTransparentButton: {
  //   label: "Make Transparent",
  //   type: "FunctionButton",

  //   function: (e, scene, node) => {
  //     scene.clearColorTransparent = true;
  //     scene.clearColor = new Color4(0, 0, 0, 0);
  //     scene.
  //   },
  // },

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

  // badDefaultCursor: {
  //   label: "Cursor",
  //   type: "AssetReference",
  //   extensions: ["svg", "png", "jpg", "webp"],

  //   onSet: (scene, node, value) => {
  //     if (value !== null) {
  //       node.defaultCursor = node.defaultCursor = "url(" + value + ") 16 16, auto";
  //     }
  //   },
  //   onChange: (e, scene, node, key, url, ref) => {
  //     scene.defaultCursor = "url(" + url + ") 16 16, auto";

  //     node.badDefaultCursor = url;
  //     node.badDefaultCursorREF = ref;
  //   },
  // },

  // badHoverCursor: {
  //   label: "Hover Cursor",
  //   type: "AssetReference",
  //   extensions: ["svg", "png", "jpg", "webp"],

  //   onSet: (scene, node, value) => {
  //     if (value !== null) {
  //       node.hoverCursor = node.hoverCursor = "url(" + value + ") 16 16, auto";
  //     }
  //   },
  //   onChange: (e, scene, node, key, url, ref) => {
  //     scene.hoverCursor = "url(" + url + ") 16 16, auto";

  //     node.badHoverCursor = "url(" + url + ") 16 16, auto";
  //     node.badHoverCursorREF = ref;
  //   },
  // },

  // defaultCursor: { group: "Basic", label: "Default Cursor", type: "String" },
  environmentIntensity: { label: "Env Intensity", type: "Number" },
  environmentTexture: {
    label: "Environment Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },

  // "giRSMMgr.enable": {
  //   label: "Enable GI",
  //   type: "Boolean",
  // },

  // "giRSMMgr.numSamples": {
  //   type: "Number",
  //   label: "Samples",
  //   forceInt: true,

  //   onSet: (scene, node, value) => {
  //     if (value === undefined) return;
  //     node.giRSMMgr.numSamples = value;

  //     scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //       giRSM.numSamples = value;
  //     });
  //   },

  //   onChange: (e, scene, node, key) => {
  //     node.giRSMMgr.numSamples = e.target.value;

  //     scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //       giRSM.numSamples = e.target.value;
  //     });
  //   },
  // },

  // "giRSMMgr.intensity": {
  //   type: "Number",
  //   label: "Intensity",
  //   onSet: (scene, node, value) => {
  //     if (value === undefined) {
  //       node.giRSMMgr.intensity = 10;
  //     } else {
  //       node.giRSMMgr.intensity = value;

  //       scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //         giRSM.intensity = value;
  //       });
  //     }
  //   },

  //   onChange: (e, scene, node, key) => {
  //     node.giRSMMgr.intensity = e.target.value;

  //     scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //       giRSM.intensity = e.target.value;
  //     });
  //   },
  // },
  // "giRSMMgr.radius": {
  //   type: "Number",
  //   label: "Radius",

  //   onSet: (scene, node, value) => {
  //     if (value === undefined) return;
  //     node.giRSMMgr.radius = value;

  //     scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //       giRSM.radius = value;
  //     });
  //   },

  //   onChange: (e, scene, node, key) => {
  //     node.giRSMMgr.radius = e.target.value;

  //     scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //       giRSM.radius = e.target.value;
  //     });
  //   },
  // },

  // "giRSMMgr.edgeArtifactCorrection": {
  //   type: "Number",
  //   label: "edgeArtifactCorrection",

  //   onSet: (scene, node, value) => {
  //     if (value === undefined) return;
  //     node.giRSMMgr.edgeArtifactCorrection = value;

  //     scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //       giRSM.edgeArtifactCorrection = value;
  //     });
  //   },

  //   onChange: (e, scene, node, key) => {
  //     node.giRSMMgr.edgeArtifactCorrection = e.target.value;

  //     scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //       giRSM.edgeArtifactCorrection = e.target.value;
  //     });
  //   },
  // },

  // "giRSMMgr.noiseFactor": {
  //   type: "Number",
  //   label: "noiseFactor",

  //   onSet: (scene, node, value) => {
  //     if (value === undefined) return;
  //     node.giRSMMgr.noiseFactor = value;

  //     scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //       giRSM.noiseFactor = value;
  //     });
  //   },

  //   onChange: (e, scene, node, key) => {
  //     node.giRSMMgr.noiseFactor = e.target.value;

  //     scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //       giRSM.noiseFactor = e.target.value;
  //     });
  //   },
  // },

  // "giRSMMgr.rotateSample": {
  //   type: "Boolean",
  //   label: "rotateSample",

  //   onSet: (scene, node, value) => {
  //     if (value === undefined) return;
  //     node.giRSMMgr.rotateSample = Boolean(value);

  //     scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //       giRSM.rotateSample = Boolean(value);
  //     });
  //   },

  //   onChange: (e, scene, node, key) => {
  //     node.giRSMMgr.rotateSample = e.target.checked;

  //     scene.giRSMMgr.giRSM.forEach((giRSM) => {
  //       giRSM.rotateSample = e.target.checked;
  //     });
  //   },
  // },
  // "giRSMMgr.enableBlur": { type: "Boolean", label: "Enale Blur" },

  // "giRSMMgr.blurKernel": { type: "Number", label: "Blur Intensity" },

  // fogTitle: { group: "Fog", label: "Fog", type: "Title" },
  // fogEnabled: { group: "Fog", label: "Enable Fog", type: "Boolean", override: false },
  // fogColor: { group: "Fog", label: "Fog Color", type: "Color3", override: "#000000" },
  // fogStart: { group: "Fog", label: "Fog Start", type: "Number", unit: "meters" },
  // fogEnd: { group: "Fog", label: "Fog End", type: "Number", unit: "meters" },
  // effTitle: { group: "Effects", label: "Effects", type: "Title" },
  // "imageProcessingConfiguration.isEnabled": {
  //   group: "Effects",
  //   label: "Enable Effects",
  //   type: "Boolean",
  //   override: false,
  // },
  // "imageProcessingConfiguration.exposure": { group: "Effects", label: "Exposure", type: "Number" },
  // "imageProcessingConfiguration.contrast": { group: "Effects", label: "Contrast", type: "Number" },
  // "imageProcessingConfiguration.colorGradingEnabled": { group: "Effects", label: "Enable Color Grading", type: "Boolean" },
  // "imageProcessingConfiguration.colorGradingTexture": { group: "Effects", label: "Color Grading Texture", type: "Texture" },
  // "imageProcessingConfiguration.toneMappingEnabled": { group: "Effects", label: "Enable Tone Mapping", type: "Boolean" },
  // "imageProcessingConfiguration.toneMappingType": {
  //   group: "Effects",
  //   label: "Tone Mapping Type",
  //   type: "Select",
  //   options: {
  //     0: "Standard",
  //     1: "ACES",
  //   },
  // },
  // "imageProcessingConfiguration.vignetteEnabled": { group: "Effects", label: "Enable Vignette", type: "Boolean" },
  // "imageProcessingConfiguration.vignetteColor": { group: "Effects", label: "Vignette Color", type: "Color3", override: "#000000" },
  // "imageProcessingConfiguration.vignetteWeight": { group: "Effects", label: "Vignette Weight", type: "Number" },
  // "imageProcessingConfiguration.vignetteStretch": { group: "Effects", label: "Vignette Stretch", type: "Number" },

  fogEnabled: { group: "Fog", label: "Enable Fog", type: "Boolean", override: false },
  fogColor: { group: "Fog", label: "Fog Color", type: "Color3", override: "#000000" },
  fogStart: { group: "Fog", label: "Fog Start", type: "Number", unit: "meters" },
  fogEnd: { group: "Fog", label: "Fog End", type: "Number", unit: "meters" },

  useOrderIndependentTransparency: { group: "Utilities", label: "Enable OIT", type: "Boolean" },
  forceShowBoundingBoxes: { group: "Utilities", label: "Show Bounding Boxes", type: "Boolean" },
  forceWireframe: { group: "Utilities", label: "Show Wireframe", type: "Boolean" },

  //useRightHandedSystem: { group: "Utilities", label: "Use Right Handed System (requires restart)", type: "Boolean" },

  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const arcRotateCameraProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String", showInEssentials: true },
  isDefault: { label: "Default", type: "Boolean", hidden: true },
  locked: {
    type: "Boolean",
    label: "Lock",

    onSet: (scene, node, value) => {
      if (value) {
        node.detachControl();
        node.locked = true;
      } else {
        const canvas = scene.getEngine().getRenderingCanvas();
        node.attachControl(canvas, true);
        node.locked = false;
      }
    },
    onChange: (e, scene, node, key) => {
      if (e.target.checked) {
        node.detachControl();
        node.locked = true;
      } else {
        const canvas = scene.getEngine().getRenderingCanvas();
        node.attachControl(canvas, true);
        node.locked = false;
      }
    },
  },
  activate: {
    label: "Activate",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      const canvas = scene.getEngine().getRenderingCanvas();

      scene.cameras.forEach((cam, i) => {
        cam.detachControl(canvas);
      });
      if (!node.locked) {
        node.attachControl(canvas, true);
      }
      scene.activeCamera = node;

      if (node.badChanges) {
        if (node.badChanges.alpha) {
          node.alpha = node.badChanges.alpha;
        }
        if (node.badChanges.beta) {
          node.beta = node.badChanges.beta;
        }
        if (node.badChanges.radius) {
          node.radius = node.badChanges.radius;
        }
      } else if (scene.sceneData.cameras[node.name]) {
        if (scene.sceneData.cameras[node.name].alpha) {
          node.alpha = scene.sceneData.cameras[node.name].alpha;
        }
        if (scene.sceneData.cameras[node.name].beta) {
          node.beta = scene.sceneData.cameras[node.name].beta;
        }
        if (scene.sceneData.cameras[node.name].radius) {
          node.radius = scene.sceneData.cameras[node.name].radius;
        }
      }
    },
  },

  makeDefault: {
    label: "Make Default",
    type: "FunctionButton",
    function: (e, scene, node) => {
      const button = e.target;
      scene.cameras.forEach((cam, i) => {
        if (!cam.hasOwnProperty("badChanges")) {
          cam.badChanges = {};
        }
        cam.isDefault = false;
        cam.badChanges.isDefault = false;
      });

      if (!node.hasOwnProperty("badChanges")) {
        node.badChanges = {};
      }
      node.isDefault = true;
      node.badChanges.isDefault = true;
      toast.success(node.displayName + " is now the default camera");
      setTimeout(() => {
        button.innerHTML = "Make Default";
      }, 1000);
    },
    // hidden: (sceneData, scene, node) => {
    //   return node.isDefault;
    // },
  },

  setFromView: {
    label: "Set From View",
    type: "FunctionButton",
    function: (e, scene, node) => {
      const button = e.target;
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

      setTimeout(() => {
        button.innerHTML = "Set From View";
      }, 1000);
    },
    showInEssentials: true,
  },

  radius: { label: "Distance", type: "Number", showInEssentials: true },
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

  // target: { label: "Target", type: "Vector3" },
  targetTitle: { label: "Target", type: "Title", showInEssentials: true },
  "target.x": { label: "tX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "target.y": { label: "tY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "target.z": { label: "tZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },

  offTitle: { label: "Target Offset", type: "Title", showInEssentials: true },
  "targetScreenOffset.x": { label: "oX", type: "Number", width: "half", labelColor: "#f55151", showInEssentials: true },
  "targetScreenOffset.y": { label: "oY", type: "Number", width: "half", labelColor: "#00ff00", showInEssentials: true },

  targetScreenOffsetParallax: {
    group: "Effects",
    type: "Boolean",
    label: "Enable Mouse Hover Parallax Effect",

    onSet: (scene, node, value) => {
      if (window.matchMedia("(hover: none)").matches) return;
      if (value && window.location.search.indexOf("vr=true") === -1) {
        // Current position
        let currentX = 0;
        let currentY = 0;

        // Target position
        let targetX = 0;
        let targetY = 0;

        const lerpSpeed = 0.1;

        function updatePosition() {
          function lerp(start, end, t) {
            return start + (end - start) * t;
          }
          // Interpolate the current position towards the target position
          currentX = lerp(currentX, targetX, lerpSpeed);
          currentY = lerp(currentY, targetY, lerpSpeed);

          node.targetScreenOffset.x = -currentX * (node.targetScreenParallaxSensitivity || 0.1);
          node.targetScreenOffset.y = -currentY * (node.targetScreenParallaxSensitivity || 0.1);

          // Continue the loop
          window.targetScreenOffsetParallax = requestAnimationFrame(updatePosition);
        }

        if (!window.targetScreenOffsetParallaxMouseMove) {
          window.targetScreenOffsetParallaxMouseMove = (event) => {
            // Calculate the center of the screen
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Calculate the position of the mouse relative to the center
            const x = (event.clientX - centerX) / centerX;
            const y = (event.clientY - centerY) / centerY;

            // Update target position
            targetX = x;
            targetY = -y; // Inverting y to make the top positive
          };
        }

        if (node.targetScreenOffsetParallax) return;
        node.targetScreenOffsetParallax = true;

        // Start the continuous update loop
        window.targetScreenOffsetParallax = requestAnimationFrame(updatePosition);

        // Add the event listener to the mousemove event
        window.addEventListener("mousemove", window.targetScreenOffsetParallaxMouseMove);
      }
    },
    onChange: (e, scene, node, key) => {
      if (window.location.search.indexOf("vr=true") === -1) {
        // Current position
        let currentX = 0;
        let currentY = 0;

        // Target position
        let targetX = 0;
        let targetY = 0;

        const lerpSpeed = 0.1;

        function updatePosition() {
          function lerp(start, end, t) {
            return start + (end - start) * t;
          }
          // Interpolate the current position towards the target position
          currentX = lerp(currentX, targetX, lerpSpeed);
          currentY = lerp(currentY, targetY, lerpSpeed);

          node.targetScreenOffset.x = -currentX * (node.targetScreenParallaxSensitivity || 0.1);
          node.targetScreenOffset.y = -currentY * (node.targetScreenParallaxSensitivity || 0.1);

          // Continue the loop
          window.targetScreenOffsetParallax = requestAnimationFrame(updatePosition);
        }

        if (!window.targetScreenOffsetParallaxMouseMove) {
          window.targetScreenOffsetParallaxMouseMove = (event) => {
            // Calculate the center of the screen
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Calculate the position of the mouse relative to the center
            const x = (event.clientX - centerX) / centerX;
            const y = (event.clientY - centerY) / centerY;

            // Update target position
            targetX = x;
            targetY = -y; // Inverting y to make the top positive
          };
        }

        if (e.target.checked) {
          if (node.targetScreenOffsetParallax) return;
          node.targetScreenOffsetParallax = true;
          window.targetScreenOffsetParallax = requestAnimationFrame(updatePosition);
          window.addEventListener("mousemove", window.targetScreenOffsetParallaxMouseMove);
        } else {
          node.targetScreenOffsetParallax = false;
          window.removeEventListener("mousemove", window.targetScreenOffsetParallaxMouseMove);
          window.targetScreenOffsetParallaxMouseMove = null;
          cancelAnimationFrame(window.targetScreenOffsetParallax);
          window.targetScreenOffsetParallax = null;
        }
      }
    },
    showInEssentials: true,
  },

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

  orbitParallax: {
    group: "Effects",
    type: "Boolean",
    label: "Enable Mouse Hover Orbit Effect",

    onSet: (scene, node, value) => {
      if (window.matchMedia("(hover: none)").matches) return;
      // function handleOrientation(event) {
      //   const absolute = event.absolute;
      //   const alpha = event.alpha;
      //   const beta = event.beta;
      //   const gamma = event.gamma;

      //   node.alpha = (alpha * Math.PI) / 180;

      //   // Do stuff with the new orientation data
      // }

      // window.addEventListener("deviceorientation", handleOrientation, true);

      if (value && window.location.search.indexOf("vr=true") === -1) {
        const lerpSpeed = 0.4;

        const camSettings = {
          centerAlpha: node.alpha,
          centerBeta: node.beta,
          newAlpha: node.alpha,
          newBeta: node.beta,
        };

        function updatePosition() {
          function lerp(start, end, t) {
            return start + (end - start) * t;
          }

          node.alpha = lerp(node.alpha, camSettings.newAlpha, lerpSpeed);
          node.beta = lerp(node.beta, camSettings.newBeta, lerpSpeed);

          window.orbitParallax = requestAnimationFrame(updatePosition);
        }

        if (!window.orbitParallaxMouseMove) {
          window.orbitParallaxMouseMove = (event) => {
            const centerX = event.pageX / window.innerWidth - 0.5;
            const centerY = event.pageY / window.innerHeight - 0.5;

            camSettings.newAlpha = camSettings.centerAlpha + node.orbitParallaxSensitivityAlpha * centerX;
            camSettings.newBeta = camSettings.centerBeta + node.orbitParallaxSensitivityBeta * centerY;
          };
        }
        if (!window.orbitParallaxMouseDown) {
          window.orbitParallaxMouseDown = (event) => {
            cancelAnimationFrame(window.orbitParallax);
          };
        }

        if (!window.orbitParallaxMouseUp) {
          window.orbitParallaxMouseUp = (event) => {
            camSettings.centerAlpha = node.alpha;
            camSettings.centerBeta = node.beta;
            camSettings.newAlpha = node.alpha;
            camSettings.newBeta = node.beta;

            window.orbitParallax = requestAnimationFrame(updatePosition);
          };
        }

        if (node.orbitParallax) return;
        node.orbitParallax = true;

        window.orbitParallax = requestAnimationFrame(updatePosition);

        window.addEventListener("mousedown", window.orbitParallaxMouseDown);
        window.addEventListener("mouseup", window.orbitParallaxMouseUp);
        window.addEventListener("mousemove", window.orbitParallaxMouseMove);
      }
    },
    onChange: (e, scene, node, key) => {
      const lerpSpeed = 0.4;

      const camSettings = {
        centerAlpha: node.alpha,
        centerBeta: node.beta,
        newAlpha: node.alpha,
        newBeta: node.beta,
      };

      function updatePosition() {
        function lerp(start, end, t) {
          return start + (end - start) * t;
        }

        node.alpha = lerp(node.alpha, camSettings.newAlpha, lerpSpeed);
        node.beta = lerp(node.beta, camSettings.newBeta, lerpSpeed);

        window.orbitParallax = requestAnimationFrame(updatePosition);
      }

      if (!window.orbitParallaxMouseMove) {
        window.orbitParallaxMouseMove = (event) => {
          const centerX = event.pageX / window.innerWidth - 0.5;
          const centerY = event.pageY / window.innerHeight - 0.5;

          camSettings.newAlpha = camSettings.centerAlpha + node.orbitParallaxSensitivityAlpha * centerX;
          camSettings.newBeta = camSettings.centerBeta + node.orbitParallaxSensitivityBeta * centerY;
        };
      }
      if (!window.orbitParallaxMouseDown) {
        window.orbitParallaxMouseDown = (event) => {
          cancelAnimationFrame(window.orbitParallax);
        };
      }

      if (!window.orbitParallaxMouseUp) {
        window.orbitParallaxMouseUp = (event) => {
          camSettings.centerAlpha = node.alpha;
          camSettings.centerBeta = node.beta;
          camSettings.newAlpha = node.alpha;
          camSettings.newBeta = node.beta;

          window.orbitParallax = requestAnimationFrame(updatePosition);
        };
      }
      if (e.target.checked && window.location.search.indexOf("vr=true") === -1) {
        if (node.orbitParallax) return;
        node.orbitParallax = true;

        window.orbitParallax = requestAnimationFrame(updatePosition);

        window.addEventListener("mouseup", window.orbitParallaxMouseUp);
        window.addEventListener("mousemove", window.orbitParallaxMouseMove);
        window.addEventListener("mousedown", window.orbitParallaxMouseDown);
      } else {
        node.orbitParallax = false;

        window.removeEventListener("mouseup", window.orbitParallaxMouseUp);
        window.orbitParallaxMouseUp = null;
        window.removeEventListener("mousemove", window.orbitParallaxMouseMove);
        window.orbitParallaxMouseMove = null;
        window.removeEventListener("mousedown", window.orbitParallaxMouseDown);
        window.orbitParallaxMouseDown = null;
        cancelAnimationFrame(window.orbitParallax);
        window.orbitParallax = null;
      }
    },
    showInEssentials: true,
  },
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
  useAutoRotationBehavior: {
    group: "Advanced",
    label: "Autorotation",
    type: "Boolean",
    override: false,

    onSet: (scene, node, value) => {
      if (Boolean(value) === true) {
        try {
          node.useAutoRotationBehavior = true;

          setTimeout(() => {
            if (node.autoRotationBehavior) {
              node.autoRotationBehavior.idleRotationSpeed = 0;
            }
          });

          return;
        } catch (error) {
          console.warn(error);
        }
      }
    },
  },
  "autoRotationBehavior.idleRotationSpeed": {
    group: "Advanced",
    label: "Autorotation Speed",
    type: "Number",

    onSet: (scene, node, value) => {
      setTimeout(() => {
        try {
          if (!node.autoRotationBehavior) {
            return;
          }

          if (value !== null) {
            node.autoRotationBehavior.idleRotationSpeed = value;
          } else {
            node.autoRotationBehavior.idleRotationSpeed = 0.05;
          }
        } catch (error) {
          console.warn(error);
        }
      }, 1500);
    },
  },
  "autoRotationBehavior.idleRotationWaitTime": { group: "Advanced", label: "Autorotation Wait Time (ms)", type: "Number" },
  "autoRotationBehavior.idleRotationSpinupTime": { group: "Advanced", label: "Autorotation Spin Up Time (ms)", type: "Number" },
  zoomSensitivity: { group: "Advanced", label: "Zoom Sensitivity", type: "Number", min: 0.0, max: 1, step: 0.1, override: 0.5 },
  panSensitivity: { group: "Advanced", label: "Pan Sensitivity", type: "Number", min: 0.0, max: 1, step: 0.1, override: 0.5 },

  // allowUpsideDown: { group: "Advanced", label: "Allow Upside Down", type: "Boolean" },

  speed: { group: "Advanced", label: "Speed", type: "Number" },
  inertia: { group: "Advanced", label: "Inertia", type: "Number" },
  invertRotation: { group: "Advanced", label: "Invert Rotation", type: "Boolean" },
  inverseRotationSpeed: { group: "Advanced", label: "Inverse Speed", type: "Number" },
  // checkCollisions: { group: "Advanced", label: "Enable Collisions", type: "Boolean", override: false },
  // collisionRadius: { group: "Advanced", label: "Hitbox", type: "Vector3", override: { x: 0.2, y: 0.8, z: 0.2 } },

  fov: {
    group: "Lens",
    label: "Fov",
    type: "Number",
    hidden: true,
    showInEssentials: true,
  },
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

      scene.registerAfterRender(() => {
        if (document.getElementById("renderCanvas")?.offsetWidth > 1024) {
          node.fov = node.fovLarge || node.fov;
        }
        if (document.getElementById("renderCanvas")?.offsetWidth <= 1024 && document.getElementById("renderCanvas")?.offsetWidth > 640) {
          node.fov = node.fovMedium || node.fov;
        }
        if (document.getElementById("renderCanvas")?.offsetWidth <= 640) {
          node.fov = node.fovSmall || node.fov;
        }
      });
    },

    onChange: (e, scene, node, key) => {
      node.fovLarge = focalLengthToRadiants(e.target.value);
      const fun = () => {
        if (document.getElementById("renderCanvas")?.offsetWidth > 1024) {
          node.fov = node.fovLarge || node.fov;
        }
        if (document.getElementById("renderCanvas")?.offsetWidth <= 1024 && document.getElementById("renderCanvas")?.offsetWidth > 640) {
          node.fov = node.fovMedium || node.fov;
        }
        if (document.getElementById("renderCanvas")?.offsetWidth <= 640) {
          node.fov = node.fovSmall || node.fov;
        }
      };

      fun();
    },
    showInEssentials: true,
  },

  fovMedium: {
    group: "Lens",
    label: "Focal Length Tablet (mm)",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToFocalLength(val);
    },
    backConversion: (val) => {
      return focalLengthToRadiants(val);
    },

    onSet: (scene, node, value) => {
      node.fovMedium = node.fov;
      const fun = () => {
        if (value !== null) {
          node.fovMedium = value;
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

    onChange: (e, scene, node, key) => {
      node.fovMedium = focalLengthToRadiants(e.target.value);
      const fun = () => {
        if (document.getElementById("renderCanvas")?.offsetWidth > 1024) {
          node.fov = node.fovLarge || node.fov;
        }
        if (document.getElementById("renderCanvas")?.offsetWidth <= 1024 && document.getElementById("renderCanvas")?.offsetWidth > 640) {
          node.fov = node.fovMedium || node.fov;
        }
        if (document.getElementById("renderCanvas")?.offsetWidth <= 640) {
          node.fov = node.fovSmall || node.fov;
        }
      };

      fun();
    },
    showInEssentials: true,
  },

  fovSmall: {
    group: "Lens",
    label: "Focal Length Mobile (mm)",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToFocalLength(val);
    },
    backConversion: (val) => {
      return focalLengthToRadiants(val);
    },

    onSet: (scene, node, value) => {
      node.fovSmall = node.fov;

      const fun = () => {
        if (value !== null) {
          node.fovSmall = value;
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

    onChange: (e, scene, node, key) => {
      node.fovSmall = focalLengthToRadiants(e.target.value);
      const fun = () => {
        if (document.getElementById("renderCanvas")?.offsetWidth > 1024) {
          node.fov = node.fovLarge || node.fov;
        }
        if (document.getElementById("renderCanvas")?.offsetWidth <= 1024 && document.getElementById("renderCanvas")?.offsetWidth > 640) {
          node.fov = node.fovMedium || node.fov;
        }
        if (document.getElementById("renderCanvas")?.offsetWidth <= 640) {
          node.fov = node.fovSmall || node.fov;
        }
      };

      fun();
    },
    showInEssentials: true,
  },

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
    onChange: (e, scene, node, key) => {
      if (e.target.value === "FOVMODE_HORIZONTAL_FIXED") {
        node.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED;
        node.badFovMode = "FOVMODE_HORIZONTAL_FIXED";
      }
      if (e.target.value === "FOVMODE_VERTICAL_FIXED") {
        node.fovMode = Camera.FOVMODE_VERTICAL_FIXED;
        node.badFovMode = "FOVMODE_VERTICAL_FIXED";
      }
    },
    showInEssentials: true,
  },
  maxZ: { group: "Lens", label: "Max Clip", type: "Number", override: 10000, unit: "meters", showInEssentials: true },
  minZ: { group: "Lens", label: "Min Clip", type: "Number", override: 0.1, unit: "meters", showInEssentials: true },

  lowerRadiusLimit: { group: "Limits", label: "Min Distance", type: "Number", override: 0.1, showInEssentials: true },
  upperRadiusLimit: { group: "Limits", label: "Max Distance", type: "Number", override: 10000, showInEssentials: true },

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
    // override: ((-360 * Math.PI) / 180) * 100
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
    // override: ((360 * Math.PI) / 180) * 100
    showInEssentials: true,
  },

  clearAlphaLimits: {
    group: "Limits",
    label: "Clear Horizonal Limits",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      node.upperAlphaLimit = null;
      node.lowerAlphaLimit = null;
    },
    showInEssentials: true,
  },
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

  clearBetaLimits: {
    group: "Limits",
    label: "Clear Vertical Limits",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      node.upperBetaLimit = Math.PI;
      node.lowerBetaLimit = 0;
    },
    showInEssentials: true,
  },

  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const universalCameraProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },
  isDefault: { label: "Default", type: "Boolean", hidden: true },
  locked: {
    type: "Boolean",
    label: "Lock",

    onSet: (scene, node, value) => {
      if (value) {
        node.detachControl();
        node.locked = true;
      } else {
        const canvas = scene.getEngine().getRenderingCanvas();
        node.attachControl(canvas, true);
        node.locked = false;
      }
    },
    onChange: (e, scene, node, key) => {
      if (e.target.checked) {
        node.detachControl();
        node.locked = true;
      } else {
        const canvas = scene.getEngine().getRenderingCanvas();
        node.attachControl(canvas, true);
        node.locked = false;
      }
    },
  },
  activate: {
    label: "Activate",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      const canvas = scene.getEngine().getRenderingCanvas();

      scene.cameras.forEach((cam, i) => {
        cam.detachControl(canvas);
      });

      if (!node.locked) {
        node.attachControl(canvas, true);
      }
      scene.activeCamera = node;

      if (node.badChanges) {
        if (node.badChanges.position) {
          node.position = node.badChanges.position;
        }
        if (node.badChanges.target) {
          node.target = node.badChanges.target;
        }
      } else if (scene.sceneData.cameras[node.name]) {
        if (scene.sceneData.cameras[node.name].position) {
          node.position = scene.sceneData.cameras[node.name].position;
        }
        if (scene.sceneData.cameras[node.name].target) {
          node.target = scene.sceneData.cameras[node.name].target;
        }
      }
    },
  },

  makeDefault: {
    label: "Make Default",
    type: "FunctionButton",
    function: (e, scene, node) => {
      const button = e.target;
      scene.cameras.forEach((cam, i) => {
        if (!cam.hasOwnProperty("badChanges")) {
          cam.badChanges = {};
        }
        cam.isDefault = false;
        cam.badChanges.isDefault = false;
      });

      if (!node.hasOwnProperty("badChanges")) {
        node.badChanges = {};
      }
      node.isDefault = true;
      node.badChanges.isDefault = true;
      toast.success(node.displayName + " is now the default camera");
      setTimeout(() => {
        button.innerHTML = "Make Default";
      }, 1000);
    },
    // hidden: (sceneData, scene, node) => {
    //   return node.isDefault;
    // },
  },
  setFromView: {
    label: "Set From View",
    type: "FunctionButton",
    function: (e, scene, node) => {
      const button = e.target;
      const position = node.position;
      const target = node.target;

      if (!node.hasOwnProperty("badChanges")) {
        node.badChanges = {};
      }
      node.badChanges["target.x"] = node.target.x;
      node.badChanges["target.y"] = node.target.y;
      node.badChanges["target.z"] = node.target.z;

      node.badChanges["position.x"] = node.position.x;
      node.badChanges["position.y"] = node.position.y;
      node.badChanges["position.z"] = node.position.z;

      node.badChanges["rotation.x"] = node.rotation.x;
      node.badChanges["rotation.y"] = node.rotation.y;
      node.badChanges["rotation.z"] = node.rotation.z;

      // setNodeData(sceneData.cameras[node.name], "target", { x: target.x, y: target.y, z: target.z });
      // setNodeData(sceneData.cameras[node.name], "position", { x: position.x, y: position.y, z: position.z });
      toast.success("Camera position registered");
      setTimeout(() => {
        button.innerHTML = "Set From View";
      }, 1000);
    },
    showInEssentials: true,
  },
  //position: { label: "Position", type: "Vector3" },
  posTitle: { label: "Position", type: "Title", showInEssentials: true },
  "position.x": { label: "pX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "position.y": { label: "pY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "position.z": { label: "pZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },
  //target: { label: "Target", type: "Vector3" },
  rotTitle: { label: "Rotation", type: "Title", showInEssentials: true },
  "rotation.x": {
    label: "rX °",
    type: "Number",
    width: "third",
    labelColor: "#f55151",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    showInEssentials: true,
  },
  "rotation.y": {
    label: "rY °",
    type: "Number",
    width: "third",
    labelColor: "#00ff00",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    showInEssentials: true,
  },
  "rotation.z": {
    label: "rZ °",
    type: "Number",
    width: "third",
    labelColor: "#0099ff",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    showInEssentials: true,
  },
  tarTitle: { label: "Target", type: "Title", showInEssentials: true },
  "target.x": { label: "sX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "target.y": { label: "sY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "target.z": { label: "sZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },

  walkableHeight: { group: "Navigation", label: "Eyes Height", type: "Number", override: 1.8, showInEssentials: true },
  walkableMeshes: {
    group: "Navigation",
    label: "Walkable Meshes",
    type: "MeshesArrayReference",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.walkableMeshes = [];
        value.forEach((m, i) => {
          if (scene.getMeshByName(m)) {
            node.walkableMeshes.push(m);
          }
        });
        return;
      } else {
        node.walkableMeshes = [];
      }
    },
    onChange: (value, scene, node, key) => {
      var selectedOpts = [];
      var selectedMeshes = [];
      value.forEach((m, i) => {
        if (!selectedMeshes.includes(scene.getMeshByName(m))) {
          selectedOpts.push(m);
          selectedMeshes.push(scene.getMeshByName(m));
        }
      });

      node.badChanges[key] = selectedOpts;
      node.walkableMeshes = selectedOpts;
    },
    showInEssentials: true,
  },
  walkableBehavior: {
    group: "Navigation",
    label: "Walkable Behavior",
    type: "Select",
    options: {
      animation: "Animation",
      teleport: "Teleport",
    },
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.walkableBehavior = value;
        return;
      } else {
        node.walkableBehavior = "animation";
        return;
      }
    },
    showInEssentials: true,
  },

  fov: {
    group: "Lens",
    label: "Fov °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    override: 1.0472,
    showInEssentials: true,
  },
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
    onChange: (e, scene, node, key) => {
      if (e.target.value === "FOVMODE_HORIZONTAL_FIXED") {
        node.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED;
        node.badFovMode = "FOVMODE_HORIZONTAL_FIXED";
      }
      if (e.target.value === "FOVMODE_VERTICAL_FIXED") {
        node.fovMode = Camera.FOVMODE_VERTICAL_FIXED;
        node.badFovMode = "FOVMODE_VERTICAL_FIXED";
      }
    },
  },
  maxZ: { group: "Lens", label: "Max Clip", type: "Number", override: 10000, unit: "meters" },
  minZ: { group: "Lens", label: "Min Clip", type: "Number", override: 0.1, unit: "meters" },

  hitTitle: { group: "Navigation", label: "Hitbox", type: "Title" },
  "ellipsoid.x": { group: "Navigation", label: "eX", type: "Number", override: 0.2, width: "third", labelColor: "#f55151" },
  "ellipsoid.y": { group: "Navigation", label: "eY", type: "Number", override: 0.8, width: "third", labelColor: "#00ff00" },
  "ellipsoid.z": { group: "Navigation", label: "eZ", type: "Number", override: 0.2, width: "third", labelColor: "#0099ff" },

  applyGravity: { group: "Navigation", label: "Apply Gravity", type: "Boolean", override: false },
  speed: { group: "Navigation", label: "Speed", type: "Number", override: 0.16 },
  invertRotation: { group: "Navigation", label: "Invert Rotation", type: "Boolean" },
  inverseRotationSpeed: { group: "Navigation", label: "Inverse Sensitivity", type: "Number" },
  inertia: { group: "Navigation", label: "Inertia", type: "Number" },
  checkCollisions: { group: "Navigation", label: "Enable Collisions", type: "Boolean", override: false },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const pointLightProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String", showInEssentials: true },
  // lookAt: {
  //   label: "Focus Light",
  //   type: "FunctionButton",
  //   function: (e, scene, node) => {
  //     scene.activeCamera.target = new Vector3(node.position.x, node.position.y, node.position.z);
  //   },
  // },
  // position: { label: "Position", type: "Vector 3" },

  posGizmo: {
    label: "Position",
    type: "FunctionButton",
    showInEssentials: true,
    hideInNode: true,
    style: {
      display: "none",
    },

    onMount: (scene, node) => {
      if (node.gizmoManager) {
        node.lightGizmo.dispose();
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.dispose();
      }

      node.gizmoManager = new GizmoManager(scene);
      node.gizmoManager.usePointerToAttachGizmos = false;
      node.lightGizmo = new LightGizmo();
      node.lightGizmo.light = node;
      node.lightGizmo.scaleRatio = 0.5;
      node.gizmoManager.attachToMesh(node);

      node.gizmoManager.positionGizmoEnabled = true;
      node.gizmoManager.gizmos.positionGizmo.scaleRatio = 0.5;

      const positionGizmo = node.gizmoManager.gizmos?.positionGizmo;
      if (positionGizmo) {
        positionGizmo.onDragEndObservable.add(() => {
          const position = getDeep(node, "position");

          if (!node.hasOwnProperty("badChanges")) {
            node.badChanges = {};
          }
          node.badChanges["position.x"] = parseFloat(position.x);
          node.badChanges["position.y"] = parseFloat(position.y);
          node.badChanges["position.z"] = parseFloat(position.z);
        });
      }
    },

    onUnmount: (scene, node) => {
      if (node.lightGizmo) {
        node.lightGizmo.dispose();
      }
      if (node.gizmoManager) {
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.dispose();
      }
    },
  },
  enabled: {
    label: "Enabled",
    type: "Boolean",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.enabled = Boolean(value);
        node.setEnabled(Boolean(value));
      } else {
        node.enabled = true;
      }
    },
    onChange: (e, scene, node, key) => {
      node.enabled = Boolean(e.target.checked);
      node.setEnabled(Boolean(e.target.checked));
    },
    showInEssentials: true,
  },
  posTitle: { type: "Title", label: "Position", showInEssentials: true },

  "position.x": { label: "pX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "position.y": { label: "pY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "position.z": { label: "pZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },

  intensity: { label: "Intensity", type: "Number", showInEssentials: true },
  diffuse: { label: "Diffuse", type: "Color3", showInEssentials: true },
  specular: { label: "Specular", type: "Color3", showInEssentials: true },

  shadowEnabled: { group: "Shadows", label: "Enable Shadows", type: "Boolean", override: false, showInEssentials: true },
  shadDistTitle: { group: "Shadows", label: "Shadow Distance", type: "Title" },
  shadowMinZ: { group: "Shadows", label: "Min", type: "Number", override: 0.01, unit: "meters", width: "half", showInEssentials: true },
  shadowMaxZ: { group: "Shadows", label: "Max", type: "Number", override: 100, unit: "meters", width: "half", showInEssentials: true },
  "shadowGenerator.frustumEdgeFalloff": { group: "Shadows", label: "Falloff", type: "Number" },
  "shadowGenerator.bias": { group: "Shadows", label: "Bias", type: "Number" },
  //  "shadowGenerator.blurBoxOffset": { group: "Shadows", label: "Blur", type: "Number", min: 0, max: 100, step: 1 },
  //  "shadowGenerator.useKernelBlur": { group: "Shadows", label: "Use Kernel Blur", type: "Boolean", override: true },
  "shadowGenerator.useBlurExponentialShadowMap": { label: "Blur Shadow", type: "Boolean", group: "Shadows" },
  "shadowGenerator.useBlurCloseExponentialShadowMap": { label: "Blur Close Shadow (self-shadowing)", type: "Boolean", group: "Shadows" },
  "shadowGenerator.blurKernel": { group: "Shadows", label: "Blur", type: "Number", min: 0, max: 200, step: 1 },
  "shadowGenerator.blurScale": { group: "Shadows", label: "Blur Scale", type: "Number" },
  "shadowGenerator.darkness": { group: "Shadows", label: "Darkness", type: "Number" },

  "shadowGenerator.casters": {
    label: "Casters",
    type: "MeshesArrayReference",
    group: "Shadows",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.shadowGenerator.casters = [];
        value.forEach((m, i) => {
          if (scene.getMeshByName(m)) {
            node.shadowGenerator.casters.push(m);
            node.shadowGenerator.getShadowMap().renderList.push(scene.getMeshByName(m));
          }
        });

        return;
      } else {
        node.shadowGenerator.casters = scene.meshes
          .filter(
            (m) =>
              m.name !== "Mesh_EnvironmentPlane" &&
              m.name !== "Mesh_Skybox" &&
              m.name !== "gridHelper" &&
              m.name !== "axisHelper" &&
              m.name !== "headTrackHelper"
          )
          .map((m) => m.name);

        node.shadowGenerator.getShadowMap().renderList = scene.meshes
          .filter(
            (m) =>
              m.name !== "Mesh_EnvironmentPlane" &&
              m.name !== "Mesh_Skybox" &&
              m.name !== "gridHelper" &&
              m.name !== "axisHelper" &&
              m.name !== "headTrackHelper"
          )
          .map((m) => m);
      }
    },
    onChange: (value, scene, node, key) => {
      var selectedOpts = [];
      var selectedMeshes = [];

      value.forEach((m, i) => {
        if (!selectedMeshes.includes(scene.getMeshByName(m))) {
          selectedOpts.push(m);
          selectedMeshes.push(scene.getMeshByName(m));
        }
      });

      node.badChanges[key] = selectedOpts;
      node.shadowGenerator.casters = selectedOpts;
      node.shadowGenerator.getShadowMap().renderList = selectedMeshes;

      if (node.shadowEnabled) {
        node.shadowEnabled = false;
        setTimeout(() => {
          node.shadowEnabled = true;
          // scene.forceUpdate();
        }, 50);
      }
    },
    showInEssentials: true,
  },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const spotLightProps = {
  displayName: { label: "Name", type: "String", showInEssentials: true },
  enabled: {
    label: "Enabled",
    type: "Boolean",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.enabled = Boolean(value);
        node.setEnabled(Boolean(value));
      } else {
        node.enabled = true;
      }
    },
    onChange: (e, scene, node, key) => {
      node.enabled = Boolean(e.target.checked);
      node.setEnabled(Boolean(e.target.checked));
    },
    showInEssentials: true,
  },

  posGizmo: {
    label: "Position",
    type: "FunctionButton",
    showInEssentials: true,
    hideInNode: true,
    style: {
      display: "none",
    },
    onMount: (scene, node) => {
      if (node.gizmoManager) {
        node.lightGizmo.dispose();
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.dispose();
      }

      node.gizmoManager = new GizmoManager(scene);
      node.gizmoManager.usePointerToAttachGizmos = false;
      node.lightGizmo = new LightGizmo();
      node.lightGizmo.light = node;
      node.lightGizmo.scaleRatio = 0.5;
      node.gizmoManager.attachToMesh(node);

      node.gizmoManager.positionGizmoEnabled = true;
      node.gizmoManager.gizmos.positionGizmo.scaleRatio = 0.5;

      const positionGizmo = node.gizmoManager.gizmos?.positionGizmo;
      if (positionGizmo) {
        positionGizmo.onDragEndObservable.add(() => {
          const position = getDeep(node, "position");

          if (!node.hasOwnProperty("badChanges")) {
            node.badChanges = {};
          }
          node.badChanges["position.x"] = parseFloat(position.x);
          node.badChanges["position.y"] = parseFloat(position.y);
          node.badChanges["position.z"] = parseFloat(position.z);
        });
      }
    },

    onUnmount: (scene, node) => {
      if (node.lightGizmo) {
        node.lightGizmo.dispose();
      }
      if (node.gizmoManager) {
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.dispose();
      }
    },
  },

  posTitle: { type: "Title", label: "Position", showInEssentials: true },
  "position.x": { label: "pX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "position.y": { label: "pY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "position.z": { label: "pZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },

  dirTitle: { label: "Direction", type: "Title", showInEssentials: true },
  "direction.x": { label: "dX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "direction.y": { label: "dY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "direction.z": { label: "dZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },

  setDirection: {
    label: "Set Direction",
    type: "FunctionButton",
    function: (e, scene, node) => {
      const button = e.target;
      button.innerHTML = "Pick a point";
      const observer = scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
          case PointerEventTypes.POINTERPICK:
            node.setDirectionToTarget(pointerInfo.pickInfo.pickedPoint);
            if (!node.hasOwnProperty("badChanges")) {
              node.badChanges = {};
            }
            node.badChanges["direction.x"] = node.direction.x;
            node.badChanges["direction.y"] = node.direction.y;
            node.badChanges["direction.z"] = node.direction.z;
            scene.onPointerObservable.remove(observer);
            button.innerHTML = "Done";
            // if (pointerInfo.pickInfo.pickedMesh) {
            //   scene.closeNode(pointerInfo.pickInfo.pickedMesh.name);
            // }
            setTimeout(() => {
              button.innerHTML = "Set Direction";
            }, 1000);

            break;
          default:
            return;
        }
      });
    },
    showInEssentials: true,
  },

  angle: {
    label: "Angle °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    showInEssentials: true,
  },
  intensity: { label: "Intensity", type: "Number", showInEssentials: true },

  diffuse: { label: "Diffuse", type: "Color3", showInEssentials: true },
  specular: { label: "Specular", type: "Color3", showInEssentials: true },

  shadowEnabled: { group: "Shadows", label: "Enable Shadows", type: "Boolean", override: false },
  shadDistTitle: { group: "Shadows", label: "Shadow Distance", type: "Title" },
  shadowMinZ: { group: "Shadows", label: "Min", type: "Number", override: 0.01, unit: "meters", width: "half" },
  shadowMaxZ: { group: "Shadows", label: "Max", type: "Number", override: 100, unit: "meters", width: "half" },
  "shadowGenerator.frustumEdgeFalloff": { group: "Shadows", label: "Falloff", type: "Number" },
  "shadowGenerator.bias": { group: "Shadows", label: "Bias", type: "Number" },
  //  "shadowGenerator.blurBoxOffset": { group: "Shadows", label: "Blur", type: "Number", min: 0, max: 100, step: 1 },
  //  "shadowGenerator.useKernelBlur": { group: "Shadows", label: "Use Kernel Blur", type: "Boolean", override: true },
  "shadowGenerator.useBlurExponentialShadowMap": { label: "Blur Shadow", type: "Boolean", group: "Shadows" },
  "shadowGenerator.useBlurCloseExponentialShadowMap": { label: "Blur Close Shadow (self-shadowing)", type: "Boolean", group: "Shadows" },
  "shadowGenerator.blurKernel": { group: "Shadows", label: "Blur", type: "Number", min: 0, max: 200, step: 1 },
  "shadowGenerator.blurScale": { group: "Shadows", label: "Blur Scale", type: "Number" },
  "shadowGenerator.darkness": { group: "Shadows", label: "Darkness", type: "Number" },

  "shadowGenerator.casters": {
    label: "Casters",
    type: "MeshesArrayReference",
    group: "Shadows",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.shadowGenerator.casters = [];
        value.forEach((m, i) => {
          if (scene.getMeshByName(m)) {
            node.shadowGenerator.casters.push(m);
            node.shadowGenerator.getShadowMap().renderList.push(scene.getMeshByName(m));
          }
        });

        return;
      } else {
        node.shadowGenerator.casters = scene.meshes
          .filter(
            (m) =>
              m.name !== "Mesh_EnvironmentPlane" &&
              m.name !== "Mesh_Skybox" &&
              m.name !== "gridHelper" &&
              m.name !== "axisHelper" &&
              m.name !== "headTrackHelper"
          )
          .map((m) => m.name);

        node.shadowGenerator.getShadowMap().renderList = scene.meshes
          .filter(
            (m) =>
              m.name !== "Mesh_EnvironmentPlane" &&
              m.name !== "Mesh_Skybox" &&
              m.name !== "gridHelper" &&
              m.name !== "axisHelper" &&
              m.name !== "headTrackHelper"
          )
          .map((m) => m);
      }
    },
    onChange: (value, scene, node, key) => {
      var selectedOpts = [];
      var selectedMeshes = [];

      value.forEach((m, i) => {
        if (!selectedMeshes.includes(scene.getMeshByName(m))) {
          selectedOpts.push(m);
          selectedMeshes.push(scene.getMeshByName(m));
        }
      });

      node.badChanges[key] = selectedOpts;
      node.shadowGenerator.casters = selectedOpts;
      node.shadowGenerator.getShadowMap().renderList = selectedMeshes;

      if (node.shadowEnabled) {
        node.shadowEnabled = false;
        setTimeout(() => {
          node.shadowEnabled = true;
          // scene.forceUpdate();
        }, 50);
      }
    },
    showInEssentials: true,
  },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const directionalLightProps = {
  displayName: { label: "Name", type: "String", showInEssentials: true },

  posGizmo: {
    label: "Position",
    type: "FunctionButton",
    showInEssentials: true,
    hideInNode: true,
    style: {
      display: "none",
    },

    onMount: (scene, node) => {
      if (node.gizmoManager) {
        node.lightGizmo.dispose();
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.dispose();
      }

      node.gizmoManager = new GizmoManager(scene);
      node.gizmoManager.usePointerToAttachGizmos = false;
      node.lightGizmo = new LightGizmo();
      node.lightGizmo.light = node;
      node.lightGizmo.scaleRatio = 0.5;
      node.gizmoManager.attachToMesh(node);

      node.gizmoManager.positionGizmoEnabled = true;
      node.gizmoManager.gizmos.positionGizmo.scaleRatio = 0.5;

      const positionGizmo = node.gizmoManager.gizmos?.positionGizmo;
      if (positionGizmo) {
        positionGizmo.onDragEndObservable.add(() => {
          const position = getDeep(node, "position");

          if (!node.hasOwnProperty("badChanges")) {
            node.badChanges = {};
          }
          node.badChanges["position.x"] = parseFloat(position.x);
          node.badChanges["position.y"] = parseFloat(position.y);
          node.badChanges["position.z"] = parseFloat(position.z);
        });
      }
    },

    onUnmount: (scene, node) => {
      if (node.lightGizmo) {
        node.lightGizmo.dispose();
      }
      if (node.gizmoManager) {
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.dispose();
      }
    },
  },
  enabled: {
    label: "Enabled",
    type: "Boolean",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.enabled = Boolean(value);
        node.setEnabled(Boolean(value));
      } else {
        node.enabled = true;
      }
    },
    onChange: (e, scene, node, key) => {
      node.enabled = Boolean(e.target.checked);
      node.setEnabled(Boolean(e.target.checked));
    },
    showInEssentials: true,
  },

  posTitle: { type: "Title", label: "Position", showInEssentials: true },

  "position.x": { label: "pX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "position.y": { label: "pY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "position.z": { label: "pZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },
  //direction: { label: "Direction", type: "Vector3" },
  dirTitle: { label: "Direction", type: "Title", showInEssentials: true },
  "direction.x": { label: "dX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "direction.y": { label: "dY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "direction.z": { label: "dZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },
  setDirection: {
    label: "Set Direction",
    type: "FunctionButton",
    showInEssentials: true,
    function: (e, scene, node) => {
      const button = e.target;
      button.innerHTML = "Pick a point";
      const observer = scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
          case PointerEventTypes.POINTERPICK:
            node.setDirectionToTarget(pointerInfo.pickInfo.pickedPoint);
            if (!node.hasOwnProperty("badChanges")) {
              node.badChanges = {};
            }
            node.badChanges["direction.x"] = node.direction.x;
            node.badChanges["direction.y"] = node.direction.y;
            node.badChanges["direction.z"] = node.direction.z;
            scene.onPointerObservable.remove(observer);
            button.innerHTML = "Done";

            setTimeout(() => {
              button.innerHTML = "Set Direction";
            }, 1000);

            break;
          default:
            return;
        }
      });
    },
  },

  intensity: { label: "Intensity", type: "Number", showInEssentials: true },
  diffuse: { label: "Diffuse", type: "Color3", showInEssentials: true },

  specular: { label: "Specular", type: "Color3", showInEssentials: true },

  shadowEnabled: { group: "Shadows", label: "Enable Shadows", type: "Boolean", override: false },
  shadDistTitle: { group: "Shadows", label: "Shadow Distance", type: "Title" },
  shadowMinZ: { group: "Shadows", label: "Min", type: "Number", override: 0.01, unit: "meters", width: "half" },
  shadowMaxZ: { group: "Shadows", label: "Max", type: "Number", override: 100, unit: "meters", width: "half" },
  "shadowGenerator.frustumEdgeFalloff": { group: "Shadows", label: "Falloff", type: "Number" },
  "shadowGenerator.bias": { group: "Shadows", label: "Bias", type: "Number" },
  //  "shadowGenerator.blurBoxOffset": { group: "Shadows", label: "Blur", type: "Number", min: 0, max: 100, step: 1 },
  //  "shadowGenerator.useKernelBlur": { group: "Shadows", label: "Use Kernel Blur", type: "Boolean", override: true },
  "shadowGenerator.useBlurExponentialShadowMap": { label: "Blur Shadow", type: "Boolean", group: "Shadows" },
  "shadowGenerator.useBlurCloseExponentialShadowMap": { label: "Blur Close Shadow (self-shadowing)", type: "Boolean", group: "Shadows" },
  "shadowGenerator.blurKernel": { group: "Shadows", label: "Blur", type: "Number", min: 0, max: 200, step: 1 },
  "shadowGenerator.blurScale": { group: "Shadows", label: "Blur Scale", type: "Number" },
  "shadowGenerator.darkness": { group: "Shadows", label: "Darkness", type: "Number" },

  "shadowGenerator.casters": {
    label: "Casters",
    type: "MeshesArrayReference",
    group: "Shadows",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.shadowGenerator.casters = [];
        value.forEach((m, i) => {
          if (scene.getMeshByName(m)) {
            node.shadowGenerator.casters.push(m);
            node.shadowGenerator.getShadowMap().renderList.push(scene.getMeshByName(m));
          }
        });

        return;
      } else {
        node.shadowGenerator.casters = scene.meshes
          .filter(
            (m) =>
              m.name !== "Mesh_EnvironmentPlane" &&
              m.name !== "Mesh_Skybox" &&
              m.name !== "gridHelper" &&
              m.name !== "axisHelper" &&
              m.name !== "headTrackHelper"
          )
          .map((m) => m.name);

        node.shadowGenerator.getShadowMap().renderList = scene.meshes
          .filter(
            (m) =>
              m.name !== "Mesh_EnvironmentPlane" &&
              m.name !== "Mesh_Skybox" &&
              m.name !== "gridHelper" &&
              m.name !== "axisHelper" &&
              m.name !== "headTrackHelper"
          )
          .map((m) => m);
      }
    },
    onChange: (value, scene, node, key) => {
      var selectedOpts = [];
      var selectedMeshes = [];

      value.forEach((m, i) => {
        if (!selectedMeshes.includes(scene.getMeshByName(m))) {
          selectedOpts.push(m);
          selectedMeshes.push(scene.getMeshByName(m));
        }
      });

      node.badChanges[key] = selectedOpts;
      node.shadowGenerator.casters = selectedOpts;
      node.shadowGenerator.getShadowMap().renderList = selectedMeshes;

      if (node.shadowEnabled) {
        node.shadowEnabled = false;
        setTimeout(() => {
          node.shadowEnabled = true;
        }, 50);
      }
    },
    showInEssentials: true,
  },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const hemisphericLightProps = {
  displayName: { label: "Name", type: "String", showInEssentials: true },

  enabled: {
    label: "Enabled",
    type: "Boolean",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.enabled = Boolean(value);
        node.setEnabled(Boolean(value));
      } else {
        node.enabled = true;
      }
    },
    onChange: (e, scene, node, key) => {
      node.enabled = Boolean(e.target.checked);
      node.setEnabled(Boolean(e.target.checked));
    },
    showInEssentials: true,
  },

  dirTitle: { label: "Direction", type: "Title", showInEssentials: true },

  "direction.x": { label: "dX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "direction.y": { label: "dY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "direction.z": { label: "dZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },

  setDirection: {
    label: "Set Direction",
    type: "FunctionButton",
    function: (e, scene, node) => {
      const button = e.target;
      button.innerHTML = "Pick a point";
      const observer = scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
          case PointerEventTypes.POINTERPICK:
            node.setDirectionToTarget(pointerInfo.pickInfo.pickedPoint);
            if (!node.hasOwnProperty("badChanges")) {
              node.badChanges = {};
            }
            node.badChanges["direction.x"] = node.direction.x;
            node.badChanges["direction.y"] = node.direction.y;
            node.badChanges["direction.z"] = node.direction.z;
            scene.onPointerObservable.remove(observer);
            button.innerHTML = "Done";

            setTimeout(() => {
              button.innerHTML = "Set Direction";
            }, 1000);

            break;
          default:
            return;
        }
      });
    },
    showInEssentials: true,
  },
  intensity: { label: "Intensity", type: "Number", showInEssentials: true },
  diffuse: { label: "Sky Color", type: "Color3", override: "#bada55", showInEssentials: true },
  groundColor: { label: "Ground Color", type: "Color3", override: "#000000", showInEssentials: true },
  specular: { label: "Specular", type: "Color3", showInEssentials: true },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const shadowOnlyMaterialProps = {
  displayName: { label: "Name", type: "String" },
  shadowColor: { label: "Shadow Color", type: "Color3", override: "#dedede" },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const PBRMaterialProps = {
  displayName: { group: "General", label: "Name", type: "String", showInEssentials: true },
  unlit: { group: "General", label: "Unlit", type: "Boolean", showInEssentials: true },

  backFaceCulling: { group: "General", label: "Back Face Culling", type: "Boolean", showInEssentials: true },

  albedoTexture: {
    group: "General",
    label: "Base Color Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
    showInEssentials: true,
  },

  albedoColor: { group: "General", label: "Base Color", type: "Color3", handle: { type: "target" }, showInEssentials: true },

  metallicTexture: {
    group: "General",
    label: "ORM / Metallic Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },

  metallic: { group: "General", label: "Metallic", type: "Number", min: 0, max: 1, step: 0.01 },

  microSurfaceTexture: {
    group: "General",
    label: "Roughness Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },

  roughness: { group: "General", label: "Roughness", type: "Number", min: 0, max: 1, step: 0.01 },
  specularIntensity: { group: "General", label: "Specular", type: "Number", min: 0, max: 1, step: 0.01 },
  // reflectivityColor: { group: "General", label: "Specular Color", type: "Color3" },

  enableSpecularAntiAliasing: {
    group: "General",
    label: "Specular Anti Aliasing",
    type: "Boolean",
    subGroup: "Settings",
  },
  indexOfRefraction: { group: "General", label: "IOR", type: "Number", showInEssentials: true },

  emissiveTexture: {
    group: "General",
    label: "Emissive Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
    showInEssentials: true,
  },

  emissiveColor: { group: "General", label: "Emissive Color", type: "Color3", showInEssentials: true },
  emissiveIntensity: { group: "General", label: "Emissive Intensity", type: "Number", showInEssentials: true },

  // ambientColor: { label: "AO Color", type: "Color3" },
  ambientTexture: {
    group: "General",
    label: "AO Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },

  ambientTextureStrength: { group: "General", label: "AO Intensity", type: "Number" },
  bumpTexture: {
    group: "General",
    label: "Normal Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
    showInEssentials: true,
  },

  twoSidedLighting: { group: "General", label: "Two Sided Lighting", type: "Boolean", subGroup: "Settings" },
  useAmbientOcclusionFromMetallicTextureRed: { group: "General", label: "Ambient From ORM Red", type: "Boolean", subGroup: "Settings" },
  useRoughnessFromMetallicTextureGreen: { group: "General", label: "Roughness From ORM Green", type: "Boolean", subGroup: "Settings" },
  useMetallnessFromMetallicTextureBlue: { group: "General", label: "Metallness From ORM Blue", type: "Boolean", subGroup: "Settings" },
  useRoughnessFromMetallicTextureAlpha: { group: "General", label: "Roughness From ORM Alpha", type: "Boolean", subGroup: "Settings" },
  // ALPHA

  opacityTexture: {
    group: "Alpha",
    label: "Alpha Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
    showInEssentials: true,
  },
  alpha: { group: "Alpha", label: "Alpha Level", type: "Number", min: 0, max: 1, step: 0.01 },

  transparencyMode: {
    group: "Alpha",
    label: "Transparency Mode",
    type: "Select",
    options: {
      0: "Opaque",
      1: "Alpha Test",
      2: "Alpha Blend",
      3: "Alpha Test and Blend",
    },
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.transparencyMode = parseInt(value);
      }
      // if (parseInt(value) === 0) node.transparencyMode = PBRMaterial.MATERIAL_OPAQUE;
      // if (parseInt(value) === 1) node.transparencyMode = PBRMaterial.MATERIAL_ALPHATEST;
      // if (parseInt(value) === 2) node.transparencyMode = PBRMaterial.MATERIAL_ALPHABLEND;
      // if (parseInt(value) === 3) node.transparencyMode = PBRMaterial.MATERIAL_ALPHATESTANDBLEND;
    },
    onChange: (e, scene, node, key) => {
      node.transparencyMode = parseInt(e.target.value);
      // if (parseInt(e.target.value) === 0) node.transparencyMode = PBRMaterial.MATERIAL_OPAQUE;
      // if (parseInt(e.target.value) === 1) node.transparencyMode = PBRMaterial.MATERIAL_ALPHATEST;
      // if (parseInt(e.target.value) === 2) node.transparencyMode = PBRMaterial.MATERIAL_ALPHABLEND;
      // if (parseInt(e.target.value) === 3) node.transparencyMode = PBRMaterial.MATERIAL_ALPHATESTANDBLEND;
    },
    showInEssentials: true,
  },
  alphaMode: {
    group: "Alpha",
    label: "Alpha Mode",
    type: "Select",
    options: {
      0: "Disable",
      1: "Add",
      2: "Combine",
      3: "Subtract",
      4: "Multiply",
      5: "Maximized",
      6: "One One",
    },
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.alphaMode = parseInt(value);
      } else {
        node.alphaMode = 2;
      }
      // if (parseInt(value) === 0) node.alphaMode = Engine.ALPHA_DISABLE;
      // if (parseInt(value) === 1) node.alphaMode = Engine.ALPHA_ADD;
      // if (parseInt(value) === 2) node.alphaMode = Engine.ALPHA_COMBINE;
      // if (parseInt(value) === 3) node.alphaMode = Engine.ALPHA_SUBTRACT;
      // if (parseInt(value) === 4) node.alphaMode = Engine.ALPHA_MULTIPLY;
      // if (parseInt(value) === 5) node.alphaMode = Engine.ALPHA_MAXIMIZED;
      // if (parseInt(value) === 6) node.alphaMode = Engine.ALPHA_ONEONE;
    },
    onChange: (e, scene, node, key) => {
      node.alphaMode = parseInt(e.target.value);
      // if (parseInt(e.target.value) === 0) node.alphaMode = Engine.ALPHA_DISABLE;
      // if (parseInt(e.target.value) === 1) node.alphaMode = Engine.ALPHA_ADD;
      // if (parseInt(e.target.value) === 2) node.alphaMode = Engine.ALPHA_COMBINE;
      // if (parseInt(e.target.value) === 3) node.alphaMode = Engine.ALPHA_SUBTRACT;
      // if (parseInt(e.target.value) === 4) node.alphaMode = Engine.ALPHA_MULTIPLY;
      // if (parseInt(e.target.value) === 5) node.alphaMode = Engine.ALPHA_MAXIMIZED;
      // if (parseInt(e.target.value) === 6) node.alphaMode = Engine.ALPHA_ONEONE;
    },
    showInEssentials: true,
  },
  useAlphaFromAlbedoTexture: { group: "Alpha", label: "Use Alpha from Albedo Texture", type: "Boolean", subGroup: "Settings" },

  useSpecularOverAlpha: { group: "Alpha", label: "Specular Over Alpha", type: "Boolean" },

  lightmapTexture: {
    group: "Lightning",
    label: "Lightmap Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },
  useLightmapAsShadowmap: { group: "Lightning", label: "Use Lightmap as Shadowmap", type: "Boolean" },
  environmentIntensity: { group: "Lightning", label: "Env Intensity", type: "Number" },
  directIntensity: { group: "Lightning", label: "Direct Light Intensity", type: "Number" },
  maxSimultaneousLights: { group: "Lightning", label: "Max Lights", type: "Number" },

  reflectionTexture: {
    group: "Reflection",
    label: "Reflection Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },
  reflectionColor: { group: "Reflection", label: "Reflection Color", type: "Color3" },

  useProbeReflection: {
    group: "Reflection",
    label: "Use Probe Reflection",

    type: "Boolean",

    onSet: (scene, node, value) => {
      if (Boolean(value) === true) {
        try {
          node.useProbeReflection = Boolean(value);
          node.probe = new ReflectionProbe(node.name + "_Probe", 1024, scene);
          if (node.getBindedMeshes().length) {
            node.probe.position = node.getBindedMeshes()[0].position.clone();
            node.probePositionX = node.getBindedMeshes()[0].position.x;
            node.probePositionY = node.getBindedMeshes()[0].position.y;
            node.probePositionZ = node.getBindedMeshes()[0].position.z;
          } else {
            node.probe.position = new Vector3(0, 0, 0);
          }

          node.reflectionTexture = node.probe.cubeTexture;
          node.realTimeFiltering = true;

          return;
        } catch (error) {
          console.warn(error);
        }
      }
    },
    onChange: (e, scene, node, key) => {
      if (e.target.checked !== null) {
        try {
          if (e.target.checked) {
            if (!node.probe) {
              node.probe = new ReflectionProbe(node.name + "_Probe", 1024, scene);
              if (node.getBindedMeshes().length) {
                node.probe.position = node.getBindedMeshes()[0].position.clone();
                node.probePositionX = node.getBindedMeshes()[0].position.x;
                node.probePositionY = node.getBindedMeshes()[0].position.y;
                node.probePositionZ = node.getBindedMeshes()[0].position.z;
              } else {
                node.probe.position = new Vector3(0, 0, 0);
              }
            }

            node.reflectionTexture = node.probe.cubeTexture;

            node.realTimeFiltering = true;
          } else {
            // node.mirror.dispose();
            node.reflectionTexture = null;
          }

          node.useProbeReflection = Boolean(e.target.checked);
        } catch (error) {
          console.warn(error);
        }
      }
    },
  },

  probeReflections: {
    label: "Probe Reflections",
    type: "MeshesArrayReference",
    group: "Reflection",
    onSet: (scene, node, value) => {
      if (value !== null) {
        try {
          node.probeReflections = [];

          value.forEach((m, i) => {
            if (scene.getMeshByName(m) && node.probe) {
              node.probe.renderList.push(scene.getMeshByName(m));
              node.probeReflections.push(m);
            }
          });
          return;
        } catch (error) {
          console.warn(error);
        }
      } else {
        node.probeReflections = [];
      }
    },
    onChange: (value, scene, node, key) => {
      if (node.probe) {
        try {
          node.probe.renderList = [];
          var selectedOpts = [];
          var selectedMeshes = [];
          value.forEach((m, i) => {
            if (!selectedMeshes.includes(scene.getMeshByName(m))) {
              selectedOpts.push(m);
              selectedMeshes.push(scene.getMeshByName(m));
            }
          });

          node.badChanges[key] = selectedOpts;
          node.probeReflections = selectedOpts;
          selectedMeshes.forEach((mesh) => {
            node.probe.renderList.push(mesh);
          });
        } catch (error) {
          console.warn(error);
        }
      }
    },
  },

  posTitle: { group: "Reflection", label: "Probe Position", type: "Title" },
  probePositionX: {
    group: "Reflection",
    label: "pX",
    type: "Number",
    width: "third",
    labelColor: "#f55151",
    onSet: (scene, node, value) => {
      if (value !== null && node.probe) {
        node.probePositionX = value;
        node.probe.position.x = value;
      } else {
        node.probePositionX = 0;
      }
    },

    onChange: (e, scene, node, key) => {
      if (e.target.value !== null && node.probe) {
        node.probe.position.x = e.target.value;
        node.probePositionX = e.target.value;
      } else {
        node.probePositionX = e.target.value;
      }
    },
  },

  probePositionY: {
    group: "Reflection",
    label: "pY",
    type: "Number",
    width: "third",
    labelColor: "#00ff00",
    onSet: (scene, node, value) => {
      if (value !== null && node.probe) {
        node.probePositionY = value;
        node.probe.position.y = value;
      } else {
        node.probePositionY = 0;
      }
    },

    onChange: (e, scene, node, key) => {
      if (e.target.value !== null && node.probe) {
        node.probe.position.y = e.target.value;
        node.probePositionY = e.target.value;
      } else {
        node.probePositionY = e.target.value;
      }
    },
  },

  probePositionZ: {
    group: "Reflection",
    label: "pZ",
    type: "Number",
    width: "third",
    labelColor: "#0099ff",
    onSet: (scene, node, value) => {
      if (value !== null && node.probe) {
        node.probePositionZ = value;
        node.probe.position.z = value;
      } else {
        node.probePositionZ = 0;
      }
    },

    onChange: (e, scene, node, key) => {
      if (e.target.value !== null && node.probe) {
        node.probe.position.z = e.target.value;
        node.probePositionZ = e.target.value;
      } else {
        node.probePositionZ = e.target.value;
      }
    },
  },
  useMirrorReflection: {
    group: "Reflection",
    label: "Use Mirror Reflection",

    type: "Boolean",

    onSet: (scene, node, value) => {
      if (Boolean(value) === true) {
        try {
          node.useMirrorReflection = Boolean(value);
          node.mirror = new MirrorTexture(node.name + "_MirrorTexture", 1024, scene, true);
          node.reflectionTexture = node.mirror;
          node.reflectionTexture.mirrorPlane = new Plane(0, -1.0, 0, 0 || 0);
          node.reflectionTexture.blurKernel = 32;

          return;
        } catch (error) {
          console.warn(error);
        }
      }
    },
    onChange: (e, scene, node, key) => {
      if (e.target.checked !== null) {
        try {
          if (e.target.checked) {
            if (!node.mirror) {
              node.mirror = new MirrorTexture(node.name + "_MirrorTexture", 1024, scene, true);
            }

            node.reflectionTexture = node.mirror;
            node.reflectionTexture.mirrorPlane = new Plane(0, -1.0, 0, node.getBindedMeshes()[0].position.y);
            node.reflectionTexture.blurKernel = 32;
            // node.realTimeFiltering = true;
          } else {
            // node.mirror.dispose();
            node.reflectionTexture = null;
          }

          node.useMirrorReflection = Boolean(e.target.checked);
        } catch (error) {
          console.warn(error);
        }
      }
    },
  },

  mirrorReflections: {
    label: "Mirror Reflections",
    type: "MeshesArrayReference",
    group: "Reflection",
    onSet: (scene, node, value) => {
      if (value !== null) {
        try {
          node.mirrorReflections = [];

          value.forEach((m, i) => {
            if (scene.getMeshByName(m) && node.mirror) {
              node.mirror.renderList.push(scene.getMeshByName(m));
              node.mirrorReflections.push(m);
            }
          });
          return;
        } catch (error) {
          console.warn(error);
        }
      } else {
        node.mirrorReflections = [];
      }
    },
    onChange: (value, scene, node, key) => {
      if (node.mirror) {
        try {
          node.mirror.renderList = [];
          var selectedOpts = [];
          var selectedMeshes = [];
          value.forEach((m, i) => {
            if (!selectedMeshes.includes(scene.getMeshByName(m))) {
              selectedOpts.push(m);
              selectedMeshes.push(scene.getMeshByName(m));
            }
          });

          node.badChanges[key] = selectedOpts;
          node.mirrorReflections = selectedOpts;
          selectedMeshes.forEach((mesh) => {
            node.mirror.renderList.push(mesh);
          });
        } catch (error) {
          console.warn(error);
        }
      }
    },
  },
  mirrorReflectionBlurKernel: {
    group: "Reflection",
    label: "Mirror Blur",
    type: "Number",
    onSet: (scene, node, value) => {
      if (value !== null && node.mirror) {
        try {
          node.mirrorReflectionBlurKernel = value;
          node.reflectionTexture.blurKernel = value;
        } catch (error) {
          console.warn(error);
        }
      } else {
        node.mirrorReflectionBlurKernel = 32;
      }
    },
    onChange: (e, scene, node, key) => {
      if (node.mirror) {
        try {
          node.mirrorReflectionBlurKernel = e.target.value;
          node.reflectionTexture.blurKernel = e.target.value;
        } catch (error) {
          console.warn(error);
        }
      }
    },
  },

  mirrorReflectionHeight: {
    group: "Reflection",
    label: "Mirror Height",
    type: "Number",
    onSet: (scene, node, value) => {
      if (value !== null && node.mirror && node.reflectionTexture.mirrorPlane) {
        try {
          node.reflectionTexture.mirrorPlane.d = value;
          node.mirrorReflectionHeight = value;
        } catch (error) {
          console.warn(error);
        }
      } else {
        node.mirrorReflectionHeight = 0;
        // node.mirrorReflectionBlurKernel = 32;
      }
    },
    onChange: (e, scene, node, key) => {
      if (node.mirror && node.reflectionTexture.mirrorPlane) {
        try {
          node.reflectionTexture.mirrorPlane.d = e.target.value;
          node.mirrorReflectionHeight = e.target.value;
        } catch (error) {
          console.warn(error);
        }
      }
    },
  },

  "anisotropy.isEnabled": { group: "Anisotropy", label: "Enable", type: "Boolean" },
  "anisotropy.intensity": { group: "Anisotropy", label: "intensity", type: "Number" },
  "subSurface.isRefractionEnabled": {
    group: "Volume",
    label: "Enable Refraction",
    type: "Boolean",

    onSet: (scene, node, value) => {
      if (value) {
        if (!node.subSurface.refractionTexture) {
          let refractionTexture = new RefractionTexture("refractionTexture_" + node.name, 1024, scene);

          node.refBinded = false;
          node.onBindObservable.add((mesh) => {
            if (node.refBinded) return;
            refractionTexture.refractionPlane = Plane.FromPositionAndNormal(mesh.position, mesh.getFacetNormal(0).scale(-1));
            if (scene.sceneData.materials[node.name] && scene.sceneData.materials[node.name]["subSurface.refractionTexture.refractionPlane.d"]) {
              refractionTexture.refractionPlane.d = scene.sceneData.materials[node.name]["subSurface.refractionTexture.refractionPlane.d"];
            }

            node.refBinded = true;
          });

          refractionTexture.renderListPredicate = (m) => m.material && m.material !== node;
          node.subSurface.isRefractionEnabled = value;
          node.subSurface.refractionTexture = refractionTexture;
        }
      } else {
        if (node.subSurface) {
          node.subSurface.isRefractionEnabled = false;
        }
      }
    },
    onChange: (e, scene, node, key) => {
      if (e.target.checked !== null) {
        try {
          node.subSurface.isRefractionEnabled = Boolean(e.target.checked);
          if (e.target.checked) {
            if (!node.subSurface.refractionTexture) {
              let refractionTexture = new RefractionTexture("refractionTexture_" + node.name, 1024, scene);

              node.refBinded = false;
              node.onBindObservable.add((mesh) => {
                if (node.refBinded) return;
                refractionTexture.refractionPlane = Plane.FromPositionAndNormal(mesh.position, mesh.getFacetNormal(0).scale(-1));
                if (scene.sceneData.materials[node.name] && scene.sceneData.materials[node.name]["subSurface.refractionTexture.refractionPlane.d"]) {
                  refractionTexture.refractionPlane.d = scene.sceneData.materials[node.name]["subSurface.refractionTexture.refractionPlane.d"];
                }

                node.refBinded = true;
              });

              refractionTexture.renderListPredicate = (m) => m.material && m.material !== node;
              node.subSurface.refractionTexture = refractionTexture;
            }
          }
        } catch (error) {
          console.warn(error);
        }
      }
    },
  },
  "subSurface.refractionTexture": {
    group: "Volume",
    label: "Refraction Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },

  // "subSurface.refractionTexture.refractionPlane.a": {
  //   group: "Volume",
  //   label: "Refraction Plane Normal A",
  //   type: "Number",
  // },
  // "subSurface.refractionTexture.refractionPlane.b": {
  //   group: "Volume",
  //   label: "Refraction Plane Normal B",
  //   type: "Number",
  // },
  // "subSurface.refractionTexture.refractionPlane.c": {
  //   group: "Volume",
  //   label: "Refraction Plane Normal C",
  //   type: "Number",
  // },
  "subSurface.refractionTexture.refractionPlane.d": {
    group: "Volume",
    label: "Refraction Plane Normal D",
    type: "Number",
  },
  "subSurface.refractionTexture.depth": { group: "Volume", label: "Depth", type: "Number" },
  "subSurface.refractionIntensityTexture": {
    group: "Volume",
    label: "Refraction Intensity Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },
  "subSurface.thicknessTexture": {
    group: "Volume",
    label: "Thickness Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },

  "subSurface.diffusionDistance": { group: "Volume", label: "Diffusion Distance", type: "Color3" },
  "subSurface.volumeIndexOfRefraction": { group: "Volume", label: "IOR", type: "Number" },

  "subSurface.refractionIntensity": { group: "Volume", label: "Refraction intensity", type: "Number" },
  "subSurface.useAlbedoToTintRefraction": { group: "Volume", label: "Use Albedo to Tint", type: "Boolean", override: true },
  "subSurface.tintColor": { group: "Volume", label: "Tint Color", type: "Color3" },
  "subSurface.tintColorAtDistance": { group: "Volume", label: "Tint Color At Distance", type: "Number" },

  "subSurface.linkRefractionWithTransparency": { group: "Volume", label: "Link Refraction With Transparency", type: "Boolean" },

  "subSurface.isScatteringEnabled": { group: "Volume", label: "Enable Scattering", type: "Boolean" },

  "subSurface.minimumThickness": { group: "Volume", label: "Min Thickness", type: "Number" },

  "subSurface.maximumThickness": { group: "Volume", label: "Max Thickness", type: "Number" },

  "subSurface.isDispersionEnabled": {
    group: "Volume",
    label: "Enable Dispersion",
    type: "Boolean",
  },
  "subSurface.dispersion": { group: "Volume", label: "Dispersion Intensity", type: "Number" },

  "subSurface.useThicknessAsDepth": { group: "Volume", label: "Use Thickness As Depth", type: "Boolean" },

  "subSurface.isTranslucencyEnabled": { group: "Volume", label: "Enable Translucency", type: "Boolean" },
  "subSurface.translucencyIntensityTexture": {
    group: "Volume",
    label: "Translucency Intensity Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },
  "subSurface.translucencyIntensity": { group: "Volume", label: "Translucency Intensity", type: "Number" },

  // "subSurface.translucencyColor": { group: "Volume", label: "Translucency Color", type: "Color3" },

  "subSurface.invertRefractionY": { group: "Volume", label: "Invert Refraction Y", type: "Boolean" },
  "subSurface.disableAlphaBlending": { group: "Volume", label: "Disable Alpha Blending", type: "Boolean" },
  "iridescence.isEnabled": { group: "Iridescence", label: "Enable", type: "Boolean" },
  "iridescence.texture": {
    group: "Iridescence",
    label: "Iridescence Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },
  "iridescence.intensity": { group: "Iridescence", label: "intensity", type: "Number" },

  "iridescence.indexOfRefraction": { group: "Iridescence", label: "IOR", type: "Number" },

  "clearCoat.isEnabled": { group: "Clear Coat", label: "Enable", type: "Boolean" },
  "clearCoat.texture": {
    group: "Clear Coat",
    label: "Clear Coat Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },
  "clearCoat.bumpTexture": {
    group: "Clear Coat",
    label: "Clear Coat Bump Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },
  "clearCoat.isTintEnabled": { group: "Clear Coat", label: "Enable Tint", type: "Boolean" },
  "clearCoat.tintColor": { group: "Clear Coat", label: "Tint Color", type: "Color3" },
  "clearCoat.intensity": { group: "Clear Coat", label: "intensity", type: "Number" },

  "clearCoat.indexOfRefraction": { group: "Clear Coat", label: "IOR", type: "Number" },
  "clearCoat.roughness": { group: "Clear Coat", label: "Roughness", type: "Number", min: 0, max: 1, step: 0.01 },

  "sheen.isEnabled": { group: "Sheen", label: "Enable", type: "Boolean" },
  "sheen.texture": {
    group: "Sheen",
    label: "Sheen Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
  },
  "sheen.color": { group: "Sheen", label: "Color", type: "Color3" },
  "sheen.intensity": { group: "Sheen", label: "intensity", type: "Number" },

  // invertNormalMapX: {
  //   label: "Invert Normal X",
  //   type: "Boolean",
  // },
  // invertNormalMapY: {
  //   label: "Invert Normal Y",
  //   type: "Boolean",
  // },
  wireframe: {
    group: "Utilities",
    label: "Wireframe",
    type: "Boolean",
    showInEssentials: true,
  },

  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const shaderMaterialProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },
  vertex: {
    label: "Vertex",
    type: "String",
    hidden: true,
  },
  fragment: {
    label: "Fragment",
    type: "String",
    hidden: true,
  },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const diamondMaterialProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },
  u_MAX_BOUNCES: {
    label: "Bounces",
    type: "Number",
    min: 1,
    max: 16,
    step: 1,
    forceInt: true,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.u_MAX_BOUNCES = parseInt(value);
        node.setInt("u_MAX_BOUNCES", parseInt(value));
      } else {
        node.u_MAX_BOUNCES = 3;
        node.setInt("u_MAX_BOUNCES", 3);
      }
    },
    onChange: (e, scene, node, key) => {
      node.u_MAX_BOUNCES = parseInt(e.target.value || 3);
      node.setInt("u_MAX_BOUNCES", parseInt(e.target.value || 3));
    },
  },

  u_IOR: {
    label: "Ior",
    type: "Number",
    min: 0.5,
    max: 4,
    step: 0.01,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.u_IOR = parseFloat(value);
        node.setFloat("u_IOR", parseFloat(value));
      } else {
        node.u_IOR = 2.4;
        node.setFloat("u_IOR", 2.4);
      }
    },
    onChange: (e, scene, node, key) => {
      node.u_IOR = parseFloat(e.target.value || 2.4);
      node.setFloat("u_IOR", parseFloat(e.target.value || 2.4));
    },
  },

  u_MAX_DISTANCE: {
    label: "Max Ray Distance",
    type: "Number",
    min: 0.1,
    max: 100.0,
    step: 0.1,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.u_MAX_DISTANCE = parseFloat(value);
        node.setFloat("u_MAX_DISTANCE", parseFloat(value));
      } else {
        node.u_MAX_DISTANCE = 10.0;
        node.setFloat("u_MAX_DISTANCE", 10.0);
      }
    },
    onChange: (e, scene, node, key) => {
      node.u_MAX_DISTANCE = parseFloat(e.target.value || 10.0);
      node.setFloat("u_MAX_DISTANCE", parseFloat(e.target.value || 10.0));
    },
  },

  u_EPSILON: {
    label: "Epsilon",
    type: "Number",
    min: 0.0001,
    max: 1,
    step: 0.0001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.u_EPSILON = parseFloat(value);
        node.setFloat("u_EPSILON", parseFloat(value));
      } else {
        node.u_EPSILON = 0.001;
        node.setFloat("u_EPSILON", 0.001);
      }
    },
    onChange: (e, scene, node, key) => {
      node.u_EPSILON = parseFloat(e.target.value || 0.001);
      node.setFloat("u_EPSILON", parseFloat(e.target.value || 0.001));
    },
  },

  u_BLEND_MODE: {
    label: "Blend Mode",
    type: "Number",
    min: 0,
    max: 3,
    step: 1,
    forceInt: true,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.u_BLEND_MODE = parseInt(value);
        node.setInt("u_BLEND_MODE", parseInt(value));
      } else {
        node.u_BLEND_MODE = 1;
        node.setInt("u_BLEND_MODE", 1);
      }
    },
    onChange: (e, scene, node, key) => {
      node.u_BLEND_MODE = parseInt(e.target.value || 1);
      node.setInt("u_BLEND_MODE", parseInt(e.target.value || 1));
    },
  },
  blendtit: {
    type: "Title",
    label: "0 = Auto | 1 = Mix | 2 = Overlay | 3 = Multiply",
  },

  u_MIX: {
    label: "Mix",
    type: "Number",
    min: 0,
    max: 1,
    step: 0.01,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.u_MIX = parseFloat(value);
        node.setFloat("u_MIX", parseFloat(value));
      } else {
        node.u_MIX = 0.5;
        node.setFloat("u_MIX", 0.5);
      }
    },
    onChange: (e, scene, node, key) => {
      node.u_MIX = parseFloat(e.target.value || 0.5);
      node.setFloat("u_MIX", parseFloat(e.target.value || 0.5));
    },
  },

  u_BRIGHTNESS: {
    label: "Brightness Multiplier",
    type: "Number",
    min: 0,
    max: 2,
    step: 0.1,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.u_BRIGHTNESS = parseFloat(value);
        node.setFloat("u_BRIGHTNESS", parseFloat(value));
      } else {
        node.u_BRIGHTNESS = 1.0;
        node.setFloat("u_BRIGHTNESS", 1.0);
      }
    },
    onChange: (e, scene, node, key) => {
      node.u_BRIGHTNESS = parseFloat(e.target.value || 1.0);
      node.setFloat("u_BRIGHTNESS", parseFloat(e.target.value || 1.0));
    },
  },
};

export const transmissionMaterialProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },

  samples: {
    label: "Samples",
    type: "Number",
    min: 1,
    max: 16,
    step: 1,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.samples = value;
      } else {
        node.samples = 8;
      }
    },
    onChange: (e, scene, node, key) => {
      node.samples = e.target.value || 8;
    },
  },

  uChromaticAberration: {
    label: "Aberration",
    type: "Number",
    min: 0,
    max: 2,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.uChromaticAberration = value;
      } else {
        node.uChromaticAberration = 0.2;
      }
    },
    onChange: (e, scene, node, key) => {
      node.uChromaticAberration = e.target.value || 0.2;
    },
  },

  uRefractPower: {
    label: "Power",
    type: "Number",
    min: 0,
    max: 2,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.uRefractPower = value;
      } else {
        node.uRefractPower = 0.1;
      }
    },
    onChange: (e, scene, node, key) => {
      node.uRefractPower = e.target.value || 0.1;
    },
  },

  rChannel: {
    label: "Red",
    type: "Number",
    min: 0.001,
    max: 6,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.rChannel = value;
      } else {
        node.rChannel = 3.0;
      }
    },
    onChange: (e, scene, node, key) => {
      node.rChannel = e.target.value || 3.0;
    },
  },

  gChannel: {
    label: "Green",
    type: "Number",
    min: 0.001,
    max: 6,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.gChannel = value;
      } else {
        node.gChannel = 3.0;
      }
    },
    onChange: (e, scene, node, key) => {
      node.gChannel = e.target.value || 3.0;
    },
  },

  bChannel: {
    label: "Blue",
    type: "Number",
    min: 0.001,
    max: 6,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.bChannel = value;
      } else {
        node.bChannel = 3.0;
      }
    },
    onChange: (e, scene, node, key) => {
      node.bChannel = e.target.value || 3.0;
    },
  },

  uSaturation: {
    label: "Saturation",
    type: "Number",
    min: 0,
    max: 2,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.uSaturation = value;
      } else {
        node.uSaturation = 1;
      }
    },
    onChange: (e, scene, node, key) => {
      node.uSaturation = e.target.value || 1;
    },
  },

  uIorR: {
    label: "Red IOR",
    type: "Number",
    min: 0,
    max: 2,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.uIorR = value;
      } else {
        node.uIorR = 1;
      }
    },
    onChange: (e, scene, node, key) => {
      node.uIorR = e.target.value || 1;
    },
  },

  uIorG: {
    label: "Green IOR",
    type: "Number",
    min: 0,
    max: 2,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.uIorG = value;
      } else {
        node.uIorG = 1;
      }
    },
    onChange: (e, scene, node, key) => {
      node.uIorG = e.target.value || 1;
    },
  },

  uIorB: {
    label: "Blue IOR",
    type: "Number",
    min: 0,
    max: 2,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.uIorB = value;
      } else {
        node.uIorB = 1;
      }
    },
    onChange: (e, scene, node, key) => {
      node.uIorB = e.target.value || 1;
    },
  },

  uIorC: {
    label: "Cyan IOR",
    type: "Number",
    min: 0,
    max: 2,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.uIorC = value;
      } else {
        node.uIorC = 1;
      }
    },
    onChange: (e, scene, node, key) => {
      node.uIorC = e.target.value || 1;
    },
  },

  uIorY: {
    label: "Yellow IOR",
    type: "Number",
    min: 0,
    max: 2,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.uIorY = value;
      } else {
        node.uIorY = 1;
      }
    },
    onChange: (e, scene, node, key) => {
      node.uIorY = e.target.value || 1;
    },
  },

  uIorP: {
    label: "Purple IOR",
    type: "Number",
    min: 0,
    max: 2,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.uIorP = value;
      } else {
        node.uIorP = 1;
      }
    },
    onChange: (e, scene, node, key) => {
      node.uIorP = e.target.value || 1;
    },
  },

  uShininess: {
    hidden: true,
    label: "uShininess",
    type: "Number",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.uShininess = value;
      } else {
        node.uShininess = 40.0;
      }
    },
    onChange: (e, scene, node, key) => {
      node.uShininess = e.target.value || 40.0;
    },
  },

  uDiffuseness: {
    hidden: true,
    label: "uDiffuseness",
    type: "Number",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.uDiffuseness = value;
      } else {
        node.uDiffuseness = 6.0;
      }
    },
    onChange: (e, scene, node, key) => {
      node.uDiffuseness = e.target.value || 6.0;
    },
  },

  // uReflectionPower: {
  //   label: "Reflection",
  //   type: "Number",
  //   min: 0,
  //   max: 1,
  //   step: 0.001,
  //   onSet: (scene, node, value) => {
  //     if (value !== null) {
  //       node.uReflectionPower = value;
  //     } else {
  //       node.uReflectionPower = 0.5;
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     node.uReflectionPower = e.target.value || 0.5;
  //   },
  // },

  uFresnelPower: {
    label: "Fresnel",
    type: "Number",
    min: 0,
    max: 100,
    step: 0.001,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.uFresnelPower = value;
      } else {
        node.uFresnelPower = 50;
      }
    },
    onChange: (e, scene, node, key) => {
      node.uFresnelPower = e.target.value || 50;
    },
  },
};

export const photoDomeProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },
  // measuresColor: { group: "Measures Color", label: "Color", type: "Color3" },

  enabled: {
    label: "Enabled",
    type: "Boolean",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.enabled = Boolean(value);
        node.setEnabled(Boolean(value));
      } else {
        node.enabled = true;
      }
    },
    onChange: (e, scene, node, key) => {
      node.enabled = Boolean(e.target.checked);
      node.setEnabled(Boolean(e.target.checked));
    },
  },
  "photoTexture.url": {
    label: "Texture",
    type: "AssetReference",
    hidden: true,
  },

  //position: { label: "Position", type: "Vector3" },
  posTitle: { label: "Position", type: "Title", showInEssentials: true },
  "position.x": { label: "pX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "position.y": { label: "pY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "position.z": { label: "pZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },
  rotTitle: { label: "Rotation", type: "Title", showInEssentials: true },
  "rotation.x": {
    label: "rX °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    width: "third",
    labelColor: "#f55151",
    showInEssentials: true,
  },
  "rotation.y": {
    label: "rY °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    width: "third",
    labelColor: "#00ff00",
    showInEssentials: true,
  },
  "rotation.z": {
    label: "rZ °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    width: "third",
    labelColor: "#0099ff",
    showInEssentials: true,
  },
  scaTitle: { label: "Scaling", type: "Title", showInEssentials: true },
  "scaling.x": { label: "sX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "scaling.y": { label: "sY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "scaling.z": { label: "sZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const gSplatProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },
  // measuresColor: { group: "Measures Color", label: "Color", type: "Color3" },

  enabled: {
    label: "Enabled",
    type: "Boolean",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.enabled = Boolean(value);
        node.setEnabled(Boolean(value));
      } else {
        node.enabled = true;
      }
    },
    onChange: (e, scene, node, key) => {
      node.enabled = Boolean(e.target.checked);
      node.setEnabled(Boolean(e.target.checked));
    },
  },
  url: {
    label: "Url",
    type: "String",
    hidden: true,
  },

  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const transformNodeProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String", showInEssentials: true },
  // measuresColor: { group: "Measures Color", label: "Color", type: "Color3" },

  enabled: {
    label: "Enabled",
    type: "Boolean",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.enabled = Boolean(value);
        node.setEnabled(Boolean(value));
      } else {
        node.enabled = true;
      }
    },
    onChange: (e, scene, node, key) => {
      node.enabled = Boolean(e.target.checked);
      node.setEnabled(Boolean(e.target.checked));
    },
  },
  //position: { label: "Position", type: "Vector3" },

  posGizmo: {
    label: "Position",
    type: "FunctionButton",
    showInEssentials: true,
    hideInNode: true,
    materialIcon: "drag_pan",
    style: {
      justifyContent: "space-between",
    },

    function: (
      e,
      scene,
      node

      // isMappingActive
    ) => {
      if (node.gizmoManager) {
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.rotationGizmoEnabled = false;
        node.gizmoManager.scaleGizmoEnabled = false;
        node.gizmoManager.dispose();
      }

      node.gizmoManager = new GizmoManager(scene);
      node.gizmoManager.usePointerToAttachGizmos = false;
      node.gizmoManager.attachToMesh(node);

      node.gizmoManager.positionGizmoEnabled = !node.gizmoManager.positionGizmoEnabled;
      node.gizmoManager.gizmos.positionGizmo.scaleRatio = 0.5;
      node.gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh = true;

      node.gizmoManager.gizmos.positionGizmo.onDragEndObservable.add(() => {
        const position = getDeep(node, "position");

        if (!node.hasOwnProperty("badChanges")) {
          node.badChanges = {};
        }
        node.badChanges["position.x"] = parseFloat(position.x);
        node.badChanges["position.y"] = parseFloat(position.y);
        node.badChanges["position.z"] = parseFloat(position.z);
      });
    },
  },

  posTitle: { type: "Title", label: "Position" },

  "position.x": { label: "pX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "position.y": { label: "pY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "position.z": { label: "pZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },

  rotGizmo: {
    label: "Rotation",
    type: "FunctionButton",
    hideInNode: true,
    showInEssentials: true,
    materialIcon: "cached",
    style: {
      justifyContent: "space-between",
    },
    function: (e, scene, node) => {
      if (node.gizmoManager) {
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.rotationGizmoEnabled = false;
        node.gizmoManager.scaleGizmoEnabled = false;
        node.gizmoManager.dispose();
      }

      node.gizmoManager = new GizmoManager(scene);
      node.gizmoManager.usePointerToAttachGizmos = false;
      node.gizmoManager.attachToMesh(node);

      node.gizmoManager.rotationGizmoEnabled = !node.gizmoManager.rotationGizmoEnabled;
      node.gizmoManager.gizmos.rotationGizmo.scaleRatio = 0.5;
      node.gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh = true;

      node.gizmoManager.gizmos.rotationGizmo.onDragEndObservable.add(() => {
        const rotation = getDeep(node, "rotation");

        if (!node.hasOwnProperty("badChanges")) {
          node.badChanges = {};
        }
        node.badChanges["rotation.x"] = parseFloat(rotation.x);
        node.badChanges["rotation.y"] = parseFloat(rotation.y);
        node.badChanges["rotation.z"] = parseFloat(rotation.z);
      });
    },
  },

  rotTitle: { type: "Title", label: "Rotation" },

  "rotation.x": {
    label: "rX °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    width: "third",
    labelColor: "#f55151",
    showInEssentials: true,
  },
  "rotation.y": {
    label: "rY °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    width: "third",
    labelColor: "#00ff00",
    showInEssentials: true,
  },
  "rotation.z": {
    label: "rZ °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    width: "third",
    labelColor: "#0099ff",
    showInEssentials: true,
  },

  scaGizmo: {
    label: "Scaling",
    type: "FunctionButton",
    showInEssentials: true,
    hideInNode: true,
    materialIcon: "zoom_out_map",
    style: {
      justifyContent: "space-between",
    },
    function: (e, scene, node) => {
      if (node.gizmoManager) {
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.rotationGizmoEnabled = false;
        node.gizmoManager.scaleGizmoEnabled = false;
        node.gizmoManager.dispose();
      }

      node.gizmoManager = new GizmoManager(scene);
      node.gizmoManager.usePointerToAttachGizmos = false;
      node.gizmoManager.attachToMesh(node);

      node.gizmoManager.scaleGizmoEnabled = !node.gizmoManager.scaleGizmoEnabled;
      node.gizmoManager.gizmos.scaleGizmo.scaleRatio = 0.5;

      node.gizmoManager.gizmos.scaleGizmo.onDragEndObservable.add(() => {
        const scaling = getDeep(node, "scaling");

        if (!node.hasOwnProperty("badChanges")) {
          node.badChanges = {};
        }
        node.badChanges["scaling.x"] = parseFloat(scaling.x);
        node.badChanges["scaling.y"] = parseFloat(scaling.y);
        node.badChanges["scaling.z"] = parseFloat(scaling.z);
      });
    },
    onUnmount: (scene, node) => {
      if (node.gizmoManager) {
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.rotationGizmoEnabled = false;
        node.gizmoManager.scaleGizmoEnabled = false;
        node.gizmoManager.dispose();
      }
    },
  },

  scaTitle: { type: "Title", label: "Scaling" },

  "scaling.x": { label: "sX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "scaling.y": { label: "sY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "scaling.z": { label: "sZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },
  billboardMode: { group: "Advanced", label: "Billboard Mode", type: "Select", options: { 0: "None", 1: "X", 2: "Y", 4: "Z", 7: "All" } },

  measuresColor: { group: "Measures", label: "Measures Color", type: "Color3", override: "#000000" },
  measureX: { label: "MX", type: "Number", width: "third", labelColor: "#f55151", group: "Measures" },
  measureY: { label: "MY", type: "Number", width: "third", labelColor: "#00ff00", group: "Measures" },
  measureZ: { label: "MZ", type: "Number", width: "third", labelColor: "#0099ff", group: "Measures" },
  measureThickness: { label: "Thickness", type: "Number", group: "Measures", override: 0.005 },
  measureDistance: { label: "Distance", type: "Number", group: "Measures", override: 0 },
  measureFont: { label: "Font", type: "String", group: "Measures", override: "normal 72px sans-serif" },

  measuresUnit: { label: "Unit", type: "String", group: "Measures", override: "m" },
  generateMeasures: {
    group: "Measures",
    label: "Generate Measures",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      var createText = function (text, posX, posY, posZ, size, scene, side) {
        //data reporter
        if (scene.getMeshByName(node.name + "_measures_" + side)) {
          scene.getMeshByName(node.name + "_measures_" + side).dispose();
          scene.getMaterialByName(node.name + "_measures_material_" + side).dispose();
          scene.getTextureByName(node.name + "_measures_texture_" + side).dispose();
        }

        var outputplane = MeshBuilder.CreatePlane(node.name + "_measures_" + side, { size: Math.max(size.x, size.y, size.z) }, scene, false);

        outputplane.position = new Vector3(posX, posY, posZ);
        outputplane.rotation.y = -Math.PI;
        outputplane.billboardMode = 7;

        var outputplaneTexture = new DynamicTexture(node.name + "_measures_texture_" + side, 512, scene, true);

        outputplaneTexture.drawText(text, null, 240, node.measureFont, node.measuresColor.toHexString() || "#fff");
        outputplaneTexture.hasAlpha = true;

        outputplane.material = new PBRMaterial(node.name + "_measures_material_" + side, scene);

        outputplane.material.unlit = true;
        outputplane.material.albedoTexture = outputplaneTexture;
        outputplane.material.specularColor = new Color3(0, 0, 0);
        outputplane.material.emissiveColor = new Color3(0, 0, 0);
        outputplane.material.backFaceCulling = false;

        return outputplane;
      };

      const divider = new Vector3(2, 2, 2);
      const boundingVectors = node.getHierarchyBoundingVectors();

      // Calculate the center point
      const minimumVector = boundingVectors.min;
      const maximumVector = boundingVectors.max;
      const center = Vector3.Center(minimumVector, maximumVector);

      var meshPosCenter = center;

      var meshSize = maximumVector.subtract(minimumVector).divide(divider);

      var distance = node.measureDistance;

      var xP = meshPosCenter.x + meshSize.x + (meshSize.x / 100) * distance;
      var xN = meshPosCenter.x - meshSize.x - (meshSize.x / 100) * distance;

      var yP = meshPosCenter.y + meshSize.y + (meshSize.y / 100) * distance;
      var yN = meshPosCenter.y - meshSize.y - (meshSize.y / 100) * distance;

      var zP = meshPosCenter.z + meshSize.z + (meshSize.z / 100) * distance;
      var zN = meshPosCenter.z - meshSize.z - (meshSize.z / 100) * distance;

      var xLine = [new Vector3(xN, yN, zN), new Vector3(xP, yN, zN)];
      var yLine = [new Vector3(xP, yN, zN), new Vector3(xP, yP, zN)];
      var zLine = [new Vector3(xP, yN, zN), new Vector3(xP, yN, zP)];

      var lineCoordinates = [xLine, yLine, zLine];

      if (scene.getMeshByName(node.name + "_measures_lines")) {
        scene.getMeshByName(node.name + "_measures_lines").dispose();
      }

      const dimensionLines = new Mesh(node.name + "_measures_lines", scene);

      lineCoordinates.forEach((coord, i) => {
        const startPoint = coord[0];
        const endPoint = coord[1];

        const height = Vector3.Distance(startPoint, endPoint);
        const direction = endPoint.subtract(startPoint).normalize();

        const cylinder = MeshBuilder.CreateCylinder(
          "cylinder",
          {
            height: height,
            diameterTop: node.measureThickness, // Adjust the top diameter as needed
            diameterBottom: node.measureThickness, // Adjust the bottom diameter as needed
            tessellation: 4, // Increase the tessellation for smoother cylinders
          },
          scene
        );
        if (scene.getMaterialByName(node.name + "_measures_line_" + i)) {
          scene.getMaterialByName(node.name + "_measures_line_" + i).dispose();
        }
        cylinder.material = new PBRMaterial(node.name + "_measures_line_" + i, scene);
        cylinder.material.specularColor = new Color3(0, 0, 0);
        cylinder.material.albedoColor = node.measuresColor || new Color3(1, 1, 1);
        cylinder.material.unlit = true;

        cylinder.position.copyFrom(startPoint.add(endPoint).scale(0.5));
        cylinder.lookAt(endPoint);

        const axis = Vector3.Cross(Vector3.Up(), direction);
        const angle = Math.acos(Vector3.Dot(Vector3.Up(), direction));

        cylinder.rotationQuaternion = Quaternion.RotationAxis(axis, angle);

        cylinder.setParent(dimensionLines);
      });

      // if (scene.getMeshByName(node.name + "_measures_lines")) {
      //   scene.getMeshByName(node.name + "_measures_lines").dispose();
      // }
      // var dimensionLines = MeshBuilder.CreateLineSystem(node.name + "_measures_lines", { lines: lineCoordinates }, scene);
      // dimensionLines.displayName = node.displayName + " Lines";

      // dimensionLines.color = node.measuresColor || new Color3(1, 1, 1);

      var sizeX = !isNaN(node.measureX) && node.measureX > 0 ? parseFloat(node.measureX) : meshSize.x;
      var sizeY = !isNaN(node.measureY) && node.measureY > 0 ? parseFloat(node.measureY) : meshSize.y;
      var sizeZ = !isNaN(node.measureZ) && node.measureZ > 0 ? parseFloat(node.measureZ) : meshSize.z;

      var xText = createText((sizeX / 1).toFixed(2) * 2 + " " + (node.measuresUnit ? node.measuresUnit : "m"), meshPosCenter.x, yN, zN, meshSize, scene, "x");
      xText.position.z = xText.position.z - xText.getBoundingInfo().boundingBox.extendSizeWorld.x / 1;

      var yText = createText((sizeY / 1).toFixed(2) * 2 + " " + (node.measuresUnit ? node.measuresUnit : "m"), xP, meshPosCenter.y, zN, meshSize, scene, "y");
      yText.position.x = yText.position.x + xText.getBoundingInfo().boundingBox.extendSizeWorld.x / 1;

      var zText = createText((sizeZ / 1).toFixed(2) * 2 + " " + (node.measuresUnit ? node.measuresUnit : "m"), xP, yN, meshPosCenter.z, meshSize, scene, "z");
      zText.position.x = zText.position.x + xText.getBoundingInfo().boundingBox.extendSizeWorld.x / 1;
    },
  },
  clearMeasures: {
    label: "Clear Measures",
    type: "FunctionButton",
    group: "Measures",
    animable: true,
    function: (e, scene, node) => {
      if (scene.getMeshByName(node.name + "_measures_lines")) {
        scene.getMeshByName(node.name + "_measures_lines").dispose();

        scene.getMeshByName(node.name + "_measures_" + "x").dispose();
        scene.getMaterialByName(node.name + "_measures_material_" + "x").dispose();
        scene.getTextureByName(node.name + "_measures_texture_" + "x").dispose();

        scene.getMeshByName(node.name + "_measures_" + "y").dispose();
        scene.getMaterialByName(node.name + "_measures_material_" + "y").dispose();
        scene.getTextureByName(node.name + "_measures_texture_" + "y").dispose();

        scene.getMeshByName(node.name + "_measures_" + "z").dispose();
        scene.getMaterialByName(node.name + "_measures_material_" + "z").dispose();
        scene.getTextureByName(node.name + "_measures_texture_" + "z").dispose();

        scene.getMaterialByName(node.name + "_measures_line_" + 0).dispose();
        scene.getMaterialByName(node.name + "_measures_line_" + 1).dispose();
        scene.getMaterialByName(node.name + "_measures_line_" + 2).dispose();
      }
    },
  },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const meshProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },

  displayName: { label: "Name", type: "String", showInEssentials: true },
  font: { label: "Font", type: "String", hidden: true },
  text: { label: "Text", type: "String", hidden: true },
  resolution: { label: "Resolution", type: "Number", hidden: true },
  // lookAt: {
  //   label: "Focus Mesh",
  //   type: "FunctionButton",
  //   function: (e, scene, node) => {
  //     const center = new Vector3(
  //       node.getBoundingInfo().boundingBox.centerWorld.x,
  //       node.getBoundingInfo().boundingBox.centerWorld.y,
  //       node.getBoundingInfo().boundingBox.centerWorld.z
  //     );
  //     scene.activeCamera.target = center;
  //     if (scene.activeCamera.getClassName() === "ArcRotateCamera") {
  //       const radiantsToDegrees = (radiants) => {
  //         var pi = Math.PI;
  //         return radiants * (180 / pi);
  //       };
  //       let obj = node.getBoundingInfo().boundingBox.extendSizeWorld;
  //       let arr = [obj.x, obj.y, obj.z];
  //       let min = Math.min(...arr);
  //       let max = Math.max(...arr);

  //       scene.activeCamera.radius = (max + min) * 10;
  //     }
  //   },
  // },
  //isVisible: { label: "Visible", type: "Boolean", setNodeData:false },

  enabled: {
    label: "Enabled",

    type: "Boolean",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.enabled = Boolean(value);
        node.setEnabled(Boolean(value));
      } else {
        node.enabled = true;
      }
    },
    onChange: (e, scene, node, key) => {
      node.enabled = Boolean(e.target.checked);
      node.setEnabled(Boolean(e.target.checked));
    },
  },

  isPickable: { label: "Pickable", width: "half", type: "Boolean" },
  useVertexColors: { label: "Vertex Colors", width: "half", type: "Boolean" },
  flipNormals: {
    label: "Flip Faces",
    width: "half",
    type: "Boolean",

    onSet: (scene, node, value) => {
      if (value !== null) {
        if (!node.wasFlipped) {
          if (value) {
            node.flipNormals = true;
            node.flipFaces(true);
          } else {
            node.flipNormals = false;
          }
          node.wasFlipped = true;
        }
      } else {
        node.flipNormals = false;
      }
    },
    onChange: (e, scene, node, key) => {
      if (e.target.checked) {
        node.flipNormals = true;
        node.flipFaces(true);
      } else {
        node.flipNormals = false;
        node.flipFaces(true);
      }
    },
  },
  isDraggable: {
    label: "Draggable",
    width: "half",
    type: "Boolean",
    onSet: (scene, node, value) => {
      if (node.hasOwnProperty("pointerDragBehavior")) {
        if (value !== undefined && value !== null && value === true) {
          node.pointerDragBehavior.attach(node);

          node.pointerDragBehavior.enabled = true;
          node.isDraggable = true;
        }

        if (value !== undefined && value !== null && value === false) {
          node.pointerDragBehavior.detach(node);

          node.pointerDragBehavior.enabled = false;
          node.isDraggable = false;
        }
      } else {
        node.isDraggable = false;
      }
    },
    onChange: (e, scene, node, key) => {
      if (node.hasOwnProperty("pointerDragBehavior")) {
        if (e.target.checked !== undefined && e.target.checked !== null && e.target.checked === true) {
          node.pointerDragBehavior.attach(node);

          node.pointerDragBehavior.enabled = true;
          node.isDraggable = true;
        }

        if (e.target.checked !== undefined && e.target.checked !== null && e.target.checked === false) {
          node.pointerDragBehavior.detach(node);

          node.pointerDragBehavior.enabled = false;
          node.isDraggable = false;
        }
      }
    },
  },
  renderingGroupId: { group: "Advanced", label: "Z Index (0 - 4)", type: "Number", forceInt: true },

  posGizmo: {
    label: "Position",
    type: "FunctionButton",
    showInEssentials: true,
    hideInNode: true,
    materialIcon: "drag_pan",
    style: {
      justifyContent: "space-between",
    },
    function: (
      e,
      scene,
      node

      // isMappingActive
    ) => {
      if (node.gizmoManager) {
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.rotationGizmoEnabled = false;
        node.gizmoManager.scaleGizmoEnabled = false;
        node.gizmoManager.dispose();
      }

      node.gizmoManager = new GizmoManager(scene);
      node.gizmoManager.usePointerToAttachGizmos = false;
      node.gizmoManager.attachToMesh(node);

      node.gizmoManager.positionGizmoEnabled = !node.gizmoManager.positionGizmoEnabled;
      node.gizmoManager.gizmos.positionGizmo.scaleRatio = 0.5;
      node.gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh = true;

      node.gizmoManager.gizmos.positionGizmo.onDragEndObservable.add(() => {
        const position = getDeep(node, "position");

        if (!node.hasOwnProperty("badChanges")) {
          node.badChanges = {};
        }
        node.badChanges["position.x"] = parseFloat(position.x);
        node.badChanges["position.y"] = parseFloat(position.y);
        node.badChanges["position.z"] = parseFloat(position.z);
      });
    },

    onUnmount: (scene, node) => {
      if (node.gizmoManager) {
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.rotationGizmoEnabled = false;
        node.gizmoManager.scaleGizmoEnabled = false;
        node.gizmoManager.dispose();
      }
    },
  },
  posTitle: { type: "Title", label: "Position" },

  "position.x": { label: "pX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "position.y": { label: "pY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "position.z": { label: "pZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },

  rotGizmo: {
    label: "Rotation",
    type: "FunctionButton",
    materialIcon: "cached",
    style: {
      justifyContent: "space-between",
    },
    hideInNode: true,
    showInEssentials: true,
    function: (e, scene, node) => {
      if (node.gizmoManager) {
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.rotationGizmoEnabled = false;
        node.gizmoManager.scaleGizmoEnabled = false;
        node.gizmoManager.dispose();
      }

      node.gizmoManager = new GizmoManager(scene);
      node.gizmoManager.usePointerToAttachGizmos = false;
      node.gizmoManager.attachToMesh(node);

      node.gizmoManager.rotationGizmoEnabled = !node.gizmoManager.rotationGizmoEnabled;
      node.gizmoManager.gizmos.rotationGizmo.scaleRatio = 0.5;
      node.gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh = true;

      node.gizmoManager.gizmos.rotationGizmo.onDragEndObservable.add(() => {
        const rotation = getDeep(node, "rotation");

        if (!node.hasOwnProperty("badChanges")) {
          node.badChanges = {};
        }
        node.badChanges["rotation.x"] = parseFloat(rotation.x);
        node.badChanges["rotation.y"] = parseFloat(rotation.y);
        node.badChanges["rotation.z"] = parseFloat(rotation.z);
      });
    },
  },

  rotTitle: { type: "Title", label: "Rotation" },

  "rotation.x": {
    label: "rX °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    width: "third",
    labelColor: "#f55151",
    showInEssentials: true,
  },
  "rotation.y": {
    label: "rY °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    width: "third",
    labelColor: "#00ff00",
    showInEssentials: true,
  },
  "rotation.z": {
    label: "rZ °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    width: "third",
    labelColor: "#0099ff",
    showInEssentials: true,
  },

  scaGizmo: {
    label: "Scaling",
    type: "FunctionButton",
    hideInNode: true,
    showInEssentials: true,
    materialIcon: "zoom_out_map",
    style: {
      justifyContent: "space-between",
    },

    function: (e, scene, node) => {
      if (node.gizmoManager) {
        node.gizmoManager.positionGizmoEnabled = false;
        node.gizmoManager.rotationGizmoEnabled = false;
        node.gizmoManager.scaleGizmoEnabled = false;
        node.gizmoManager.dispose();
      }

      node.gizmoManager = new GizmoManager(scene);
      node.gizmoManager.usePointerToAttachGizmos = false;
      node.gizmoManager.attachToMesh(node);

      node.gizmoManager.scaleGizmoEnabled = !node.gizmoManager.scaleGizmoEnabled;
      node.gizmoManager.gizmos.scaleGizmo.scaleRatio = 0.5;

      node.gizmoManager.gizmos.scaleGizmo.onDragEndObservable.add(() => {
        const scaling = getDeep(node, "scaling");
        if (!node.hasOwnProperty("badChanges")) {
          node.badChanges = {};
        }
        node.badChanges["scaling.x"] = parseFloat(scaling.x);
        node.badChanges["scaling.y"] = parseFloat(scaling.y);
        node.badChanges["scaling.z"] = parseFloat(scaling.z);
      });
    },
  },

  scaTitle: { type: "Title", label: "Scaling" },

  "scaling.x": { label: "sX", type: "Number", width: "third", labelColor: "#f55151", showInEssentials: true },
  "scaling.y": { label: "sY", type: "Number", width: "third", labelColor: "#00ff00", showInEssentials: true },
  "scaling.z": { label: "sZ", type: "Number", width: "third", labelColor: "#0099ff", showInEssentials: true },

  visibility: { label: "Visibility", type: "Number", min: 0, max: 1, step: 0.01 },
  material: {
    label: "Material",
    type: "Material",
    handle: {
      type: "target",
    },
    showInEssentials: true,
  },

  receiveShadows: { group: "Advanced", label: "Receive Shadows", type: "Boolean" },
  renderOverlay: { group: "Advanced", label: "Enable HighLight", type: "Boolean", override: false },
  overlayColor: { group: "Advanced", label: "HighLight Color", type: "Color3", override: "#bada55" },

  checkCollisions: { group: "Advanced", label: "Collide", type: "Boolean", override: false },

  // highlightEnable: {
  //   group: "Advanced",
  //   label: "Enable Highlight",
  //   type: "Boolean",
  //   onSet: (scene, node, value) => {
  //     if (value) {
  //       node.highlightLayer = new HighlightLayer("Highlight_" + node.name, scene);
  //       node.highlightLayer.addMesh(node, node.highlightColor || Color3.FromHexString("#bada55").toLinearSpace());
  //       node.highlightLayer.isEnabled = true;

  //       const pulse = () => {
  //         alpha += 0.02;
  //         node.highlightLayer.blurHorizontalSize = Math.sin(alpha) + 1;
  //         node.highlightLayer.blurVerticalSize = Math.sin(alpha) + 1;
  //       };

  //       var alpha = 0;
  //       scene.registerAfterRender(function pulse() {
  //         if (node.highlightPulse) {
  //           alpha += 0.02;
  //           node.highlightLayer.blurHorizontalSize = Math.sin(alpha) + 1;
  //           node.highlightLayer.blurVerticalSize = Math.sin(alpha) + 1;
  //         }
  //       });
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     if (Boolean(e.target.checked)) {
  //       node.highlightLayer = new HighlightLayer("Highlight_" + node.name, scene);
  //       node.highlightLayer.addMesh(node, node.highlightColor || Color3.FromHexString("#bada55").toLinearSpace());
  //       node.highlightLayer.isEnabled = true;

  //       const pulse = () => {
  //         alpha += 0.02;
  //         node.highlightLayer.blurHorizontalSize = Math.sin(alpha) + 1;
  //         node.highlightLayer.blurVerticalSize = Math.sin(alpha) + 1;
  //       };

  //       var alpha = 0;
  //       scene.registerAfterRender(function pulse() {
  //         if (node.highlightPulse) {
  //           alpha += 0.02;
  //           node.highlightLayer.blurHorizontalSize = Math.sin(alpha) + 1;
  //           node.highlightLayer.blurVerticalSize = Math.sin(alpha) + 1;
  //         }
  //       });
  //     } else {
  //       if (node.highlightLayer) {
  //         node.highlightLayer.dispose();
  //       }
  //     }
  //   },
  // },

  // highlightPulse: {
  //   group: "Advanced",
  //   label: "Highlight Pulse",
  //   type: "Boolean",
  // },

  // highlightColor: {
  //   group: "Advanced",
  //   label: "Highlight Color",
  //   type: "Color3",

  //   onSet: (scene, node, value) => {
  //     if (value !== null && node.highlightLayer) {
  //       node.highlightLayer.addMesh(node, Color3.FromHexString(value).toLinearSpace());
  //       node.highlightColor = Color3.FromHexString(value).toLinearSpace();
  //     } else {
  //       node.highlightColor = Color3.FromHexString("#bada55").toLinearSpace();
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     node.highlightColor = Color3.FromHexString(e.target.value);
  //     if (node.highlightLayer) {
  //       node.highlightLayer.addMesh(node, node.highlightColor);
  //     }
  //   },
  // },

  billboardMode: { group: "Advanced", label: "Billboard Mode", type: "Select", options: { 0: "None", 1: "X", 2: "Y", 4: "Z", 7: "All" } },

  // showBoundingBox: { group: "Advanced", label: "Show Bounding Box", type: "Boolean" },
  measuresColor: { group: "Measures", label: "Measures Color", type: "Color3", override: "#000000" },
  measureX: { label: "MX", type: "Number", width: "third", labelColor: "#f55151", group: "Measures" },
  measureY: { label: "MY", type: "Number", width: "third", labelColor: "#00ff00", group: "Measures" },
  measureZ: { label: "MZ", type: "Number", width: "third", labelColor: "#0099ff", group: "Measures" },
  measureThickness: { label: "Thickness", type: "Number", group: "Measures", override: 0.005 },
  measureDistance: { label: "Distance", type: "Number", group: "Measures", override: 0 },
  measureFont: { label: "Font", type: "String", group: "Measures", override: "normal 72px sans-serif" },
  measuresUnit: { label: "Unit", type: "String", group: "Measures", override: "m" },
  generateMeasures: {
    group: "Measures",
    label: "Generate Measures",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      var createText = function (text, posX, posY, posZ, size, scene, side) {
        //data reporter
        if (scene.getMeshByName(node.name + "_measures_" + side)) {
          scene.getMeshByName(node.name + "_measures_" + side).dispose();
          scene.getMaterialByName(node.name + "_measures_material_" + side).dispose();
          scene.getTextureByName(node.name + "_measures_texture_" + side).dispose();
        }

        var outputplane = MeshBuilder.CreatePlane(node.name + "_measures_" + side, { size: Math.max(size.x, size.y, size.z) }, scene, false);

        outputplane.position = new Vector3(posX, posY, posZ);
        outputplane.rotation.y = -Math.PI;
        outputplane.billboardMode = 7;

        var outputplaneTexture = new DynamicTexture(node.name + "_measures_texture_" + side, 512, scene, true);

        outputplaneTexture.drawText(text, null, 240, node.measureFont, node.measuresColor.toHexString() || "#fff");
        outputplaneTexture.hasAlpha = true;

        outputplane.material = new PBRMaterial(node.name + "_measures_material_" + side, scene);

        outputplane.material.unlit = true;
        outputplane.material.albedoTexture = outputplaneTexture;
        outputplane.material.specularColor = new Color3(0, 0, 0);
        outputplane.material.emissiveColor = new Color3(0, 0, 0);
        outputplane.material.backFaceCulling = false;

        return outputplane;
      };

      var meshPosCenter = node.getBoundingInfo().boundingBox.centerWorld;
      var meshSize = node.getBoundingInfo().boundingBox.extendSizeWorld;

      var distance = node.measureDistance;

      var xP = meshPosCenter.x + meshSize.x + (meshSize.x / 100) * distance;
      var xN = meshPosCenter.x - meshSize.x - (meshSize.x / 100) * distance;

      var yP = meshPosCenter.y + meshSize.y + (meshSize.y / 100) * distance;
      var yN = meshPosCenter.y - meshSize.y - (meshSize.y / 100) * distance;

      var zP = meshPosCenter.z + meshSize.z + (meshSize.z / 100) * distance;
      var zN = meshPosCenter.z - meshSize.z - (meshSize.z / 100) * distance;

      var xLine = [new Vector3(xN, yN, zN), new Vector3(xP, yN, zN)];
      var yLine = [new Vector3(xP, yN, zN), new Vector3(xP, yP, zN)];
      var zLine = [new Vector3(xP, yN, zN), new Vector3(xP, yN, zP)];

      var lineCoordinates = [xLine, yLine, zLine];

      if (scene.getMeshByName(node.name + "_measures_lines")) {
        scene.getMeshByName(node.name + "_measures_lines").dispose();
      }

      const dimensionLines = new Mesh(node.name + "_measures_lines", scene);

      lineCoordinates.forEach((coord, i) => {
        const startPoint = coord[0];
        const endPoint = coord[1];

        const height = Vector3.Distance(startPoint, endPoint);
        const direction = endPoint.subtract(startPoint).normalize();

        const cylinder = MeshBuilder.CreateCylinder(
          "cylinder",
          {
            height: height,
            diameterTop: node.measureThickness, // Adjust the top diameter as needed
            diameterBottom: node.measureThickness, // Adjust the bottom diameter as needed
            tessellation: 4, // Increase the tessellation for smoother cylinders
          },
          scene
        );
        if (scene.getMaterialByName(node.name + "_measures_line_" + i)) {
          scene.getMaterialByName(node.name + "_measures_line_" + i).dispose();
        }
        cylinder.material = new PBRMaterial(node.name + "_measures_line_" + i, scene);
        cylinder.material.specularColor = new Color3(0, 0, 0);
        cylinder.material.albedoColor = node.measuresColor || new Color3(1, 1, 1);
        cylinder.material.unlit = true;

        cylinder.position.copyFrom(startPoint.add(endPoint).scale(0.5));
        cylinder.lookAt(endPoint);

        const axis = Vector3.Cross(Vector3.Up(), direction);
        const angle = Math.acos(Vector3.Dot(Vector3.Up(), direction));

        cylinder.rotationQuaternion = Quaternion.RotationAxis(axis, angle);

        cylinder.setParent(dimensionLines);
      });

      // if (scene.getMeshByName(node.name + "_measures_lines")) {
      //   scene.getMeshByName(node.name + "_measures_lines").dispose();
      // }
      // var dimensionLines = MeshBuilder.CreateLineSystem(node.name + "_measures_lines", { lines: lineCoordinates }, scene);
      // dimensionLines.displayName = node.displayName + " Lines";

      // dimensionLines.color = node.measuresColor || new Color3(1, 1, 1);

      var sizeX = !isNaN(node.measureX) && node.measureX > 0 ? parseFloat(node.measureX) : meshSize.x;
      var sizeY = !isNaN(node.measureY) && node.measureY > 0 ? parseFloat(node.measureY) : meshSize.y;
      var sizeZ = !isNaN(node.measureZ) && node.measureZ > 0 ? parseFloat(node.measureZ) : meshSize.z;

      var xText = createText((sizeX / 1).toFixed(2) * 2 + " " + (node.measuresUnit ? node.measuresUnit : "m"), meshPosCenter.x, yN, zN, meshSize, scene, "x");
      xText.position.z = xText.position.z - xText.getBoundingInfo().boundingBox.extendSizeWorld.x / 1;

      var yText = createText((sizeY / 1).toFixed(2) * 2 + " " + (node.measuresUnit ? node.measuresUnit : "m"), xP, meshPosCenter.y, zN, meshSize, scene, "y");
      yText.position.x = yText.position.x + xText.getBoundingInfo().boundingBox.extendSizeWorld.x / 1;

      var zText = createText((sizeZ / 1).toFixed(2) * 2 + " " + (node.measuresUnit ? node.measuresUnit : "m"), xP, yN, meshPosCenter.z, meshSize, scene, "z");
      zText.position.x = zText.position.x + xText.getBoundingInfo().boundingBox.extendSizeWorld.x / 1;
    },
  },
  clearMeasures: {
    group: "Measures",
    label: "Clear Measures",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      if (scene.getMeshByName(node.name + "_measures_lines")) {
        scene.getMeshByName(node.name + "_measures_lines").dispose();

        scene.getMeshByName(node.name + "_measures_" + "x").dispose();
        scene.getMaterialByName(node.name + "_measures_material_" + "x").dispose();
        scene.getTextureByName(node.name + "_measures_texture_" + "x").dispose();

        scene.getMeshByName(node.name + "_measures_" + "y").dispose();
        scene.getMaterialByName(node.name + "_measures_material_" + "y").dispose();
        scene.getTextureByName(node.name + "_measures_texture_" + "y").dispose();

        scene.getMeshByName(node.name + "_measures_" + "z").dispose();
        scene.getMaterialByName(node.name + "_measures_material_" + "z").dispose();
        scene.getTextureByName(node.name + "_measures_texture_" + "z").dispose();

        scene.getMaterialByName(node.name + "_measures_line_" + 0).dispose();
        scene.getMaterialByName(node.name + "_measures_line_" + 1).dispose();
        scene.getMaterialByName(node.name + "_measures_line_" + 2).dispose();
      }
    },
  },

  dragConstraint: {
    group: "Advanced",
    label: "Drag Constraint",
    type: "Select",
    options: {
      none: "None",
      dragPlaneNormalX: "X Plane",
      dragPlaneNormalY: "Y Plane",
      dragPlaneNormalZ: "Z Plane",
      dragPlaneNormalXY: "X-Y Plane",
      dragPlaneNormalXZ: "X-Z Plane",
      dragPlaneNormalYZ: "Y-Z Plane",
      dragAxisX: "X Axis",
      dragAxisY: "Y Axis",
      dragAxisZ: "Z Axis",
      dragAxisXY: "X-Y Axis",
      dragAxisXZ: "X-Z Axis",
      dragAxisYZ: "Y-Z Axis",
    },
    override: "none",
    onSet: (scene, node, value) => {
      if (node.hasOwnProperty("pointerDragBehavior")) {
        if (value !== undefined && value !== null && value === "none") {
          return;
        }

        if (value !== undefined && value !== null && value === "dragPlaneNormalX") {
          node.pointerDragBehavior.options.dragPlaneNormal = new Vector3(1, 0, 0);
        }
        if (value !== undefined && value !== null && value === "dragPlaneNormalY") {
          node.pointerDragBehavior.options.dragPlaneNormal = new Vector3(0, 1, 0);
        }
        if (value !== undefined && value !== null && value === "dragPlaneNormalZ") {
          node.pointerDragBehavior.options.dragPlaneNormal = new Vector3(0, 0, 1);
        }
        if (value !== undefined && value !== null && value === "dragPlaneNormalXY") {
          node.pointerDragBehavior.options.dragPlaneNormal = new Vector3(1, 1, 0);
        }
        if (value !== undefined && value !== null && value === "dragPlaneNormalXZ") {
          node.pointerDragBehavior.options.dragPlaneNormal = new Vector3(1, 0, 1);
        }
        if (value !== undefined && value !== null && value === "dragPlaneNormalYZ") {
          node.pointerDragBehavior.options.dragPlaneNormal = new Vector3(0, 1, 1);
        }

        if (value !== undefined && value !== null && value === "dragAxisX") {
          node.pointerDragBehavior.options.dragAxis = new Vector3(1, 0, 0);
        }
        if (value !== undefined && value !== null && value === "dragAxisY") {
          node.pointerDragBehavior.options.dragAxis = new Vector3(0, 1, 0);
        }
        if (value !== undefined && value !== null && value === "dragAxisZ") {
          node.pointerDragBehavior.options.dragAxis = new Vector3(0, 0, 1);
        }
        if (value !== undefined && value !== null && value === "dragAxisXY") {
          node.pointerDragBehavior.options.dragAxis = new Vector3(1, 1, 0);
        }
        if (value !== undefined && value !== null && value === "dragAxisXZ") {
          node.pointerDragBehavior.options.dragAxis = new Vector3(1, 0, 1);
        }
        if (value !== undefined && value !== null && value === "dragAxisYZ") {
          node.pointerDragBehavior.options.dragAxis = new Vector3(0, 1, 1);
        }

        node.dragConstraint = value;
      }
    },
    onChange: (e, scene, node, key) => {
      if (node.hasOwnProperty("pointerDragBehavior")) {
        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "none") {
          delete node.pointerDragBehavior.options.dragAxis;
          delete node.pointerDragBehavior.options.dragPlaneNormal;
        }

        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "dragPlaneNormalX") {
          delete node.pointerDragBehavior.options.dragAxis;
          node.pointerDragBehavior.options.dragPlaneNormal = new Vector3(1, 0, 0);
        }
        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "dragPlaneNormalY") {
          delete node.pointerDragBehavior.options.dragAxis;
          node.pointerDragBehavior.options.dragPlaneNormal = new Vector3(0, 1, 0);
        }
        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "dragPlaneNormalZ") {
          delete node.pointerDragBehavior.options.dragAxis;
          node.pointerDragBehavior.options.dragPlaneNormal = new Vector3(0, 0, 1);
        }
        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "dragPlaneNormalXY") {
          delete node.pointerDragBehavior.options.dragAxis;
          node.pointerDragBehavior.options.dragPlaneNormal = new Vector3(1, 1, 0);
        }
        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "dragPlaneNormalXZ") {
          delete node.pointerDragBehavior.options.dragAxis;
          node.pointerDragBehavior.options.dragPlaneNormal = new Vector3(1, 0, 1);
        }
        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "dragPlaneNormalYZ") {
          delete node.pointerDragBehavior.options.dragAxis;
          node.pointerDragBehavior.options.dragPlaneNormal = new Vector3(0, 1, 1);
        }

        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "dragAxisX") {
          delete node.pointerDragBehavior.options.dragPlaneNormal;
          node.pointerDragBehavior.options.dragAxis = new Vector3(1, 0, 0);
        }
        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "dragAxisY") {
          delete node.pointerDragBehavior.options.dragPlaneNormal;
          node.pointerDragBehavior.options.dragAxis = new Vector3(0, 1, 0);
        }
        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "dragAxisZ") {
          delete node.pointerDragBehavior.options.dragPlaneNormal;
          node.pointerDragBehavior.options.dragAxis = new Vector3(0, 0, 1);
        }
        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "dragAxisXY") {
          delete node.pointerDragBehavior.options.dragPlaneNormal;
          node.pointerDragBehavior.options.dragAxis = new Vector3(1, 1, 0);
        }
        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "dragAxisXZ") {
          delete node.pointerDragBehavior.options.dragPlaneNormal;
          node.pointerDragBehavior.options.dragAxis = new Vector3(1, 0, 1);
        }
        if (e.target.value !== undefined && e.target.value !== null && e.target.value === "dragAxisYZ") {
          delete node.pointerDragBehavior.options.dragPlaneNormal;
          node.pointerDragBehavior.options.dragAxis = new Vector3(0, 1, 1);
        }
        node.dragConstraint = e.target.value;
      }
    },
  },

  dragSnapDistanceTitle: { group: "Advanced", label: "Drag Snap Distance", type: "Title" },

  dragSnapDistanceX: {
    group: "Advanced",
    type: "Number",
    label: "Snap X",
    override: 0,
    width: "third",
  },
  dragSnapDistanceY: {
    group: "Advanced",
    type: "Number",
    label: "Snap Y",
    override: 0,
    width: "third",
  },
  dragSnapDistanceZ: {
    group: "Advanced",
    type: "Number",
    label: "Snap Z",
    override: 0,
    width: "third",
  },
  makeGemTit: {
    group: "Advanced",
    type: "Title",
    label: "Make Gem",
  },
  makeGem: {
    group: "Advanced",
    type: "FunctionButton",
    label: "Generate",
    function: (e, scene, node) => {
      const outer = node;
      const inner = createMeshClone(scene, null, node, "GemInside_" + node.name);

      const outerMaterial = createPBRMaterial(scene, null, "GemInsideMaterial_" + node.name);
      const innerMaterial = createPBRMaterial(scene, null, "GemOutsideMaterial_" + node.name);
      let gemEnv;

      if (scene.getTextureByName("CubeTexture_GemEnvironment")) {
        gemEnv = scene.getTextureByName("CubeTexture_GemEnvironment");
      } else {
        gemEnv = createCubeTexture(scene, null, "/assets/gem1.env", "CubeTexture_GemEnvironment");
        gemEnv.displayName = "Gem Environment";

        gemEnv.badChanges = {
          name: "CubeTexture_GemEnvironment",
          displayName: "Gem Environment",
          url: "/assets/gem1.env",
        };
      }

      let refractionTexture = new RefractionTexture("refractionTexture_" + outerMaterial.name, 1024, scene);

      outerMaterial.refBinded = false;
      outerMaterial.onBindObservable.add((mesh) => {
        if (outerMaterial.refBinded) return;

        refractionTexture.refractionPlane = Plane.FromPositionAndNormal(mesh.position, mesh.getFacetNormal(0).scale(-1));

        refractionTexture.refractionPlane.d = -100;

        outerMaterial.refBinded = true;
      });

      refractionTexture.renderListPredicate = (m) => m.material && m.material !== outerMaterial;

      outerMaterial.displayName = "Gem Outside Material " + (node.displayName || node.name);
      outerMaterial.metallic = 0;
      outerMaterial.roughness = 0.02;
      outerMaterial.indexOfRefraction = 2.4;
      outerMaterial.subSurface.isRefractionEnabled = true;
      outerMaterial.subSurface.refractionTexture = refractionTexture;
      outerMaterial.subSurface.refractionTexture.depth = 0.01;
      outerMaterial.subSurface.isDispersionEnabled = true;
      outerMaterial.subSurface.volumeIndexOfRefraction = 2.4;
      outerMaterial.subSurface.dispersion = 5;
      outerMaterial.environmentIntensity = 2;
      outerMaterial.reflectionTexture = gemEnv;

      outerMaterial.badChanges = {
        displayName: "Gem Outside Material " + (node.displayName || node.name),
        metallic: 0,
        roughness: 0.02,
        indexOfRefraction: 2.4,
        reflectionTexture: "CubeTexture_GemEnvironment",
        "subSurface.volumeIndexOfRefraction": 2.4,
        "subSurface.isRefractionEnabled": true,
        "subSurface.refractionTexture.refractionPlane.d": -100,
        //  "subSurface.refractionTexture": refractionTexture.name,
        "subSurface.refractionTexture.refractionPlane": -1,
        "subSurface.refractionTexture.depth": 0.01,
        "subSurface.isDispersionEnabled": true,
        "subSurface.dispersion": 5,
        environmentIntensity: 2,
      };
      (innerMaterial.displayName = "Gem Inside Material " + (node.displayName || node.name)), (innerMaterial.metallic = 1);
      innerMaterial.roughness = 0.02;
      innerMaterial.indexOfRefraction = 2.4;
      innerMaterial.reflectionTexture = gemEnv;

      innerMaterial.badChanges = {
        displayName: "Gem Inside Material " + (node.displayName || node.name),
        metallic: 1,
        roughness: 0.02,
        indexOfRefraction: 2.4,
        reflectionTexture: "CubeTexture_GemEnvironment",
      };

      outer.material = outerMaterial;

      if (!outer.badChanges) {
        outer.badChanges = {};
      }

      outer.badChanges.material = outerMaterial.name;

      inner.material = innerMaterial;
      inner.flipNormals = true;
      inner.flipFaces(true);

      if (!inner.badChanges) {
        inner.badChanges = {};
      }

      inner.badChanges.flipNormals = true;
      inner.badChanges.displayName = "Gem Inside " + (node.displayName || node.name);
      inner.badChanges.material = innerMaterial.name;
    },
  },
  makeGemTit2: {
    group: "Advanced",
    type: "Title",
    label: "This will generate mesh clones and materials for this mesh to achieve a gem effect.",
  },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const decalProps = {
  posTitle: { label: "Position", type: "Title" },
  "position.x": { label: "pX", type: "Number", width: "third", labelColor: "#f55151" },
  "position.y": { label: "pY", type: "Number", width: "third", labelColor: "#00ff00" },
  "position.z": { label: "pZ", type: "Number", width: "third", labelColor: "#0099ff" },
  rotTitle: { label: "Rotation", type: "Title" },
  "rotation.x": {
    label: "rX °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    width: "third",
    labelColor: "#f55151",
  },
  "rotation.y": {
    label: "rY °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    width: "third",
    labelColor: "#00ff00",
  },
  "rotation.z": {
    label: "rZ °",
    type: "Number",
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
    width: "third",
    labelColor: "#0099ff",
  },
  scaTitle: { label: "Scaling", type: "Title" },
  "scaling.x": { label: "sX", type: "Number", width: "third", labelColor: "#f55151" },
  "scaling.y": { label: "sY", type: "Number", width: "third", labelColor: "#00ff00" },
  "scaling.z": { label: "sZ", type: "Number", width: "third", labelColor: "#0099ff" },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const textureProps = {
  displayName: {
    label: "Name",
    type: "String",
  },

  url: {
    label: "Image",
    type: "AssetReference",
    extensions: textureExtensions,

    onSet: (scene, node, value) => {
      if (value !== null) {
        node.updateURL(value);
        node.url = value;
      }
    },
    onChange: (e, scene, node, key, url, ref) => {
      node.badChanges[key] = url;
      node.badChanges[key + "REF"] = ref;
      node.updateURL(url);
      node.url = url;
      node.urlREF = ref;
    },

    onRemove: (e, scene, node, key, url, ref) => {
      node.badChanges[key] = null;
      node.badChanges[key + "REF"] = "$NULL$";
      node.updateURL(fallbackTexture);
      node.url = fallbackTexture;
      node.urlREF = ref;
    },
  },

  getAlphaFromRGB: { label: "Use as Alpha Texture", type: "Boolean" },

  level: { label: "Level", type: "Number" },

  uScale: { label: "U Scale", type: "Number" },
  vScale: { label: "V Scale", type: "Number" },
  uOffset: { label: "U Offset", type: "Number" },
  vOffset: { label: "V Offset", type: "Number" },
  uAng: { label: "U Angle", type: "Number" },
  vAng: { label: "V Angle", type: "Number" },

  coordinatesIndex: { label: "UV Channel", type: "Number", max: 4, min: 0, step: 1, forceInt: true, disableDrag: true },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const colorGradingtextureProps = {
  displayName: {
    label: "Name",
    type: "String",
  },

  url: {
    label: "Image",
    type: "AssetReference",
    extensions: colorGradingTextureExtensions,

    onSet: (scene, node, value) => {
      if (value !== null) {
        //  node.updateURL(value);
        node.url = value;
      }
    },
    onChange: (e, scene, node, key, url, ref) => {
      node.badChanges[key] = url;
      node.badChanges[key + "REF"] = ref;
      //  node.updateURL(url);
      node.url = url;
      node.urlREF = ref;
    },

    onRemove: (e, scene, node, key, url, ref) => {
      node.badChanges[key] = null;
      node.badChanges[key + "REF"] = "$NULL$";
      //  node.updateURL(fallbackTexture);
      node.url = fallbackTexture;
      node.urlREF = ref;
    },
  },

  level: { label: "Level", type: "Number" },

  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const cubeTextureProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },

  url: {
    label: "Image",
    type: "AssetReference",
    extensions: cubeTextureExtensions,

    onSet: (scene, node, value) => {
      if (value !== null) {
        node.updateURL(value);
        node.url = value;
      }
    },
    onChange: (e, scene, node, key, url, ref) => {
      // const values = e.target.value.split("______");
      // node.badChanges[key] = values[1];
      // node.badChanges[key + "REF"] = values[0];
      // node.updateURL(values[1]);
      // node.url = values[1];
      // node.urlREF = values[0];

      node.badChanges[key] = url;
      node.badChanges[key + "REF"] = ref;
      node.updateURL(url);
      node.url = url;
      node.urlREF = ref;
    },
  },

  // bbox: {
  //   label: "Scale (m)",
  //   type: "Number",

  //   onSet: (scene, node, value) => {
  //     //node.canRescale(true);
  //     if (value !== null) {
  //       if (value === 0 || value === "0") {
  //         node.boundingBoxSize = null;
  //         node.bbox = 0;
  //       } else {
  //         node.bbox = parseFloat(value);
  //         node.boundingBoxSize = new Vector3(value, value, value);
  //       }
  //     } else {
  //       node.boundingBoxSize = null;
  //       node.bbox = 0;
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     if (e.target.value === 0 || e.target.value === "0") {
  //       node.boundingBoxSize = null;
  //       node.bbox = 0;
  //     } else {
  //       node.bbox = parseFloat(e.target.value);
  //       node.boundingBoxSize = new Vector3(parseFloat(e.target.value), parseFloat(e.target.value), parseFloat(e.target.value));
  //     }

  //     // node.badChanges[key] = parseFloat(e.target.value);
  //   },
  // },
  level: { label: "Level", type: "Number" },

  rotationY: {
    label: "Rotation Y °",
    type: "Number",
    step: 0.001,
    min: 0,
    max: 360,
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
  },
  // coordinatesModeSelector: {
  //   label: "Reflection Behavior",
  //   type: "Select",
  //   options: {
  //     0: "Explicit",
  //     1: "Spherical",
  //     2: "Planar",
  //     3: "Cubic",
  //     4: "Projection",
  //     5: "Skybox",
  //     6: "Inv Cubic",
  //     7: "Equirectangular",
  //     8: "Fixed Equirectangular",
  //     9: "Fixed Equirectangular Mirrored",
  //   },
  //   onSet: (scene, node, value) => {
  //     if (value !== null) {
  //       const val = parseInt(value);
  //       if (val === 0) {
  //         node.coordinatesMode = Texture.EXPLICIT_MODE;
  //       }
  //       if (val === 1) {
  //         node.coordinatesMode = Texture.SPHERICAL_MODE;
  //       }
  //       if (val === 2) {
  //         node.coordinatesMode = Texture.PLANAR_MODE;
  //       }
  //       if (val === 3) {
  //         node.coordinatesMode = Texture.CUBIC_MODE;
  //       }
  //       if (val === 4) {
  //         node.coordinatesMode = Texture.PROJECTION_MODE;
  //       }
  //       if (val === 5) {
  //         node.coordinatesMode = Texture.SKYBOX_MODE;
  //       }
  //       if (val === 6) {
  //         node.coordinatesMode = Texture.INVCUBIC_MODE;
  //       }
  //       if (val === 7) {
  //         node.coordinatesMode = Texture.EQUIRECTANGULAR_MODE;
  //       }
  //       if (val === 8) {
  //         node.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MODE;
  //       }
  //       if (val === 9) {
  //         node.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE;
  //       }
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     const val = parseInt(e.target.value);
  //     node.coordinatesModeSelector = parseInt(e.target.value);
  //     if (val === 0) {
  //       node.coordinatesMode = Texture.EXPLICIT_MODE;
  //     }
  //     if (val === 1) {
  //       node.coordinatesMode = Texture.SPHERICAL_MODE;
  //     }
  //     if (val === 2) {
  //       node.coordinatesMode = Texture.PLANAR_MODE;
  //     }
  //     if (val === 3) {
  //       node.coordinatesMode = Texture.CUBIC_MODE;
  //     }
  //     if (val === 4) {
  //       node.coordinatesMode = Texture.PROJECTION_MODE;
  //     }
  //     if (val === 5) {
  //       node.coordinatesMode = Texture.SKYBOX_MODE;
  //     }
  //     if (val === 6) {
  //       node.coordinatesMode = Texture.INVCUBIC_MODE;
  //     }
  //     if (val === 7) {
  //       node.coordinatesMode = Texture.EQUIRECTANGULAR_MODE;
  //     }
  //     if (val === 8) {
  //       node.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MODE;
  //     }
  //     if (val === 9) {
  //       node.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE;
  //     }
  //   },
  // },
  // enableSkyboxMode: {
  //   type: "Boolean",
  //   label: "Skybox Mode",
  //   onSet: (scene, node, value) => {
  //     if (Boolean(value)) {
  //       node.enableSkyboxMode = true;
  //       node.coordinatesMode = 5;
  //     } else {
  //       node.enableSkyboxMode = false;
  //       node.coordinatesMode = 0;
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     if (e.target.checked !== null) {
  //       if (Boolean(e.target.checked)) {
  //         node.enableSkyboxMode = true;
  //         node.coordinatesMode = 5;
  //       } else {
  //         node.enableSkyboxMode = false;
  //         node.coordinatesMode = 0;
  //       }
  //     }
  //   },
  // },
  coordinatesIndex: { label: "UV Channel", type: "Number", max: 4, min: 0, step: 1, forceInt: true, disableDrag: true },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const hdrCubeTextureProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },

  url: {
    label: "Image",
    type: "AssetReference",
    extensions: hdrCubeTextureExtensions,

    onSet: (scene, node, value) => {
      if (value !== null) {
        node.updateURL(value);
        node.url = value;
      }
    },
    onChange: (e, scene, node, key, url, ref) => {
      // const values = e.target.value.split("______");
      // node.badChanges[key] = values[1];
      // node.badChanges[key + "REF"] = values[0];
      // node.updateURL(values[1]);
      // node.url = values[1];
      // node.urlREF = values[0];

      node.badChanges[key] = url;
      node.badChanges[key + "REF"] = ref;
      node.updateURL(url);
      node.url = url;
      node.urlREF = ref;
    },
  },

  // bbox: {
  //   label: "Scale (m)",
  //   type: "Number",
  //   step: 0.001,
  //   min: 0,
  //   max: 10,
  //   onSet: (scene, node, value) => {
  //     //node.canRescale(true);
  //     if (value !== null) {
  //       if (value === 0 || value === "0") {
  //         node.boundingBoxSize = null;
  //         node.bbox = 0;
  //       } else {
  //         node.bbox = parseFloat(value);
  //         node.boundingBoxSize = new Vector3(value, value, value);
  //       }
  //     } else {
  //       node.boundingBoxSize = null;
  //       node.bbox = 0;
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     if (e.target.value === 0 || e.target.value === "0") {
  //       node.boundingBoxSize = null;
  //       node.bbox = 0;
  //     } else {
  //       node.bbox = parseFloat(e.target.value);
  //       node.boundingBoxSize = new Vector3(parseFloat(e.target.value), parseFloat(e.target.value), parseFloat(e.target.value));
  //     }

  //     // node.badChanges[key] = parseFloat(e.target.value);
  //   },
  // },
  level: { label: "Level", type: "Number" },

  rotationY: {
    label: "Rotation Y °",
    type: "Number",
    step: 0.001,
    min: 0,
    max: 360,
    frontConversion: (val) => {
      return radiantsToDegrees(val);
    },
    backConversion: (val) => {
      return degreesToRadiants(val);
    },
  },
  // coordinatesModeSelector: {
  //   label: "Reflection Behavior",
  //   type: "Select",
  //   options: {
  //     0: "Explicit",
  //     1: "Spherical",
  //     2: "Planar",
  //     3: "Cubic",
  //     4: "Projection",
  //     5: "Skybox",
  //     6: "Inv Cubic",
  //     7: "Equirectangular",
  //     8: "Fixed Equirectangular",
  //     9: "Fixed Equirectangular Mirrored",
  //   },
  //   onSet: (scene, node, value) => {
  //     if (value !== null) {
  //       const val = parseInt(value);
  //       if (val === 0) {
  //         node.coordinatesMode = Texture.EXPLICIT_MODE;
  //       }
  //       if (val === 1) {
  //         node.coordinatesMode = Texture.SPHERICAL_MODE;
  //       }
  //       if (val === 2) {
  //         node.coordinatesMode = Texture.PLANAR_MODE;
  //       }
  //       if (val === 3) {
  //         node.coordinatesMode = Texture.CUBIC_MODE;
  //       }
  //       if (val === 4) {
  //         node.coordinatesMode = Texture.PROJECTION_MODE;
  //       }
  //       if (val === 5) {
  //         node.coordinatesMode = Texture.SKYBOX_MODE;
  //       }
  //       if (val === 6) {
  //         node.coordinatesMode = Texture.INVCUBIC_MODE;
  //       }
  //       if (val === 7) {
  //         node.coordinatesMode = Texture.EQUIRECTANGULAR_MODE;
  //       }
  //       if (val === 8) {
  //         node.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MODE;
  //       }
  //       if (val === 9) {
  //         node.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE;
  //       }
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     const val = parseInt(e.target.value);
  //     node.coordinatesModeSelector = parseInt(e.target.value);
  //     if (val === 0) {
  //       node.coordinatesMode = Texture.EXPLICIT_MODE;
  //     }
  //     if (val === 1) {
  //       node.coordinatesMode = Texture.SPHERICAL_MODE;
  //     }
  //     if (val === 2) {
  //       node.coordinatesMode = Texture.PLANAR_MODE;
  //     }
  //     if (val === 3) {
  //       node.coordinatesMode = Texture.CUBIC_MODE;
  //     }
  //     if (val === 4) {
  //       node.coordinatesMode = Texture.PROJECTION_MODE;
  //     }
  //     if (val === 5) {
  //       node.coordinatesMode = Texture.SKYBOX_MODE;
  //     }
  //     if (val === 6) {
  //       node.coordinatesMode = Texture.INVCUBIC_MODE;
  //     }
  //     if (val === 7) {
  //       node.coordinatesMode = Texture.EQUIRECTANGULAR_MODE;
  //     }
  //     if (val === 8) {
  //       node.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MODE;
  //     }
  //     if (val === 9) {
  //       node.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE;
  //     }
  //   },
  // },
  // enableSkyboxMode: {
  //   type: "Boolean",
  //   label: "Skybox Mode",
  //   onSet: (scene, node, value) => {
  //     if (Boolean(value)) {
  //       node.enableSkyboxMode = true;
  //       node.coordinatesMode = 5;
  //     } else {
  //       node.enableSkyboxMode = false;
  //       node.coordinatesMode = 0;
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     if (e.target.checked !== null) {
  //       if (Boolean(e.target.checked)) {
  //         node.enableSkyboxMode = true;
  //         node.coordinatesMode = 5;
  //       } else {
  //         node.enableSkyboxMode = false;
  //         node.coordinatesMode = 0;
  //       }
  //     }
  //   },
  // },
  coordinatesIndex: { label: "UV Channel", type: "Number", max: 4, min: 0, step: 1, forceInt: true, disableDrag: true },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const videoTextureProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },
  play: {
    label: "Play",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      node.video.play();
    },
  },
  pause: {
    label: "Pause",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      node.video.pause();
    },
  },
  stop: {
    label: "Stop",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      node.video.pause();
      setTimeout(() => {
        node.video.currentTime = 0;
      }, 50);
    },
  },

  muted: {
    label: "Muted",
    type: "Boolean",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.video.muted = Boolean(value);
        node.muted = Boolean(value);
      } else {
        node.muted = false;
      }
    },
    onChange: (e, scene, node, key) => {
      node.muted = Boolean(e.target.checked);
      node.video.muted = Boolean(e.target.checked);
    },
  },
  loop: {
    label: "Loop",
    type: "Boolean",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.video.loop = Boolean(value);
        node.loop = Boolean(value);
      } else {
        node.loop = false;
      }
    },
    onChange: (e, scene, node, key) => {
      node.loop = Boolean(e.target.checked);
      node.video.loop = Boolean(e.target.checked);
    },
  },
  autoPlay: {
    label: "Auto Play",
    type: "Boolean",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.video.autoplay = Boolean(value);
        node.autoPlay = Boolean(value);
        if (value === true) {
          setTimeout(() => {
            node.video.play();
          });
        }
      } else {
        node.autoPlay = false;
      }
    },
    onChange: (e, scene, node, key) => {
      node.autoPlay = Boolean(e.target.checked);
      node.video.autoplay = Boolean(e.target.checked);
    },
  },
  url: {
    label: "Video",
    type: "AssetReference",
    extensions: videoTextureExtensions,

    onSet: (scene, node, value) => {
      if (value !== null) {
        node.updateURL(value);
        node.url = value;
      }
    },
    onChange: (e, scene, node, key, url, ref) => {
      // const values = e.target.value.split("______");
      // node.badChanges[key] = values[1];
      // node.badChanges[key + "REF"] = values[0];
      // node.updateURL(values[1]);
      // node.url = values[1];
      // node.urlREF = values[0];

      node.badChanges[key] = url;
      node.badChanges[key + "REF"] = ref;
      node.updateURL(url);
      node.url = url;
      node.urlREF = ref;
    },
  },
  coordinatesIndex: { label: "UV Channel", type: "Number", max: 4, min: 0, step: 1, forceInt: true, disableDrag: true },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const drawDynamicTexture = (node) => {
  const ctx = node.getContext();

  let fontStyle = node.fontStyle || "normal";

  const size = 10;
  ctx.font = fontStyle + " " + size + "px " + node.fontFamily;
  const textWidth = ctx.measureText(node.text).width;
  const ratio = textWidth / size;
  const fontSize = Math.floor(1024 / (ratio * 1));
  ctx.clearRect(0, 0, 1024, 1024);
  let font;

  if (node.autoSize) {
    font = fontStyle + " " + fontSize + "px " + node.fontFamily;
  } else {
    font = fontStyle + " " + node.fontSize + "px " + node.fontFamily;
  }

  node.drawText(node.text, null, null, font, node.fontColor, "transparent", false, true);
  // node.update(true, true);
};

export const dynamicTextureProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },
  text: {
    label: "Text",
    type: "String",
    override: "Text",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.text = value;
        drawDynamicTexture(node);
      }
    },
    onChange: (e, scene, node, key) => {
      node.text = e.target.value;

      drawDynamicTexture(node);
    },
  },
  fontFamily: {
    label: "Font",
    type: "Select",
    override: "Arial",
    options: (scene) => {
      // Static font options
      const staticOptions = {
        Arial: "Arial",
        Helvetica: "Helvetica",
        Tahoma: "Tahoma",
        Verdana: "Verdana",
        Consolas: "Consolas",
        "Times New Roman": "Times New Roman",
        "Courier New": "Courier New",
        "Lucida Console": "Lucida Console",
        Garamond: "Garamond",
        "Comic Sans MS": "Comic Sans MS",
      };

      // Dynamic font options from scene.mainData.fonts
      const dynamicOptions = scene.mainData.fonts
        ? Object.entries(scene.mainData.fonts).reduce((acc, [key, value]) => {
          const fontName = value.url.split("/")[6].split(".")[0];
          acc[fontName] = fontName;
          return acc;
        }, {})
        : null;

      // Combine static and dynamic options
      return { ...staticOptions, ...dynamicOptions };
    },

    onSet: (scene, node, value) => {
      if (value !== null) {
        node.fontFamily = value;
        drawDynamicTexture(node);
      }
    },
    onChange: (e, scene, node, key) => {
      node.fontFamily = e.target.value;

      drawDynamicTexture(node);
    },
  },

  fontStyle: {
    label: "Style",
    type: "Select",
    override: "normal",
    options: {
      normal: "Normal",
      bold: "Bold",
      italic: "Italic",
    },

    onSet: (scene, node, value) => {
      if (value !== null) {
        node.fontStyle = value;
        drawDynamicTexture(node);
      }
    },
    onChange: (e, scene, node, key) => {
      node.fontStyle = e.target.value;

      drawDynamicTexture(node);
    },
  },

  fontColor: {
    label: "Color",
    type: "Color3",
    override: "#ffffff",
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.fontColor = value;

        drawDynamicTexture(node);
      }
    },
    onChange: (e, scene, node, key) => {
      node.fontColor = e.target.value;

      drawDynamicTexture(node);
    },
  },
  // bgColor: {
  //   label: "Background Color",
  //   type: "Color3",
  //   override: "#ffffffff",
  //   onSet: (scene, node, value) => {
  //     if (value !== null) {
  //       node.bgColor = value;
  //       node.bgColorTransparent = false;

  //       drawDynamicTexture(node);
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     node.bgColor = e.target.value;
  //     node.bgColorTransparent = false;

  //     drawDynamicTexture(node);
  //   },
  // },

  // bgColorTransparent: {
  //   label: "Transparent",
  //   type: "Boolean",

  //   onSet: (scene, node, value) => {
  //     if (value !== null) {
  //       node.bgColorTransparent = value;

  //       if (node.bgColorTransparent) {
  //         node.bgColor = "transparent";
  //       }

  //       drawDynamicTexture(node);
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     node.bgColorTransparent = e.target.checked;
  //     if (node.bgColorTransparent) {
  //       node.bgColor = "transparent";
  //     }

  //     drawDynamicTexture(node);
  //   },
  // },

  autoSize: {
    label: "Auto Size",
    type: "Boolean",
    override: true,

    onSet: (scene, node, value) => {
      if (value !== null) {
        node.autoSize = value;
        drawDynamicTexture(node);
      }
    },
    onChange: (e, scene, node, key) => {
      node.autoSize = e.target.checked;

      drawDynamicTexture(node);
    },
  },

  fontSize: {
    label: "Size",
    type: "Number",
    override: 64,
    forceInt: true,
    onSet: (scene, node, value) => {
      if (value !== null) {
        node.fontSize = parseFloat(value);

        drawDynamicTexture(node);
      }
    },
    onChange: (e, scene, node, key) => {
      node.fontSize = parseFloat(e.target.value);

      drawDynamicTexture(node);
    },
  },

  // invertText: {
  //   label: "Mirror Text",
  //   type: "Boolean",
  //   override: false,
  //   group: "Advanced",
  //   onSet: (scene, node, value) => {
  //     if (value !== null) {
  //       node.invertText = value;
  //       drawDynamicTexture(node);
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     node.invertText = e.target.checked;

  //     drawDynamicTexture(node);
  //   },
  // },
  //getAlphaFromRGB: { label: "Use as Alpha Texture", type: "Boolean", group: "Advanced" },

  level: { label: "Level", type: "Number", group: "Advanced" },

  uScale: { label: "U Scale", type: "Number", group: "Advanced" },
  vScale: { label: "V Scale", type: "Number", group: "Advanced" },
  uOffset: { label: "U Offset", type: "Number", group: "Advanced" },
  vOffset: { label: "V Offset", type: "Number", group: "Advanced" },
  uAng: { label: "U Angle", type: "Number", group: "Advanced" },
  vAng: { label: "V Angle", type: "Number", group: "Advanced" },

  coordinatesIndex: { label: "UV Channel", type: "Number", max: 4, min: 0, step: 1, group: "Advanced", forceInt: true, disableDrag: true },

  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const soundProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },
  play: {
    label: "Play",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      Engine.audioEngine.unlock();
      node.stop();
      node.play();
    },
  },
  stop: {
    label: "Stop",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      node.stop();
    },
  },
  loop: { label: "Loop", type: "Boolean" },
  autoPlay: { label: "Auto Play", type: "Boolean" },
  spatialSound: { label: "Spatial", type: "Boolean" },
  distanceModel: { label: "Distance Model", type: "String", override: "exponential" },
  volume: { group: "Basic", label: "Volume", type: "Number", override: 1 },
  url: {
    label: "Sound",
    type: "AssetReference",
    extensions: soundExtensions,
    hidden: true,

    onSet: (scene, node, value) => { },
    onChange: (e, scene, node, key) => { },
  },

  //position: { label: "Position", type: "Vector3" }
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const animationGroupProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: { label: "Name", type: "String" },
  speedRatio: { label: "Speed (negative value for reverse)", type: "Number" },
  play: {
    label: "Play",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      if (node.isPlaying) {
        node.stop();
      }
      node.play();
    },
  },
  pause: {
    label: "Pause",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      node.pause();
    },
  },
  stop: {
    label: "Stop",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      node.stop();
    },
  },
  reset: {
    label: "Reset",
    type: "FunctionButton",
    animable: true,
    function: (e, scene, node) => {
      node.play();
      node.goToFrame(1);
      node.stop();
    },
  },

  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
export const animationProps = { badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" } };
export const controlNodeProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: {
    label: "Name",
    type: "String",
  },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const variableProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: {
    label: "Name",
    type: "String",
  },
  value: {
    label: "Value",
    type: "Number",
    override: 0,
  },
  // addVar: {
  //   label: "Add Variable",
  //   type: "FunctionButton",

  //   function: (e, scene, node) => {
  //     node.variables["Var_" + Date.now()] = { key: "", value: "" };
  //     scene.forceUpdate();
  //   },
  // },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const collectionProps = {
  // nodePosition: { label: "Name", type: "String", hidden: true },
  displayName: {
    label: "Name",
    type: "String",
  },

  // addVar: {
  //   label: "Add Variable",
  //   type: "FunctionButton",

  //   function: (e, scene, node) => {
  //     node.variables["Var_" + Date.now()] = { key: "", value: "" };
  //     scene.forceUpdate();
  //   },
  // },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};

export const effectsProps = {
  "imageProcessingConfiguration.isEnabled": {
    group: "Image Processing",
    label: "Enable Effects",
    type: "Boolean",
    override: false,
    showInEssentials: true,
  },
  "imageProcessingConfiguration.exposure": { group: "Image Processing", label: "Exposure", type: "Number", showInEssentials: true },
  "imageProcessingConfiguration.contrast": { group: "Image Processing", label: "Contrast", type: "Number", showInEssentials: true },
  "imageProcessingConfiguration.colorCurves.globalHue": { group: "Image Processing", label: "Global Hue", type: "Number", showInEssentials: true },
  "imageProcessingConfiguration.colorCurves.globalDensity": { group: "Image Processing", label: "Global Density", type: "Number", showInEssentials: true },
  "imageProcessingConfiguration.colorCurves.globalSaturation": {
    group: "Image Processing",
    label: "Global Saturation",
    type: "Number",
    showInEssentials: true,
  },
  "imageProcessingConfiguration.colorCurves.highlightsHue": { group: "Image Processing", label: "Highlight Hue", type: "Number", showInEssentials: true },
  "imageProcessingConfiguration.colorCurves.highlightsDensity": {
    group: "Image Processing",
    label: "Highlight Density",
    type: "Number",
    showInEssentials: true,
  },
  "imageProcessingConfiguration.colorCurves.highlightsSaturation": {
    group: "Image Processing",
    label: "Highlight Saturation",
    type: "Number",
    showInEssentials: true,
  },
  "imageProcessingConfiguration.colorCurves.shadowsHue": { group: "Image Processing", label: "Shadows Hue", type: "Number", showInEssentials: true },
  "imageProcessingConfiguration.colorCurves.shadowsDensity": { group: "Image Processing", label: "Shadows Density", type: "Number", showInEssentials: true },
  "imageProcessingConfiguration.colorCurves.shadowsSaturation": {
    group: "Image Processing",
    label: "Shadows Saturation",
    type: "Number",
    showInEssentials: true,
  },
  "imageProcessingConfiguration.colorGradingEnabled": { group: "Image Processing", label: "Enable Color Grading", type: "Boolean", showInEssentials: true },
  "imageProcessingConfiguration.colorGradingTexture": {
    group: "Image Processing",
    label: "Color Grading Texture",
    type: "Texture",
    handle: {
      type: "target",
    },
    showInEssentials: true,
  },
  "imageProcessingConfiguration.toneMappingEnabled": { group: "Image Processing", label: "Enable Tone Mapping", type: "Boolean" },
  "imageProcessingConfiguration.toneMappingType": {
    group: "Image Processing",
    label: "Tone Mapping Type",
    type: "Select",
    options: {
      0: "Standard",
      1: "ACES",
      2: "Khronos PBR Neutral",
    },

    onSet: (scene, node, value) => {
      if (!node.imageProcessingConfiguration) {
        return;
      }

      if (value !== null) {
        node.imageProcessingConfiguration.toneMappingType = parseInt(value);
      }
    },
    onChange: (e, scene, node, key) => {
      if (!node.imageProcessingConfiguration) {
        return;
      }

      node.imageProcessingConfiguration.toneMappingType = parseInt(e.target.value);
    },
    showInEssentials: true,
  },
  "imageProcessingConfiguration.vignetteEnabled": { group: "Image Processing", label: "Enable Vignette", type: "Boolean", showInEssentials: true },
  "imageProcessingConfiguration.vignetteColor": {
    group: "Image Processing",
    label: "Vignette Color",
    type: "Color3",
    override: "#000000",
    showInEssentials: true,
  },
  "imageProcessingConfiguration.vignetteWeight": { group: "Image Processing", label: "Vignette Weight", type: "Number", showInEssentials: true },
  "imageProcessingConfiguration.vignetteStretch": { group: "Image Processing", label: "Vignette Stretch", type: "Number", showInEssentials: true },

  "ssao.isEnabled": {
    group: "SSAO",
    type: "Boolean",
    label: "Enable SSAO",

    onSet: (scene, node, value) => {
      if (window.location.search.indexOf("vr=true") === -1) {
        if (value !== null && value === true && !node.ssao) {
          node.ssao = new SSAO2RenderingPipeline("ssao2", scene, { ssaoRatio: 0.5, blurRatio: 1.0 }, scene.cameras);
          node.ssao.isEnabled = true;
          node.ssao.base = 0;
          node.ssao.bilateralSamples = 64;
          node.ssao.bilateralSoften = 1;
          node.ssao.bilateralTolerance = 2;
          node.ssao.maxZ = 100;
          node.ssao.minZAspect = 1;
          node.ssao.radius = 0.1;
          node.ssao.totalStrength = 1;
        } else {
          if (node.ssao) {
            node.ssao.isEnabled = false;
          }

          return;
        }
      }
    },
    onChange: (e, scene, node, key) => {
      if (e.target.checked) {
        if (!node.ssao?.isEnabled) {
          if (node.ssao) {
            node.ssao.dispose();
          }
          // const useMSAA = false;
          node.ssao = new SSAO2RenderingPipeline("ssao2", scene, { ssaoRatio: 0.5, blurRatio: 1.0 }, scene.cameras);
          node.ssao.isEnabled = true;
          node.ssao.base = 0;
          node.ssao.bilateralSamples = 64;
          node.ssao.bilateralSoften = 1;
          node.ssao.bilateralTolerance = 2;
          node.ssao.maxZ = 100;
          node.ssao.minZAspect = 1;
          node.ssao.radius = 0.1;
          node.ssao.totalStrength = 1;
        }
      } else {
        if (node.ssao) {
          node.ssao.dispose();
          node.ssao.isEnabled = false;
        }
      }
    },
    showInEssentials: true,
  },
  // ssao2Title: { group: "SSAO", label: "SSAO", type: "Title" },
  // "ssao2Settings.enable": {
  //   group: "SSAO",
  //   label: "Enable SSAO",
  //   type: "Boolean",

  //   onSet: (scene, node, value) => {
  //     if (!node.ssao2Settings) node.ssao2Settings = {};
  //     if (value !== null && value === true && !node.ssao) {
  //       node.ssao2Settings.enable = true;
  //       node.ssao2 = new SSAO2RenderingPipeline("ssao2", scene, { ssaoRatio: 0.5, blurRatio: 1.0 }, scene.cameras);
  //       // node.ssao2.base = node.ssao2Settings.base;
  //       // node.ssao2.bilateralSamples = node.ssao2Settings.bilateralSamples;
  //       // node.ssao2.bilateralSoften = node.ssao2Settings.bilateralSoften;
  //       // node.ssao2.bilateralTolerance = node.ssao2Settings.bilateralTolerance;
  //       // node.ssao2.maxZ = node.ssao2Settings.maxZ;
  //       // node.ssao2.minZAspect = node.ssao2Settings.minZAspect;
  //       // node.ssao2.radius = node.ssao2Settings.radius;
  //       // node.ssao2.totalStrength = node.ssao2Settings.totalStrength;
  //     } else {
  //       node.ssao2Settings.enable = false;
  //     }
  //   },
  //   onChange: (e, scene, node, key) => {
  //     if (Boolean(e.target.checked) && !node.ssao2) {
  //       node.ssao2Settings.enable = true;
  //       node.ssao2 = new SSAO2RenderingPipeline("ssao2", scene, { ssaoRatio: 0.5, blurRatio: 1.0 }, scene.cameras);
  //       node.ssao2.base = node.ssao2Settings.base;
  //       node.ssao2.bilateralSamples = node.ssao2Settings.bilateralSamples;
  //       node.ssao2.bilateralSoften = node.ssao2Settings.bilateralSoften;
  //       node.ssao2.bilateralTolerance = node.ssao2Settings.bilateralTolerance;
  //       node.ssao2.maxZ = node.ssao2Settings.maxZ;
  //       node.ssao2.minZAspect = node.ssao2Settings.minZAspect;
  //       node.ssao2.radius = node.ssao2Settings.radius;
  //       node.ssao2.totalStrength = node.ssao2Settings.totalStrength;
  //     } else {
  //       node.ssao2.dispose();
  //       node.ssao2 = null;
  //       node.ssao2Settings.enable = false;
  //     }
  //   },
  // },

  "ssao.base": {
    group: "SSAO",
    label: "Base",
    type: "Number",
    showInEssentials: true,
  },
  "ssao.bilateralSamples": {
    group: "SSAO",
    label: "Bilateral Samples",
    type: "Number",
    showInEssentials: true,
  },
  "ssao.bilateralSoften": {
    group: "SSAO",
    label: "Bilateral Soften",
    type: "Number",
    showInEssentials: true,
  },
  "ssao.bilateralTolerance": {
    group: "SSAO",
    label: "Bilateral Tolerance",
    type: "Number",
    showInEssentials: true,
  },

  "ssao.maxZ": {
    group: "SSAO",
    label: "Max Z",
    type: "Number",
    showInEssentials: true,
  },
  "ssao.minZAspect": {
    group: "SSAO",
    label: "Min Z Aspect",
    type: "Number",
    showInEssentials: true,
  },

  "ssao.radius": {
    group: "SSAO",
    label: "Radius",
    type: "Number",
    showInEssentials: true,
  },

  "ssao.totalStrength": {
    group: "SSAO",
    label: "Strength",
    type: "Number",
    showInEssentials: true,
  },

  "ssr.isEnabled": {
    group: "Screen Reflections",
    type: "Boolean",
    label: "Enable SSR",

    onSet: (scene, node, value) => {
      if (window.location.search.indexOf("vr=true") === -1) {
        if (value !== null && value === true && !node.ssr) {
          const forceGeometryBuffer = true;
          node.ssr = new SSRRenderingPipeline("ssr", scene, scene.cameras, forceGeometryBuffer, Constants.TEXTURETYPE_UNSIGNED_BYTE);
          node.ssr.isEnabled = true;
        } else {
          return;
        }
      }
    },
    onChange: (e, scene, node, key) => {
      if (e.target.checked) {
        if (!node.ssr) {
          const forceGeometryBuffer = true;
          // const useMSAA = false;
          node.ssr = new SSRRenderingPipeline("ssr", scene, scene.cameras, forceGeometryBuffer, Constants.TEXTURETYPE_UNSIGNED_BYTE);
          node.ssr.isEnabled = true;
        } else {
          node.ssr.isEnabled = true;
        }
      } else {
        //   node.ssr.dispose();
        node.ssr.isEnabled = false;
      }
    },
    showInEssentials: true,
  },

  "ssr.thickness": { group: "Screen Reflections", type: "Number", label: "Thickness", showInEssentials: true },
  "ssr.enableAutomaticThicknessComputation": { group: "Screen Reflections", type: "Boolean", label: "Automatic Thickness", showInEssentials: true },
  "ssr.reflectivityThreshold": { group: "Screen Reflections", type: "Number", label: "Reflectivity Threshold (0.04)", showInEssentials: true },
  "ssr.useFresnel": { group: "Screen Reflections", type: "Boolean", label: "Use Fresnel", showInEssentials: true },

  "ssr.roughnessFactor": { group: "Screen Reflections", type: "Number", label: "Roughness Factor", showInEssentials: true },
  "ssr.maxSteps": { group: "Screen Reflections", type: "Number", label: "Max Steps", showInEssentials: true },
  "ssr.maxDistance": { group: "Screen Reflections", type: "Number", label: "Max Distance", showInEssentials: true },

  "ssr.enableSmoothReflections": { group: "Screen Reflections", type: "Boolean", label: "Smooth Reflections", showInEssentials: true },
  "ssr.attenuateScreenBorders": { group: "Screen Reflections", type: "Boolean", label: "Attenuate Screen Borders", showInEssentials: true },

  "ssr.step": { group: "Screen Reflections", type: "Number", label: "Step", showInEssentials: true },
  "ssr.ssrDownsample": { group: "Screen Reflections", type: "Number", label: "Downsample", showInEssentials: true },
  "ssr.blurDownsample": { group: "Screen Reflections", type: "Number", label: "Blur Downsample", showInEssentials: true },
  "ssr.blurDispersionStrength": { group: "Screen Reflections", type: "Number", label: "Blur Dispersion Strength", showInEssentials: true },

  "ssr.selfCollisionNumSkip": { group: "Screen Reflections", type: "Number", label: "Self Collision Num Skip", showInEssentials: true },
  "ssr.samples": { group: "Screen Reflections", type: "Number", label: "Samples", showInEssentials: true },

  "ssr.debug": { group: "Screen Reflections", type: "Boolean", label: "Debug", showInEssentials: true },

  "gl.isEnabled": { group: "Glow", type: "Boolean", label: "Enable Glow", showInEssentials: true },
  "gl.intensity": { group: "Glow", type: "Number", label: "Intensity", showInEssentials: true },
  "gl.blurKernelSize": { group: "Glow", type: "Number", label: "Blur", showInEssentials: true },

  "defaultRenderingPipeline.bloomEnabled": { group: "Bloom", label: "Enable Bloom", type: "Boolean", showInEssentials: true },
  "defaultRenderingPipeline.bloomKernel": {
    group: "Bloom",
    label: "Kernel",
    type: "Number",
    showInEssentials: true,
  },
  "defaultRenderingPipeline.bloomScale": { group: "Bloom", label: "Scale", type: "Number", showInEssentials: true },
  "defaultRenderingPipeline.bloomThreshold": { group: "Bloom", label: "Threshold", type: "Number", showInEssentials: true },
  "defaultRenderingPipeline.bloomWeight": { group: "Bloom", label: " Weight", type: "Number", showInEssentials: true },

  "defaultRenderingPipeline.chromaticAberrationEnabled": {
    group: "Chromatic Aberration",
    label: "Enable Chromatic Ab.",
    type: "Boolean",
    showInEssentials: true,
  },
  "defaultRenderingPipeline.chromaticAberration.aberrationAmount": { group: "Chromatic Aberration", label: "Amount", type: "Number", showInEssentials: true },

  "defaultRenderingPipeline.depthOfFieldEnabled": { group: "Depth Of Field", label: "Enable DoF", type: "Boolean", showInEssentials: true },

  "defaultRenderingPipeline.depthOfFieldBlurLevel": { group: "Depth Of Field", label: "Blur Level", type: "Number", min: 0, max: 2, step: 1 },
  "defaultRenderingPipeline.depthOfField.fStop": { group: "Depth Of Field", label: "fStop", type: "Number" },
  "defaultRenderingPipeline.depthOfField.focalLength": { group: "Depth Of Field", label: "Focal Length", type: "Number", unit: "millimeters" },
  "defaultRenderingPipeline.depthOfField.focusDistance": {
    group: "Depth Of Field",
    label: "Focus Distance",
    type: "Number",
    frontConversion: (value) => {
      return value / 1000;
    },
    backConversion: (value) => {
      return value * 1000;
    },
    showInEssentials: true,
  },

  "defaultRenderingPipeline.depthOfField.lensSize": {
    group: "Depth Of Field",
    label: "Lens Size",
    type: "Number",
    unit: "millimeters",
    showInEssentials: true,
  },

  "defaultRenderingPipeline.fxaaEnabled": { group: "Anti Aliasing", label: "Enable FXAA", type: "Boolean", showInEssentials: true },

  "defaultRenderingPipeline.grainEnabled": { group: "Grain", label: "Enable Grain", type: "Boolean", showInEssentials: true },
  "defaultRenderingPipeline.grain.intensity": { group: "Grain", label: "Intensity", type: "Number", showInEssentials: true },
  "defaultRenderingPipeline.grain.animated": { group: "Grain", label: "Animated", type: "Boolean", showInEssentials: true },

  "defaultRenderingPipeline.sharpenEnabled": { group: "Sharpen", label: "Enable Sharpen", type: "Boolean", showInEssentials: true },
  "defaultRenderingPipeline.sharpen.colorAmount": { group: "Sharpen", label: "Color Amount", type: "Number", showInEssentials: true },
  "defaultRenderingPipeline.sharpen.edgeAmount": { group: "Sharpen", label: "Edge Amount", type: "Number", showInEssentials: true },
  badNotes: { type: "String", multiline: true, label: "Notes", group: "Notes" },
};
