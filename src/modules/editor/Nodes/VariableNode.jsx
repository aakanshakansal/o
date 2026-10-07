import React, { useState } from "react";
import Fields from "../NodeFields";

import { Tooltip } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import { useCollapsedNodes, useCurrentScene, useUpdateCollapsedNodes } from "../../../badProvider/functions";
import { AddtoCollectionButton } from "../Components/AddToCollectionButton";
import { ConfirmDialog } from "../ConfirmDialog";
import Marqueeno from "../Marqueeno";

export function VariableNode(props) {
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
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  if (props.data.node["nodePosition"]) {
    props.data.node["nodePosition"] = { x: props.xPos, y: props.yPos };
  }
  if (!node.hasOwnProperty("badChanges")) {
    node.badChanges = {};
  }
  // node.badChanges["nodePosition"] = props.data.node["nodePosition"];

  return (
    <div className="node" style={{ background: theme.palette.background.default, outlineColor: theme.palette.grey.main }}>
      <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
        <strong className="nodeTitle">
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.text.primary }}>
            code_blocks
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
          <Tooltip title="Delete" arrow placement="top">
            <button
              className="nodeHeaderAction"
              style={{ color: theme.palette.red.main }}
              onClick={() => {
                setOpenConfirmDialog(true);
              }}
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </Tooltip>

          <Tooltip title="Close" arrow placement="top">
            <button
              className="nodeHeaderAction"
              onClick={() => {
                scene.closeNode(node.name);
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {!collapsed ? (
        <div className="nodeInner">
          <Fields node={node} />

          {/* <div className="nodeHidden">
            <span>Type: {node.getClassName()}</span>
            <br />
            <span style={{ display: "flex", alignItems: "center" }}>
              Id: <input type="text" defaultValue={node.name} />
            </span>
          </div> */}
        </div>
      ) : null}
      <ConfirmDialog
        open={openConfirmDialog}
        confirm={() => {
          setOpenConfirmDialog(false);
          scene.closeNode(node.name);
          delete scene.variables[node.name];
        }}
        cancel={() => {
          setOpenConfirmDialog(false);
        }}
        text="Are you sure you want to remove this sound?"
      />
    </div>
  );
}
