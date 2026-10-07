import React from "react";
import { useCurrentScene, useOpenNodes } from "../../../badProvider/functions";

export const EngineButton = (props) => {
  const scene = useCurrentScene();
  const openNodes = useOpenNodes();
  const node = props.node;

  return (
    <div
      className={"nodeButton"}
      key="engine"
      style={{ ...props.style, color: Object.keys(openNodes).filter((k) => k === node.name).length === 0 ? "" : "#bada55" }}
    >
      <button
        id={"SceneButton"}
        onClick={(e) => {
          scene.openNode("Engine", node);
        }}
      >
        {/* <BiCog className="typeIcon" /> */}
        Engine Settings
      </button>
    </div>
  );
};

export default EngineButton;
