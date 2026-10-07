import { useTheme } from "@mui/material";
import React from "react";
import { getBezierPath, useReactFlow } from "reactflow";

const foreignObjectSize = 17;

export default function RemoveButtonEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }) {
  const reactFlowInstance = useReactFlow();
  const theme = useTheme();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt, id) => {
    reactFlowInstance.deleteElements({
      edges: [
        {
          id: id,
          type: "removable",
        },
      ],
    });
  };

  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path " d={edgePath} markerEnd={markerEnd} />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={labelX - foreignObjectSize / 2}
        y={labelY - foreignObjectSize / 2}
        className="removeEdgeButton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div>
          <button
            style={{
              cursor: "pointer",
              borderRadius: foreignObjectSize,
              backgroundColor: theme.palette.red.main,
              color: "#ffffff",
              height: foreignObjectSize,
              width: foreignObjectSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={(event) => onEdgeClick(event, id)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </foreignObject>
    </>
  );
}
