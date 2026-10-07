import React from "react";

import { ControlNodeButton } from "../Buttons/ControlNodeButton";

export function ControlNodesList(props) {
  const MakeTree = (parentNode, nodes) => {
    return Object.entries(nodes).map(([key, node], i) => {
      if (node === null) {
        return null;
      }
      if (props.search && node.displayName && !node.displayName.toLowerCase().includes(props.search)) {
        return null;
      }
      return (
        <div key={i}>
          <ControlNodeButton node={node} />
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
