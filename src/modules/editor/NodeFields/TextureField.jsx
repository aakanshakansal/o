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

const TextureField = (props) => {
  const theme = useTheme();
  const scene = useCurrentScene();
  const mappingTarget = useMappingTarget();
  const mappingTargetFrame = useMappingTargetFrame();
  const mappingFieldTypes = useMappingFieldTypes();
  const isMappingActive = useIsMappingActive();
  const updateMappingSource = useUpdateMappingSource();
  const editorState = useEditorState();
  const edges = useEdges();
  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  const val = getDeep(node, key);
  const [value, setValue] = useState(val ? val.name : null);

  useEffect(() => {
    setValue(val ? val.name : null);
  }, [edges]);

  const onHandleClick = () => {
    if (val) {
      //  scene.openNode("Texture", val, { position: { x: node.nodePosition.x - 360, y: node.nodePosition.y } });
      scene.openNode("Texture", val);
    }
  };

  const onChange = (e, v) => {
    setValue(v);

    if (isMappingActive && mappingFieldTypes.includes("texture")) {
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
        setDeep(node, key, scene.getTextureByName(v));
      }
    }
    return scene.forceUpdate();
  };

  const options = scene.textures
    .filter((texture) => texture.fromAsset || texture.isCustom || texture.cloneOf)
    .map((texture) => {
      return texture.name;
    });

  return (
    <div key={key} className={opts.type + " field nowheel"}>
      {opts.handle && opts.handle.type === "target" && editorState !== "essentials" ? (
        <Handle
          style={{ zIndex: 1 }}
          onClick={onHandleClick}
          onConnect={(e) => {}}
          className={"targetHandle  orange " + (val ? "connected" : "")}
          type="target"
          id={key}
          position={Position.Left}
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

              marginBottom: isMappingActive && mappingFieldTypes.includes("texture") ? "0.4em" : "0",
            }}
          >
            {opts.label || key}
          </Button>
        ) : (
          opts.label || key
        )}

        {(isMappingActive && mappingFieldTypes.includes("texture")) || editorState === "essentials" ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Autocomplete
              sx={{ backgroundColor: theme.palette.background.light }}
              size="small"
              style={{ width: "100%", borderRadius: "0.5em" }}
              value={value}
              // className={
              //   isMappingActive && mappingFieldTypes.includes("texture")
              //     ? mappingTarget &&
              //       mappingTarget.nodes &&
              //       mappingTarget.nodes.hasOwnProperty(node.name) &&
              //       mappingTarget.nodes[node.name].props.hasOwnProperty(key) &&
              //       mappingTarget.nodes[node.name].props[key].keyFrames &&
              //       mappingTarget.nodes[node.name].props[key].keyFrames.hasOwnProperty(mappingTargetFrame)
              //       ? "map framed"
              //       : "map"
              //     : ""
              // }
              disablePortal
              options={options}
              getOptionLabel={(option) => {
                return scene.getTextureByName(option)?.displayName?.split("/").pop() || option;
              }}
              renderInput={(params) => <TextField {...params} label={null} />}
              onChange={onChange}
            />
            {isMappingActive && mappingFieldTypes.includes("texture") ? (
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

export default TextureField;
