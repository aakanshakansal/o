import React from "react";

import { Button } from "@mui/material";
import { useCurrentScene } from "../../../badProvider/functions";
import { cleanFirebaseUrl, getDeep, setDeep } from "../../../helpers";
const AssetReferenceField = (props) => {
  const scene = useCurrentScene();
  const node = props.node;
  const key = props._key;
  const opts = props.opts;

  const val = getDeep(node, key);
  const refVal = getDeep(node, key + "REF");

  return (
    <div key={key} className={opts.type + " field"}>
      <span>{opts.label}</span>
      <div style={{ display: "flex" }}>
        <Button
          onClick={() =>
            scene.openPrompt("addAsset", {
              single: true,
              extensions: opts.extensions,
              callback: (data) => {
                const url = data[0].customUrl || cleanFirebaseUrl(data[0].url);
                const ref = data[0].id;

                if (!node.hasOwnProperty("badChanges")) {
                  node.badChanges = {};
                }

                node.badChanges[key] = url;
                node.badChanges[key + "REF"] = ref;

                if (opts.onChange) {
                  opts.onChange(null, scene, node, key, url, ref);
                } else {
                  setDeep(node, key, url);
                  setDeep(node, key + "REF", ref);
                }

                scene.openPrompt(null);
                return scene.forceUpdate();
              },
              cancel: () => scene.openPrompt(null),
            })
          }
          className="FunctionButton"
          style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
        >
          {/* {opts.label || key}:{" "} */}

          {refVal && refVal.ref ? refVal.ref : val ? val.split("/").pop() : "Select Asset"}
        </Button>
        {val && opts.removable ? (
          <Button
            color="red"
            style={{ width: "1.6em", marginLeft: "0.5em" }}
            onClick={() => {
              if (!node.hasOwnProperty("badChanges")) {
                node.badChanges = {};
              }

              node.badChanges[key] = "$NULL$";
              node.badChanges[key + "REF"] = "$NULL$";
              if (opts.onRemove) {
                opts.onRemove(null, scene, node, key, null, null);
              } else {
                setDeep(node, key, null);
                setDeep(node, key + "REF", null);
              }
              return scene.forceUpdate();
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default AssetReferenceField;
