import { WebGPUEngine } from "@babylonjs/core";
import { reportRuntimeDiagnostic } from "../helpers";
import badLoadingScreen from "./badLoadingScreen";

export const initGPUEngine = async () => {
  const canvas = document.getElementById("renderCanvas");
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  canvas.addEventListener("wheel", (evt) => evt.preventDefault());

  const engine = new WebGPUEngine(canvas);

  const initTimeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("WebGPU init timeout")), 8000);
  });

  try {
    await Promise.race([engine.initAsync(), initTimeout]);
  } catch (error) {
    reportRuntimeDiagnostic("WebGPU initialization failure", error?.message || String(error));
    throw error;
  }

  if (isIOS) {
    engine.setHardwareScalingLevel(2);
  }

  engine.loadingScreen = badLoadingScreen();
  engine.displayLoadingUI();

  window.addEventListener("resize", function () {
    engine.resize();
  });
  engine.runRenderLoop(() => {
    if (engine.currentScene && engine.currentScene.activeCamera && !engine.paused) {
      engine.currentScene.render();
    }
  });
  return engine;
};
