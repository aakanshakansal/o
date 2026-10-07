import { Button, MenuItem, Select, Switch, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { toast } from "sonner";
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
import { getDeep, getSceneElementByName, getSceneElementPropsByName } from "../../../../helpers";
import { actionsDispatcher } from "../../../../sceneFunctions/actionDispatcher";
import { ActionButton } from "../../Buttons/ActionButton";
import { AnimationGroupButton } from "../../Buttons/AnimationGroupButton";
import { CameraButton } from "../../Buttons/CameraButton";
import { LightButton } from "../../Buttons/LightButton";
import { MaterialButton } from "../../Buttons/MaterialButton";
import { MeshButton } from "../../Buttons/MeshButton";
import SceneButton from "../../Buttons/SceneButton";
import { SoundButton } from "../../Buttons/SoundButton";
import { TextureButton } from "../../Buttons/TextureButton";
import { VariableButton } from "../../Buttons/VariableButton";
import { ButtonCircleRemove } from "../../Components/ButtonCircleRemove";
import { NumberInput } from "../../Components/NumberInput";
import { EffectsButton } from "../../Effects";
import NodeField from "../../NodeField";
const Condition = (props) => {
  const scene = useCurrentScene();

  const isMappingActive = useIsMappingActive();
  const updateIsMappingActive = useUpdateIsMappingActive();
  const mappingSource = useMappingSource();
  const updateMappingSource = useUpdateMappingSource();
  const mappingTarget = useMappingTarget();
  const updateMappingTarget = useUpdateMappingTarget();

  const updateMappingFieldTypes = useUpdateMappingFieldTypes();
  const resetMapping = useResetMapping();
  const node = props.node;

  const [showOnTrueRefs, setShowOnTrueRefs] = useState(false);

  const [showOnFalseRefs, setShowOnFalseRefs] = useState(false);

  const reactFlowInstance = useReactFlow();
  // useEffect(() => {
  //   node.elements = elements;
  // }, [elements]);
  const theme = useTheme();

  const [conditions, setConditions] = useState(node.conditions || {});

  const [valToUpdate, setValToUpdate] = useState(null);
  const addCondition = () => {
    setConditions((prevConditions) => {
      const newConditionKey = "Condition_" + Date.now();
      const newConditions = {
        ...prevConditions,
        [newConditionKey]: { value: "", symbol: "equalTo", compareValue: "", andor: "and" },
      };
      node.conditions = newConditions;
      return newConditions;
    });
  };

  const removeCondition = (k) => {
    const isConfirmed = confirm("Are you sure you want to delete this condition?");
    if (isConfirmed) {
      setConditions((prevConditions) => {
        delete prevConditions[k];

        const newConditions = {
          ...prevConditions,
        };
        node.conditions = newConditions;
        reset();
        return newConditions;
      });
    }
  };

  const onSymbolChange = (e, k) => {
    setConditions((prevConditions) => {
      prevConditions[k].symbol = e.target.value;

      const newConditions = {
        ...prevConditions,
      };
      node.conditions = newConditions;
      return newConditions;
    });
  };

  const onAndOrChange = (e, k) => {
    setConditions((prevConditions) => {
      prevConditions[k].andor = e.target.value;

      const newConditions = {
        ...prevConditions,
      };
      node.conditions = newConditions;
      return newConditions;
    });
  };

  const reset = () => {
    setValToUpdate(null);
    resetMapping(null);
  };

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  const onConnect = (e) => {
    return;
  };

  if (isMappingActive && mappingSource && node && node.name === mappingTarget.name && valToUpdate) {
    const source = mappingSource;
    const sourceNode = source.node;
    const sourceKey = source.key;
    const sourceValue = source.value;

    const sourceValueType = source.valueType;
    const sourceLabel = source.label;

    node.conditions[valToUpdate.key][valToUpdate.value] = {};

    node.conditions[valToUpdate.key][valToUpdate.value] = { nodeName: sourceNode.name, sourceKey };

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

  //   const onActivateLink = (node) => {
  //     mappingContext.dispatch({
  //       type: UPDATE_MAPPING_TARGET,
  //       payload: node,
  //     });

  //     mappingContext.dispatch({
  //       type: UPDATE_IS_MAPPING_ACTIVE,
  //       payload: true,
  //     });
  //   };

  const onActivateLink = (e, value, key) => {
    if (isMappingActive) {
      reset();
    } else {
      setValToUpdate({ value, key });

      updateIsMappingActive(true);

      updateMappingTarget(node);

      updateMappingFieldTypes(["boolean", "number", "range"]);
    }
  };

  const onRemoveLink = (value, key) => {
    const isConfirmed = confirm("Are you sure you want to delete this property?");
    if (isConfirmed) {
      setConditions((prevConditions) => {
        prevConditions[key][value] = "";

        const newConditions = {
          ...prevConditions,
        };
        node.conditions = newConditions;
        return newConditions;
      });
    }
  };

  const setStaticValue = (valueToSet, value, key) => {
    setConditions((prevConditions) => {
      prevConditions[key][value] = valueToSet;

      const newConditions = {
        ...prevConditions,
      };
      node.conditions = newConditions;
      return newConditions;
    });
  };

  return (
    <div>
      {Object.entries(conditions).map(([k, v], i) => {
        const valueType = typeof v.value;
        const compareValueType = typeof v.compareValue;

        let valueElem = null;
        let valueElemClass = null;
        let valueElemProps = null;
        let compareValueElemProps = null;
        let compareValueElem = null;
        let compareValueElemClass = null;

        if (valueType === "object") {
          valueElem = getSceneElementByName(scene, v.value.nodeName);
          valueElemProps = valueElem ? getSceneElementPropsByName(scene, v.value.nodeName) : null;
          valueElemClass = valueElemProps ? valueElem.getClassName() : null;
        }

        if (compareValueType === "object") {
          compareValueElem = getSceneElementByName(scene, v.compareValue.nodeName);
          compareValueElemProps = compareValueElem ? getSceneElementPropsByName(scene, v.compareValue.nodeName) : null;
          compareValueElemClass = compareValueElemProps ? compareValueElem.getClassName() : null;
        }

        return (
          <div key={i} className="condition nodeInner" style={{ borderBottom: "solid", marginBottom: "1em" }}>
            {i !== 0 ? (
              <div className="field">
                <Select
                  sx={{ backgroundColor: theme.palette.background.light }}
                  value={v.andor}
                  onChange={(e) => onAndOrChange(e, k)}
                  style={{ width: "100%" }}
                >
                  <MenuItem key="and" value="and">
                    AND
                  </MenuItem>
                  <MenuItem key="or" value="or">
                    OR
                  </MenuItem>
                </Select>
              </div>
            ) : null}

            <div className="field">
              {typeof v.value === "object" && valueElem ? (
                <>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <ButtonCircleRemove onClick={() => removeCondition(k)} />
                    {valueElemClass === "PBRMaterial" ||
                    valueElemClass === "ShadowOnlyMaterial" ||
                    valueElemClass === "TransmissionMaterial" ||
                    valueElemClass === "DiamondMaterial" ? (
                      <MaterialButton node={valueElem} />
                    ) : valueElemClass === "TransformNode" || valueElemClass === "PhotoDome" ? (
                      <MeshButton node={valueElem} />
                    ) : valueElemClass === "Mesh" ? (
                      <MeshButton node={valueElem} />
                    ) : valueElemClass === "ArcRotateCamera" || valueElemClass === "UniversalCamera" ? (
                      <CameraButton node={valueElem} />
                    ) : valueElemClass === "Texture" || valueElemClass === "CubeTexture" || valueElemClass === "VideoTexture" ? (
                      <TextureButton node={valueElem} />
                    ) : valueElemClass === "Sound" ? (
                      <SoundButton node={valueElem} />
                    ) : valueElemClass === "PointLight" || valueElemClass === "DirectionalLight" || valueElemClass === "SpotLight" ? (
                      <LightButton node={valueElem} />
                    ) : valueElemClass === "Scene" ? (
                      <SceneButton node={scene} />
                    ) : valueElemClass === "Effects" ? (
                      <EffectsButton node={scene.effects} />
                    ) : valueElemClass === "AnimationGroup" ? (
                      <AnimationGroupButton node={valueElem} />
                    ) : valueElemClass === "Variable" ? (
                      <VariableButton node={valueElem} />
                    ) : null}
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "100%" }}>{NodeField(valueElem, v.value.sourceKey, valueElemProps[v.value.sourceKey])}</div>

                    <Button
                      onClick={() => onRemoveLink("value", k)}
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
                  <ButtonCircleRemove style={{ marginRight: "0.5em" }} onClick={() => removeCondition(k)} />

                  {valToUpdate?.key === k ? (
                    <Button
                      onClick={(e) => onActivateLink(e, "value", k)}
                      variant="outlined"
                      style={{ color: theme.palette.red.main, borderColor: theme.palette.red.main, width: "100%" }}
                      className="functionButton"
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      onClick={(e) => onActivateLink(e, "value", k)}
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

            {node.conditions[k].value.nodeName ? (
              <div className="field">
                <Select
                  sx={{ backgroundColor: theme.palette.background.light }}
                  value={v.symbol}
                  onChange={(e) => onSymbolChange(e, k)}
                  style={{ width: "100%" }}
                >
                  <MenuItem key="equalTo" value="equalTo">
                    {"="} Equal to
                  </MenuItem>
                  <MenuItem key="notEqualTo" value="notEqualTo">
                    {"≠"} Not Equal to
                  </MenuItem>
                  <MenuItem key="greaterThan" value="greaterThan">
                    {">"} Greater Than
                  </MenuItem>
                  <MenuItem key="lessThan" value="lessThan">
                    {"<"} Less Than
                  </MenuItem>
                </Select>
              </div>
            ) : null}

            <div className="field">
              {typeof v.compareValue === "object" && compareValueElem ? (
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
                    {compareValueElemClass === "PBRMaterial" ||
                    compareValueElemClass === "ShadowOnlyMaterial" ||
                    compareValueElemClass === "TransmissionMaterial" ? (
                      <>
                        <MaterialButton node={compareValueElem} />
                      </>
                    ) : compareValueElemClass === "TransformNode" || compareValueElemClass === "PhotoDome" ? (
                      <>
                        <MeshButton node={compareValueElem} />
                      </>
                    ) : compareValueElemClass === "Mesh" ? (
                      <>
                        <MeshButton node={compareValueElem} />
                      </>
                    ) : compareValueElemClass === "ArcRotateCamera" || compareValueElemClass === "UniversalCamera" ? (
                      <>
                        <CameraButton node={compareValueElem} />
                      </>
                    ) : compareValueElemClass === "Texture" || compareValueElemClass === "CubeTexture" || compareValueElemClass === "VideoTexture" ? (
                      <>
                        <TextureButton node={compareValueElem} />
                      </>
                    ) : compareValueElemClass === "Sound" ? (
                      <>
                        <SoundButton node={compareValueElem} />
                      </>
                    ) : compareValueElemClass === "PointLight" || compareValueElemClass === "DirectionalLight" || compareValueElemClass === "SpotLight" ? (
                      <>
                        <LightButton node={compareValueElem} />
                      </>
                    ) : compareValueElemClass === "Scene" ? (
                      <SceneButton node={scene} />
                    ) : compareValueElemClass === "Effects" ? (
                      <EffectsButton node={scene.effects} />
                    ) : compareValueElemClass === "AnimationGroup" ? (
                      <>
                        <AnimationGroupButton node={compareValueElem} />
                      </>
                    ) : null}
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "100%" }}>
                      {NodeField(compareValueElem, v.compareValue.sourceKey, compareValueElemProps[v.compareValue.sourceKey])}
                    </div>

                    <Button
                      onClick={() => onRemoveLink("compareValue", k)}
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
                  {/* <Button
                    onClick={() => removeCondition(k)}
                    variant="outlined"
                    style={{ color: theme.palette.text.primary, borderColor: theme.palette.text.primary, width: "1.6em" }}
                    className="functionButton"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </Button> */}

                  {typeof getDeep(getSceneElementByName(scene, node.conditions[k].value.nodeName), node.conditions[k].value.sourceKey) === "number" ? (
                    <>
                      <NumberInput
                        label="Value"
                        type="number"
                        value={node.conditions[k].compareValue}
                        onBlur={(e) => setStaticValue(Number(e.target.value), "compareValue", k)}
                        style={{ width: "100%" }}
                      ></NumberInput>
                      <Button
                        onClick={(e) => onActivateLink(e, "compareValue", k)}
                        variant="outlined"
                        style={{ color: theme.palette.text.primary, borderColor: theme.palette.text.primary, width: "1.6em" }}
                        className="functionButton"
                      >
                        <span className="material-symbols-outlined">link</span>
                      </Button>
                    </>
                  ) : typeof getDeep(getSceneElementByName(scene, node.conditions[k].value.nodeName), node.conditions[k].value.sourceKey) === "boolean" ? (
                    <>
                      <Switch
                        size="small"
                        type="checkbox"
                        checked={Boolean(node.conditions[k].compareValue)}
                        onChange={(e) => setStaticValue(e.target.checked, "compareValue", k)}
                      />

                      <Button
                        onClick={(e) => onActivateLink(e, "compareValue", k)}
                        variant="outlined"
                        style={{ color: theme.palette.text.primary, borderColor: theme.palette.text.primary, width: "1.6em" }}
                        className="functionButton"
                      >
                        <span className="material-symbols-outlined">link</span>
                      </Button>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div className="nodeInner">
        <Button
          onClick={() => addCondition()}
          variant="outlined"
          style={{ color: theme.palette.text.primary, borderColor: theme.palette.text.primary }}
          className="functionButton"
        >
          Add Condition
        </Button>

        <div className="referenceHandle">
          {node.trueActions.length ? (
            <div className="references" style={{ backgroundColor: theme.palette.background.default, border: "solid 1px " + theme.palette.border.main }}>
              <div className="referencesTitle" onClick={() => setShowOnTrueRefs(!showOnTrueRefs)}>
                Actions
                {showOnTrueRefs ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )}
              </div>
              {showOnTrueRefs ? (
                <div className="referencesList">
                  {node.trueActions.map((a, i) => {
                    if (scene.actions.hasOwnProperty(a)) {
                      return <ActionButton key={i} node={scene.actions[a]} />;
                    }
                    return null;
                  })}
                </div>
              ) : null}
            </div>
          ) : (
            <div />
          )}

          <div className="handles">
            <Button
              // style={{ background: theme.palette.default.main, color: theme.palette.light.main }}
              onClick={() => {
                node["trueActions"].forEach((a) => {
                  if (scene.actions.hasOwnProperty(a)) {
                    //  console.log("starting", scene.actions[id]);
                    return actionsDispatcher(scene, scene.actions[a]);
                  }
                });
              }}
              className="FunctionButton meshTriggerButton"
            >
              True
            </Button>
            <Handle
              className={" multiple sourceHandle  red "}
              type="source"
              onConnect={(e) => {
                const target = reactFlowInstance.getNode(e.target);
                if (!node["trueActions"].includes(e.target) && target.type === "Action") {
                  return node["trueActions"].push(e.target);
                }
                return toast.error("Bad Connection :(");

                // setUpdate(!update);
              }}
              id={"true"}
              position={Position.Right}
            />
          </div>
        </div>

        <div className="referenceHandle">
          {node.falseActions.length ? (
            <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
              <div className="referencesTitle" onClick={() => setShowOnFalseRefs(!showOnFalseRefs)}>
                Actions
                {showOnFalseRefs ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )}
              </div>
              {showOnFalseRefs ? (
                <div className="referencesList">
                  {node.falseActions.map((a, i) => {
                    if (scene.actions.hasOwnProperty(a)) {
                      return <ActionButton key={i} node={scene.actions[a]} />;
                    }
                    return null;
                  })}
                </div>
              ) : null}
            </div>
          ) : (
            <div />
          )}
          <div className="handles">
            <Button
              // style={{ background: theme.palette.default.main, color: theme.palette.light.main }}
              onClick={() => {
                node["falseActions"].forEach((a) => {
                  if (scene.actions.hasOwnProperty(a)) {
                    //  console.log("starting", scene.actions[id]);
                    return actionsDispatcher(scene, scene.actions[a]);
                  }
                });
              }}
              className="FunctionButton meshTriggerButton"
            >
              False
            </Button>
            <Handle
              className={" multiple sourceHandle  red "}
              type="source"
              onConnect={(e) => {
                const target = reactFlowInstance.getNode(e.target);
                if (!node["falseActions"].includes(e.target) && target.type === "Action") {
                  return node["falseActions"].push(e.target);
                }
                return toast.error("Bad Connection :(");

                // setUpdate(!update);
              }}
              id={"false"}
              position={Position.Right}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Condition;
