import React, { useEffect, useState } from "react";

import { Color3 } from "@babylonjs/core";
import {
  useCurrentScene,
  useIsMappingActive,
  useMappingFieldTypes,
  useMappingTarget,
  useMappingTargetFrame,
  useUpdateMappingSource,
} from "../../../badProvider/functions";
import { getDeep, setDeep } from "../../../helpers";
import { ColorInput } from "../Components/ColorInput";
const Color3Field = (props) => {
  const scene = useCurrentScene();
  const mappingTarget = useMappingTarget();
  const mappingTargetFrame = useMappingTargetFrame();
  const mappingFieldTypes = useMappingFieldTypes();
  const isMappingActive = useIsMappingActive();
  const updateMappingSource = useUpdateMappingSource();
  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  const val = getDeep(node, key);
  const [value, setValue] = useState(
    val ? (typeof val.getClassName === "function" ? (opts.frontConversion ? opts.frontConversion(val) : val.toGammaSpace().toHexString()) : val) : "#ffffff"
  );

  let frameCounter = 0;
  const rtValue = () => {
    frameCounter++;
    if (frameCounter >= 10) {
      if (getDeep(node, key) !== undefined && typeof getDeep(node, key).getClassName === "function") {
        setValue(
          getDeep(node, key) ? (opts.frontConversion ? opts.frontConversion(getDeep(node, key)) : getDeep(node, key).toGammaSpace().toHexString()) : "#ffffff"
        );
      }
      frameCounter = 0;
    }
  };

  useEffect(() => {
    // if (isMappingActive && node.name !== mappingTarget.name) {
    // } else {
    scene.registerAfterRender(rtValue);
    //}

    return () => {
      scene.unregisterAfterRender(rtValue);
    };
  }, []);

  const onFocus = () => {
    //  scene.unregisterAfterRender(rtValue);
  };

  // updates the value when clicking out of the input
  function onBlur() {
    scene.forceUpdate();
  }

  const onChange = (e) => {
    const tempE = {
      target: {
        value: val
          ? typeof val.getClassName === "function"
            ? opts.frontConversion
              ? opts.frontConversion(val)
              : val.toGammaSpace().toHexString()
            : val
          : "#ffffff",
      },
    };
    scene.badHistory.push({ fun: () => onChange(tempE) });
    setValue(e.target.value);

    if (isMappingActive && mappingFieldTypes.includes("color")) {
      updateMappingSource({ node: node, value: e.target.value, valueType: opts.type, key: key, label: opts.label || key });
    } else {
      if (!node.hasOwnProperty("badChanges")) {
        node.badChanges = {};
      }
      node.badChanges[key] = e.target.value;
    }

    if (opts.onChange) {
      opts.onChange(e, scene, node, key);
    } else {
      setDeep(node, key, opts.backConversion ? opts.backConversion(e.target.value) : Color3.FromHexString(e.target.value).toLinearSpace());
    }
    return;
  };
  return (
    <div title={key} key={key} className={opts.type + " field"} style={{ display: "flex", alignItems: "center" }}>
      <ColorInput label={opts.label || key} value={value} onBlur={onBlur} onChange={onChange} onFocus={onFocus} />

      {isMappingActive && mappingFieldTypes.includes("color") ? (
        <button
          onClick={() =>
            updateMappingSource({
              node: node,
              value: opts.frontConversion ? opts.frontConversion(val) : val.toGammaSpace().toHexString(),
              valueType: opts.type,
              key: key,
              label: opts.label || key,
            })
          }
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

export default Color3Field;
