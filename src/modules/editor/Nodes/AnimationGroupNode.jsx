import React, { useState } from "react";
import Fields from "../NodeFields";

import { Tooltip } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import { toast } from "sonner";
import { useCurrentScene } from "../../../badProvider/functions";
import { AddtoCollectionButton } from "../Components/AddToCollectionButton";
import Marqueeno from "../Marqueeno";

export function AnimationGroupNode(props) {
  const theme = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const scene = useCurrentScene();
  const node = props.data.node;

  if (props.data.node["nodePosition"]) {
    props.data.node["nodePosition"] = { x: props.xPos, y: props.yPos };
  }
  if (!node.hasOwnProperty("badChanges")) {
    node.badChanges = {};
  }

  const onClose = () => {
    scene.closeNode(node.name);
  };
  const onFrameChange = (e) => {
    if (!node.isPlaying) node.play();

    node.pause();
    node.goToFrame((node.to / 100) * e.target.value);
  };

  return (
    <div className="node" style={{ background: theme.palette.background.default, outlineColor: theme.palette.grey.main }}>
      <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
        <strong className="nodeTitle">
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.text.primary }}>
            directions_run
          </span>
          <span onClick={() => setCollapsed(node.name)}>
            <Marqueeno text={node.displayName || node.name} />
          </span>
        </strong>

        <div className="nodeActions">
          <Tooltip title="Add to Collection" arrow placement="top">
            <span>
              <AddtoCollectionButton node={node} />
            </span>
          </Tooltip>

          <Tooltip title="Close" arrow placement="top">
            <button className="nodeHeaderAction" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </Tooltip>
        </div>
      </div>
      {!collapsed ? (
        <div className="nodeInner">
          <Fields node={node} />

          <div className="field">
            <span>Frame Length: {Math.ceil(node.to)}</span>
            <br></br>
            <br></br>
            <input defaultValue={0} onChange={onFrameChange} type="range" min={0} max={100} step={0.01} />
          </div>
          <div className="nodeHidden">
            <span>Type: {node.getClassName()}</span>
            <br />
            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Id: {node.name}</span>
              <span
                className="material-symbols-outlined"
                onClick={() => {
                  navigator.clipboard.writeText(node.name);
                  toast("Id copied to clipboard");
                }}
                style={{ marginLeft: "0.5em", cursor: "pointer" }}
              >
                content_copy
              </span>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
