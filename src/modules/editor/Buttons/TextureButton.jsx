import React from "react";
import { useCurrentScene, useOpenNodes } from "../../../badProvider/functions";
import Marqueeno from "../Marqueeno";

export function TextureButton(props) {
  const scene = useCurrentScene();
  const openNodes = useOpenNodes();
  const node = props.node;

  const onClick = (e) => {
    scene.openNode("Texture", node);
  };
  return (
    <div
      className={"nodeButton"}
      key={node.name}
      style={{ ...props.style, color: Object.keys(openNodes).filter((k) => k === node.name).length === 0 ? "" : "#bada55" }}
    >
      <button id={node.name + "TextureButton"} onClick={onClick}>
        <Marqueeno text={node.displayName || node.name} />
      </button>
    </div>
  );
}
