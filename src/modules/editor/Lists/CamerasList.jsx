import React from "react";

import { useTheme } from "@mui/material";
import { useCurrentScene, useIsMappingActive, useMappingFieldTypes, useUpdateMappingSource } from "../../../badProvider/functions";
import { groupBy } from "../../../helpers";
import { CameraButton } from "../Buttons/CameraButton";

export const CamerasList = (props) => {
  const theme = useTheme();

  const scene = useCurrentScene();
  const isMappingActive = useIsMappingActive();
  const mappingFieldTypes = useMappingFieldTypes();
  const updateMappingSource = useUpdateMappingSource();
  const MakeTree = (parentNode, nodes) => {
    const groups = groupBy(nodes, (node) => {
      return node.getClassName();
    });

    return Object.entries(groups).map(([type, group], i) => {
      return (
        <div className="list cameras" key={i}>
          <div className="sublistHeader" style={{ borderColor: theme.palette.violet.main, color: theme.palette.violet.main }}>
            {type === "ArcRotateCamera" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                360
              </span>
            ) : type === "UniversalCamera" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                photo_camera
              </span>
            ) : null}
            {type === "ArcRotateCamera" && "Orbit"}
            {type === "UniversalCamera" && "First Person"}
          </div>
          <div className="sublistGroup">
            {group.map((node, i) => {
              if (node === null) {
                return null;
              }
              if (props.search && node.displayName && !node.displayName.toLowerCase().includes(props.search)) {
                return null;
              }
              return (
                <div key={i} style={{ display: "flex", overflow: "hidden" }}>
                  <button
                    onClick={() => {
                      const canvas = scene.getEngine().getRenderingCanvas();

                      scene.cameras.forEach((cam, i) => {
                        cam.detachControl(canvas);
                      });
                      node.attachControl(canvas, true);
                      scene.activeCamera = node;
                      // if (!node.hasOwnProperty("badChanges")) {
                      //   node.badChanges = {};
                      // }

                      if (node.getClassName() === "ArcRotateCamera") {
                        if (node.badChanges) {
                          if (node.badChanges.alpha) {
                            node.alpha = node.badChanges.alpha;
                          }
                          if (node.badChanges.beta) {
                            node.beta = node.badChanges.beta;
                          }
                          if (node.badChanges.radius) {
                            node.radius = node.badChanges.radius;
                          }
                        } else if (scene.sceneData.cameras[node.name]) {
                          if (scene.sceneData.cameras[node.name].alpha) {
                            node.alpha = scene.sceneData.cameras[node.name].alpha;
                          }
                          if (scene.sceneData.cameras[node.name].beta) {
                            node.beta = scene.sceneData.cameras[node.name].beta;
                          }
                          if (scene.sceneData.cameras[node.name].radius) {
                            node.radius = scene.sceneData.cameras[node.name].radius;
                          }
                        }
                      }

                      if (node.getClassName() === "UniversalCamera") {
                        if (node.badChanges) {
                          if (node.badChanges.position) {
                            node.position = node.badChanges.position;
                          }
                          if (node.badChanges.target) {
                            node.target = node.badChanges.target;
                          }
                        } else if (scene.sceneData.cameras[node.name]) {
                          if (scene.sceneData.cameras[node.name].position) {
                            node.position = scene.sceneData.cameras[node.name].position;
                          }
                          if (scene.sceneData.cameras[node.name].target) {
                            node.target = scene.sceneData.cameras[node.name].target;
                          }
                        }
                      }
                      if (isMappingActive && mappingFieldTypes.includes("boolean")) {
                        updateMappingSource({ node: node, value: null, valueType: "FunctionButton", key: "activate", label: "Activate" });
                      }

                      scene.forceUpdate();
                    }}
                    style={{
                      flexShrink: 0,
                      height: "1.6em",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "1.6em",
                      background: isMappingActive && mappingFieldTypes.includes("boolean") ? "#bbda5580" : "",
                    }}
                  >
                    {scene.activeCamera.name === node.name ? (
                      <span className="material-symbols-outlined" style={{ color: "" }}>
                        visibility
                      </span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ color: "#f44336" }}>
                        visibility_off
                      </span>
                    )}
                  </button>
                  <CameraButton node={node} />
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };
  return props.nodes && Object.values(props.nodes).length
    ? MakeTree(
        null,
        Object.values(props.nodes).sort(function (a, b) {
          var textA = a.displayName.toLowerCase() || a.name.toLowerCase();
          var textB = b.displayName.toLowerCase() || b.name.toLowerCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        })
      )
    : null;
};
