import React, { useEffect, useState } from "react";

import { Button, useTheme } from "@mui/material";

import { Handle, Position } from "reactflow";
import { useCurrentScene } from "../../../../badProvider/functions";
import { actionsDispatcher } from "../../../../sceneFunctions/actionDispatcher";
import { ActionButton } from "../../Buttons/ActionButton";
import { NumberInput } from "../../Components/NumberInput";

const makeNumArr = (num) => new Array(num).fill("").map((_, i) => i + 1);
const MeshTriggers = (props) => {
  const theme = useTheme();
  const scene = useCurrentScene();
  const node = props.node;
  const [step, setStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(node.totalSteps + 1);
  const [currentStep, setCurrentStep] = useState(scene[node.name + "Step"] || 0);
  const [update, setUpdate] = useState(false);
  useEffect(() => {
    function stepChecker() {
      setCurrentStep(scene[node.name + "Step"] || 0);
    }
    scene.registerAfterRender(stepChecker);

    return () => {
      scene.unregisterAfterRender(stepChecker);
    };
  }, []);

  const onConnect = (e) => {
    if (!node.steps[step]) {
      node.steps[step] = [];
    }

    if (scene.actions.hasOwnProperty(e.target) && !node.steps[step].includes(e.targetHandle)) {
      node.steps[step].push(e.targetHandle);
      return setUpdate(!update);
    }

    return console.log("Invalid Connection");
  };

  const onInputTotalSteps = (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value === 0) return;
    node.totalSteps = value - 1;
    setTotalSteps(value);
  };

  return (
    <div style={{ width: "360px" }}>
      <div className="field" style={{ marginTop: "0.5em" }}>
        <NumberInput disableDrag={true} value={totalSteps} label="Sequence Length" onBlur={onInputTotalSteps} />
      </div>
      <div className="steps field" style={{ backgroundColor: theme.palette.background.light }}>
        <div
          key={0}
          onClick={() => {
            setStep(0);
            scene.forceUpdate();
          }}
          style={{
            background: currentStep === 0 ? theme.palette.green.main : "",
            border:
              currentStep === 0
                ? "solid 1px " + theme.palette.green.main
                : step === 0
                ? "solid 3px " + theme.palette.green.main
                : "solid 1px " + theme.palette.text.primary,
          }}
          className={"step"}
        >
          {node.steps[0].length ? "." : null}
        </div>

        {makeNumArr(node.totalSteps).map((s, i) => {
          return (
            <div
              key={s}
              onClick={() => {
                setStep(s);
                scene.forceUpdate();
              }}
              style={{
                background: currentStep === s ? theme.palette.green.main : "",
                border:
                  currentStep === s
                    ? "solid 1px " + theme.palette.green.main
                    : step === s
                    ? "solid 3px " + theme.palette.green.main
                    : "solid 1px " + theme.palette.text.primary,
              }}
              className={"step"}
            >
              {node.steps[s] && node.steps[s].length ? <span className="material-symbols-outlined">arrow_right</span> : null}
            </div>
          );
        })}
      </div>
      <div className="referenceHandle">
        {node.steps[step] ? (
          <div className="references" style={{ width: "100%", padding: "0.5em" }}>
            {node.steps[step]
              ? node.steps[step].map((a, i) => {
                  if (scene.actions.hasOwnProperty(a)) {
                    return <ActionButton key={i} node={scene.actions[a]} />;
                  }
                  return null;
                })
              : null}
          </div>
        ) : null}
        <div className="handles">
          <Button
            // style={{ background: theme.palette.default.main, color: theme.palette.light.main }}
            onClick={() => {
              if (node.steps[step]) {
                node.steps[step].map((a, i) => {
                  if (scene.actions.hasOwnProperty(a)) {
                    return actionsDispatcher(scene, scene.actions[a]);
                  }
                  return null;
                });
              }
            }}
            className="FunctionButton meshTriggerButton"
          >
            Step {step + 1}
          </Button>

          <Handle
            className={"sourceHandle triggerHandle multiple red " + (node.steps[step] && node.steps[step].length ? "connected" : "")}
            type="source"
            onConnect={onConnect}
            id={"step" + step}
            position={Position.Right}
          />
        </div>
      </div>
    </div>
  );
};

export default MeshTriggers;
