import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React, { useState } from "react";

import useTheme from "@mui/material/styles/useTheme";
import { useCurrentScene } from "../../../badProvider/functions";
import { getDeep, setDeep } from "../../../helpers";
const AnimationGroupReferenceField = (props) => {
  const theme = useTheme();
  const scene = useCurrentScene();
  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  const val = getDeep(node, key);
  const [value, setValue] = useState(val ? val.name : "$NULL$");
  const onChange = (e) => {
    setValue(e.target.value);
    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    if (opts.onChange) {
      opts.onChange(e, scene, node, key);
      return scene.forceUpdate();
    }

    node.badChanges[key] = e.target.value;
    setDeep(node, key, scene.getAnimationGroupByName(e.target.value));

    return scene.forceUpdate();
  };
  return (
    <div key={key} className={opts.type + " field"}>
      <Select sx={{ backgroundColor: theme.palette.background.light }} size="small" value={value} onChange={onChange}>
        <MenuItem value="$NULL$">Not set</MenuItem>

        {Object.values(scene.animationGroups).map((ag, i) => {
          if (!ag.fromAsset) return null;
          return (
            <MenuItem key={i} value={ag.name}>
              {" "}
              {ag.displayName || ag.name}
            </MenuItem>
          );
        })}
      </Select>
      <span>{opts.label || key}</span>
    </div>
  );
};

export default AnimationGroupReferenceField;
