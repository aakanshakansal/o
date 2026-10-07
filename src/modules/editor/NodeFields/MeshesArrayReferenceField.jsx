import React, { useState } from "react";

import { Button } from "@mui/material";

import { useCurrentScene } from "../../../badProvider/functions";
import { getDeep } from "../../../helpers";
const MeshesArrayReferenceField = (props) => {
  const scene = useCurrentScene();
  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  const val = getDeep(node, key);

  const [values, setValues] = useState(val);

  return (
    <>
      <div title={key} key={key} className={opts.type + " field"}>
        <Button
          onClick={() =>
            scene.openPrompt("meshesArrayReferenece", {
              label: opts.label,
              values,
              callback: (v) => {
                setValues(v);
                if (!node.hasOwnProperty("badChanges")) {
                  node.badChanges = {};
                }
                if (opts.onChange) {
                  opts.onChange(v, scene, node, key);
                  //return scene.forceUpdate();
                }
              },
            })
          }
          className="FunctionButton"
        >
          {opts.label} - {values.length}
        </Button>
      </div>
    </>
  );
};

export default MeshesArrayReferenceField;
