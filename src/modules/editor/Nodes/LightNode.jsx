import React, { useEffect, useState } from "react";
import Fields from "../NodeFields";

import { GizmoManager, LightGizmo, Vector3 } from "@babylonjs/core";

import { getDeep } from "../../../helpers";

import { Tooltip } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import { toast } from "sonner";
import { useCollapsedNodes, useCurrentScene, useIsMappingActive, useUpdateCollapsedNodes, useUpdateMappingSource } from "../../../badProvider/functions";
import { createLightCopy } from "../../../sceneFunctions/createSceneElements";
import { AddtoCollectionButton } from "../Components/AddToCollectionButton";
import { ConfirmDialog } from "../ConfirmDialog";
import Marqueeno from "../Marqueeno";

export const LightNode = (props) => {
  const scene = useCurrentScene();
  const collapsedNodes = useCollapsedNodes();
  const updateCollapsedNodes = useUpdateCollapsedNodes();
  const node = props.data.node;
  const isMappingActive = useIsMappingActive();
  const updateMappingSource = useUpdateMappingSource();
  const theme = useTheme();

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

  useEffect(() => {
    if (node.gizmoManager) {
      node.lightGizmo.dispose();
      node.gizmoManager.positionGizmoEnabled = false;
      node.gizmoManager.dispose();
    }
    node.gizmoManager = new GizmoManager(scene);
    node.gizmoManager.usePointerToAttachGizmos = false;
    node.lightGizmo = new LightGizmo();
    node.lightGizmo.light = node;
    node.lightGizmo.scaleRatio = 0.5;
    node.gizmoManager.attachToMesh(node);

    //if (!node.getClassName() === "HemisphericLight") {
    node.gizmoManager.positionGizmoEnabled = true;
    node.gizmoManager.gizmos.positionGizmo.scaleRatio = 0.5;
    //}

    if (node.getClassName() === "HemisphericLight") {
      node.gizmoManager.positionGizmoEnabled = false;
    }

    node.gizmoManager.gizmos.positionGizmo.onDragEndObservable.add(() => {
      const position = getDeep(node, "position");
      if (!isMappingActive) {
        if (!node.hasOwnProperty("badChanges")) {
          node.badChanges = {};
        }
        node.badChanges["position.x"] = parseFloat(position.x);

        node.badChanges["position.y"] = parseFloat(position.y);

        node.badChanges["position.z"] = parseFloat(position.z);
      } else {
        updateMappingSource({
          node: node,
          value: { x: parseFloat(position.x), y: parseFloat(position.y), z: parseFloat(position.z) },
          valueType: "Vector3",
          key: "position",
          label: "Position",
        });
      }
    });

    return () => {
      node.lightGizmo.dispose();
      node.gizmoManager.positionGizmoEnabled = false;
      node.gizmoManager.dispose();
    };
  }, [isMappingActive]);

  const onClose = () => {
    scene.closeNode(node.name);
  };
  const onRemove = () => {
    scene.closeNode(node.name);
    if (node.hasOwnProperty("shadowGenerator")) {
      node.shadowGenerator.dispose();
    }
    node.dispose();
  };
  return (
    <div className="node" style={{ background: theme.palette.background.default, outlineColor: theme.palette.yellow.main }}>
      <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
        <strong className="nodeTitle">
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.yellow.main }}>
            emoji_objects
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
          {node.getClassName() !== "HemisphericLight" ? (
            <Tooltip title="Focus Element" arrow placement="top">
              <button
                color="primary"
                className="nodeHeaderAction"
                onClick={() => {
                  scene.activeCamera.target = new Vector3(node.position.x, node.position.y, node.position.z);
                }}
              >
                <span className="material-symbols-outlined">filter_center_focus</span>
              </button>
            </Tooltip>
          ) : null}

          <Tooltip title="Clone" arrow placement="top">
            <button
              onClick={() => {
                const newCopy = createLightCopy(scene, null, node);

                scene.openNode("Light", newCopy);
              }}
            >
              <span className="material-symbols-outlined">content_copy</span>
            </button>
          </Tooltip>

          {!node.fromAsset || node.cloneOf ? (
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

          {/* <button className="nodeHeaderAction" onClick={onDuplicate}>
          <span className="material-symbols-outlined">content_copy</span>
        </button> */}

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
        text="Are you sure you want to remove this light?"
      />
    </div>
  );
};
