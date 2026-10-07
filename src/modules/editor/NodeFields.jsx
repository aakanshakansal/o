import React, { Fragment, useState } from "react";

import {
  PBRMaterialProps,
  actionProps,
  animationGroupProps,
  arcRotateCameraProps,
  collectionProps,
  colorGradingtextureProps,
  controlNodeProps,
  cubeTextureProps,
  diamondMaterialProps,
  directionalLightProps,
  dynamicTextureProps,
  effectsProps,
  engineProps,
  gSplatProps,
  hemisphericLightProps,
  meshProps,
  photoDomeProps,
  pointLightProps,
  sceneProps,
  shaderMaterialProps,
  shadowOnlyMaterialProps,
  soundProps,
  spotLightProps,
  textureProps,
  transformNodeProps,
  transmissionMaterialProps,
  universalCameraProps,
  variableProps,
  videoTextureProps,
} from "../../nodesProps";
import NodeField from "./NodeField";

import { useTheme } from "@mui/material";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Handle, Position } from "reactflow";
import { useEditorState } from "../../badProvider/functions";

function transformGroupObject(originalObject) {
  const transformedObject = {};

  for (const prop in originalObject) {
    const group = originalObject[prop].group;
    const subGroup = originalObject[prop].subGroup || "default"; // Use "default" if subGroup is not defined

    if (!transformedObject[group]) {
      transformedObject[group] = {};
    }

    if (!transformedObject[group][subGroup]) {
      transformedObject[group][subGroup] = {};
    }

    transformedObject[group][subGroup][prop] = originalObject[prop];
  }

  return transformedObject;
}

const Fields = (props) => {
  const theme = useTheme();
  const node = props.node;
  const editorState = useEditorState();
  const [activeGroups, setActiveGroups] = useState(["General"]);
  const [activeSubGroups, setActiveSubGroups] = useState([]);

  const GroupButtons = (props) => {
    const groups = [];
    Object.entries(props._props).forEach(([k, v], i) => {
      if (v.hasOwnProperty("group") && !groups.includes(v.group)) {
        groups.push(v.group);
      }
    });

    // groups.sort();

    return (
      <Stack direction="row" className="chipGroup" style={{ paddingBottom: "0.5em", flexWrap: "wrap" }}>
        {groups.map((g, i) => {
          return (
            <Chip
              color={props.activeGroups.includes(g) ? "primary" : "default"}
              style={{ margin: "0 4px 4px 0" }}
              key={g}
              label={g}
              size="small"
              className={props.activeGroups.includes(g) ? "active" : ""}
              onClick={() => {
                const groupsArr = props.activeGroups.map((g) => {
                  return g;
                });
                const index = groupsArr.indexOf(g);
                if (index > -1) {
                  groupsArr.splice(index, 1); // 2nd parameter means remove one item only
                } else {
                  groupsArr.push(g);
                }

                props.setActiveGroups(groupsArr);
              }}
            />
          );
        })}
      </Stack>
    );
  };

  const Accordions = (props) => {
    const groups = transformGroupObject(props._props);

    return Object.entries(groups).map(([groupName, subGroups], i) => {
      if (groupName === "undefined") {
        return Object.entries(subGroups.default).map(([k, v], i) => {
          if (editorState === "essentials" && !v.showInEssentials) return null;
          if (editorState !== "essentials" && v.hideInNode) return null;
          return <Fragment key={k}>{NodeField(node, k, v)}</Fragment>;
        });
      } else {
        let render = false;
        if (editorState === "essentials") {
          const hasEssentials = Object.values(subGroups.default).some((prop) => prop.showInEssentials === true);

          render = hasEssentials;
        } else {
          render = true;
        }

        if (!render) return null;
        return (
          <div
            key={groupName}
            id={node.name + groupName.replace(/\s/g, "")}
            style={
              props.activeGroups.includes(groupName)
                ? {
                    width: "100%",
                    padding: "0em",
                    // minHeight: "2em",

                    margin: "0.5em 0",
                    // padding: "0.5em 0",
                    backgroundColor: theme.palette.background.grey,
                    borderRadius: "0.5em",
                    //  borderTop: "solid 1px " + theme.palette.border.main,
                  }
                : {
                    width: "100%",

                    // minHeight: "2em",

                    padding: "0",
                    backgroundColor: theme.palette.background.default,
                    borderRadius: "0.5em",
                    //   borderTop: "solid 1px " + theme.palette.border.main,
                  }
            }
          >
            <div
              style={
                props.activeGroups.includes(groupName)
                  ? {
                      position: "relative",
                      height: "2em",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      padding: "0 0.5em",
                      backgroundColor: theme.palette.background.dark,
                      //  marginBottom: "1em",
                      overflow: "hidden",
                      borderRadius: "0.5em 0.5em 0 0",
                    }
                  : {
                      position: "relative",
                      height: "1.6em",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      padding: "0 0.5em",
                      //  overflow: "hidden",
                      borderRadius: "0.5em 0.5em 0 0",
                    }
              }
              onClick={() => {
                const accArr = [...props.activeGroups];
                const index = accArr.indexOf(groupName);
                if (index > -1) {
                  accArr.splice(index, 1); // 2nd parameter means remove one item only
                } else {
                  accArr.push(groupName);
                }

                props.setActiveGroups(accArr);
              }}
            >
              {!props.activeGroups.includes(groupName)
                ? Object.entries(subGroups.default).map(([k, v], i) => {
                    if (v.handle !== undefined && editorState !== "essentials") {
                      return (
                        <Handle
                          key={k}
                          style={{ zIndex: 1, pointerEvents: "none", background: "#ff9800", left: "-0.5em", height: "0.5em", width: "0.5em", border: "none" }}
                          onClick={(e) => {}}
                          onConnect={(e) => {}}
                          className={""}
                          type="target"
                          id={k}
                          position={Position.Left}
                        />
                      );
                    } else {
                      return null;
                    }
                  })
                : null}

              <strong>{groupName}</strong>
              {props.activeGroups.includes(groupName) ? (
                <span className="material-symbols-outlined">expand_more</span>
              ) : (
                <span className="material-symbols-outlined">chevron_right</span>
              )}
            </div>
            {props.activeGroups.includes(groupName) ? (
              <div
                key={groupName}
                style={{
                  padding: "0.5em",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {Object.entries(subGroups).map(([subGroupName, subGroupProps], i) => {
                  return (
                    <>
                      <div key={subGroupName}>
                        {subGroupName !== "default" && (
                          <div
                            key={subGroupName}
                            id={node.name + subGroupName.replace(/\s/g, "")}
                            style={
                              props.activeSubGroups.includes(subGroupName)
                                ? {
                                    width: "100%",
                                    height: "1.6em",
                                    padding: "0 0.5em",
                                    backgroundColor: theme.palette.background.dark,
                                    borderRadius: "0.5em 0.5em 0 0",
                                    // minHeight: "2em",
                                    margin: "0.5em 0 0.5em 0",
                                  }
                                : {
                                    width: "100%",
                                    height: "1.6em",
                                    padding: "0 0.5em",
                                    // minHeight: "2em",
                                    margin: "0.5em 0 0.5em 0",
                                    backgroundColor: theme.palette.background.default,
                                    // borderRadius: "0.5em",
                                    borderRadius: "0.5em",
                                  }
                            }
                          >
                            <div
                              style={{
                                height: "1.6em",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                const subAccArr = [...props.activeSubGroups];
                                const index = subAccArr.indexOf(subGroupName);
                                if (index > -1) {
                                  subAccArr.splice(index, 1);
                                } else {
                                  subAccArr.push(subGroupName);
                                }

                                props.setActiveSubGroups(subAccArr);
                              }}
                            >
                              <strong>{subGroupName}</strong>
                              {props.activeSubGroups.includes(subGroupName) ? (
                                <span className="material-symbols-outlined">expand_more</span>
                              ) : (
                                <span className="material-symbols-outlined">chevron_right</span>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="nodeInner" style={{ padding: 0 }}>
                          {props.activeSubGroups.includes(subGroupName) || subGroupName === "default"
                            ? Object.entries(subGroupProps).map(([k, v], i) => {
                                return <Fragment key={k}>{NodeField(node, k, v)}</Fragment>;
                              })
                            : null}
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      }
    });
  };

  if (typeof node.getClassName !== "function") {
    return null;
  }

  // CHIPS TEMPLATE
  //   <Fragment key={node.getClassName()}>
  //   <GroupButtons _props={effectsProps} activeGroups={activeGroups} setActiveGroups={(g) => setActiveGroups(g)} />
  //   {Object.entries(effectsProps).map(([k, v], i) => {
  //     if (v.hasOwnProperty("group") && !activeGroups.includes(v.group)) {
  //       return null;
  //     }
  //     return <Fragment key={k}>{NodeField(node, k, v)}</Fragment>;
  //   })}
  // </Fragment>
  return node.getClassName() === "ArcRotateCamera" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={arcRotateCameraProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "UniversalCamera" || node.getClassName() === "FreeCamera" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={universalCameraProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "Effects" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={effectsProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "ThinEngine" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={engineProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "PointLight" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={pointLightProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "DirectionalLight" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={directionalLightProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "HemisphericLight" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={hemisphericLightProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "SpotLight" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={spotLightProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "PBRMaterial" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={PBRMaterialProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "ShaderMaterial" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={shaderMaterialProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "TransmissionMaterial" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={transmissionMaterialProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "DiamondMaterial" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={diamondMaterialProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "ShadowOnlyMaterial" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={shadowOnlyMaterialProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "TransformNode" || node.getClassName() === "InstancedMesh" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={transformNodeProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "PhotoDome" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={photoDomeProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "Mesh" && node.isAsset && typeof node.getDescendants === "function" && node.getDescendants(true).length ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={transformNodeProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "Mesh" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={meshProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "GSplat" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={gSplatProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "3DText" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={meshProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "Scene" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={sceneProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "Sound" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={soundProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "Texture" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={textureProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "DynamicTexture" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={dynamicTextureProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "CubeTexture" || node.getClassName() === "HDRCubeTexture" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={cubeTextureProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "ColorGradingTexture" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={colorGradingtextureProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "VideoTexture" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={videoTextureProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "AnimationGroup" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={animationGroupProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "Variable" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={variableProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "Action" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={actionProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "ControlNode" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={controlNodeProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : node.getClassName() === "Collection" ? (
    <Fragment key={node.getClassName()}>
      <Accordions
        _props={collectionProps}
        node={node}
        activeGroups={activeGroups}
        setActiveGroups={(a) => setActiveGroups(a)}
        activeSubGroups={activeSubGroups}
        setActiveSubGroups={setActiveSubGroups}
      />
    </Fragment>
  ) : null;
};

export default Fields;
