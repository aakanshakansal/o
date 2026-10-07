import React from "react";
import { LightButton } from "../Buttons/LightButton";

import { useTheme } from "@mui/material";
import { useCurrentScene, useIsMappingActive, useMappingFieldTypes, useUpdateMappingSource } from "../../../badProvider/functions";
import { groupBy } from "../../../helpers";

export const LightsList = (props) => {
  const scene = useCurrentScene();
  const isMappingActive = useIsMappingActive();
  const mappingFieldTypes = useMappingFieldTypes();
  const updateMappingSource = useUpdateMappingSource();
  const theme = useTheme();
  const MakeTree = (parentNode, nodes) => {
    const groups = groupBy(nodes, (node) => {
      return node.getClassName();
    });

    return Object.entries(groups).map(([type, group], i) => {
      return (
        <div className="list lights" key={i}>
          <div className="sublistHeader" style={{ borderColor: theme.palette.yellow.main, color: theme.palette.yellow.main }}>
            {type === "PointLight" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                emoji_objects
              </span>
            ) : type === "DirectionalLight" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                light_mode
              </span>
            ) : type === "SpotLight" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                highlight
              </span>
            ) : type === "HemisphericLight" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                language
              </span>
            ) : null}
            {type === "PointLight" && "Point"}
            {type === "DirectionalLight" && "Directional"}
            {type === "SpotLight" && "Spot"}
            {type === "HemisphericLight" && "Hemispheric"}
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
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <button
                    onClick={() => {
                      node.setEnabled(!node.isEnabled(false));
                      node.enabled = node.isEnabled(false);
                      scene.forceUpdate();
                      if (isMappingActive && mappingFieldTypes.includes("boolean")) {
                        updateMappingSource({
                          node: node,
                          value: Boolean(node.isEnabled(false)),
                          valueType: "String",
                          key: "enabled",
                          label: "Enabled",
                        });
                      } else {
                        if (!node.hasOwnProperty("badChanges")) {
                          node.badChanges = {};
                        }
                        node.badChanges.enabled = node.isEnabled(false);
                      }
                    }}
                    style={{
                      height: "1.6em",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "1.6em",
                      background: isMappingActive && mappingFieldTypes.includes("boolean") ? "#bbda5580" : "",
                      flexShrink: 0,
                    }}
                  >
                    {node.isEnabled(false) ? (
                      <span className="material-symbols-outlined">visibility</span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ color: theme.palette.red.main }}>
                        visibility_off
                      </span>
                    )}
                  </button>

                  <LightButton node={node} />
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
