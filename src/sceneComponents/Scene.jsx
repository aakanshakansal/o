import { useEffect, useRef, useState } from "react";

//import { createContext } from "react";

// import * as BABYLON from "@babylonjs/core/Legacy/legacy";

import { AiFillAndroid, AiFillApple, AiFillWindows } from "react-icons/ai";
import { ReactFlowProvider } from "reactflow";
import { addVisit, getDevice, getOrganization, isLocalhost } from "../helpers";
import { Overlay } from "./Overlay";
import VrButton from "./VrButton";

// import cannon from "cannon";
import { initScene } from "../sceneFunctions/initScene";
import ArButton from "./ArButton";
import SplitWrapper from "./SplitWrapper";

import { AnimatePresence } from "framer-motion";
import {
    useCurrentSceneIsLoading,
    useData,
    useEditorOverlay,
    useLoadingScreen,
    useUpdateCurrentScene,
    useUpdateCurrentSceneIsLoading,
    useUpdateData,
    useUpdateForceUpdate,
    useUpdateLoadingScreen,
    useViewportSize,
} from "../badProvider/functions";
import { DropWrapper } from "../modules/editor/Components/DropWrapper";
import { storageUrl } from "../Router";
import { initFaceMaskTracking } from "../sceneFunctions/initFaceMaskTracking";
import { initGLEngine } from "../sceneFunctions/initGLEngine";
import { initGPUEngine } from "../sceneFunctions/initGPUEngine";
import { onSceneReady } from "../sceneFunctions/onSceneReady";
import setScene from "../sceneFunctions/setScene";
import { RuntimeMaterialControls } from "./RuntimeMaterialControls";

// window.CANNON = cannon;

let engine = { currentScene: null };
const loadedFontFaces = new Set();

const loadFontsWithSoftTimeout = async (fonts, timeoutMs = 1200) => {
  if (!fonts) {
    return;
  }

  const fontPromises = Object.entries(fonts).map(async ([, fontDef]) => {
    try {
      const fontPathParts = fontDef?.url?.split("/");
      const fileName = fontPathParts?.[6] || "";
      const fontName = fileName.split(".")[0];

      if (!fontName || loadedFontFaces.has(fontName)) {
        return;
      }

      const fontUrl = `${storageUrl + fontDef.url}`;
      const response = await fetch(fontUrl);
      const fontData = await response.blob();
      const fontBlobUrl = URL.createObjectURL(fontData);
      const fontFace = new FontFace(fontName, `url(${fontBlobUrl})`);

      await fontFace.load();
      document.fonts.add(fontFace);
      loadedFontFaces.add(fontName);

      const style = document.createElement("style");
      style.innerHTML = `
        @font-face {
          font-family: "${fontName}";
          src: url("${fontUrl}");
        }
      `;
      document.head.appendChild(style);
    } catch (error) {
      console.warn("Font load failed", error);
    }
  });

  await Promise.race([
    Promise.allSettled(fontPromises),
    new Promise((resolve) => {
      setTimeout(resolve, timeoutMs);
    }),
  ]);
};

const Scene = () => {
  const [EditorComponent, setEditorComponent] = useState(null); // Holds dynamically imported Editor

  const viewportSize = useViewportSize();

  const editorOverlay = useEditorOverlay();
  const updateCurrentScene = useUpdateCurrentScene();
  const updateData = useUpdateData();

  const [watermark, setWatermark] = useState(false);

  const [engineReady, setEngineReady] = useState(false);

  const loading = useCurrentSceneIsLoading();
  const setLoading = useUpdateCurrentSceneIsLoading();

  const loadingScreen = useLoadingScreen();
  const setLoadingScreen = useUpdateLoadingScreen();

  const [headTrackDetected, setHeadTrackDetected] = useState(false);
  const forceUpdate = useUpdateForceUpdate();
  const data = useData();

  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    const start = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const forceWebGPU = searchParams.get("forceWebGPU") === "true";
      const disableWebGPU = searchParams.get("disableWebGPU") === "true";
      const device = getDevice();
      const isHeadTracking = window.location.href.indexOf("vto=head") !== -1;

      if (window.location.href.indexOf("vto=head") !== -1) {
        var cu = document.createElement("script");
        cu.src = "https://cdn.badvisor.io/faceMeshFiles/camera_utils.js";
        cu.crossOrigin = "anonymous";
        document.head.appendChild(cu);

        var fm = document.createElement("script");
        fm.src = "https://cdn.badvisor.io/faceMeshFiles/face_mesh.js";
        fm.crossOrigin = "anonymous";
        document.head.appendChild(fm);
      }

      // Load fonts in the background to avoid delaying first frame.
      loadFontsWithSoftTimeout(data.fonts);

      if (!engine.currentScene) {
        const shouldTryWebGPU =
          !disableWebGPU && data.data.engine?.enableWebGPU && window.navigator.gpu && !isHeadTracking && (forceWebGPU || device !== "IOS");

        if (shouldTryWebGPU) {
          try {
            engine = await initGPUEngine();
            setEngineReady(true);
            return;
          } catch (error) {
            console.warn("WebGPU initialization failed, falling back to WebGL", error);
          }
        }

        if (!isHeadTracking && device === "IOS") {
          console.info("Using WebGL on iOS for Safari 26.x stability");
        }

        try {
          engine = initGLEngine();
          setEngineReady(true);
        } catch (error) {
          console.error("WebGL initialization failed", error);
        }
      }
    };

    if (window.location.search.includes("editmode=true") || window.location.pathname === "/sandbox") {
      // Here loads the editor

      import("../modules/editor/Editor").then((module) => setEditorComponent(() => module.default)).catch((err) => console.error("Failed to load Editor", err));
    }

    start();

    // const updateInterval = setInterval(() => {
    //   window.dispatchEvent(new Event("resize"));
    // }, 100);

    // return () => {
    //   clearInterval(updateInterval);
    // };
  }, []);

  useEffect(() => {
    if (window.organizationId && data && !loading && !loadingScreen) {
      try {
        const referrer = window.location !== window.parent.location ? document.referrer : document.location.href;
        const organizationId = window.organizationId;
        getOrganization(organizationId).then((organization) => {
          if (
            //  referrer.indexOf("http://localhost") !== -1 ||
            referrer.indexOf("https://badvisor-admin") !== -1 ||
            referrer.indexOf("https://admin.badvisor") !== -1 ||
            referrer.indexOf("https://badvisor-makerkit.vercel.app") !== -1
          ) {
            // do nothing
          } else {
            //add visit

            if (organization?.subscription) {
              addVisit(organizationId, data.id).then((visits) => {
                visits.json().then((data) => {
                  const currentVisits = Object.values(data.visits).reduce((sum, count) => sum + count, 0);

                  const maxVisits = organization?.subscription?.limits?.visits || 0;

                  if (currentVisits > maxVisits && maxVisits !== -1) {
                    setWatermark(true);
                  }
                });
              });
              // add visit
              // do something with sub
            } else {
              addVisit(organizationId, data.id);

              setWatermark(true);
            }
          }
        });
      } catch (error) {
        console.warn(error);
      }
    }
  }, [loading, loadingScreen]);

  const prevMainData = useRef();

  useEffect(() => {
    if (document.getElementById("loadingScreen")) {
      document.getElementById("loadingScreenProgress").innerHTML = "Setting up scene...";
    }

    setLoading(true);
    setLoadingScreen(true);
    if (engine.currentScene) {
      if (engine.currentScene.VRHelper && engine.currentScene.VRHelper.baseExperience) {
        const exitVR = async () => {
          await engine.currentScene.VRHelper.baseExperience.exitXRAsync();
          window.dispatchEvent(new Event("resize"));
        };
        exitVR();
      }
    }
    if (engineReady && prevMainData !== data) {
      // Dispose the previous Babylon scene BEFORE loading the new one so GPU
      // memory is freed first. Without this, both scenes occupy VRAM
      // simultaneously, which trips the aggressive VRAM cap on iOS 26.5+.
      if (engine.currentScene) {
        try {
          const prevScene = engine.currentScene;
          engine.currentScene = null;
          prevScene.dispose();
        } catch (_disposeErr) {
          console.warn("[DIAG][CAUSE_2] Previous scene dispose failed", _disposeErr);
        }
      }

      initScene(engine, data, (scene) => {
        if (isLocalhost) {
          console.log("Init Scene:", data);
        }

        scene.showQr = (data) => {
          setShowQr(data);
        };

        setScene(scene);

        scene.executeWhenReady(async () => {
          scene.mainData = data;

          scene.badId = data.handle;

          updateCurrentScene(scene);

          scene.forceUpdate = () => forceUpdate();
          scene.updateData = (data) => updateData(data);
          if (window.location.search.indexOf("vto=head") !== -1) {
            let wasDetected = false;
            initFaceMaskTracking(scene, (detected) => {
              if (detected && !wasDetected) {
                console.log("head track detected");
                wasDetected = true;
                setHeadTrackDetected(true);
              }

              if (!detected && wasDetected) {
                console.log("head track lost");
                wasDetected = false;
                setHeadTrackDetected(false);
              }
            });
            setTimeout(() => {
              onSceneReady(scene, engine, setLoading, setLoadingScreen);
            }, 2000);
          } else {
            onSceneReady(scene, engine, setLoading, setLoadingScreen);
          }

          engine.currentScene = scene;
        });
      });
      prevMainData.current = data;
    }
  }, [data, engineReady]);

  return (
    <>
      <ReactFlowProvider>
        <SplitWrapper>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <DropWrapper scene={engine.currentScene}>
              <div
                id="scene"
                style={{
                  position: "relative",
                }}
              >
                {engine.currentScene ? (
                  <div id="overAll" className={"overAll"}>
                    {window.location.search.indexOf("vr=true") !== -1 ? <VrButton scene={engine.currentScene} /> : null}
                    {window.location.search.indexOf("ar=true") !== -1 ? <ArButton scene={engine.currentScene} /> : null}

                    {engine.currentScene.overlays && !editorOverlay && window.location.search.indexOf("naked=true") === -1 ? (
                      <div id="overlays">
                        <AnimatePresence>
                          {Object.entries(engine.currentScene.overlays)
                            .reverse()
                            .map(([k, v]) => {
                              return v.overlayData && v.enabled ? (
                                <Overlay
                                  style={{
                                    height: viewportSize.height ? viewportSize.height + "px" : "100%",
                                    width: viewportSize.width ? viewportSize.width + "px" : "100%",
                                    margin: "0 auto",
                                  }}
                                  key={k}
                                  {...v}
                                />
                              ) : null;
                            })}
                        </AnimatePresence>
                      </div>
                    ) : null}

                    {!editorOverlay &&
                    window.location.search.indexOf("editmode=true") === -1 &&
                    window.location.pathname !== "/sandbox" &&
                    window.location.search.indexOf("naked=true") === -1 ? (
                      <RuntimeMaterialControls scene={engine.currentScene} />
                    ) : null}
                  </div>
                ) : null}
                <div id="arQrContainer" style={{ display: showQr ? "flex" : "none" }}>
                  <div id="arQrInner">
                    <button onClick={() => engine.currentScene.showQr(false)}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                    <canvas id="arQrCode"></canvas>
                    <div id="arQrText"></div>
                    {showQr.glb || showQr.usdz ? (
                      <div id="arQrIcons">
                        {showQr.usdz ? <AiFillApple /> : null}
                        {showQr.glb ? (
                          <>
                            <AiFillAndroid />
                            <AiFillWindows />
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div id="renderCanvasContainer">
                  {/* <div id="cursorTooltip" className="MuiTooltip-popper" /> */}
                  <canvas
                    style={{
                      height: viewportSize.height ? viewportSize.height + "px" : "100%",
                      width: viewportSize.width ? viewportSize.width + "px" : "100%",
                      margin: "0 auto",
                    }}
                    tabIndex={0}
                    className="renderCanvas"
                    id="renderCanvas"
                  />
                </div>

                {!headTrackDetected && window.location.href.indexOf("vto=head") !== -1 && !loadingScreen ? (
                  <div
                    style={{
                      position: "fixed",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: "99999",
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: "100%",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      textAlign: "center",
                    }}
                  >
                    <div>
                      <img style={{ height: "40vh" }} src="/assets/headPlaceholder.svg" />
                      <br />
                      Looking for you...
                    </div>
                  </div>
                ) : null}

                <div
                  id="curtain"
                  style={{
                    position: "fixed",

                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: "99999",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                    backgroundColor: "rgba(255,255,255,0.8)",
                    display: "none",
                    flexDirection: "column",
                  }}
                >
                  {/* <div
                    className="beh"
                    style={{
                      width: "160px",
                    }}
                  >
                    <img alt="loading" id="loadingLogo" src={"/assets/logotext.png"} />
          
                  </div> */}
                  <div id="curtainProgress" style={{ position: "relative" }}></div>
                  <div style={{ position: "fixed", top: 0, left: 0, height: "2px", backgroundColor: "#111111", width: "0%" }} id="curtainProgressBar"></div>
                </div>
              </div>
            </DropWrapper>
          </div>
          {window.location.search.indexOf("editmode=true") !== -1 || window.location.pathname === "/sandbox" ? (
            <div style={{ height: "100%", zIndex: 1 }}>{engine.currentScene && !loading && EditorComponent ? <EditorComponent /> : null}</div>
          ) : null}

          {watermark ? (
            <a className="watermark" rel="noreferrer" href="https://badvisor.io/" target="_blank">
              <svg id="type" width="101" height="18" viewBox="0 0 101 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.320312" y="0.425781" width="100.414" height="17.5664" fill="white" />
                <path
                  d="M14.429 9.90906C14.688 10.2845 14.8215 10.7323 14.8104 11.1883C14.8104 12.3408 14.3356 13.2075 13.386 13.7883C12.4363 14.3692 11.2143 14.66 9.71993 14.6607H3.42969L5.60903 3.76172H11.3818C12.6588 3.76172 13.6292 3.98761 14.293 4.43938C14.9568 4.89115 15.2891 5.53193 15.2899 6.36172C15.301 6.94149 15.1203 7.5087 14.7759 7.97519C14.405 8.45887 13.91 8.83288 13.3433 9.05737C13.7761 9.2369 14.1516 9.53143 14.429 9.90906ZM10.8252 11.8337C10.939 11.7481 11.0301 11.6359 11.0904 11.5069C11.1507 11.3779 11.1783 11.236 11.1709 11.0938C11.1755 10.9912 11.1544 10.8891 11.1095 10.7967C11.0647 10.7043 10.9974 10.6246 10.9139 10.5648C10.7241 10.4346 10.4974 10.3692 10.2674 10.3781H7.89786L7.55212 12.0907H9.92162C10.2428 12.1063 10.5603 12.016 10.8252 11.8337ZM8.70806 6.3306L8.38536 7.94984H10.2489C11.0587 7.94984 11.4636 7.63329 11.4636 7.00019C11.4685 6.9028 11.4481 6.80582 11.4045 6.71861C11.3609 6.6314 11.2955 6.5569 11.2147 6.50232C10.9986 6.37511 10.7494 6.31532 10.499 6.3306H8.70806Z"
                  fill="black"
                />
                <path
                  d="M23.4043 12.7603H19.2473L18.157 14.6596H14.2812L21.225 3.76172H24.8368L27.4207 14.6596H23.7627L23.4043 12.7603ZM22.8903 10.1096L22.3613 7.3275L20.757 10.1142L22.8903 10.1096Z"
                  fill="black"
                />
                <path
                  d="M30.1911 3.76172H35.111C36.2527 3.76172 37.2412 3.94842 38.0763 4.32183C38.8619 4.6538 39.531 5.2118 39.9987 5.92493C40.4451 6.62026 40.6683 7.44006 40.6683 8.38432C40.6683 9.64053 40.3779 10.7435 39.797 11.6931C39.2163 12.6395 38.3764 13.3994 37.3768 13.8828C36.3442 14.3968 35.1686 14.6538 33.8502 14.6538H28.0117L30.1911 3.76172ZM33.9689 11.7957C34.9132 11.7957 35.6477 11.4972 36.1724 10.9002C36.6972 10.3032 36.9615 9.53757 36.9654 8.6033C36.9654 7.9702 36.7706 7.48232 36.381 7.13964C35.9915 6.79697 35.4283 6.62564 34.6915 6.62564H33.2889L32.2609 11.7945L33.9689 11.7957Z"
                  fill="black"
                />
                <path d="M54.3087 3.76172L47.5206 14.6596H43.9087L41.4805 3.76172H45.2479L46.6021 10.1142L50.5413 3.76172H54.3087Z" fill="black" />
                <path d="M54.6676 3.76172H58.3417L56.1624 14.6596H52.4883L54.6676 3.76172Z" fill="black" />
                <path
                  d="M59.6017 14.6046C58.8792 14.4436 58.186 14.1715 57.5469 13.7979L58.9633 11.0884C60.076 11.7468 61.3444 12.0961 62.6374 12.1003C63.1045 12.1003 63.4626 12.043 63.7115 11.9285C63.9604 11.8141 64.0849 11.6585 64.0849 11.4618C64.0849 11.2751 63.9577 11.1245 63.7034 11.01C63.3122 10.8526 62.9086 10.7277 62.4968 10.6366C61.8833 10.4859 61.2801 10.2961 60.6908 10.0684C60.2115 9.8752 59.7834 9.57341 59.4404 9.18679C59.0824 8.78726 58.9033 8.26058 58.9033 7.60673C58.8881 6.83579 59.1199 6.0802 59.5649 5.45044C60.0059 4.83578 60.6417 4.35827 61.4722 4.01791C62.3028 3.67754 63.2835 3.50889 64.4145 3.51197C65.1764 3.50663 65.9365 3.58744 66.6803 3.75284C67.3169 3.8887 67.9288 4.12193 68.4943 4.44432L67.1678 7.12384C66.7322 6.84972 66.2567 6.64484 65.7583 6.51649C65.2425 6.38127 64.7115 6.31309 64.1783 6.31365C63.6696 6.31365 63.2751 6.38626 62.9947 6.53147C62.7142 6.67668 62.574 6.84802 62.574 7.04548C62.574 7.24293 62.7012 7.39852 62.9555 7.51223C63.3617 7.6731 63.7813 7.79805 64.2094 7.88564C64.8149 8.02153 65.4106 8.19826 65.9923 8.41462C66.4736 8.60105 66.9032 8.90023 67.245 9.28705C67.5977 9.6812 67.774 10.2002 67.774 10.8441C67.7881 11.6089 67.5531 12.3577 67.1044 12.9773C66.658 13.592 66.0195 14.0668 65.189 14.4018C64.3584 14.7368 63.3827 14.9054 62.2617 14.9077C61.3661 14.9132 60.4731 14.8115 59.6017 14.6046Z"
                  fill="black"
                />
                <path
                  d="M71.3786 14.287C70.5823 13.9121 69.9117 13.3145 69.4482 12.5663C68.9891 11.8014 68.7543 10.9228 68.7705 10.0309C68.7499 8.84318 69.0539 7.67241 69.6499 6.64487C70.2305 5.65927 71.0779 4.85785 72.0943 4.33299C73.1377 3.78287 74.3182 3.50781 75.6359 3.50781C76.7461 3.50781 77.7192 3.71295 78.5551 4.12324C79.3513 4.49824 80.0218 5.09588 80.4855 5.84389C80.9445 6.60884 81.1793 7.48739 81.1632 8.37935C81.1838 9.56703 80.8798 10.7378 80.2838 11.7653C79.7033 12.751 78.8559 13.5525 77.8394 14.0772C76.796 14.6273 75.6155 14.9024 74.2978 14.9024C73.1868 14.9055 72.2137 14.7003 71.3786 14.287ZM76.1268 11.4772C76.5619 11.171 76.9041 10.7507 77.1156 10.2625C77.3483 9.7384 77.4662 9.17059 77.4614 8.59717C77.4614 7.95409 77.272 7.44047 76.8932 7.0563C76.5144 6.67214 75.9927 6.48006 75.3281 6.48006C74.7874 6.468 74.2565 6.62602 73.8103 6.93184C73.3752 7.23806 73.0331 7.65839 72.8215 8.14655C72.5886 8.671 72.4707 9.23924 72.4757 9.81304C72.4757 10.4569 72.6651 10.9705 73.0439 11.3539C73.4227 11.7373 73.9444 11.9294 74.609 11.9302C75.1494 11.9433 75.6803 11.7865 76.1268 11.4818V11.4772Z"
                  fill="black"
                />
                <path
                  d="M92.1959 9.87103C91.6819 10.5925 90.9581 11.1303 90.0246 11.4845L91.8467 14.6607H88.032L86.49 11.919H85.5876L85.0425 14.6596H81.3672L83.5465 3.76172H88.4354C89.8675 3.76172 90.9816 4.07558 91.7776 4.7033C92.5735 5.33102 92.9704 6.21074 92.9681 7.34248C92.9862 8.24601 92.7157 9.13177 92.1959 9.87103ZM87.8752 6.59452H86.6398L86.1316 9.14727H87.6413C88.1499 9.14727 88.5445 9.02011 88.8249 8.7658C89.1053 8.51148 89.2456 8.15613 89.2456 7.69975C89.2456 6.96293 88.7888 6.59452 87.8752 6.59452Z"
                  fill="black"
                />
              </svg>

              <svg id="cat" width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9.31419 0.425801C8.74382 0.425801 9.18774 5.4919 9.18774 5.4919C8.17479 5.19057 4.83461 5.63449 4.83461 5.63449C4.17007 3.78885 2.47509 0.615477 1.82669 0.853581C1.1783 1.09168 2.91901 10.0683 0.734375 17.5343C6.52824 16.5684 15.743 17.424 15.743 17.424C14.6507 10.4638 10.0689 0.409658 9.31419 0.425801ZM5.3014 10.8096C5.11966 10.8146 4.94053 10.7655 4.78667 10.6687C4.63281 10.5718 4.51114 10.4315 4.43706 10.2655C4.36299 10.0994 4.33984 9.91515 4.37054 9.73596C4.40124 9.55676 4.48442 9.39071 4.60954 9.2588C4.73466 9.1269 4.8961 9.03508 5.07342 8.99497C5.25075 8.95486 5.43599 8.96826 5.6057 9.03347C5.7754 9.09868 5.92195 9.21278 6.02678 9.36131C6.13162 9.50985 6.19003 9.68615 6.19463 9.8679C6.20077 10.1111 6.11018 10.3469 5.94272 10.5234C5.77527 10.7 5.54463 10.8029 5.3014 10.8096ZM9.21195 10.7154C9.03021 10.7204 8.85108 10.6714 8.69722 10.5745C8.54336 10.4776 8.42169 10.3373 8.34762 10.1713C8.27354 10.0053 8.25039 9.82099 8.28109 9.64179C8.3118 9.4626 8.39497 9.29654 8.52009 9.16464C8.64521 9.03273 8.80665 8.94092 8.98398 8.9008C9.1613 8.86069 9.34654 8.87409 9.51625 8.9393C9.68596 9.00452 9.8325 9.11861 9.93734 9.26715C10.0422 9.41569 10.1006 9.59198 10.1052 9.77373C10.111 10.0167 10.0202 10.2522 9.85279 10.4284C9.68538 10.6046 9.45494 10.7073 9.21195 10.714V10.7154Z"
                  fill="black"
                />
              </svg>
            </a>
          ) : null}
        </SplitWrapper>
      </ReactFlowProvider>
    </>
  );
};

export default Scene;
