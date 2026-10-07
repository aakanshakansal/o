import React, { useEffect, useState } from "react";
import { Handle, Position, useEdges, useReactFlow } from "reactflow";
import { MeshButton } from "../Buttons/MeshButton";
import Fields from "../NodeFields";

import { toast } from "sonner";

import { Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCollapsedNodes, useCurrentScene, useUpdateCollapsedNodes } from "../../../badProvider/functions";
import { createMaterialCopy } from "../../../sceneFunctions/createSceneElements";
import { AddtoCollectionButton } from "../Components/AddToCollectionButton";
import { ConfirmDialog } from "../ConfirmDialog";
import Marqueeno from "../Marqueeno";

export function MaterialNode(props) {
  const reactFlowInstance = useReactFlow();
  const scene = useCurrentScene();
  const collapsedNodes = useCollapsedNodes();
  const updateCollapsedNodes = useUpdateCollapsedNodes();
  const node = props.data.node;
  const edges = useEdges();

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
  const [bindedMeshes, setBindedMeshes] = useState(null);
  const [showReferences, setShowReferences] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  if (props.data.node["nodePosition"]) {
    props.data.node["nodePosition"] = { x: props.xPos, y: props.yPos };
  }
  if (!node.hasOwnProperty("badChanges")) {
    node.badChanges = {};
  }
  // node.badChanges["nodePosition"] = props.data.node["nodePosition"];

  useEffect(() => {
    const bindedMeshesArr = [];

    if (typeof node.getBindedMeshes === "function" && node.getBindedMeshes().length) {
      node.getBindedMeshes().forEach((m, i) => {
        bindedMeshesArr.push(m);
      });
    }

    setBindedMeshes(bindedMeshesArr);
  }, [edges]);

  const onClose = () => {
    scene.closeNode(node.name);
  };
  const onRemove = () => {
    scene.closeNode(node.name);

    node.dispose(true, true);
  };

  return (
    <div className="node" style={{ background: theme.palette.background.default, outlineColor: theme.palette.green.main }}>
      <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
        <strong className="nodeTitle">
          {node.getClassName() === "PBRMaterial" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.green.main }}>
              deployed_code
            </span>
          ) : node.getClassName() === "ShadowOnlyMaterial" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.green.main }}>
              ev_shadow
            </span>
          ) : node.getClassName() === "ShaderMaterial" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.green.main }}>
              star
            </span>
          ) : node.getClassName() === "TransmissionMaterial" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.green.main }}>
              sound_detection_glass_break
            </span>
          ) : null}

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

          <Tooltip title="Copy" arrow placement="top">
            <button
              onClick={() => {
                const newCopy = createMaterialCopy(scene, null, node);

                scene.openNode("Material", newCopy);
              }}
            >
              <span className="material-symbols-outlined">content_copy</span>
            </button>
          </Tooltip>

          {node.isCustom || node.cloneOf ? (
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
          <Handle
            className={"sourceHandle multiple green " + (bindedMeshes && bindedMeshes.length ? "connected" : "")}
            type="source"
            id={node.name}
            // onClick={() => {
            //   if (bindedMeshes && bindedMeshes.length) {
            //     bindedMeshes.forEach((m) => {
            //       scene.openNode("Mesh", m);
            //     });
            //   }
            // }}
            position={Position.Right}
            onConnect={(e) => {
              const target = reactFlowInstance.getNode(e.target);

              if (target.type === "Mesh") {
                if (!target.data.node.hasOwnProperty("badChanges")) {
                  target.data.node.badChanges = {};
                }
                target.data.node.badChanges[e.targetHandle] = node.name;

                return (target.data.node[e.targetHandle] = node);
              }
              return toast.error("Bad Connection :(");
            }}
          />
          <Fields node={node} activeGroups={[]} />

          {bindedMeshes && bindedMeshes.length ? (
            <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%", marginTop: "1em" }}>
              <div className="referencesTitle" onClick={() => setShowReferences(!showReferences)}>
                Meshes using this material{" "}
                {showReferences ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )}
              </div>
              {showReferences ? (
                <div className="referencesList">
                  {bindedMeshes.map((m, i) => {
                    return <MeshButton key={i} node={m} />;
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

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
        text="Are you sure you want to remove this material?"
      />
    </div>
  );
}
