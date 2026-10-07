import { Engine } from "@babylonjs/core";
import { reportRuntimeDiagnostic } from "../helpers";
import badLoadingScreen from "./badLoadingScreen";

const preventWheelDefault = (evt) => {
  evt.preventDefault();
};

const attachWebGLDiagnostics = (canvas) => {
  if (!canvas || canvas.__badvisorDiagnosticsAttached) {
    return;
  }

  canvas.__badvisorDiagnosticsAttached = true;

  const originalGetContext = canvas.getContext.bind(canvas);

  canvas.getContext = (type, ...args) => {
    const context = originalGetContext(type, ...args);
    const isWebGLContext = type === "webgl" || type === "experimental-webgl" || type === "webgl2";

    if (!isWebGLContext || !context || context.__badvisorCompileDiagnosticsAttached) {
      return context;
    }

    context.__badvisorCompileDiagnosticsAttached = true;

    const originalGetShaderParameter = context.getShaderParameter.bind(context);
    context.getShaderParameter = (shader, pname) => {
      const result = originalGetShaderParameter(shader, pname);

      if (pname === context.COMPILE_STATUS && result === false) {
        const infoLog = context.getShaderInfoLog(shader) || "";
        reportRuntimeDiagnostic("WEBGL_compile_status: false", {
          contextType: type,
          infoLog,
        });

        if (/nan|infinity|inf\b/i.test(infoLog)) {
          reportRuntimeDiagnostic("Shader compile log contains NaN/Infinity", infoLog);
        }
      }

      return result;
    };

    return context;
  };

  canvas.addEventListener(
    "webglcontextlost",
    (event) => {
      reportRuntimeDiagnostic("WebGL context lost", event?.statusMessage || "");
    },
    false,
  );

  const runtimeErrorListener = (event) => {
    const message = event?.message || event?.reason?.message || event?.reason || "";
    if (!message) {
      return;
    }

    const normalized = String(message).toLowerCase();
    if (normalized.includes("mreexceptionadvisorylimitactive") || normalized.includes("gpu process") || normalized.includes("context lost")) {
      reportRuntimeDiagnostic("GPU runtime error", String(message));
    }
  };

  if (!window.__badvisorRuntimeDiagnosticsAttached) {
    window.__badvisorRuntimeDiagnosticsAttached = true;
    window.addEventListener("error", runtimeErrorListener);
    window.addEventListener("unhandledrejection", runtimeErrorListener);
  }
};

export const initGLEngine = () => {
  const canvas = document.getElementById("renderCanvas");
  attachWebGLDiagnostics(canvas);
  if (canvas && !canvas.__badvisorWheelPreventAttached) {
    canvas.addEventListener("wheel", preventWheelDefault, { passive: false });
    canvas.__badvisorWheelPreventAttached = true;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const lowMemoryMode = isIOS && window.location.search.indexOf("editmode=true") === -1;

  const engine = new Engine(canvas, true, {
    stencil: true,
    antialias: !lowMemoryMode,
    powerPreference: lowMemoryMode ? "low-power" : "high-performance",
    preserveDrawingBuffer: window.location.search.indexOf("editmode=true") !== -1 || window.location.pathname === "/sandbox" ? true : false,
  });

  engine.enableOfflineSupport = false;

  if (lowMemoryMode) {
    engine.setHardwareScalingLevel(2);
  }

  engine.loadingScreen = badLoadingScreen();
  engine.displayLoadingUI();

  engine.runRenderLoop(() => {
    if (engine.currentScene && engine.currentScene.activeCamera && !engine.paused) {
      engine.currentScene.render();
    }
  });

  window.__badvisorCurrentEngine = engine;
  if (!window.__badvisorResizeHandlerAttached) {
    window.__badvisorResizeHandlerAttached = true;
    window.addEventListener("resize", () => {
      window.__badvisorCurrentEngine?.resize();
    });
  }

  return engine;
};
