import useTheme from "@mui/material/styles/useTheme";
import React from "react";
import Fields from "./NodeFields";

import { Tooltip } from "@mui/material";
import { useCollapsedNodes, useCurrentScene, useOpenNodes, useUpdateCollapsedNodes } from "../../badProvider/functions";

export const EffectsFields = (props) => {
  const theme = useTheme();

  const scene = useCurrentScene();

  const collapsedNodes = useCollapsedNodes();
  const updateCollapsedNodes = useUpdateCollapsedNodes();
  const node = props.data.node;
  const collapsed = collapsedNodes.includes(node.name);
  const setCollapsed = (nodeName) => {
    const collapsedCopy = [...collapsedNodes];

    if (collapsedCopy.includes(nodeName)) {
      collapsedCopy.splice(collapsedCopy.indexOf(nodeName), 1);
    } else {
      collapsedCopy.push(nodeName);
    }

    updateCollapsedNodes(collapsedCopy);
  };
  if (props.data.node["nodePosition"]) {
    props.data.node["nodePosition"] = { x: props.xPos, y: props.yPos };
  }
  if (!node.hasOwnProperty("badChanges")) {
    node.badChanges = {};
  }
  // node.badChanges["nodePosition"] = props.data.node["nodePosition"];

  const onClose = () => {
    scene.closeNode(node.name);
  };
  //node.name = "effects";
  return (
    <div className="node effectsFields" style={{ background: theme.palette.background.default, outlineColor: theme.palette.grey.main }}>
      <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
        <strong className="nodeTitle">
          <span className="material-symbols-outlined" style={{ color: theme.palette.text.primary, marginRight: "0.5em" }}>
            auto_awesome
          </span>

          <span onClick={() => setCollapsed(node.name)}>Effects</span>
        </strong>

        <div className="nodeActions">
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
          <div style={{ display: "none" }}>
            <br />
            <span style={{ opacity: 0.5 }}>Type: {node.getClassName()}</span>
            <br />
            <span style={{ opacity: 0.5, display: "flex", alignItems: "center" }}>
              Id: <input defaultValue={node.name} />
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const EffectsButton = (props) => {
  const scene = useCurrentScene();
  const openNodes = useOpenNodes();
  const node = props.node;

  const onClick = (e) => {
    scene.openNode("Effects", node);
  };
  return (
    <div className={"nodeButton"} key="effects" style={{ color: Object.keys(openNodes).filter((k) => k === node.name).length === 0 ? "" : "#bada55" }}>
      <button id={"EffectsButton"} onClick={onClick}>
        Effects
      </button>
    </div>
  );
};
