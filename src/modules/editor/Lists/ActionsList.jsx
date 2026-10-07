import React from "react";
import { ActionButton } from "../Buttons/ActionButton";

import { useTheme } from "@mui/material";

import { groupBy } from "../../../helpers";
export function ActionsList(props) {
  const theme = useTheme();

  const MakeTree = (parentNode, nodes) => {
    const groups = groupBy(nodes, "type");

    return Object.entries(groups).map(([type, group], i) => {
      return (
        <div className="list actions" key={i}>
          <div className="sublistHeader" style={{ borderColor: theme.palette.red.main, color: theme.palette.red.main }}>
            {type === "Animate" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  directions_run
                </span>
                Animate
              </>
            ) : type === "Timeline" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  schedule
                </span>
                Timeline
              </>
            ) : type === "Sequencer" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  chevron_right
                </span>
                Sequencer
              </>
            ) : type === "Overlays" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  web_asset
                </span>
                Overlays
              </>
            ) : type === "EnterAR" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  view_in_ar
                </span>
                Enter AR
              </>
            ) : type === "EnterVTO" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  person
                </span>
                Enter VTO
              </>
            ) : type === "ExternalLink" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  link
                </span>
                External Link
              </>
            ) : type === "SaveConfig" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  save
                </span>
                Save Configuration
              </>
            ) : type === "Condition" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  equal
                </span>
                Condition
              </>
            ) : type === "Math" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  functions
                </span>
                Math
              </>
            ) : type === "AddReplace" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  move_down
                </span>
                Add / Replace
              </>
            ) : type === "Screenshot" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  capture
                </span>
                Screenshot
              </>
            ) : type === "ExportScene" ? (
              <>
                <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                  download
                </span>
                Export Scene
              </>
            ) : (
              <span>{type.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
            )}
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
                <div key={i} style={{ display: "flex" }}>
                  <ActionButton node={node} />
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
}
