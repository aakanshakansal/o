import React from "react";

import { Color3 } from "@babylonjs/core";
import { useTheme } from "@mui/material";
import { useCurrentScene, useHighlightedMeshButton, useOpenNodes } from "../../../badProvider/functions";
import Marqueeno from "../Marqueeno";

export function MeshButton(props) {
  const theme = useTheme();
  const scene = useCurrentScene();
  const openNodes = useOpenNodes();
  const highlightedMeshButton = useHighlightedMeshButton();
  const node = props.node;

  const onMouseOver = () => {
    if (node.getClassName() === "Mesh" || node.getClassName() === "3DText") {
      scene.highlightLayer.addMesh(node, Color3.FromHexString("#ff0000").toLinearSpace());
    }
  };
  const onMouseOut = () => {
    scene.highlightLayer.removeAllMeshes();
  };

  const onClick = (e) => {
    scene.openNode("Mesh", node);
  };
  return (
    <div
      style={{
        ...props.style,
        color: Object.keys(openNodes).filter((k) => k === node.name).length === 0 ? "" : theme.palette.green.main,
        backgroundColor: highlightedMeshButton === node.name ? "#bbda5590" : "",
      }}
      className={"nodeButton"}
      key={node.name}
    >
      <button id={node.name + "MeshButton"} onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
        {node.isAsset ? (
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", flexShrink: 0, color: theme.palette.turquoise.main }}>
            folder
          </span>
        ) : node.cloneOf ? (
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", flexShrink: 0, color: theme.palette.turquoise.main }}>
            content_copy
          </span>
        ) : node.getClassName() === "Mesh" ? (
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", flexShrink: 0, color: theme.palette.turquoise.main }}>
            switch_access
          </span>
        ) : node.getClassName() === "TransformNode" ? (
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", flexShrink: 0, color: theme.palette.turquoise.main }}>
            account_tree
          </span>
        ) : node.getClassName() === "PhotoDome" ? (
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", flexShrink: 0, color: theme.palette.turquoise.main }}>
            public
          </span>
        ) : node.getClassName() === "GSplat" ? (
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", flexShrink: 0, color: theme.palette.turquoise.main }}>
            lens_blur
          </span>
        ) : node.getClassName() === "3DText" ? (
          <span style={{ marginRight: "0.5em", flexShrink: 0, color: theme.palette.turquoise.main }}>Aa</span>
        ) : node.getClassName() === "InstancedMesh" ? (
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", flexShrink: 0, color: theme.palette.turquoise.main }}>
            copy_all
          </span>
        ) : null}

        <Marqueeno text={node.displayName || node.name} />
      </button>
    </div>
  );
}
