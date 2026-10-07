import React, { useEffect, useState } from "react";

import {
  useCurrentScene,
  useIsMappingActive,
  useMappingFieldTypes,
  useMappingTarget,
  useMappingTargetFrame,
  useUpdateMappingSource,
} from "../../../badProvider/functions";
import { getDeep, setDeep } from "../../../helpers";
import { NumberInput } from "../Components/NumberInput";

const NumberField = (props) => {
  const scene = useCurrentScene();

  const mappingTarget = useMappingTarget();
  const mappingTargetFrame = useMappingTargetFrame();
  const mappingFieldTypes = useMappingFieldTypes();
  const isMappingActive = useIsMappingActive();
  const updateMappingSource = useUpdateMappingSource();

  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  const val = parseFloat(getDeep(node, key));
  //const [number, setNumber] = useState(parseFloat(val));

  const [numberVisible, setNumberVisible] = useState(opts.frontConversion ? parseFloat(opts.frontConversion(val)) : parseFloat(val));

  let frameCounter = 0;
  const rtValue = () => {
    frameCounter++;
    if (frameCounter >= 2) {
      setNumberVisible(opts.frontConversion ? parseFloat(opts.frontConversion(getDeep(node, key))) : parseFloat(getDeep(node, key)));
      frameCounter = 0;
    }
  };

  const onFocus = () => {
    scene.unregisterAfterRender(rtValue);
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
    opts.forceInt && (e.target.value = Math.round(e.target.value));
    const valueVisible = parseFloat(parseFloat(e.target.value || 0));
    let value = opts.backConversion ? parseFloat(opts.backConversion(e.target.value || 0)) : parseFloat(parseFloat(e.target.value || 0));
    //setNumber(value);

    setNumberVisible(valueVisible);
    if (isMappingActive && mappingFieldTypes.includes("number")) {
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
    <div
      title={key}
      key={key + numberVisible}
      className={opts.type + " field " + (opts.width && opts.width) + " " + key.replace(/\./g, "")}
      style={{ display: "flex", alignItems: "center" }}
    >
      <NumberInput
        disableDrag={opts.disableDrag}
        unit={opts.unit}
        label={opts.label || key}
        value={opts.forceInt ? Math.round(numberVisible) : numberVisible.toFixed(3)}
        onBlur={onInput}
        onFocus={onFocus}
        labelColor={opts.labelColor}
      />

      {isMappingActive && mappingFieldTypes.includes("number") ? (
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

export default NumberField;
