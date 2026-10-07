import { Button, MenuItem, Select, Slider, Switch, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Circ } from "../../../../assets/ease/Circ";
import { Cubic } from "../../../../assets/ease/Cubic";
import { EaseIn } from "../../../../assets/ease/EaseIn";
import { EaseInOut } from "../../../../assets/ease/EaseInOut";
import { EaseLinear } from "../../../../assets/ease/EaseLinear";
import { EaseNone } from "../../../../assets/ease/EaseNone";
import { EaseOut } from "../../../../assets/ease/EaseOut";
import { Quad } from "../../../../assets/ease/Quad";
import { Quart } from "../../../../assets/ease/Quart";
import { Quint } from "../../../../assets/ease/Quint";
import { Sine } from "../../../../assets/ease/Sine";
import {
  useCurrentScene,
  useIsMappingActive,
  useMappingSource,
  useMappingTarget,
  useMappingTargetFrame,
  useResetMapping,
  useUpdateIsMappingActive,
  useUpdateMappingFieldTypes,
  useUpdateMappingSource,
  useUpdateMappingTarget,
  useUpdateMappingTargetFrame,
} from "../../../../badProvider/functions";
import { getSceneElementByName, getSceneElementPropsByName } from "../../../../helpers";
import { actionsDispatcher } from "../../../../sceneFunctions/actionDispatcher";
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

const Animate = (props) => {
  const theme = useTheme();
  const scene = useCurrentScene();

  const isMappingActive = useIsMappingActive();
  const updateIsMappingActive = useUpdateIsMappingActive();
  const mappingSource = useMappingSource();
  const updateMappingSource = useUpdateMappingSource();
  const mappingTarget = useMappingTarget();
  const updateMappingTarget = useUpdateMappingTarget();
  const mappingTargetFrame = useMappingTargetFrame();

  const updateMappingTargetFrame = useUpdateMappingTargetFrame();
  const updateMappingFieldTypes = useUpdateMappingFieldTypes();
  const resetMapping = useResetMapping();
  const node = props.node;
  const [update, setUpdate] = useState(false);

  const [duration, setDuration] = useState(node.duration || 250);
  const [fps, setFps] = useState(node.fps || 60);

  Object.keys(node.nodes).forEach((nodeName) => {
    if (!getSceneElementByName(scene, nodeName)) {
      return delete node.nodes[nodeName];
    }
  });

  const reset = () => {
    resetMapping();
  };

  const onDurationChange = (val) => {
    if (val) {
      node.duration = val;
      setDuration(val);
    } else {
      node.duration = 250;
      setDuration(250);
    }
  };

  const onFpsChange = (val) => {
    if (val) {
      node.fps = val;
      setFps(val);
    } else {
      node.fps = 60;
      setFps(60);
    }
  };

  const onNodeRemove = (nodeName) => {
    delete node.nodes[nodeName];
    setUpdate(!update);
  };

  const onPropRemove = (nodeName, key) => {
    const isConfirmed = confirm("Are you sure you want to delete this property?");
    if (isConfirmed) {
      delete node.nodes[nodeName].props[key];
      setUpdate(!update);
    }
  };

  const onKeyFrameRemove = (parent, k) => {
    delete parent[k];
    setUpdate(!update);
  };

  const onFrameInputClick = () => {
    return;
    // resetMapping();
  };

  const onFrameChange = (val) => {
    updateMappingTargetFrame(parseInt(val || 0));
    // updateMappingTarget(node);

    actionsDispatcher(scene, node, { goToFrame: parseInt(val || 0) });
  };

  const onFrameClick = (val) => {
    updateMappingTargetFrame(parseInt(val || 0));
    //     updateMappingTarget(node);

    actionsDispatcher(scene, node, { goToFrame: parseInt(val || 0) });
  };

  const toggleMapping = (e) => {
    if (isMappingActive) {
      reset();
    } else {
      updateMappingTarget(node);

      updateIsMappingActive(true);
      updateMappingFieldTypes(["boolean", "number", "material", "texture", "range", "select", "color", "button"]);
    }
  };

  if (isMappingActive && mappingSource && node && node.name === mappingTarget.name) {
    const source = mappingSource;
    const sourceNode = source.node;
    const sourceKey = source.key;
    const sourceValue = source.value;
    // const sourceValueType = source.valueType;
    // const sourceLabel = source.label;

    if (!node.nodes.hasOwnProperty(sourceNode.name)) {
      node.nodes[sourceNode.name] = { nodeType: sourceNode.getClassName(), props: {} };
    }

    if (!node.nodes[sourceNode.name].props.hasOwnProperty(sourceKey)) {
      node.nodes[sourceNode.name].props[sourceKey] = {
        // label: sourceLabel,
        // valueType: sourceValueType,
        keyFrames: {},
      };
    }

    node.nodes[sourceNode.name].props[sourceKey].keyFrames[mappingTargetFrame || 0] = { value: sourceValue };

    updateMappingSource(null);
  }

  const reverseAnimation = (prop) => {
    prop.inverted = !prop.inverted;

    const reversedKeyFrames = {};

    const keys = Object.keys(prop.keyFrames);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = prop.keyFrames[key].value;
      const reversedKey = keys[keys.length - 1 - i];
      reversedKeyFrames[reversedKey] = { value };
    }

    scene.forceUpdate();

    return (prop.keyFrames = reversedKeyFrames);
  };

  useEffect(() => {
    updateMappingTargetFrame(0);
    return () => {
      actionsDispatcher(scene, node, { goToFrame: 0, preventLog: true });
      reset();
    };
  }, []);

  const Switcher = (props) => {
    const nodeName = props.nodeName;
    return (
      <Select
        sx={{ backgroundColor: theme.palette.background.light }}
        defaultValue={nodeName}
        className="selectIcon "
        style={{ background: "transparent", marginLeft: "0.2em" }}
        onChange={(e) => {
          let props = node.nodes[nodeName];
          node.nodes[e.target.value] = props;

          delete node.nodes[nodeName];
          scene.forceUpdate();
        }}
        renderValue={(value) => {
          return (
            <span style={{ lineHeight: "1.6em" }} className="material-symbols-outlined">
              magic_exchange
            </span>
          );
        }}
      >
        {props.resource.map((elem) => {
          return (
            <MenuItem key={elem.name} value={elem.name}>
              {elem.displayName || elem.name}
            </MenuItem>
          );
        })}
      </Select>
    );
  };

  return (
    <div className="nowheel" style={{ overflow: "hidden auto", minHeight: "60px", paddingRight: "1em", resize: "both", minWidth: "760px" }}>
      <div className="field" style={{ width: "360px", marginTop: "0.5em" }}>
        {NodeField(node, "trackEvent", {
          type: "Boolean",
          label: "Track Event",
        })}
      </div>

      <div style={{ position: "absolute", top: "5em", right: "0.5em", display: "flex", gap: "1em" }}>
        <div className="field Boolean" style={{ width: "170px", justifyContent: "flex-end" }}>
          <span style={{ color: theme.palette.text.primary }}>{isMappingActive && node.name === mappingTarget.name ? "Mapping Active" : "Map Properties"}</span>
          <Switch
            size="small"
            className="mappingSwitch"
            checked={isMappingActive && node.name === mappingTarget.name}
            onChange={(e) => {
              toggleMapping();
            }}
          ></Switch>
        </div>
      </div>
      <div
        className="field durationInput"
        style={{ width: "100%", justifyContent: "flex-end", display: "flex", alignItems: "center", gap: "1em", marginTop: "1em" }}
      >
        <NumberInput
          disableDrag="true"
          style={{ width: "360px" }}
          label={
            <span>
              Duration (frames) <span style={{ flexShrink: 0, opacity: 0.5 }}>{(duration / 60).toFixed(2)} s</span>
            </span>
          }
          value={duration}
          type="number"
          onBlur={(e) => onDurationChange(e.target.value)}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <div style={{ width: "360px", flexShrink: 0 }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "0", marginTop: "1em", width: "100%" }}>
          <span
            style={{
              display: "flex",
              position: "relative",
              height: "1.6em",
              alignItems: "center",
              width: "64px",
              border: "1px solid " + theme.palette.border.main,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.main,
              borderRadius: "0.5em",
              overflow: "hidden",
              flexShrink: 0,
              ...props.style,
            }}
          >
            <input
              className="frameInput"
              style={{ width: "100%", height: "100%", textAlign: "right", padding: "0 1em 0 1em", background: "none", color: theme.palette.text.default }}
              type="number"
              value={mappingTargetFrame || 0}
              onClick={onFrameInputClick}
              onChange={(e) => onFrameChange(e.target.value)}
            ></input>
          </span>

          <div className="field" style={{ width: "100%", display: "flex", alignItems: "center", flexWrap: "wrap", paddingLeft: " 1.6em", flexShrink: 0 }}>
            <Slider
              className="frameSlider"
              track={false}
              step={1}
              style={{ width: "100%" }}
              // slots={{
              //   thumb: () => <div className="MuiSlider-thumb"></div>,
              // }}
              valueLabelFormat={(value) => <div>{value}</div>}
              valueLabelDisplay="auto"
              size="small"
              value={mappingTargetFrame || 0}
              onChange={(e) => onFrameChange(e.target.value)}
              min={0}
              max={parseInt(duration)}
            />
          </div>
        </div>
      </div>
      {Object.keys(node.nodes).length ? (
        <div className="animateRows">
          {Object.entries(node.nodes)
            .reverse()
            .map(([nodeName, data]) => {
              let elem;
              let elemProps;
              let elemClass;
              if (getSceneElementByName(scene, nodeName) && getSceneElementPropsByName(scene, nodeName)) {
                elem = getSceneElementByName(scene, nodeName);
                elemProps = getSceneElementPropsByName(scene, nodeName);
                elemClass = elem.getClassName();
              }
              const borderColor =
                elemClass === "PBRMaterial" || elemClass === "ShadowOnlyMaterial" || elemClass === "TransmissionMaterial" || elemClass === "DiamondMaterial"
                  ? theme.palette.green.main
                  : elemClass === "Mesh" || elemClass === "TransformNode" || elemClass === "PhotoDome"
                  ? theme.palette.turquoise.main
                  : elemClass === "ArcRotateCamera" || elemClass === "UniversalCamera"
                  ? theme.palette.violet.main
                  : elemClass === "Texture" || elemClass === "CubeTexture" || elemClass === "HDRCubeTexture" || elemClass === "VideoTexture"
                  ? theme.palette.orange.main
                  : elemClass === "Sound"
                  ? theme.palette.blue.main
                  : elemClass === "PointLight" || elemClass === "DirectionalLight" || elemClass === "SpotLight" || elemClass === "HemisphericLight"
                  ? theme.palette.yellow.main
                  : theme.palette.text.primary;

              return (
                <div
                  key={nodeName}
                  className="animateRow"
                  style={{
                    borderColor: borderColor,
                  }}
                >
                  <div
                    className="animateNodeButton"
                    style={{
                      borderColor: borderColor,
                    }}
                  >
                    {isMappingActive && node.name === mappingTarget.name ? (
                      <ButtonCircleRemove style={{ marginLeft: "0.5em" }} onClick={() => onNodeRemove(nodeName)} />
                    ) : null}
                    {elemClass === "PBRMaterial" ||
                    elemClass === "ShadowOnlyMaterial" ||
                    elemClass === "TransmissionMaterial" ||
                    elemClass === "DiamondMaterial" ? (
                      <>
                        <MaterialButton node={scene.getMaterialByName(nodeName)} /> <Switcher nodeName={nodeName} resource={scene.materials} />
                      </>
                    ) : elemClass === "TransformNode" || elemClass === "PhotoDome" ? (
                      <>
                        <MeshButton node={scene.getTransformNodeByName(nodeName)} />
                        <Switcher nodeName={nodeName} resource={scene.transformNodes} />
                      </>
                    ) : elemClass === "Mesh" ? (
                      <>
                        <MeshButton node={scene.getMeshByName(nodeName)} />
                        <Switcher nodeName={nodeName} resource={scene.meshes} />
                      </>
                    ) : elemClass === "ArcRotateCamera" || elemClass === "UniversalCamera" ? (
                      <>
                        <CameraButton node={scene.getCameraByName(nodeName)} />

                        <Switcher nodeName={nodeName} resource={scene.cameras} />
                      </>
                    ) : elemClass === "Texture" || elemClass === "CubeTexture" || elemClass === "HDRCubeTexture" || elemClass === "VideoTexture" ? (
                      <>
                        <TextureButton node={scene.getTextureByName(nodeName)} />
                        <Switcher nodeName={nodeName} resource={scene.textures} />
                      </>
                    ) : elemClass === "Sound" ? (
                      <>
                        <SoundButton node={scene.getSoundByName(nodeName)} />
                        <Switcher nodeName={nodeName} resource={scene.mainSoundTrack.soundCollection} />
                      </>
                    ) : elemClass === "PointLight" || elemClass === "DirectionalLight" || elemClass === "SpotLight" ? (
                      <>
                        <LightButton node={scene.getLightByName(nodeName)} />
                        <Switcher nodeName={nodeName} resource={scene.lights} />
                      </>
                    ) : elemClass === "Scene" ? (
                      <SceneButton node={scene} />
                    ) : elemClass === "Effects" ? (
                      <EffectsButton node={scene.effects} />
                    ) : elemClass === "AnimationGroup" ? (
                      <>
                        <AnimationGroupButton node={scene.getAnimationGroupByName(nodeName)} />
                        <Switcher nodeName={nodeName} resource={scene.animationGroups} />
                      </>
                    ) : elemClass === "Variable" ? (
                      <>
                        <VariableButton node={elem} />
                      </>
                    ) : null}
                  </div>
                  {Object.entries(data.props)
                    .reverse()
                    .map(([key, prop]) => {
                      // console.log(elemProps);
                      if (elemProps[key]) {
                        return (
                          <div className="animateRowSettings" key={nodeName + key}>
                            <div style={{ width: "360px", display: "flex", alignItems: "center", flexShrink: 0 }}>
                              {isMappingActive && node.name === mappingTarget.name ? (
                                <ButtonCircleRemove style={{ marginRight: "0.5em" }} onClick={() => onPropRemove(nodeName, key)} />
                              ) : null}
                              <div style={{ width: "100%", pointerEvents: !isMappingActive ? "none" : null, opacity: !isMappingActive ? 0.6 : 1 }}>
                                {NodeField(elem, key, elemProps[key])}
                              </div>

                              <>
                                {node.name &&
                                (elemProps[key].type === "Number" ||
                                  elemProps[key].type === "Range" ||
                                  elemProps[key].type === "Vector3" ||
                                  elemProps[key].type === "Vector2" ||
                                  elemProps[key].type === "Color3") ? (
                                  <>
                                    <Select
                                      sx={{ backgroundColor: theme.palette.background.light }}
                                      displayEmpty
                                      defaultValue={prop.easingFun || "None"}
                                      className="selectIcon"
                                      style={{ marginLeft: "0.5em", flexShrink: 0 }}
                                      onChange={(e) => {
                                        prop.easingFun = e.target.value;
                                      }}
                                      renderValue={(value) => {
                                        if (value === "CircleEase") {
                                          return <Circ />;
                                        } else if (value === "CubicEase") {
                                          return <Cubic />;
                                        } else if (value === "QuadraticEase") {
                                          return <Quad />;
                                        } else if (value === "QuarticEase") {
                                          return <Quart />;
                                        } else if (value === "QuinticEase") {
                                          return <Quint />;
                                        } else if (value === "SineEase") {
                                          return <Sine />;
                                        } else if (value === "BounceEase") {
                                          return <EaseLinear />;
                                        } else if (value === "ElasticEase") {
                                          return <EaseLinear />;
                                        } else {
                                          return <EaseLinear />;
                                        }
                                      }}
                                    >
                                      <MenuItem value="None" key="None">
                                        <EaseLinear /> Linear
                                      </MenuItem>
                                      <MenuItem value="CircleEase" key="CircleEase">
                                        <Circ />
                                        Circle
                                      </MenuItem>
                                      <MenuItem value="CubicEase" key="CubicEase">
                                        <Cubic />
                                        Cubic
                                      </MenuItem>
                                      <MenuItem value="QuadraticEase" key="QuadraticEase">
                                        <Quad />
                                        Quadratic
                                      </MenuItem>
                                      <MenuItem value="QuarticEase" key="QuarticEase">
                                        <Quart />
                                        Quartic
                                      </MenuItem>
                                      <MenuItem value="QuinticEase" key="QuinticEase">
                                        <Quint />
                                        Quintic
                                      </MenuItem>
                                      <MenuItem value="SineEase" key="SineEase">
                                        <Sine />
                                        Sine
                                      </MenuItem>
                                      <MenuItem value="BounceEase" key="BounceEase">
                                        <EaseLinear />
                                        Bounce
                                      </MenuItem>
                                      <MenuItem value="ElasticEase" key="ElasticEase">
                                        <EaseLinear />
                                        Elastic
                                      </MenuItem>
                                    </Select>

                                    <Select
                                      sx={{ backgroundColor: theme.palette.background.light }}
                                      defaultValue={prop.easingMode || "None"}
                                      className="selectIcon"
                                      style={{ marginLeft: "0.5em", flexShrink: 0 }}
                                      onChange={(e) => {
                                        prop.easingMode = e.target.value;
                                      }}
                                      renderValue={(value) => {
                                        if (value === "EASINGMODE_EASEIN") {
                                          return <EaseIn />;
                                        }
                                        if (value === "EASINGMODE_EASEOUT") {
                                          return <EaseOut />;
                                        }

                                        if (value === "EASINGMODE_EASEINOUT") {
                                          return <EaseInOut />;
                                        }

                                        return <EaseNone />;
                                      }}
                                    >
                                      <MenuItem value="None" key="None">
                                        <EaseNone />
                                        None
                                      </MenuItem>
                                      <MenuItem value="EASINGMODE_EASEIN" key="EASINGMODE_EASEIN">
                                        <EaseIn />
                                        In
                                      </MenuItem>
                                      <MenuItem value="EASINGMODE_EASEOUT" key="EASINGMODE_EASEOUT">
                                        <EaseOut />
                                        Out
                                      </MenuItem>
                                      <MenuItem value="EASINGMODE_EASEINOUT" key="EASINGMODE_EASEINOUT">
                                        <EaseInOut />
                                        In Out
                                      </MenuItem>
                                    </Select>
                                  </>
                                ) : (
                                  <div style={{ width: "130px" }}></div>
                                )}
                                <Button
                                  style={{
                                    height: "1.6em",
                                    width: "1.6em",
                                    minWidth: 0,
                                    margin: "0 0.5em",
                                    borderRadius: "1.6em",
                                    background: prop.inverted ? theme.palette.primary.main : theme.palette.default.main,
                                    color: prop.inverted ? theme.palette.default.main : theme.palette.light.main,
                                    flexShrink: 0,
                                  }}
                                  onClick={() => {
                                    reverseAnimation(prop);

                                    toast.success("Animation inverted");
                                  }}
                                >
                                  <span className="material-symbols-outlined">{prop.inverted ? "arrow_back" : "arrow_forward"}</span>
                                </Button>
                              </>
                            </div>

                            <div className="keyFrames">
                              <Slider
                                className=""
                                track={false}
                                disableSwap
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => (
                                  <div>
                                    <div className="keyFrameInner">
                                      <ButtonCircleRemove
                                        style={{ marginTop: "-1em" }}
                                        onClick={() => {
                                          onKeyFrameRemove(prop.keyFrames, value);
                                        }}
                                      />

                                      {value}
                                    </div>
                                  </div>
                                )}
                                style={{ width: "100%", background: "rgba(0,0,0,0.1)" }}
                                step={1}
                                sx={{
                                  "& .MuiSlider-thumb": {
                                    transition: "none",
                                  },
                                  "& .MuiSlider-track": {
                                    transition: "none",
                                  },
                                  "& .MuiSlider-rail": {
                                    transition: "none",
                                  },
                                }}
                                size="small"
                                value={Object.keys(prop.keyFrames).map((frame) => {
                                  return parseInt(frame);
                                })}
                                onChange={(e, values, activeThumb) => {
                                  const newFrames = {};

                                  if (values[activeThumb - 1] || (values[activeThumb - 1] === 0 && values[activeThumb - 1] === values[activeThumb])) {
                                    values[activeThumb] = values[activeThumb] + 1;
                                  }

                                  if (values[activeThumb + 1] && values[activeThumb + 1] === values[activeThumb]) {
                                    values[activeThumb] = values[activeThumb] - 1;
                                  }

                                  values.forEach((newFrame, i) => {
                                    newFrames[newFrame] = Object.values(prop.keyFrames)[i];
                                  });

                                  prop.keyFrames = newFrames;
                                  setUpdate(!update);
                                  onFrameChange(values[activeThumb]);
                                }}
                                min={0}
                                max={parseInt(duration)}
                              />
                            </div>
                          </div>
                        );
                      } else return "null";
                    })}
                </div>
              );
            })}
        </div>
      ) : null}
    </div>
  );
};

export default Animate;
