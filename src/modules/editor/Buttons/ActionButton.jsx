import useTheme from "@mui/material/styles/useTheme";
import React, { useEffect, useState } from "react";
import { useCurrentScene, useOpenNodes } from "../../../badProvider/functions";
import { actionsDispatcher } from "../../../sceneFunctions/actionDispatcher";
import Marqueeno from "../Marqueeno";

export const ActionButton = (props) => {
  const theme = useTheme();

  const openNodes = useOpenNodes();

  const scene = useCurrentScene();
  const node = props.node;
  const [isTriggered, setIsTriggered] = useState(true);
  const onClick = (e) => {
    scene.openNode("Action", node);
  };

  useEffect(() => {
    var triggerCheck = false;

    if (
      scene.onLoadTrigger?.includes(node.name) ||
      scene.onBeforeFrameTrigger?.includes(node.name) ||
      scene.onAfterFrameTrigger?.includes(node.name) ||
      scene.onPointerPickTrigger?.includes(node.name) ||
      scene.onPointerDoubleTapTrigger?.includes(node.name) ||
      scene.onPointerDownTrigger?.includes(node.name) ||
      scene.onPointerMoveTrigger?.includes(node.name) ||
      scene.onPointerUpTrigger?.includes(node.name)
    ) {
      triggerCheck = true;
    }

    scene.meshes.forEach((m) => {
      if (
        m.onPickTrigger?.includes(node.name) ||
        m.onDoublePickTrigger?.includes(node.name) ||
        m.onPointerOverTrigger?.includes(node.name) ||
        m.onPointerOutTrigger?.includes(node.name) ||
        m.onDragStartTrigger?.includes(node.name) ||
        m.onDragTrigger?.includes(node.name) ||
        m.onDragEndTrigger?.includes(node.name)
      ) {
        triggerCheck = true;
      }
    });

    Object.values(scene.actions).forEach((a) => {
      if (a.type === "Sequencer") {
        return Object.values(a.steps).forEach((s) => {
          if (s.includes(node.name)) {
            triggerCheck = true;
          }
        });
      } else if (a.type === "Timeline") {
        return a.actions.forEach((s) => {
          if (s.name === node.name) {
            triggerCheck = true;
          }
        });
      } else if (a.type === "Condition") {
        if (a.trueActions && a.trueActions.includes(node.name)) {
          triggerCheck = true;
        } else if (a.falseActions && a.falseActions.includes(node.name)) {
          triggerCheck = true;
        }
      }
    });

    Object.values(scene.overlays).forEach((o) => {
      if (o.overlayData?.json && o.overlayData?.json.includes(node.name)) {
        triggerCheck = true;
      }
    });

    setIsTriggered(triggerCheck);
  });

  return (
    <div
      className="nodeButton"
      key={node.name}
      style={{ ...props.style, color: Object.keys(openNodes).filter((k) => k === node.name).length === 0 ? "" : "#bada55" }}
    >
      <button style={{ width: "1.6em", color: theme.palette.red.main, flexShrink: 0 }} onClick={() => actionsDispatcher(scene, node, {})}>
        <span className="material-symbols-outlined">play_arrow</span>
      </button>

      <button id={node.name + "ActionButton"} onClick={onClick}>
        <Marqueeno text={node.displayName || node.name} />
      </button>
      {!isTriggered ? (
        <span style={{ color: "rgb(244, 67, 54)", paddingRight: "0.9em", paddingLeft: "0.5em", flexShrink: 0 }} className="material-symbols-outlined">
          link_off
        </span>
      ) : null}
    </div>
  );
};
