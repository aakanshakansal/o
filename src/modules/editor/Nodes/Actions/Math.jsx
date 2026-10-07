import { Button, MenuItem, Select, useTheme } from "@mui/material";
import React, { useState } from "react";
import {
  useCurrentScene,
  useIsMappingActive,
  useMappingSource,
  useMappingTarget,
  useResetMapping,
  useUpdateIsMappingActive,
  useUpdateMappingFieldTypes,
  useUpdateMappingSource,
  useUpdateMappingTarget,
} from "../../../../badProvider/functions";
import { getSceneElementByName, getSceneElementPropsByName } from "../../../../helpers";
import { AnimationGroupButton } from "../../Buttons/AnimationGroupButton";
import { CameraButton } from "../../Buttons/CameraButton";
import { LightButton } from "../../Buttons/LightButton";
import { MaterialButton } from "../../Buttons/MaterialButton";
import { MeshButton } from "../../Buttons/MeshButton";
import SceneButton from "../../Buttons/SceneButton";
import { SoundButton } from "../../Buttons/SoundButton";
import { TextureButton } from "../../Buttons/TextureButton";
import { VariableButton } from "../../Buttons/VariableButton";
import { NumberInput } from "../../Components/NumberInput";
import { EffectsButton } from "../../Effects";
import NodeField from "../../NodeField";
const Math = (props) => {
  const scene = useCurrentScene();
  const node = props.node;

  const isMappingActive = useIsMappingActive();
  const updateIsMappingActive = useUpdateIsMappingActive();
  const mappingSource = useMappingSource();
  const updateMappingSource = useUpdateMappingSource();
  const mappingTarget = useMappingTarget();
  const updateMappingTarget = useUpdateMappingTarget();

  const updateMappingFieldTypes = useUpdateMappingFieldTypes();
  const resetMapping = useResetMapping();

  const [operation, setOperation] = useState(node.operation || {});

  const [valToUpdate, setValToUpdate] = useState(null);
  // useEffect(() => {
  //   node.elements = elements;
  // }, [elements]);
  const theme = useTheme();

  const reset = () => {
    setValToUpdate(null);
    resetMapping(null);
  };

  const onActivateLink = (e, value) => {
    if (isMappingActive) {
      reset();
    } else {
      setValToUpdate(value);
      updateIsMappingActive(true);
      updateMappingTarget(node);
      updateMappingFieldTypes(["number", "range", "variable"]);
    }
  };

  const onOperatorChange = (e) => {
    setOperation((prevOperation) => {
      prevOperation.operator = e.target.value;

      const newOperation = {
        ...prevOperation,
      };
      node.operation = newOperation;
      return newOperation;
    });
  };

  const onRemoveLink = (value) => {
    const isConfirmed = confirm("Are you sure you want to delete this property?");
    if (isConfirmed) {
      setOperation((prevOperation) => {
        prevOperation[value] = "";

        const newOperation = {
          ...prevOperation,
        };
        node.operation = newOperation;
        return newOperation;
      });
    }
  };

  const setStaticValue = (valueToSet, value, key) => {
    setOperation((prevOperation) => {
      prevOperation[value] = valueToSet;

      const newOperation = {
        ...prevOperation,
      };
      node.operation = newOperation;
      return newOperation;
    });
  };

  if (isMappingActive && mappingSource && node && node.name === mappingTarget.name && valToUpdate) {
    const source = mappingSource;
    const sourceNode = source.node;
    const sourceKey = source.key;
    const sourceValue = source.value;

    const sourceValueType = source.valueType;
    const sourceLabel = source.label;

    node.operation[valToUpdate] = {};

    node.operation[valToUpdate] = { nodeName: sourceNode.name, sourceKey };

    // if (!node.nodes.hasOwnProperty(sourceNode.name)) {
    //   node.nodes[sourceNode.name] = { nodeType: sourceNode.getClassName(), props: {} };
    // }

    // if (!node.nodes[sourceNode.name].props.hasOwnProperty(sourceKey)) {
    //   node.nodes[sourceNode.name].props[sourceKey] = {
    //     // label: sourceLabel,
    //     // valueType: sourceValueType,
    //     keyFrames: {},
    //   };
    // }

    // node.nodes[sourceNode.name].props[sourceKey].keyFrames[mappingTargetFrame || 0] = { value: sourceValue };
    //  setValToUpdate(null);

    updateMappingSource(null);
    reset();
  }

  const value1Type = typeof node.operation.value1;
  const value2Type = typeof node.operation.value2;

  let value1Elem = null;
  let value1ElemClass = null;
  let value1ElemProps = null;
  let value2ElemProps = null;
  let value2Elem = null;
  let value2ElemClass = null;

  if (value1Type === "object") {
    value1Elem = getSceneElementByName(scene, node.operation.value1.nodeName);
    value1ElemProps = value1Elem ? getSceneElementPropsByName(scene, node.operation.value1.nodeName) : null;
    value1ElemClass = value1ElemProps ? value1Elem.getClassName() : null;
  }

  if (value2Type === "object") {
    value2Elem = getSceneElementByName(scene, node.operation.value2.nodeName);
    value2ElemProps = value2Elem ? getSceneElementPropsByName(scene, node.operation.value2.nodeName) : null;
    value2ElemClass = value2ElemProps ? value2Elem.getClassName() : null;
  }
  return (
    <div className="math nodeInner" style={{ borderBottom: "solid", paddingTop: "0.8em", marginBottom: "1em" }}>
      <div className="field">
        {typeof node.operation.value1 === "object" && value1Elem && value1ElemProps ? (
          <>
            <div style={{ display: "flex", alignItems: "center" }}>
              {value1ElemClass === "PBRMaterial" ||
              value1ElemClass === "ShadowOnlyMaterial" ||
              value1ElemClass === "TransmissionMaterial" ||
              value1ElemClass === "DiamondMaterial" ? (
                <MaterialButton node={value1Elem} />
              ) : value1ElemClass === "TransformNode" || value1ElemClass === "PhotoDome" ? (
                <MeshButton node={value1Elem} />
              ) : value1ElemClass === "Mesh" ? (
                <MeshButton node={value1Elem} />
              ) : value1ElemClass === "ArcRotateCamera" || value1ElemClass === "UniversalCamera" ? (
                <CameraButton node={value1Elem} />
              ) : value1ElemClass === "Texture" || value1ElemClass === "CubeTexture" || value1ElemClass === "VideoTexture" ? (
                <TextureButton node={value1Elem} />
              ) : value1ElemClass === "Sound" ? (
                <SoundButton node={value1Elem} />
              ) : value1ElemClass === "PointLight" || value1ElemClass === "DirectionalLight" || value1ElemClass === "SpotLight" ? (
                <LightButton node={value1Elem} />
              ) : value1ElemClass === "Scene" ? (
                <SceneButton node={scene} />
              ) : value1ElemClass === "Effects" ? (
                <EffectsButton node={scene.effects} />
              ) : value1ElemClass === "AnimationGroup" ? (
                <AnimationGroupButton node={value1Elem} />
              ) : value1ElemClass === "Variable" ? (
                <VariableButton node={value1Elem} />
              ) : null}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: "100%" }}>{NodeField(value1Elem, node.operation.value1.sourceKey, value1ElemProps[node.operation.value1.sourceKey])}</div>

              <Button
                onClick={() => onRemoveLink("value1")}
                variant="outlined"
                style={{ color: theme.palette.text.primary, borderColor: theme.palette.text.primary, width: "1.6em" }}
                className="functionButton"
              >
                <span className="material-symbols-outlined">link_off</span>
              </Button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center" }}>
            {valToUpdate?.key === node.operation.value1 ? (
              <Button
                onClick={(e) => onActivateLink(e, "value1")}
                variant="outlined"
                style={{ color: theme.palette.red.main, borderColor: theme.palette.red.main, width: "100%" }}
                className="functionButton"
              >
                Cancel
              </Button>
            ) : (
              <Button
                onClick={(e) => onActivateLink(e, "value1")}
                variant="outlined"
                style={{ color: theme.palette.text.primary, borderColor: theme.palette.text.primary, width: "100%" }}
                className="functionButton"
              >
                Set Property
                <span style={{ marginLeft: "0.5em" }} className="material-symbols-outlined">
                  link
                </span>
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="field">
        <Select
          sx={{ backgroundColor: theme.palette.background.light }}
          value={node.operation.operator}
          onChange={(e) => onOperatorChange(e)}
          style={{ width: "100%" }}
        >
          <MenuItem key="add" value="add">
            {"+"} Add
          </MenuItem>
          <MenuItem key="subtract" value="subtract">
            {"-"} Subtract
          </MenuItem>
          <MenuItem key="multiply" value="multiply">
            {"×"} Multiply
          </MenuItem>
          <MenuItem key="divide" value="divide">
            {"÷"} Divide
          </MenuItem>
          <MenuItem key="set" value="set">
            {"="} Set
          </MenuItem>
        </Select>
      </div>

      <div className="field">
        {typeof node.operation.value2 === "object" && value2Elem && value2ElemProps ? (
          <>
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* <Button
                      onClick={() => removeCondition(k)}
                      variant="outlined"
                      style={{ color: theme.palette.text.primary, borderColor: theme.palette.text.primary, width: "1.6em" }}
                      className="functionButton"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </Button> */}
              {value2ElemClass === "PBRMaterial" || value2ElemClass === "ShadowOnlyMaterial" || value2ElemClass === "TransmissionMaterial" ? (
                <MaterialButton node={value2Elem} />
              ) : value2ElemClass === "TransformNode" || value2ElemClass === "PhotoDome" ? (
                <MeshButton node={value2Elem} />
              ) : value2ElemClass === "Mesh" ? (
                <MeshButton node={value2Elem} />
              ) : value2ElemClass === "ArcRotateCamera" || value2ElemClass === "UniversalCamera" ? (
                <CameraButton node={value2Elem} />
              ) : value2ElemClass === "Texture" || value2ElemClass === "CubeTexture" || value2ElemClass === "VideoTexture" ? (
                <TextureButton node={value2Elem} />
              ) : value2ElemClass === "Sound" ? (
                <SoundButton node={value2Elem} />
              ) : value2ElemClass === "PointLight" || value2ElemClass === "DirectionalLight" || value2ElemClass === "SpotLight" ? (
                <LightButton node={value2Elem} />
              ) : value2ElemClass === "Scene" ? (
                <SceneButton node={scene} />
              ) : value2ElemClass === "Effects" ? (
                <EffectsButton node={scene.effects} />
              ) : value2ElemClass === "AnimationGroup" ? (
                <AnimationGroupButton node={value2Elem} />
              ) : value2ElemClass === "Variable" ? (
                <VariableButton node={value2Elem} />
              ) : null}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: "100%" }}>{NodeField(value2Elem, node.operation.value2.sourceKey, value2ElemProps[node.operation.value2.sourceKey])}</div>

              <Button
                onClick={() => onRemoveLink("value2")}
                variant="outlined"
                style={{ color: theme.palette.text.primary, borderColor: theme.palette.text.primary, width: "1.6em" }}
                className="functionButton"
              >
                <span className="material-symbols-outlined">link_off</span>
              </Button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <>
              <NumberInput
                label="Value"
                type="number"
                value={node.operation.value2}
                onBlur={(e) => setStaticValue(Number(e.target.value), "value2")}
                style={{ width: "100%" }}
              />
              <Button
                onClick={(e) => onActivateLink(e, "value2")}
                variant="outlined"
                style={{ color: theme.palette.text.primary, borderColor: theme.palette.text.primary, width: "1.6em" }}
                className="functionButton"
              >
                <span className="material-symbols-outlined">link</span>
              </Button>
            </>
          </div>
        )}
      </div>
    </div>
  );
};

export default Math;
