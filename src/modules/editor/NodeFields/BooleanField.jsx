import React from "react";
import {
  useCurrentScene,
  useIsMappingActive,
  useMappingFieldTypes,
  useMappingTarget,
  useMappingTargetFrame,
  useUpdateMappingSource,
} from "../../../badProvider/functions";
import { getDeep, setDeep } from "../../../helpers";
import { BooleanInput } from "../Components/BooleanInput";

const BooleanField = (props) => {
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

  // const [value, setValue] = useState(val);

  // useEffect(() => {
  //   const timeout = setInterval(() => {
  //     const upVal = getDeep(node, key);

  //     if (upVal === value) {
  //       return;
  //     } else {
  //       setValue(upVal);
  //     }
  //   }, 50);

  //   return () => {
  //     clearInterval(timeout);
  //   };
  // }, []);

  const onChange = (e) => {
    const tempE = { target: { checked: val } };
    scene.badHistory.push({ fun: () => onChange(tempE) });
    if (isMappingActive && mappingFieldTypes.includes("boolean")) {
      updateMappingSource({ node: node, value: Boolean(e.target.checked), valueType: opts.type, key: key, label: opts.label || key });
    } else {
      if (!node.hasOwnProperty("badChanges")) {
        node.badChanges = {};
      }
      node.badChanges[key] = Boolean(e.target.checked);
    }

    if (opts.onChange) {
      opts.onChange(e, scene, node, key);
    } else {
      setDeep(node, key, Boolean(e.target.checked));
    }

    //  setValue(Boolean(e.target.checked));

    return scene.forceUpdate();
  };
  return (
    <div title={key} key={key} className={opts.type + " field " + (opts.width && opts.width) + " " + key.replace(/\./g, "")}>
      <BooleanInput checked={val} onChange={onChange} label={opts.label || key} />

      {isMappingActive && mappingFieldTypes.includes("boolean") ? (
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

export default BooleanField;
