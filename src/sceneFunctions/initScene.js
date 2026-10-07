import { AssetsManager, Color3, Scene as _Scene } from "@babylonjs/core";
import { toast } from "sonner";
import { actionsDispatcher } from "./actionDispatcher";
import { loadAssets } from "./loadAssets";
import { setAnimationGroups, setLights, setMaterials, setMeshes, setTextures, setTransformNodes } from "./setScene";
import Cursor from "/assets/cursor.svg";
import HoverCursor from "/assets/hover.svg";

const cloneSceneData = (sceneData) => {
  if (typeof structuredClone === "function") {
    return structuredClone(sceneData);
  }

  return JSON.parse(JSON.stringify(sceneData));
};

const preventWheelDefault = (evt) => {
  evt.preventDefault();
};

export function initScene(engine, data, callback) {
  let scene = new _Scene(engine);

  scene.name = "scene";
  window.scene = scene;

  // scene.enablePhysics();
  scene.sceneData = cloneSceneData(data.data);

  const canvas = document.getElementById("renderCanvas");
  if (canvas && !canvas.__badvisorWheelPreventAttached) {
    canvas.addEventListener("wheel", preventWheelDefault, { passive: false });
    canvas.__badvisorWheelPreventAttached = true;
  }
  // if (data.data.scene.hasOwnProperty("useRightHandedSystem")) {
  //   scene.useRightHandedSystem = data.data.scene.useRightHandedSystem;
  // } else {
  scene.useRightHandedSystem = true;
  //}

  // scene.debugLayer.show();
  scene.defaultCursor = "url(" + Cursor + ") 16 16, auto";
  scene.hoverCursor = "url(" + HoverCursor + ") 16 16, auto";
  scene.preventDefaultOnPointerDown = false;
  scene.preventDefaultOnPointerUp = false;

  scene.fogEnabled = false;

  scene.fogMode = _Scene.FOGMODE_LINEAR;

  scene.fogColor = Color3.FromHexString("#ff3333").toLinearSpace();

  scene.actionsDispatcher = actionsDispatcher;

  scene.initAssetsManager = new AssetsManager(scene);
  scene.initAssetsManager.name = "initAssetsManager";
  scene.initAssetsManager.autoHideLoadingUI = false;
  scene.defaultAssetManager = new AssetsManager(scene);
  scene.defaultAssetManager.name = "defaultAssetManager";

  if (scene.isReady()) {
    if (scene.sceneData.assets) {
      //  console.log("loading assets");
      loadAssets(scene.sceneData.assets, scene, scene.initAssetsManager, () => {});
    }
  } else {
    scene.onReadyObservable.addOnce(() => {
      if (scene.sceneData.assets) {
        //  console.log("loading assets");
        loadAssets(scene.sceneData.assets, scene, scene.initAssetsManager, () => {});
      }
    });
  }

  scene.initAssetsManager.onProgress = (remainingCount, totalCount, lastFinishedTask) => {
    if (document.getElementById("loadingScreen")) {
      document.getElementById("loadingScreenProgressBar").style.width = parseInt(100 - (100 / totalCount) * remainingCount) + "%";
      document.getElementById("loadingScreenProgress").innerHTML = "Loading asset " + (totalCount - remainingCount) + " of " + totalCount;
    }
  };

  scene.initAssetsManager.onFinish = (tasks) => {
    if (document.getElementById("curtain")) {
      document.getElementById("curtain").style.display = "none";
    }

    callback(scene);
  };

  scene.defaultAssetManager.onProgress = (remainingCount, totalCount, lastFinishedTask) => {
    if (document.getElementById("curtain")) {
      document.getElementById("curtainProgressBar").style.width = parseInt(100 - (100 / totalCount) * remainingCount) + "%";
      document.getElementById("curtainProgress").innerHTML = "Importing asset " + (totalCount - remainingCount) + " of " + totalCount;
    }
  };

  scene.defaultAssetManager.onTaskErrorObservable.add(function (task) {
    if (window.location.search.indexOf("editmode=true") !== -1 || window.location.pathname === "/sandbox") {
      toast.error(task.errorObject.message);
      setTimeout(() => {
        document.getElementById("curtain").style.display = "none";
        document.getElementById("curtainProgressBar").style.width = 0 + "%";
        document.getElementById("curtainProgress").innerHTML = "";
      }, 1000);
    }
  });

  scene.defaultAssetManager.onFinish = (tasks) => {
    // set all textures
    setTextures(scene, scene.sceneData, scene.textures);
    // set all materials
    setMaterials(scene, scene.sceneData, scene.materials);
    // set all meshes and transformNodes
    setTransformNodes(scene, scene.sceneData, scene.transformNodes);

    setMeshes(scene, scene.sceneData, scene.meshes);
    // set all lights

    setAnimationGroups(scene, scene.sceneData, scene.animationGroups);

    setLights(scene, scene.sceneData, scene.lights);
    scene.forceUpdate();
    if (window.location.search.indexOf("editmode=true") !== -1 || window.location.pathname === "/sandbox") {
      toast.success("Success!");
      setTimeout(() => {
        document.getElementById("curtain").style.display = "none";
        document.getElementById("curtainProgressBar").style.width = 0 + "%";
        document.getElementById("curtainProgress").innerHTML = "";
      }, 10);

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      const processTasksWithDelay = async (tasks, scene) => {
        for (const [i, v] of tasks.entries()) {
          if (v.loadedMeshes) {
            scene.openNode("Mesh", v.loadedMeshes[0]);
          }
          await delay(10);
        }
      };

      processTasksWithDelay(tasks, scene).then(() => {
        console.log("All tasks processed");
      });
    }
  };

  scene.badAssets = {};

  scene.badHistory = [];
  scene.onLoadTrigger = [];
  scene.onBeforeFrameTrigger = [];
  scene.onAfterFrameTrigger = [];
  scene.onPointerPickTrigger = [];
  scene.onPointerDownTrigger = [];
  scene.onPointerMoveTrigger = [];
  scene.onPointerUpTrigger = [];
  scene.onPointerDoubleTapTrigger = [];

  return scene;
}
