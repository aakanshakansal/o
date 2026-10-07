import React, { useState } from "react";
import Fields from "../NodeFields";

import { Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { toast } from "sonner";
import { useCollapsedNodes, useCurrentScene, useUpdateCollapsedNodes } from "../../../badProvider/functions";
import { AddtoCollectionButton } from "../Components/AddToCollectionButton";
import { ConfirmDialog } from "../ConfirmDialog";
import Marqueeno from "../Marqueeno";

export function CameraNode(props) {
  const theme = useTheme();
  const scene = useCurrentScene();
  const collapsedNodes = useCollapsedNodes();
  const updateCollapsedNodes = useUpdateCollapsedNodes();
  const node = props.data.node;
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

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
  const onRemove = () => {
    scene.closeNode(node.name);

    node.dispose();
  };
  return (
    <div className="node" style={{ background: theme.palette.background.default, outlineColor: theme.palette.violet.main }}>
      <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
        <strong className="nodeTitle">
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.violet.main }}>
            videocam
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
          {!node.isDefault && !node.fromAsset ? (
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
          ) : null}

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

      <ConfirmDialog
        open={openConfirmDialog}
        confirm={() => {
          setOpenConfirmDialog(false);
          onRemove();
        }}
        cancel={() => {
          setOpenConfirmDialog(false);
        }}
        text="Are you sure you want to remove this camera?"
      />
    </div>
  );
}
