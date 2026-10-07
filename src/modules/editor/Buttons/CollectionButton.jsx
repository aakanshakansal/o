import { Tooltip } from "@mui/material";
import React from "react";
import { useCurrentScene, useOpenNodes } from "../../../badProvider/functions";
import { getSceneElementByName, getSceneElementPropsByName } from "../../../helpers";
import Marqueeno from "../Marqueeno";

export function CollectionButton(props) {
  const scene = useCurrentScene();
  const openNodes = useOpenNodes();
  const node = props.node;

  const onClick = (e) => {
    scene.openNode("Collection", node);
  };
  return (
    <div
      className="nodeButton"
      key={node.name}
      style={{ ...props.style, color: Object.keys(openNodes).filter((k) => k === node.name).length === 0 ? "" : "#bada55" }}
    >
      <button id={node.name + "CollectionButton"} style={{ width: "100%" }} onClick={onClick}>
        <Marqueeno text={node.displayName || node.name} />
      </button>
      <Tooltip enterNextDelay={200} title="Open Nodes" arrow placement="left">
        <button
          style={{ paddingRight: "1em", paddingLeft: "0.5em", width: "auto" }}
          onClick={async () => {
            const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
            for (const [i, nodeName] of node.nodes.entries()) {
              await delay(100);
              if (getSceneElementByName(scene, nodeName) && getSceneElementPropsByName(scene, nodeName)) {
                const elem = getSceneElementByName(scene, nodeName);

                const elemClass = elem.getClassName();

                if (
                  (elemClass === "PBRMaterial" || elemClass === "ShadowOnlyMaterial" || elemClass === "TransmissionMaterial", elemClass === "DiamondMaterial")
                ) {
                  scene.openNode("Material", elem);
                }

                if (elemClass === "TransformNode" || elemClass === "Mesh") {
                  scene.openNode("Mesh", elem);
                }

                if (elemClass === "ArcRotateCamera" || elemClass === "UniversalCamera") {
                  scene.openNode("Camera", elem);
                }

                if (elemClass === "Texture" || elemClass === "CubeTexture" || elemClass === "VideoTexture") {
                  scene.openNode("Texture", elem);
                }

                if (elemClass === "Sound") {
                  scene.openNode("Sound", elem);
                }

                if (elemClass === "PointLight" || elemClass === "DirectionalLight" || elemClass === "SpotLight") {
                  scene.openNode("Light", elem);
                }

                if (elemClass === "AnimationGroup") {
                  scene.openNode("AnimationGroup", elem);
                }

                if (elemClass === "Variable") {
                  scene.openNode("Variable", elem);
                }

                if (elemClass === "Action") {
                  scene.openNode("Action", elem);
                }

                if (elemClass === "ControlNode") {
                  scene.openNode("ControlNode", elem);
                }
              }
            }
          }}
        >
          <span className="material-symbols-outlined">open_in_new</span>
        </button>
      </Tooltip>
    </div>
  );
}
