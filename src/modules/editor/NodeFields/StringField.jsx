import React, { useEffect } from "react";

import { useCurrentScene } from "../../../badProvider/functions";
import { getDeep, setDeep } from "../../../helpers";
import { StringInput } from "../Components/StringInput";
const StringField = (props) => {
  const scene = useCurrentScene();
  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  const val = getDeep(node, key);

  useEffect(() => {});
  const onChange = (e) => {
    const tempE = { target: { value: val } };
    scene.badHistory.push({
      fun: () => {
        onChange(tempE);
        scene.forceUpdate();
      },
    });

    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }

    node.badChanges[key] = e.target.value;
    if (opts.onChange) {
      return opts.onChange(e, scene, node, key);
    }

    setDeep(node, key, e.target.value);
    return; // scene.forceUpdate();
  };

  const onBlur = () => {
    scene.forceUpdate();
  };

  return (
    <div key={key} className={opts.type + " field"}>
      <StringInput label={opts.label || key} multiline={opts.multiline} onChange={onChange} onBlur={onBlur} value={val} />
    </div>
  );
};

export default StringField;
