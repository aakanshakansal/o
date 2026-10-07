import React, { useEffect, useState } from "react";

import useTheme from "@mui/material/styles/useTheme";
import { Handle, Position, useEdges } from "reactflow";
import { getDeep, setDeep } from "../../../helpers";

import { Button } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import {
  useCurrentScene,
  useEditorState,
  useIsMappingActive,
  useMappingFieldTypes,
  useMappingTarget,
  useMappingTargetFrame,
  useUpdateMappingSource,
} from "../../../badProvider/functions";

const MaterialField = (props) => {
  const theme = useTheme();
  const scene = useCurrentScene();
  const mappingTarget = useMappingTarget();
  const mappingTargetFrame = useMappingTargetFrame();
  const mappingFieldTypes = useMappingFieldTypes();
  const isMappingActive = useIsMappingActive();
  const editorState = useEditorState();
  const updateMappingSource = useUpdateMappingSource();
  const edges = useEdges();
  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  const val = getDeep(node, key);
  const [value, setValue] = useState(val ? val.name : null);

  useEffect(() => {
    setValue(val ? val.name : null);
  }, [edges]);

  const onChange = (e, v) => {
    setValue(v);

    if (isMappingActive && mappingFieldTypes.includes("material")) {
      updateMappingSource({ node: node, value: v, valueType: opts.type, key: key, label: opts.label || key });
    } else {
      if (!node.hasOwnProperty("badChanges")) {
        node.badChanges = {};
      }
      if (v === null) {
        node.badChanges[key] = "$NULL$";
      } else {
        node.badChanges[key] = v;
      }
    }

    if (opts.onChange) {
      opts.onChange(e, scene, node, key);
    } else {
      if (v === null) {
        setDeep(node, key, null);
      } else {
        setDeep(node, key, scene.getMaterialByName(v));
      }
    }
    return scene.forceUpdate();
  };
  const onHandleClick = () => {
    if (val) {
      //  scene.openNode("Material", val, { position: { x: node.nodePosition.x - 360, y: node.nodePosition.y } });
      scene.openNode("Material", val);
    }
  };

  const options = scene.materials
    .filter((material) => material.fromAsset || material.isCustom || material.cloneOf)
    .map((material) => {
      return material.name;
    });

  return (
    <div title={key} key={key} className={opts.type + " field nowheel"}>
      {opts.handle && opts.handle.type === "target" && editorState !== "essentials" ? (
        <Handle
          style={{ position: "absolute", zIndex: 1 }}
          onClick={onHandleClick}
          className={"targetHandle  green " + (val ? "connected" : "")}
          type="target"
          id={key}
          position={Position.Left}
          onConnect={(e) => {}}
        />
      ) : null}

      <div>
        {editorState !== "essentials" ? (
          <Button
            onClick={onHandleClick}
            className="FunctionButton"
            style={{
              justifyContent: "flex-start",
              width: "auto",

              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              paddingLeft: "1.5em",
              paddingRight: "1em",
              marginLeft: "-1em",
              marginRight: "1em",

              marginBottom: isMappingActive && mappingFieldTypes.includes("material") ? "0.4em" : "0",
            }}
          >
            {opts.label || key}
          </Button>
        ) : (
          opts.label || key
        )}

        {(isMappingActive && mappingFieldTypes.includes("material")) || editorState === "essentials" ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Autocomplete
              sx={{ backgroundColor: theme.palette.background.light }}
              style={{ width: "100%", borderRadius: "0.5em" }}
              size="small"
              value={value}
              disablePortal
              options={options}
              getOptionLabel={(option) => {
                return scene.getMaterialByName(option)?.displayName || option;
              }}
              renderInput={(params) => <TextField {...params} label={null} />}
              onChange={onChange}
            />
            {isMappingActive && mappingFieldTypes.includes("material") ? (
              <button
                style={{ marginLeft: "0.5em" }}
                onClick={() => updateMappingSource({ node: node, value: val.name, valueType: opts.type, key: key, label: opts.label || key })}
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
        ) : null}
      </div>
    </div>
  );
};

export default MaterialField;
