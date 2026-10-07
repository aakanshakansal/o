import React, { memo, useEffect } from "react";

import { Color4 } from "@babylonjs/core";
import { useCurrentScene } from "../../../badProvider/functions";

const Color4Field = memo((props) => {
  const scene = useCurrentScene();
  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  useEffect(() => {});
  return (
    <div key={key} className={opts.type + " field"}>
      <span>{opts.label || key}</span>

      <input
        type="color"
        style={{
          padding: 0,
        }}
        defaultValue={node[key].toGammaSpace().toHexString()}
        onBlur={(e) => {}}
        onChange={(e) => {
          if (!node.hasOwnProperty("badChanges")) {
            node.badChanges = {};
          }
          if (opts.onChange) {
            opts.onChange(e, scene, node, key);
            return scene.forceUpdate();
          }
          node.badChanges[key] = e.target.value;
          node[key] = Color4.FromHexString(e.target.value).toLinearSpace();
          return; // scene.forceUpdate();
        }}
      />
    </div>
  );
});

export default Color4Field;
