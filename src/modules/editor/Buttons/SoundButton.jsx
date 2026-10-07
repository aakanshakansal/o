import React from "react";
import { useCurrentScene, useOpenNodes } from "../../../badProvider/functions";
import Marqueeno from "../Marqueeno";

export function SoundButton(props) {
  const scene = useCurrentScene();
  const openNodes = useOpenNodes();
  const node = props.node;

  return (
    <div
      className={"nodeButton"}
      key={node.name}
      style={{ ...props.style, color: Object.keys(openNodes).filter((k) => k === node.name).length === 0 ? "" : "#bada55" }}
    >
      <button
        id={node.name + "SoundButton"}
        onClick={(e) => {
          scene.openNode("Sound", node);
        }}
      >
        <Marqueeno text={node.displayName || node.name} />
      </button>
    </div>
  );
}
