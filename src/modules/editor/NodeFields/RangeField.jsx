import React, { useEffect, useState } from "react";
import { getDeep, setDeep } from "../../../helpers";

import { useTheme } from "@mui/material";
import {
  useCurrentScene,
  useIsMappingActive,
  useMappingFieldTypes,
  useMappingTarget,
  useMappingTargetFrame,
  useUpdateMappingSource,
} from "../../../badProvider/functions";
import { RangeInput } from "../Components/RangeInput";

const RangeField = (props) => {
  const scene = useCurrentScene();
  const mappingTarget = useMappingTarget();
  const mappingTargetFrame = useMappingTargetFrame();
  const mappingFieldTypes = useMappingFieldTypes();
  const isMappingActive = useIsMappingActive();
  const updateMappingSource = useUpdateMappingSource();
  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  const theme = useTheme();

  const val = getDeep(node, key);
  const [number, setNumber] = useState(opts.frontConversion ? parseFloat(opts.frontConversion(val)) : val);

  // let frameCounter = 0;
  const rtValue = () => {
    // frameCounter++;
    // if (frameCounter >= 10) {
    setNumber(opts.frontConversion ? parseFloat(opts.frontConversion(getDeep(node, key))) : getDeep(node, key));
    // frameCounter = 0;
    //  }
  };

  useEffect(() => {
    scene.registerAfterRender(rtValue);

    return () => {
      scene.unregisterAfterRender(rtValue);
    };
  }, []);

  const onInput = (e) => {
    const tempE = { target: { value: val } };
    scene.badHistory.push({ fun: () => onInput(tempE) });
    setNumber(e.target.value);
    const value = opts.backConversion ? opts.backConversion(parseFloat(e.target.value)) : parseFloat(e.target.value);

    if (isMappingActive && mappingFieldTypes.includes("range")) {
      updateMappingSource({ node: node, value: value, valueType: opts.type, key: key, label: opts.label || key });
    } else {
      if (!node.hasOwnProperty("badChanges")) {
        node.badChanges = {};
      }
      node.badChanges[key] = value;
    }

    if (opts.onChange) {
      return opts.onChange(e, scene, node, key);
    } else {
      setDeep(node, key, value);
    }
    return; // scene.forceUpdate();
  };
  return (
    <div title={key} key={key} className={opts.type + " field" + " " + key.replace(/\./g, "")} style={{ display: "flex", alignItems: "center" }}>
      <RangeInput label={opts.label || key} unit={opts.unit} min={opts.min} max={opts.max} step={opts.step} value={number} onChange={onInput} />

      {isMappingActive && mappingFieldTypes.includes("range") ? (
        <button
          onClick={() => updateMappingSource({ node: node, value: val, valueType: opts.type, key: key, label: opts.label || key })}
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
};

export default RangeField;
