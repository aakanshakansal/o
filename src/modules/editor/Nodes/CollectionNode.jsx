import React, { useState } from "react";

import { Tooltip } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import { useCollapsedNodes, useCurrentScene, useUpdateCollapsedNodes } from "../../../badProvider/functions";
import { getSceneElementByName, getSceneElementPropsByName } from "../../../helpers";
import { ActionButton } from "../Buttons/ActionButton";
import { AnimationGroupButton } from "../Buttons/AnimationGroupButton";
import { CameraButton } from "../Buttons/CameraButton";
import { ControlNodeButton } from "../Buttons/ControlNodeButton";
import { LightButton } from "../Buttons/LightButton";
import { MaterialButton } from "../Buttons/MaterialButton";
import { MeshButton } from "../Buttons/MeshButton";
import SceneButton from "../Buttons/SceneButton";
import { SoundButton } from "../Buttons/SoundButton";
import { TextureButton } from "../Buttons/TextureButton";
import { VariableButton } from "../Buttons/VariableButton";
import { ButtonCircleRemove } from "../Components/ButtonCircleRemove";
import { ConfirmDialog } from "../ConfirmDialog";
import { EffectsButton } from "../Effects";
import Marqueeno from "../Marqueeno";
import Fields from "../NodeFields";

export const CollectionNode = (props) => {
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

  // const SortableItem = sortableElement(({ value }) => {

  return (
    <div className="node" style={{ background: theme.palette.background.default, outlineColor: theme.palette.grey.main }}>
      <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
        <strong className="nodeTitle">
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.text.primary }}>
            library_add
          </span>
          <span onClick={() => setCollapsed(node.name)}>
            <Marqueeno text={node.displayName || node.name} />
          </span>
        </strong>

        <div className="nodeActions">
          <button
            onClick={async () => {
              const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

              for (const [i, nodeName] of node.nodes.entries()) {
                await delay(100);
                if (getSceneElementByName(scene, nodeName) && getSceneElementPropsByName(scene, nodeName)) {
                  const elem = getSceneElementByName(scene, nodeName);

                  const elemClass = elem ? elem.getClassName() : null;

                  if (
                    elemClass === "PBRMaterial" ||
                    elemClass === "ShadowOnlyMaterial" ||
                    elemClass === "TransmissionMaterial" ||
                    elemClass === "DiamondMateriaL"
                  ) {
                    scene.openNode("Material", elem);
                  }

                  if (elemClass === "TransformNode" || elemClass === "Mesh" || elemClass === "PhotoDome") {
                    scene.openNode("Mesh", elem);
                  }

                  if (elemClass === "ArcRotateCamera" || elemClass === "UniversalCamera") {
                    scene.openNode("Camera", elem);
                  }

                  if (elemClass === "Texture" || elemClass === "CubeTexture" || elemClass === "VideoTexture") {
                    scene.openNode("Texture", elem);
                  }

                  if (elemClass === "Sound") {
                    scene.openNode("Sound", elem);
                  }

                  if (elemClass === "PointLight" || elemClass === "DirectionalLight" || elemClass === "SpotLight") {
                    scene.openNode("Light", elem);
                  }

                  if (elemClass === "AnimationGroup") {
                    scene.openNode("AnimationGroup", elem);
                  }

                  if (elemClass === "Variable") {
                    scene.openNode("Variable", elem);
                  }

                  if (elemClass === "Action") {
                    scene.openNode("Action", elem);
                  }

                  if (elemClass === "ControlNode") {
                    scene.openNode("ControlNode", elem);
                  }
                }
              }
            }}
          >
            <span className="material-symbols-outlined">open_in_new</span>
          </button>
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
          {/* <Fields node={node} /> */}
          <Fields node={node} />

          <div style={{ width: "100%" }}>
            {/* <SortableContainer onSortEnd={onSortEnd} distance={1}>
              {items
                ? items.map((nodeName, i) => {
                    if (getSceneElementByName(scene, nodeName) && getSceneElementPropsByName(scene, nodeName)) {
                      return <SortableItem key={`item-${nodeName}`} index={i} value={nodeName} />;
                    } else {
                      return null;
                    }
                  })
                : null}
            </SortableContainer> */}

            {node.nodes.map((nodeName, i) => {
              if (getSceneElementByName(scene, nodeName) && getSceneElementPropsByName(scene, nodeName)) {
                // const nodeName = value;
                const elem = getSceneElementByName(scene, nodeName);

                const elemClass = elem ? elem.getClassName() : null;

                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <ButtonCircleRemove
                      onClick={() => {
                        node.nodes.splice(node.nodes.indexOf(nodeName), 1);
                        scene.forceUpdate();
                      }}
                    />
                    <div style={{ width: "calc(100% - 2em)" }}>
                      {elemClass === "PBRMaterial" || elemClass === "ShadowOnlyMaterial" || elemClass === "TransmissionMaterial" ? (
                        <MaterialButton node={scene.getMaterialByName(nodeName)} />
                      ) : elemClass === "TransformNode" || elemClass === "PhotoDome" ? (
                        <MeshButton node={scene.getTransformNodeByName(nodeName)} />
                      ) : elemClass === "Mesh" ? (
                        <MeshButton node={scene.getMeshByName(nodeName)} />
                      ) : elemClass === "ArcRotateCamera" || elemClass === "UniversalCamera" ? (
                        <CameraButton node={scene.getCameraByName(nodeName)} />
                      ) : elemClass === "Texture" || elemClass === "CubeTexture" || elemClass === "VideoTexture" ? (
                        <TextureButton node={scene.getTextureByName(nodeName)} />
                      ) : elemClass === "Sound" ? (
                        <SoundButton node={scene.getSoundByName(nodeName)} />
                      ) : elemClass === "PointLight" || elemClass === "DirectionalLight" || elemClass === "SpotLight" ? (
                        <LightButton node={scene.getLightByName(nodeName)} />
                      ) : elemClass === "Scene" ? (
                        <SceneButton node={scene} />
                      ) : elemClass === "Effects" ? (
                        <EffectsButton node={scene.effects} />
                      ) : elemClass === "AnimationGroup" ? (
                        <AnimationGroupButton node={scene.getAnimationGroupByName(nodeName)} />
                      ) : elemClass === "Variable" ? (
                        <VariableButton node={elem} />
                      ) : elemClass === "Action" ? (
                        <ActionButton node={elem} />
                      ) : elemClass === "ControlNode" ? (
                        <ControlNodeButton node={elem} />
                      ) : null}
                    </div>
                  </div>
                );
              } else {
                return null;
              }
            })}
          </div>
          <div className="nodeHidden">
            <span>Type: Collection</span>

            <span style={{ display: "flex", alignItems: "center" }}>
              Id: <input type="text" defaultValue={node.name} />
            </span>
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        open={openConfirmDialog}
        confirm={() => {
          setOpenConfirmDialog(false);
          scene.closeNode(node.name);
          delete scene.collections[node.name];
        }}
        cancel={() => {
          setOpenConfirmDialog(false);
        }}
        text="Are you sure you want to remove this collection?"
      />
    </div>
  );
};
