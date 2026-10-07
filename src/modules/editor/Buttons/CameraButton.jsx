import { useTheme } from "@mui/material";
import React from "react";
import { useCurrentScene, useOpenNodes } from "../../../badProvider/functions";
import Marqueeno from "../Marqueeno";

export function CameraButton(props) {
  const theme = useTheme();
  const scene = useCurrentScene();
  const openNodes = useOpenNodes();
  const node = props.node;

  const onClick = (e) => {
    scene.openNode("Camera", node);
  };
  return (
    <div
      className={"nodeButton"}
      key={node.name}
      style={{ ...props.style, color: Object.keys(openNodes).filter((k) => k === node.name).length === 0 ? "" : "#bada55" }}
    >
      <button id={node.name + "CameraButton"} onClick={onClick}>
        {/* {scene.activeCamera.name === node.name ? (
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em",flexShrink:0, }}>
            visibility
          </span>
        ) : null} */}
        {node.isDefault ? (
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", flexShrink: 0, color: theme.palette.violet.main }}>
            videocam
          </span>
        ) : (
          <span
            className="material-symbols-outlined"
            style={{ marginRight: "0.5em", flexShrink: 0, color: theme.palette.violet.main, opacity: "0.5", zIndex: 0 }}
          >
            videocam
          </span>
        )}
        <Marqueeno text={node.displayName || node.name} />
      </button>
    </div>
  );
}
