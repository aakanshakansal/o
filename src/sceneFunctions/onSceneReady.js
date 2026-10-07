import { PointerEventTypes } from "@babylonjs/core";
import "@babylonjs/loaders/OBJ";
import "@babylonjs/loaders/glTF";
import { toast } from "sonner";
import { postToParentWindow, radiantsToDegrees } from "../helpers";
import { actionsDispatcher } from "./actionDispatcher";
import { postMessageApi } from "./postMessageApi";
import { createSpecialMaterials, setMeshes, setSpecialMaterials } from "./setScene";

export const onSceneReady = (scene, engine, setLoading, setLoadingScreen) => {
  createSpecialMaterials(scene, scene.sceneData);
  setSpecialMaterials(scene, scene.sceneData, scene.materials);
  setMeshes(scene, scene.sceneData, scene.meshes);
  toast.dismiss();

  scene.startTime = Date.now();
  scene.updateActionsLog = (data) => {
    if (window.actionsLog) {
      window.actionsLog = [data, ...window.actionsLog];
    } else {
      window.actionsLog = [data];
    }
  };

  if (engine.scenes.length > 1) {
    engine.scenes.forEach((s) => {
      if (s.badId) {
        s.dispose();
      }
    });
  }

  scene.registerBeforeRender(() => {
    scene.onBeforeFrameTrigger.forEach((id, i) => {
      if (scene.actions.hasOwnProperty(id)) {
        return actionsDispatcher(scene, scene.actions[id], { trigger: "SceneBeforeRender" });
      }
    });
  });

  scene.registerAfterRender(() => {
    scene.onAfterFrameTrigger.forEach((id, i) => {
      if (scene.actions.hasOwnProperty(id)) {
        return actionsDispatcher(scene, scene.actions[id], { trigger: "SceneAfterRender" });
      }
    });
  });

  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case PointerEventTypes.POINTERDOWN:
        scene.onPointerDownTrigger.forEach((id, i) => {
          if (scene.actions.hasOwnProperty(id)) {
            return actionsDispatcher(scene, scene.actions[id], { trigger: "ScenePointerDown", trackEvent: true });
          }
        });
        break;
      case PointerEventTypes.POINTERUP:
        try {
          // window.umami.track("sceneUserInteraction", {
          //   eventName: "sceneUserInteraction",
          //   sceneId: scene.badId,
          //   sceneUrl: window.location.href,
          //   currentCameraHorizontalAngle: scene.activeCamera.alpha ? radiantsToDegrees(scene.activeCamera.alpha) : null,
          //   currentCameraVerticalAngle: scene.activeCamera.beta ? radiantsToDegrees(scene.activeCamera.beta) : null,
          //   currentCameraDistance: scene.activeCamera.radius || null,
          //   currentCameraPositionX: scene.activeCamera.position?.x || null,
          //   currentCameraPositionY: scene.activeCamera.position?.y || null,
          //   currentCameraPositionZ: scene.activeCamera.position?.z || null,
          //   currentCameraTargetX: scene.activeCamera.target?.x || null,
          //   currentCameraTargetY: scene.activeCamera.target?.y || null,
          //   currentCameraTargetZ: scene.activeCamera.target?.z || null,
          // });

          if (scene.mainData.ga4Id) {
            window.gtag("event", "sceneUserInteraction", {
              eventName: "sceneUserInteraction",
              sceneId: scene.badId,
              sceneUrl: window.location.href,
              currentCameraHorizontalAngle: scene.activeCamera.alpha ? radiantsToDegrees(scene.activeCamera.alpha) : null,
              currentCameraVerticalAngle: scene.activeCamera.beta ? radiantsToDegrees(scene.activeCamera.beta) : null,
              currentCameraDistance: scene.activeCamera.radius || null,
              currentCameraPositionX: scene.activeCamera.position?.x || null,
              currentCameraPositionY: scene.activeCamera.position?.y || null,
              currentCameraPositionZ: scene.activeCamera.position?.z || null,
              currentCameraTargetX: scene.activeCamera.target?.x || null,
              currentCameraTargetY: scene.activeCamera.target?.y || null,
              currentCameraTargetZ: scene.activeCamera.target?.z || null,
              send_to: scene.mainData.ga4Id,
            });
          }
        } catch (error) {
          console.log(error);
        }

        scene.onPointerUpTrigger.forEach((id, i) => {
          if (scene.actions.hasOwnProperty(id)) {
            return actionsDispatcher(scene, scene.actions[id], { trigger: "ScenePointerUp", trackEvent: true });
          }
        });
        break;
      case PointerEventTypes.POINTERMOVE:
        scene.onPointerMoveTrigger.forEach((id, i) => {
          if (scene.actions.hasOwnProperty(id)) {
            return actionsDispatcher(scene, scene.actions[id], { trigger: "ScenePointerMove" });
          }
        });
        break;
      case PointerEventTypes.POINTERWHEEL:
        //  console.log("Pointer wheel");
        break;
      case PointerEventTypes.POINTERPICK:
        console.log("ScenePointerPick");
        scene.onPointerPickTrigger.forEach((id, i) => {
          if (scene.actions.hasOwnProperty(id)) {
            return actionsDispatcher(scene, scene.actions[id], { trigger: "ScenePointerPick", trackEvent: true });
          }
        });
        break;
      case PointerEventTypes.POINTERTAP:
        //  console.log("Pointer tap");
        break;
      case PointerEventTypes.POINTERDOUBLETAP:
        scene.onPointerDoubleTapTrigger.forEach((id, i) => {
          if (scene.actions.hasOwnProperty(id)) {
            return actionsDispatcher(scene, scene.actions[id], { trigger: "ScenePointerDoubleTap", trackEvent: true });
          }
        });
        break;
      default:
        break;
    }
  });

  window.addEventListener("message", (e) => postMessageApi(e, scene));
  if (document.getElementById("loadingScreen")) {
    document.getElementById("loadingScreenProgress").innerHTML = "Starting Scene...";
  }
  setTimeout(() => {
    setLoading(false);

    scene.onLoadTrigger.forEach((id, i) => {
      if (scene.actions.hasOwnProperty(id)) {
        return actionsDispatcher(scene, scene.actions[id], { trigger: "Load" });
      }
    });
    setTimeout(() => {
      setLoadingScreen(false);
      // if (scene.mainData.gtmId) {
      //   window.dataLayer.push({
      //     event: "sceneHasStarted",
      //   });
      // }

      try {
        // window.umami.track("sceneHasStarted", {
        //   eventName: "sceneHasStarted",
        //   sceneId: scene.badId,
        //   sceneUrl: window.location.href,
        //   startCameraHorizontalAngle: scene.activeCamera.alpha ? radiantsToDegrees(scene.activeCamera.alpha) : null,
        //   startCameraVerticalAngle: scene.activeCamera.beta ? radiantsToDegrees(scene.activeCamera.beta) : null,
        //   startCameraDistance: scene.activeCamera.radius || null,
        //   startCameraPositionX: scene.activeCamera.position?.x || null,
        //   startCameraPositionY: scene.activeCamera.position?.y || null,
        //   startCameraPositionZ: scene.activeCamera.position?.z || null,
        //   startCameraTargetX: scene.activeCamera.target?.x || null,
        //   startCameraTargetY: scene.activeCamera.target?.y || null,
        //   startCameraTargetZ: scene.activeCamera.target?.z || null,
        // });

        if (scene.mainData.ga4Id) {
          window.gtag("event", "sceneHasStarted", {
            eventName: "sceneHasStarted",
            sceneId: scene.badId,
            sceneUrl: window.location.href,
            startCameraHorizontalAngle: scene.activeCamera.alpha ? radiantsToDegrees(scene.activeCamera.alpha) : null,
            startCameraVerticalAngle: scene.activeCamera.beta ? radiantsToDegrees(scene.activeCamera.beta) : null,
            startCameraDistance: scene.activeCamera.radius || null,
            startCameraPositionX: scene.activeCamera.position?.x || null,
            startCameraPositionY: scene.activeCamera.position?.y || null,
            startCameraPositionZ: scene.activeCamera.position?.z || null,
            startCameraTargetX: scene.activeCamera.target?.x || null,
            startCameraTargetY: scene.activeCamera.target?.y || null,
            startCameraTargetZ: scene.activeCamera.target?.z || null,
            send_to: scene.mainData.ga4Id,
          });
        }
      } catch (error) {
        console.log(error);
      }

      postToParentWindow({
        type: "sceneHasStarted",

        //  data: scene.sceneData
      });
    }, 10);
  }, 10);
};
