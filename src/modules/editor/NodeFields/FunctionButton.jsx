import React, { memo, useEffect } from "react";

import Button from "@mui/material/Button";
import {
  useCurrentScene,
  useIsMappingActive,
  useMappingFieldTypes,
  useMappingTarget,
  useMappingTargetFrame,
  useUpdateMappingSource,
} from "../../../badProvider/functions";

const FunctionButton = memo((props) => {
  const scene = useCurrentScene();
  const mappingTarget = useMappingTarget();
  const mappingTargetFrame = useMappingTargetFrame();
  const mappingFieldTypes = useMappingFieldTypes();
  const isMappingActive = useIsMappingActive();
  const updateMappingSource = useUpdateMappingSource();
  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  useEffect(() => {
    if (opts.onMount && typeof opts.onMount === "function") {
      opts.onMount(scene, node);
    }

    return () => {
      if (opts.onUnmount && typeof opts.onUnmount === "function") {
        opts.onUnmount(scene, node);
      }
    };
  }, []);

  return (
    <div id={key} className="field" style={{ display: "flex", alignItems: "center" }}>
      <Button
        style={opts.style}
        className="FunctionButton"
        size="small"
        key={key}
        // className={
        //   isMappingActive && opts.animable && mappingFieldTypes.includes("button")
        //     ? mappingTarget &&
        //       mappingTarget.nodes &&
        //       mappingTarget.nodes.hasOwnProperty(node.name) &&
        //       mappingTarget.nodes[node.name].props.hasOwnProperty(key) &&
        //       mappingTarget.nodes[node.name].props[key].keyFrames &&
        //       mappingTarget.nodes[node.name].props[key].keyFrames.hasOwnProperty(mappingTargetFrame)
        //       ? "FunctionButton map framed"
        //       : "FunctionButton map"
        //     : "FunctionButton"
        // }
        onClick={(e) => {
          if (isMappingActive && opts.animable && mappingFieldTypes.includes("button")) {
            updateMappingSource({ node: node, value: null, valueType: opts.type, key: key, label: opts.label || key });
          } else {
            opts.function(e, scene, node, isMappingActive);
          }
        }}
      >
        {opts.label} {opts.materialIcon && <span className="material-symbols-outlined">{opts.materialIcon}</span>}
      </Button>
      {isMappingActive && mappingFieldTypes.includes("button") ? (
        <button
          key={key + "map"}
          style={{ marginLeft: "0.5em" }}
          onClick={() => updateMappingSource({ node: node, value: null, valueType: opts.type, key: key, label: opts.label || key })}
          className={
            mappingTarget &&
            mappingTarget.nodes &&
            mappingTarget.nodes.hasOwnProperty(node.name) &&
            mappingTarget.nodes[node.name].props.hasOwnProperty(key) &&
            mappingTarget.nodes[node.name].props[key].keyFrames &&
            mappingTarget.nodes[node.name].props[key].keyFrames.hasOwnProperty(mappingTargetFrame)
              ? "mapper framed"
              : "mapper"
          }
        ></button>
      ) : null}
    </div>
  );
});

export default FunctionButton;
