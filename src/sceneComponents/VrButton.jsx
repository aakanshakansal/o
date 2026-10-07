import { WebXRState } from "@babylonjs/core";
import { memo, useState } from "react";

const VrButton = memo((props) => {
  const [vrSupport, setVrSupport] = useState(false);
  const [vrSplash, setVrSplash] = useState(true);
  const [enteringScene, setEnteringScene] = useState(false);

  const hideSplash = () => {
    setVrSplash(false);
  };

  props.scene.vrActive = false;

  const initVRHelper = async () => {
    //  console.log("INITTING VR");
    props.scene.VRHelper = await props.scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-vr",
      },
      disableDefaultUI: true,
    });

    //  props.scene.VRHelper.camera = props.scene.activeCamera;

    if (!props.scene.VRHelper.baseExperience) {
      console.log("no vr support :(");
      //  setVrSplash(false);
      // no xr support
    } else {
      setVrSupport(true);
      // props.scene.VRHelper.baseExperience.onStateChangedObservable.add((state) => {
      //   if (state === 0) {
      //     // setVrSplash(false);
      //     props.scene.vrActive = true;
      //   }
      //   if (state === 3) {
      //     // setEnteringScene(false);
      //     setVrSplash(true);
      //     props.scene.vrActive = false;
      //   }
      // });

      props.scene.cameras.forEach((cam) => {
        if (cam.isDefault) {
          if (cam.hasOwnProperty("walkableMeshes") && cam.walkableMeshes.length) {
            props.scene.getCameraByName("webxr").walkableMeshes = cam.walkableMeshes;
          }

          if (cam.hasOwnProperty("walkableHeight")) {
            props.scene.getCameraByName("webxr").walkableHeight = cam.walkableHeight;
          }

          if (cam.hasOwnProperty("walkableBehavior")) {
            props.scene.getCameraByName("webxr").walkableBehavior = cam.walkableBehavior;
          }

          if (cam.hasOwnProperty("position")) {
            props.scene.getCameraByName("webxr").position = cam.position;
          }
          if (cam.hasOwnProperty("target")) {
            props.scene.getCameraByName("webxr").target = cam.target;
          }
        }
      });

      props.scene.VRHelper.baseExperience.onStateChangedObservable.add((state) => {
        switch (state) {
          case WebXRState.IN_XR:
            //  console.log("IN_XR");
            // XR is initialized and already submitted one frame
            props.scene.vrActive = true;
            props.scene.backInVr = false;
            break;
          case WebXRState.ENTERING_XR:
            //  console.log("ENTERING_XR");
            props.scene.vrActive = true;
            setEnteringScene(true);
            // xr is being initialized, enter XR request was made
            break;
          case WebXRState.EXITING_XR:
            // console.log("EXITING_XR");
            props.scene.vrActive = false;
            // xr exit request was made. not yet done.

            break;
          case WebXRState.NOT_IN_XR:
            //  console.log("NOT_IN_XR");
            props.scene.vrActive = false;
            if (props.scene.backInVr) {
              setEnteringScene(true);
            } else {
              setEnteringScene(false);
            }
            break;
          default:
            break;

          // self explanatory - either out or not yet in XR
        }
      });

      try {
        //  document.getElementById("error").innerHTML = "";

        await props.scene.VRHelper.baseExperience.enterXRAsync("immersive-vr", "local-floor", undefined, {} /*, optionalRenderTarget */).then(() => {});
      } catch (error) {
        //  document.getElementById("error").innerHTML = error.message;
        setEnteringScene(false);
      }
    }
  };

  if (window.location.search.indexOf("vr=true") !== -1 && !props.scene.VRHelper) {
    navigator.xr.isSessionSupported("immersive-vr").then((bool) => {
      if (bool) {
        initVRHelper();
      } else {
        //  setVrSplash(false);
      }
    });
    // WebXRSessionManager.IsSessionSupportedAsync("immersive-vr").then((bool) => {
    //   if (bool) {
    //     initVRHelper();
    //   } else {
    //     //  setVrSplash(false);
    //   }
    // });
  }

  return vrSplash ? (
    <div id="enterVrContainer">
      <div id="error"></div>
      {vrSupport ? (
        <>
          {enteringScene ? (
            <span>Loading...</span>
          ) : (
            <button
              onClick={async () => {
                //  document.getElementById("error").innerHTML = "";
                setEnteringScene(true);
                await props.scene.VRHelper.baseExperience.enterXRAsync("immersive-vr", "local-floor", undefined, {} /*, optionalRenderTarget */).then(() => {});
              }}
            >
              {"Enter VR"}
            </button>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          {" "}
          VR is not supported on this device<br></br>
          <br></br>
          <button style={{ width: "auto" }} onClick={() => hideSplash()}>
            Web Version
          </button>
        </div>
      )}
    </div>
  ) : null;
});

export default VrButton;
