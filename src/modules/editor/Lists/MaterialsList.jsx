import React from "react";

import { MaterialButton } from "../Buttons/MaterialButton";

import { useTheme } from "@mui/material";

import { groupBy } from "../../../helpers";

export const MaterialsList = (props) => {
  const theme = useTheme();

  const MakeTree = (parentNode, nodes) => {
    const groups = groupBy(nodes, (node) => {
      return node.getClassName();
    });

    return Object.entries(groups).map(([type, group], i) => {
      return (
        <div className="list materials" key={i}>
          <div className="sublistHeader" style={{ borderColor: theme.palette.green.main, color: theme.palette.green.main }}>
            {type === "PBRMaterial" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                deployed_code
              </span>
            ) : type === "ShadowOnlyMaterial" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                ev_shadow
              </span>
            ) : type === "ShaderMaterial" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                star
              </span>
            ) : type === "TransmissionMaterial" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                sound_detection_glass_break
              </span>
            ) : type === "DiamondMaterial" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                sound_detection_glass_break
              </span>
            ) : null}

            {type === "PBRMaterial" && "PBR"}

            {type === "ShadowOnlyMaterial" && "Shadow Only Material"}

            {type === "ShaderMaterial" && "Shader Material"}
            {type === "TransmissionMaterial" && "Transmission Material"}
          </div>

          <div className="sublistGroup">
            {group.map((node, i) => {
              if (node === null) {
                return null;
              }

              if (node.fromAsset || node.isCustom || node.cloneOf) {
              } else {
                return null;
              }

              if (props.search && node.displayName && !node.displayName.toLowerCase().includes(props.search)) {
                return null;
              }
              return (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <MaterialButton node={node} />
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };
  return props.nodes
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
