import React from "react";
import { useOpenNodes, useUpdateEditorOverlay } from "../../../badProvider/functions";
import Marqueeno from "../Marqueeno";
export function OverlayButton(props) {
  const openNodes = useOpenNodes();
  const node = props.node;
  const updateEditorOverlay = useUpdateEditorOverlay();
  const onClick = () => {
    updateEditorOverlay(node);
  };
  return (
    <div
      className="nodeButton"
      key={node.name}
      style={{ ...props.style, color: Object.keys(openNodes).filter((k) => k === node.name).length === 0 ? "" : "#bada55" }}
    >
      <button id={node.name + "OverlayButton"} onClick={onClick}>
        <Marqueeno text={node.displayName || node.name} />
      </button>
    </div>
  );
}
