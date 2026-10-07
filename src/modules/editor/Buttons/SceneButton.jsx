import React from "react";
import { useCurrentScene, useOpenNodes } from "../../../badProvider/functions";

export function SceneButton(props) {
  const scene = useCurrentScene();
  const openNodes = useOpenNodes();
  const node = props.node;
  const onClick = (e) => {
    scene.openNode("Scene", node);
  };
  return (
    <div
      className={"nodeButton"}
      key="scene"
      style={{ ...props.style, color: Object.keys(openNodes).filter((k) => k === node.name).length === 0 ? "" : "#bada55" }}
    >
      <button id={"SceneButton"} onClick={onClick}>
        {/* <BiCog className="typeIcon" /> */}
        Scene Settings
      </button>
    </div>
  );
}

export default SceneButton;
