import React, { useEffect, useState } from "react";
import { Handle, Position, useEdges, useReactFlow } from "reactflow";
import Fields from "../NodeFields";

import { MaterialButton } from "../Buttons/MaterialButton";

import { Tooltip } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { badDB, storageUrl } from "../../../Router";
import { useCollapsedNodes, useCurrentScene, useUpdateCollapsedNodes } from "../../../badProvider/functions";
import { setDeep } from "../../../helpers";
import { AddtoCollectionButton } from "../Components/AddToCollectionButton";
import { ConfirmDialog } from "../ConfirmDialog";
import Marqueeno from "../Marqueeno";

// import { createDecal } from "../../../sceneFunctions/createSceneElements";

export function TextureNode(props) {
  const reactFlowInstance = useReactFlow();
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
  const edges = useEdges();

  const theme = useTheme();

  if (props.data.node["nodePosition"]) {
    props.data.node["nodePosition"] = { x: props.xPos, y: props.yPos };
  }
  if (!node.hasOwnProperty("badChanges")) {
    node.badChanges = {};
  }
  // node.badChanges["nodePosition"] = props.data.node["nodePosition"];

  const [imageData, setImageData] = useState(null);
  const [bindedMaterials, setBindedMaterials] = useState(null);
  const [showReferences, setShowReferences] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  useEffect(() => {
    try {
      const internalTexture = node.getInternalTexture();

      if (typeof node.getClassName === "function" && node.getClassName() === "CubeTexture") {
        const assetId = node.url.split("assets")[1].split("/")[1];

        const assetRef = doc(badDB, "assets", assetId);

        getDoc(assetRef).then((doc) => {
          if (doc.data() && doc.data().thumbnail) {
            return setImageData(storageUrl + doc.data().thumbnail);
          }
        });
      } else if (internalTexture && internalTexture._buffer) {
        const url = URL.createObjectURL(new Blob([internalTexture._buffer], { type: "image/jpg" }));
        setImageData(url);
      } else if (internalTexture && internalTexture.url) {
        async function getImageBlob(imageUrl) {
          const response = await fetch(imageUrl);
          return response.blob();
        }

        getImageBlob(internalTexture.url).then((blob) => {
          if (blob.type.indexOf("image/") === 0) {
            setImageData(internalTexture.url);
          }
        });
      }

      const bindedMaterialsArr = [];

      scene.materials.forEach((m, i) => {
        if (typeof m.getActiveTextures === "function" && m.getActiveTextures().length) {
          m.getActiveTextures().forEach((t) => {
            if (t.name === node.name && !bindedMaterialsArr.includes(m)) bindedMaterialsArr.push(m);
          });
        }
      });

      setBindedMaterials(bindedMaterialsArr);
    } catch (error) {
      console.warn(error);
    }
  }, [edges]);

  const onClose = (e) => {
    scene.closeNode(node.name);
  };

  const onRemove = () => {
    scene.closeNode(node.name);
    node.dispose();
  };

  return (
    <div className="node" style={{ background: theme.palette.background.default, outlineColor: theme.palette.orange.main }}>
      <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
        <strong className="nodeTitle">
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.orange.main }}>
            texture
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
          {node.isCustom ? (
            <button
              className="nodeHeaderAction"
              style={{ color: theme.palette.red.main }}
              onClick={() => {
                setOpenConfirmDialog(true);
              }}
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
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
            className={"sourceHandle multiple orange " + (bindedMaterials && bindedMaterials.length ? "connected" : "")}
            type="source"
            id={node.name}
            position={Position.Right}
            // onClick={() => {
            //   if (bindedMaterials && bindedMaterials.length) {
            //     bindedMaterials.forEach((m) => {
            //       scene.openNode("Material", m);
            //     });
            //   }
            // }}
            onConnect={(e) => {
              const target = reactFlowInstance.getNode(e.target);

              if (target.type === "Material" || target.type === "Scene" || target.type === "Effects") {
                if (!target.data.node.hasOwnProperty("badChanges")) {
                  target.data.node.badChanges = {};
                }
                target.data.node.badChanges[e.targetHandle] = node.name;
                return setDeep(target.data.node, e.targetHandle, node);
              }
              return toast.error("Bad Connection :(");
            }}
          />
          {imageData ? <img alt={node.name} style={{ width: "100%", padding: "0.5em 0" }} src={imageData} /> : null}

          <Fields node={node} />

          {bindedMaterials && bindedMaterials.length ? (
            <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%", marginTop: "1em" }}>
              <div className="referencesTitle" onClick={() => setShowReferences(!showReferences)}>
                Materials using this texture{" "}
                {showReferences ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )}
              </div>
              {showReferences ? (
                <div className="referencesList">
                  {bindedMaterials.map((m, i) => {
                    return <MaterialButton key={i} node={m} />;
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
        text="Are you sure you want to remove this texture?"
      />
      {node.getSize && typeof node.getSize === "function" && !collapsed ? (
        <div style={{ width: "100%", padding: "0.5em", backgroundColor: theme.palette.orange.main, color: theme.palette.text.secondary }}>
          Size: <strong>{node.getSize().width}px</strong> x <strong>{node.getSize().height}px</strong>
        </div>
      ) : null}
    </div>
  );
}
