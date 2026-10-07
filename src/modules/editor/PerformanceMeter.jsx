import { EngineInstrumentation, SceneInstrumentation } from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useCurrentScene } from "../../badProvider/functions";
const PerformanceMeter = (props) => {
  const monitor = useRef(null);
  const scene = useCurrentScene();
  const fpsCounter = useRef();

  const dcCounter = useRef();

  useEffect(() => {
    var engineInstrumentation = new EngineInstrumentation(scene.getEngine());
    var sceneInstrumentation = new SceneInstrumentation(scene);
    sceneInstrumentation.captureActiveMeshesEvaluationTime = true;
    engineInstrumentation.captureGPUFrameTime = true;
    engineInstrumentation.captureShaderCompilationTime = true;

    var startTime = performance.now();

    const getInstruData = () => {
      const currentFps = scene.getEngine().getFps().toFixed();

      var t = performance.now();
      var dt = t - startTime;

      // if elapsed time is greater than 1s
      if (dt > 1000) {
        if (fpsCounter.current) {
          fpsCounter.current.innerHTML = currentFps;
          fpsCounter.current.style.color = "#bada55";
          if (currentFps < 60) {
            fpsCounter.current.style.color = "yellow";
          }
          if (currentFps < 30) {
            fpsCounter.current.style.color = "red";
          }
        }

        if (dcCounter.current) {
          dcCounter.current.innerHTML = sceneInstrumentation.drawCallsCounter.current;

          dcCounter.current.style.color = "#bada55";
          if (sceneInstrumentation.drawCallsCounter.current > 21) {
            dcCounter.current.style.color = "yellow";
          }
          if (sceneInstrumentation.drawCallsCounter.current > 50) {
            dcCounter.current.style.color = "red";
          }
        }

        startTime = t;
      }
    };

    scene.registerAfterRender(getInstruData);
  }, [scene]);

  return (
    <div ref={monitor} id="performanceMeter">
      <div style={{ color: "#bada55" }}>{scene.getEngine().isWebGPU ? "WebGPU" : "WebGL" + scene.getEngine().webGLVersion}</div>
      <div>
        Fps: <span className="stats" ref={fpsCounter}></span>
      </div>
      <div>
        Draw Calls: <span ref={dcCounter} className="stats"></span>
      </div>
    </div>
  );
};

export default PerformanceMeter;
