import {
  assetsExtensions,
  colorGradingTextureExtensions,
  cubeTextureExtensions,
  hdrCubeTextureExtensions,
  soundExtensions,
  splatExtensions,
  textureExtensions,
  videoTextureExtensions,
} from "../../constants";
import { cleanFirebaseUrl } from "../../helpers";
import {
  create3DText,
  createArcRotateCamera,
  createCollection,
  createControlNode,
  createCubeTexture,
  createDiamondMaterial,
  createDirectionalLight,
  createDynamicTexture,
  createGSplat,
  createHDRCubeTexture,
  createHemisphericLight,
  createPBRMaterial,
  createPhotoDome,
  createPointLight,
  createShaderMaterial,
  createShadowOnlyMaterial,
  createSound,
  createSpotLight,
  createTexture,
  createTransmissionMaterial,
  createUniversalCamera,
  createVariable,
  createVideoTexture,
  crerateColorGradingTexture,
} from "../../sceneFunctions/createSceneElements";
import { loadAssets } from "../../sceneFunctions/loadAssets";

export const createNode = async (props) => {
  const type = props.type;
  const scene = props.scene;

  if (type === "Asset") {
    scene.openPrompt(null);
    scene.openPrompt("addAsset", {
      extensions: assetsExtensions,

      callback: (data) => {
        const cleanData = {};

        data.forEach((v, i) => {
          cleanData["Asset_" + Date.now() + "_" + i] = {
            name: v.name,
            asset: v.customUrl || cleanFirebaseUrl(v.url),
            assetREF: v.id,
          };
        });
        // const ref = data.ref;
        // const url = data.url;
        // const title = data.title || ref;
        scene.openPrompt(null);
        loadAssets(cleanData, scene, scene.defaultAssetManager);
      },

      cancel: () => scene.openPrompt(null),
    });
  }

  if (type === "3DText") {
    scene.openPrompt(null);
    scene.openPrompt("add3DText", {
      extensions: assetsExtensions,

      callback: async (props) => {
        const text = props.text;
        const font = props.font;
        const resolution = props.resolution;

        scene.openPrompt(null);

        const node = await create3DText(scene, null, { text: text, font: font, resolution: resolution });

        const textMaterial = createPBRMaterial(scene);

        node.material = textMaterial;

        if (!node.material.hasOwnProperty("badChanges")) {
          node.material.badChanges = {};
        }
        node.material.badChanges.displayName = node.material.name;

        if (!node.hasOwnProperty("badChanges")) {
          node.badChanges = {};
        }

        node.badChanges.material = node.material.name;
        node.badChanges.displayName = node.name;
        node.badChanges.text = text;
        node.badChanges.font = font;
        node.badChanges.resolution = resolution;
        scene.openNode("Mesh", node);
        scene.openPrompt(null);
      },

      cancel: () => scene.openPrompt(null),
    });
  }

  if (type === "PhotoDome") {
    scene.openPrompt(null);
    scene.openPrompt("addAsset", {
      single: true,
      extensions: textureExtensions,
      callback: (data) => {
        data.forEach((v, i) => {
          const ref = v.id;
          const url = v.customUrl || cleanFirebaseUrl(v.url);
          const node = createPhotoDome(scene, null, url);

          node.displayName = v.name;
          if (!node.hasOwnProperty("badChanges")) {
            node.badChanges = {};
          }
          node.badChanges.displayName = v.name;
          node.badChanges["photoTexture.url"] = url;
          node.badChanges["photoTexture.urlREF"] = ref;

          scene.badAssets[node.name] = node;
          scene.openNode("Mesh", node);
        });
        scene.openPrompt(null);
      },
      cancel: () => scene.openPrompt(null),
    });
  }

  if (type === "GSplat") {
    scene.openPrompt(null);
    scene.openPrompt("addAsset", {
      single: true,
      extensions: splatExtensions,
      callback: (data) => {
        data.forEach((v, i) => {
          const ref = v.id;
          const url = v.customUrl || cleanFirebaseUrl(v.url);

          createGSplat(scene, null, url, null).then((node) => {
            node.displayName = v.name;
            if (!node.hasOwnProperty("badChanges")) {
              node.badChanges = {};
            }
            node.badChanges.displayName = v.name;
            node.badChanges.url = url;
            node.badChanges.urlREF = ref;

            scene.badAssets[node.name] = node;
            scene.openNode("Mesh", node);
          });
        });
        scene.openPrompt(null);
      },
      cancel: () => scene.openPrompt(null),
    });
  }

  const actionName = "Action_" + Date.now();
  let action;
  if (type === "Timeline") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "Timeline",
      type: "Timeline",
      actions: [],
      duration: 250,
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }
  if (type === "Sequencer") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "Sequencer",
      type: "Sequencer",
      steps: { 0: [] },
      totalSteps: 0,
    };

    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }

  if (type === "Overlay") {
    scene.createOverlayNode();
  }
  if (type === "Animate") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "Animate",
      duration: 250,
      nodes: {},
      type: "Animate",
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }
  if (type === "Overlays") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "Overlays",
      overlaysToShow: [],
      overlaysToHide: [],
      elementsToShow: "",
      elementsToHide: "",
      type: "Overlays",
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }

  if (type === "EnterAR") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "Enter AR",
      glb: null,
      usdz: null,
      buttonText: "View in AR",
      buttonColor: "#dedede",
      buttonTextColor: "#222222",
      type: "EnterAR",
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }

  if (type === "SaveConfig") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "SaveC onfig",
      type: "SaveConfig",
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }
  if (type === "AddReplace") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "Add - Replace",
      type: "AddReplace",
      settings: {},
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }

  if (type === "ExternalLink") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "External Link",
      type: "ExternalLink",
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }

  if (type === "EnterVTO") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "Enter VTO",
      type: "EnterVTO",
      mode: "head",
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }

  if (type === "Condition") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "Condition",
      type: "Condition",
      trueActions: [],
      falseActions: [],
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }

  if (type === "Math") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "Math",
      type: "Math",
      operation: {
        value1: "",
        operator: "add",
        value2: "",
      },
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }

  if (type === "Screenshot") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "Screenshot",
      type: "Screenshot",
      width: "",
      height: "",
      quality: 1,
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }

  if (type === "ExportScene") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "ExportScene",
      type: "ExportScene",
      excludedMeshes: [],
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }

  if (type === "Expression") {
    action = scene.actions[actionName] = {
      name: actionName,
      displayName: "Expression",
      type: "Expression",
      exp: '"defaultCamera.target.y" = "defaultCamera.radius" / 6',
    };
    action.getClassName = () => {
      return "Action";
    };
    scene.openNode("Action", action);

    scene.openPrompt(null);
  }

  if (type === "ArcRotateCamera") {
    const node = createArcRotateCamera(scene);

    node.displayName = "Orbit Camera";
    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    node.badChanges.displayName = "Orbit Camera";
    scene.effects.defaultRenderingPipeline.addCamera(node);
    scene.openNode("Camera", node);
    scene.openPrompt(null);
  }
  if (type === "UniversalCamera") {
    const node = createUniversalCamera(scene);

    scene.effects.defaultRenderingPipeline.addCamera(node);
    node.displayName = "First Person Camera";
    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    node.badChanges.displayName = "First Person Camera";
    scene.openNode("Camera", node);
    scene.openPrompt(null);
  }

  if (type === "ControlNode") {
    const node = createControlNode(scene);
    node.displayName = "Control Node";

    scene.openNode("ControlNode", node);
  }

  if (type === "PointLight") {
    const node = createPointLight(scene);
    node.displayName = "Point Light";
    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    node.badChanges.displayName = "Point Light";
    scene.openNode("Light", node);
    scene.openPrompt(null);
  }

  if (type === "DirectionalLight") {
    const node = createDirectionalLight(scene);
    node.displayName = "Directional Light";
    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    node.badChanges.displayName = "Directional Light";
    scene.openNode("Light", node);
    scene.openPrompt(null);
  }

  if (type === "SpotLight") {
    const node = createSpotLight(scene);
    node.displayName = "Spot Light";
    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    node.badChanges.displayName = "Spot Light";
    scene.openNode("Light", node);
    scene.openPrompt(null);
  }

  if (type === "HemisphericLight") {
    const node = createHemisphericLight(scene);
    node.displayName = "Hemispheric Light";
    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    node.badChanges.displayName = "Hemispheric Light";
    scene.openNode("Light", node);
    scene.openPrompt(null);
  }

  if (type === "PBRMaterial") {
    const node = createPBRMaterial(scene);
    node.displayName = "PBR Material";
    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    node.badChanges.displayName = "PBR Material";
    scene.openNode("Material", node);
  }
  if (type === "ShadowOnlyMaterial") {
    const node = createShadowOnlyMaterial(scene);
    node.displayName = "Shadow Only Material";
    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    node.badChanges.displayName = "Shadow Only Material";
    scene.openNode("Material", node);
  }

  if (type === "ShaderMaterial") {
    scene.openPrompt(null);

    scene.openPrompt("addShaderMaterial", {
      callback: async (props) => {
        scene.openPrompt(null);
        const node = createShaderMaterial(scene, null, null, props.vertex, props.fragment);
        node.vertex = props.vertex;
        node.fragment = props.fragment;
        node.displayName = "Shader Material";
        if (!node.hasOwnProperty("badChanges")) {
          node.badChanges = {};
        }

        node.badChanges.displayName = "Shader Material";
        node.badChanges.vertex = props.vertex;
        node.badChanges.fragment = props.fragment;

        scene.openNode("Material", node);
      },

      cancel: () => scene.openPrompt(null),
    });
  }

  if (type === "TransmissionMaterial") {
    const node = createTransmissionMaterial(scene);
    node.displayName = "Transmission Material";
    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    node.badChanges.displayName = "Transmission Material";

    scene.openNode("Material", node);
  }

  if (type === "DiamondMaterial") {
    const node = createDiamondMaterial(scene);
    node.displayName = "Diamond Material";
    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    node.badChanges.displayName = "Diamond Material";

    scene.openNode("Material", node);
  }

  if (type === "Sound") {
    scene.openPrompt("addAsset", {
      extensions: soundExtensions,

      callback: (data) => {
        data.forEach((v, i) => {
          const ref = v.id;
          const url = v.customUrl || cleanFirebaseUrl(v.url);
          // const ext = url.split(".").pop();
          const node = createSound(scene, null, url, null);
          node.displayName = v.name;
          if (!node.hasOwnProperty("badChanges")) {
            node.badChanges = {};
          }

          node.badChanges.displayName = v.name;
          node.badChanges.url = url;
          node.badChanges.urlREF = ref;
          scene.openPrompt(null);
          scene.openNode("Sound", node);
        });
      },

      cancel: () => scene.openPrompt(null),
    });
  }

  if (type === "Texture") {
    scene.openPrompt("addAsset", {
      extensions: textureExtensions,
      callback: (data) => {
        data.forEach((v, i) => {
          const ref = v.id;
          const url = v.customUrl || cleanFirebaseUrl(v.url);
          // const ext = url.split(".").pop();
          const node = createTexture(scene, null, url);
          node.displayName = v.name;
          if (!node.hasOwnProperty("badChanges")) {
            node.badChanges = {};
          }

          node.badChanges.displayName = v.name;
          node.badChanges.url = url;
          node.badChanges.urlREF = ref;
          scene.openPrompt(null);
          scene.openNode("Texture", node);
        });
      },
      cancel: () => scene.openPrompt(null),
    });
  }

  if (type === "DynamicTexture") {
    const node = createDynamicTexture(scene, null, null);

    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    node.badChanges.displayName = "Dynamic Texture";
    node.displayName = "Dynamic Texture";
    scene.openPrompt(null);
    scene.openNode("Texture", node);
  }

  if (type === "CubeTexture") {
    scene.openPrompt("addAsset", {
      extensions: cubeTextureExtensions,
      callback: (data) => {
        data.forEach((v, i) => {
          const ref = v.id;
          const url = v.customUrl || cleanFirebaseUrl(v.url);
          // const ext = url.split(".").pop();
          const node = createCubeTexture(scene, null, url);
          node.displayName = v.handle;
          if (!node.hasOwnProperty("badChanges")) {
            node.badChanges = {};
          }
          node.badChanges.displayName = v.handle;
          node.badChanges.url = url;
          node.badChanges.urlREF = ref;
          scene.openPrompt(null);
          scene.openNode("Texture", node);
        });
      },
      cancel: () => scene.openPrompt(null),
    });
  }

  if (type === "HDRCubeTexture") {
    scene.openPrompt("addAsset", {
      extensions: hdrCubeTextureExtensions,
      callback: (data) => {
        data.forEach((v, i) => {
          const ref = v.id;
          const url = v.customUrl || cleanFirebaseUrl(v.url);
          // const ext = url.split(".").pop();
          const node = createHDRCubeTexture(scene, null, url);
          node.displayName = v.handle;
          if (!node.hasOwnProperty("badChanges")) {
            node.badChanges = {};
          }
          node.badChanges.displayName = v.handle;
          node.badChanges.url = url;
          node.badChanges.urlREF = ref;
          scene.openPrompt(null);
          scene.openNode("Texture", node);
        });
      },
      cancel: () => scene.openPrompt(null),
    });
  }

  if (type === "VideoTexture") {
    scene.openPrompt("addAsset", {
      extensions: videoTextureExtensions,
      callback: (data) => {
        data.forEach((v, i) => {
          const ref = v.id;
          const url = v.customUrl || cleanFirebaseUrl(v.url);
          // const ext = url.split(".").pop();
          const node = createVideoTexture(scene, null, url);
          node.displayName = v.handle;
          if (!node.hasOwnProperty("badChanges")) {
            node.badChanges = {};
          }
          node.badChanges.displayName = v.handle;
          node.badChanges.url = url;
          node.badChanges.urlREF = ref;
          scene.openPrompt(null);
          scene.openNode("Texture", node);
        });
      },
      cancel: () => scene.openPrompt(null),
    });
  }

  if (type === "ColorGradingTexture") {
    scene.openPrompt("addAsset", {
      extensions: colorGradingTextureExtensions,
      callback: (data) => {
        data.forEach((v, i) => {
          const ref = v.id;
          const url = v.customUrl || cleanFirebaseUrl(v.url);
          // const ext = url.split(".").pop();
          const node = crerateColorGradingTexture(scene, null, url);
          node.displayName = v.handle;
          if (!node.hasOwnProperty("badChanges")) {
            node.badChanges = {};
          }
          node.badChanges.displayName = v.handle;
          node.badChanges.url = url;
          node.badChanges.urlREF = ref;
          scene.openPrompt(null);
          scene.openNode("Texture", node);
        });
      },
      cancel: () => scene.openPrompt(null),
    });
  }

  if (type === "Variable") {
    const variable = createVariable(scene);

    if (!variable.hasOwnProperty("badChanges")) {
      variable.badChanges = {};
    }
    variable.badChanges.displayName = "Variable";

    scene.openNode("Variable", variable);
  }

  if (type === "Collection") {
    scene.openNode("Collection", createCollection(scene));
  }
};
