import React, { useEffect, useState } from "react";

import { getSceneElementByName, getSceneElementPropsByName } from "../../../helpers";
import NodeField from "../NodeField";

import { CameraButton } from "../Buttons/CameraButton";
import { LightButton } from "../Buttons/LightButton";
import { MaterialButton } from "../Buttons/MaterialButton";
import { MeshButton } from "../Buttons/MeshButton";
import SceneButton from "../Buttons/SceneButton";
import { SoundButton } from "../Buttons/SoundButton";
import { TextureButton } from "../Buttons/TextureButton";
import { EffectsButton } from "../Effects";

import { Switch, Tooltip } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import {
  useCollapsedNodes,
  useCurrentScene,
  useIsMappingActive,
  useMappingSource,
  useMappingTarget,
  useResetMapping,
  useUpdateCollapsedNodes,
  useUpdateIsMappingActive,
  useUpdateMappingFieldTypes,
  useUpdateMappingTarget,
  useUpdateMappingTargetFrame,
} from "../../../badProvider/functions";
import { AddtoCollectionButton } from "../Components/AddToCollectionButton";
import { ButtonCircleRemove } from "../Components/ButtonCircleRemove";
import { ConfirmDialog } from "../ConfirmDialog";
import Marqueeno from "../Marqueeno";
import Fields from "../NodeFields";

export function ControlNodeNode(props) {
  const theme = useTheme();

  const resetMapping = useResetMapping();
  const updateMappingtarget = useUpdateMappingTarget();
  const isMappingActive = useIsMappingActive();
  const mappingTarget = useMappingTarget();
  const mappingSource = useMappingSource();
  const updateMappingTargetFrame = useUpdateMappingTargetFrame();
  const updateMappingFieldTypes = useUpdateMappingFieldTypes();
  const updateIsMappingActive = useUpdateIsMappingActive();
  const collapsedNodes = useCollapsedNodes();
  const updateCollapsedNodes = useUpdateCollapsedNodes();

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const scene = useCurrentScene();
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

  const [update, setUpdate] = useState(false);
  const reset = () => {
    resetMapping();
  };

  const onNodeRemove = (nodeName) => {
    delete node.nodes[nodeName];
    setUpdate(!update);
  };

  const onPropRemove = (nodeName, key) => {
    delete node.nodes[nodeName].props[key];
    setUpdate(!update);
  };

  const toggleMapping = () => {
    if (isMappingActive) {
      reset();
    } else {
      updateMappingtarget(node);

      updateIsMappingActive(true);

      updateMappingFieldTypes(["boolean", "number", "material", "texture", "range", "select", "color"]);
    }
  };

  if (isMappingActive && mappingSource && node && node.name === mappingTarget.name) {
    const source = mappingSource;
    const sourceNode = source.node;
    const sourceKey = source.key;
    // const sourceValue = source.value;
    // const sourceValueType = source.valueType;
    // const sourceLabel = source.label;

    if (!node.nodes.hasOwnProperty(sourceNode.name)) {
      node.nodes[sourceNode.name] = { nodeType: sourceNode.getClassName(), props: {} };
    }

    if (!node.nodes[sourceNode.name].props.hasOwnProperty(sourceKey)) {
      node.nodes[sourceNode.name].props[sourceKey] = {
        // label: sourceLabel,
        // valueType: sourceValueType,
        // keyFrames: {},
      };
    }

    //  node.nodes[sourceNode.name].props[sourceKey].keyFrames[mappingTargetFrame || 0] = { value: sourceValue };

    // mappingContext.dispatch({
    //   type: UPDATE_MAPPING_SOURCE,
    //   payload: null,
    // });
  }

  useEffect(() => {
    updateMappingTargetFrame(0);
    return () => {
      reset();
    };
  }, []);

  return (
    <div className="node" style={{ background: theme.palette.background.default, outlineColor: theme.palette.grey.main }}>
      <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
        <strong className="nodeTitle">
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.text.primary }}>
            nest_remote
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
              style={{ color: "#f44336" }}
              onClick={() => {
                setOpenConfirmDialog(true);
                // var result = window.confirm("Are you sure you want to remove this control node?");
                // if (result) {
                //   scene.closeNode(node.name);
                //   delete scene.controlNodes[node.name];
                // } else {
                //   return;
                // }
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
          <div className="field Boolean" style={{ width: "100%", justifyContent: "flex-end" }}>
            <span style={{ color: theme.palette.text.primary }}>{"Map Properties"}</span>
            <Switch
              size="small"
              checked={isMappingActive && node.name === mappingTarget.name}
              onChange={(e) => {
                toggleMapping();
              }}
            ></Switch>
          </div>

          <Fields node={node} />
          {Object.entries(node.nodes).map(([k, v], i) => {
            if (getSceneElementByName(scene, k) && getSceneElementPropsByName(scene, k)) {
              const elem = getSceneElementByName(scene, k);
              const elemProps = getSceneElementPropsByName(scene, k);
              const elemClass = elem.getClassName();
              return (
                <div key={i} style={{ width: "100%" }}>
                  <div className="field" style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    {isMappingActive && node.name === mappingTarget.name ? <ButtonCircleRemove onClick={() => onNodeRemove(k)} /> : null}

                    {elemClass === "PBRMaterial" ||
                    elemClass === "ShadowOnlyMaterial" ||
                    elemClass === "TransmissionMaterial" ||
                    elemClass === "DiamondMaterial" ? (
                      <MaterialButton node={scene.getMaterialByName(k)} />
                    ) : elemClass === "TransformNode" || elemClass === "PhotoDome" ? (
                      <MeshButton node={scene.getTransformNodeByName(k)} />
                    ) : elemClass === "Mesh" ? (
                      <MeshButton node={scene.getMeshByName(k)} />
                    ) : elemClass === "ArcRotateCamera" || elemClass === "UniversalCamera" ? (
                      <CameraButton node={scene.getCameraByName(k)} />
                    ) : elemClass === "Texture" || elemClass === "CubeTexture" || elemClass === "VideoTexture" ? (
                      <TextureButton node={scene.getTextureByName(k)} />
                    ) : elemClass === "Sound" ? (
                      <SoundButton node={scene.getSoundByName(k)} />
                    ) : elemClass === "PointLight" || elemClass === "DirectionalLight" || elemClass === "SpotLight" ? (
                      <LightButton node={scene.getLightByName(k)} />
                    ) : elemClass === "Scene" ? (
                      <SceneButton node={scene} />
                    ) : elemClass === "Effects" ? (
                      <EffectsButton node={scene.effects} />
                    ) : null}
                  </div>
                  {Object.entries(v.props).map(([k2, v2], i) => {
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center" }}>
                        {isMappingActive && node.name === mappingTarget.name ? (
                          <ButtonCircleRemove style={{ marginRight: "0.5em" }} onClick={() => onPropRemove(k, k2)} />
                        ) : null}
                        {NodeField(elem, k2, elemProps[k2])}
                      </div>
                    );
                  })}
                </div>
              );
            }
            return null;
          })}

          <div className="nodeHidden">
            <span>Type: {node.type}</span>
            <br />
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
          delete scene.controlNodes[node.name];
        }}
        cancel={() => {
          setOpenConfirmDialog(false);
        }}
        text="Are you sure you want to remove this control node?"
      />
    </div>
  );
}
