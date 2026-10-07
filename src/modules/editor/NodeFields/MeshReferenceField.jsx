import React from "react";
import { useCurrentScene } from "../../../badProvider/functions";

const MeshReferenceField = (props) => {
  const scene = useCurrentScene();
  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  const val = node[key];

  const onChange = (e) => {
    if (!node.hasOwnProperty("badChanges")) {
      node.badChanges = {};
    }
    if (opts.onChange) {
      opts.onChange(e, scene, node, key);
      return scene.forceUpdate();
    }

    node.badChanges[key] = e.target.value;
    node[key] = scene.getMeshByName(e.target.value);
    return scene.forceUpdate();
  };
  return (
    <div title={key} key={key} className={opts.type + " field nowheel"}>
      <select defaultValue={val.name} onChange={onChange}>
        <option disabled key="disabled">
          {val.name}
        </option>
        {Object.values(scene.meshes).map((mesh, i) => {
          return (
            <option key={mesh.name} value={mesh.name}>
              {mesh.displayName}
            </option>
          );
        })}
      </select>
      <span>{opts.label || key}</span>
    </div>
  );
};

export default MeshReferenceField;
