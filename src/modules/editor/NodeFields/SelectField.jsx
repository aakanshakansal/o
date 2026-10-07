import React, { useEffect } from "react";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import useTheme from "@mui/material/styles/useTheme";
import {
  useCurrentScene,
  useIsMappingActive,
  useMappingFieldTypes,
  useMappingTarget,
  useMappingTargetFrame,
  useUpdateMappingSource,
} from "../../../badProvider/functions";
import { getDeep, setDeep } from "../../../helpers";

const SelectField = (props) => {
  const theme = useTheme();
  const scene = useCurrentScene();
  const mappingTarget = useMappingTarget();
  const mappingTargetFrame = useMappingTargetFrame();
  const mappingFieldTypes = useMappingFieldTypes();
  const isMappingActive = useIsMappingActive();
  const updateMappingSource = useUpdateMappingSource();
  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  const options = typeof opts.options === "function" ? opts.options(scene) : opts.options;

  const val = getDeep(node, key);

  useEffect(() => {});
  const onChange = (e) => {
    const tempE = { target: { value: val } };
    scene.badHistory.push({ fun: () => onChange(tempE) });
    if (isMappingActive && mappingFieldTypes.includes("select")) {
      updateMappingSource({ node: node, value: e.target.value, valueType: opts.type, key: key, label: opts.label || key });
    } else {
      if (!node.hasOwnProperty("badChanges")) {
        node.badChanges = {};
      }
      node.badChanges[key] = e.target.value;
    }

    if (opts.onChange) {
      opts.onChange(e, scene, node, key);
      // return scene.forceUpdate();
    } else {
      setDeep(node, key, e.target.value);
    }
    return scene.forceUpdate();
  };
  return (
    <div title={key} key={key} className={opts.type + " field"}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <span
          style={{
            width: "100%",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            paddingRight: "1em",
          }}
        >
          {opts.label || key}
        </span>

        <Select
          sx={{ backgroundColor: theme.palette.background.light }}
          className={
            isMappingActive && mappingFieldTypes.includes("select")
              ? mappingTarget &&
                mappingTarget.nodes &&
                mappingTarget.nodes.hasOwnProperty(node.name) &&
                mappingTarget.nodes[node.name].props.hasOwnProperty(key) &&
                mappingTarget.nodes[node.name].props[key].keyFrames &&
                mappingTarget.nodes[node.name].props[key].keyFrames.hasOwnProperty(mappingTargetFrame)
                ? "map framed"
                : "map"
              : ""
          }
          style={{ width: "100%", paddingLeft: "0em", height: "1.6em" }}
          value={val}
          onChange={onChange}
        >
          {Object.entries(options).map(([k, v], i) => {
            return (
              <MenuItem key={k} value={k}>
                {v}
              </MenuItem>
            );
          })}
        </Select>
      </div>
    </div>
  );
};

export default SelectField;
