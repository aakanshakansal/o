import React from "react";
import { TextureButton } from "../Buttons/TextureButton";

import { useTheme } from "@mui/material";

import { groupBy } from "../../../helpers";

export const TexturesList = (props) => {
  const theme = useTheme();
  const MakeTree = (parentNode, nodes) => {
    const groups = groupBy(nodes, (node) => {
      return node.getClassName();
    });

    return Object.entries(groups).map(([type, group], i) => {
      return (
        <div className="list textures" key={i}>
          <div className="sublistHeader" style={{ borderColor: theme.palette.orange.main, color: theme.palette.orange.main }}>
            {type === "Texture" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                texture
              </span>
            ) : type === "VideoTexture" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                smart_display
              </span>
            ) : type === "HDRCubeTexture" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                deployed_code
              </span>
            ) : type === "CubeTexture" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                deployed_code
              </span>
            ) : type === "ColorGradingTexture" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                gradient
              </span>
            ) : type === "DynamicTexture" ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                text_fields
              </span>
            ) : null}

            {type === "Texture" && "Texture"}
            {type === "VideoTexture" && "Video"}
            {type === "DynamicTexture" && "Dynamic"}
            {type === "CubeTexture" && "Cube"}

            {type === "ColorGradingTexture" && "Color Grading"}
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
                <div key={i}>
                  <TextureButton node={node} />
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
          var textA = a.displayName?.toLowerCase() || a.name.toLowerCase();
          var textB = b.displayName?.toLowerCase() || b.name.toLowerCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        })
      )
    : null;
};
