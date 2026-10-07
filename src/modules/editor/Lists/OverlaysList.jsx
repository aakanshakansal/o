import React, { useEffect, useRef, useState } from "react";

import { OverlayButton } from "../Buttons/OverlayButton";

import { useTheme } from "@mui/material";
import { useCurrentScene } from "../../../badProvider/functions";

export function OverlaysList(props) {
  const theme = useTheme();

  const scene = useCurrentScene();

  const [items, setItems] = useState(Object.values(props.nodes));

  const dragItem = useRef();
  const dragOverItem = useRef();
  useEffect(() => {
    let newObj = {};
    items.forEach((elem) => {
      newObj[elem.name] = elem;
    });

    scene.overlays = newObj;
    scene.forceUpdate();
  }, [items]);

  const dragStart = (index) => {
    dragItem.current = index;
  };

  const dragEnter = (index) => {
    dragOverItem.current = index;
  };

  const drop = () => {
    const copyListItems = [...items];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setItems(copyListItems);
  };

  const SortableItem = ({ node, index }) => {
    return (
      <div
        id={node.name}
        style={{
          background: theme.palette.background.dark,
          display: "flex",
          color: theme.palette.text.primary,
          justifyContent: "start",
          alignItems: "center",
          maxWidth: "100%",
          height: "1.6em",
          zIndex: "1",
        }}
        onDragStart={() => dragStart(index)}
        onDragEnter={() => dragEnter(index)}
        onDragEnd={() => drop()}
        draggable
      >
        <span className="material-symbols-outlined" style={{ cursor: "pointer", paddingRight: "0.25em" }}>
          drag_indicator
        </span>
        <button
          onClick={() => {
            node.enabled = !node.enabled;
            scene.forceUpdate();
          }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "1.6em", cursor: "pointer" }}
        >
          {node.enabled ? (
            <span className="material-symbols-outlined">visibility</span>
          ) : (
            <span className="material-symbols-outlined" style={{ color: "#f44336" }}>
              visibility_off
            </span>
          )}
        </button>
        <span style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <OverlayButton node={node} />
        </span>
      </div>
    );
  };

  return items ? (
    <div>
      {Object.values(items).map((node, i) => {
        if (node === null || node === undefined) {
          return null;
        }
        if (props.search && node.displayName && !node.displayName.toLowerCase().includes(props.search)) {
          return null;
        }
        return <SortableItem key={`item-${node.name}`} index={i} node={node} />;
      })}
    </div>
  ) : null;
}
