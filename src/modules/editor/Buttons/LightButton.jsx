import React from "react";
import { useCurrentScene, useOpenNodes } from "../../../badProvider/functions";
import Marqueeno from "../Marqueeno";

export function LightButton(props) {
  const scene = useCurrentScene();
  const openNodes = useOpenNodes();
  const node = props.node;

  const onClick = (e) => {
    scene.openNode("Light", node);
  };
  return (
    <div
      className={"nodeButton"}
      key={node.name}
      style={{ ...props.style, color: Object.keys(openNodes).filter((k) => k === node.name).length === 0 ? "" : "#bada55" }}
    >
      <button id={node.name + "LightButton"} onClick={onClick}>
        <div
          style={{
            flexShrink: 0,
            height: "1.2em",
            width: "1.2em",
            marginRight: "0.5em",
            backgroundColor: node.diffuse.toHexString() || "unset",
            borderRadius: "50%",
          }}
        ></div>

        <Marqueeno text={node.displayName || node.name} />
      </button>
    </div>
  );
}
