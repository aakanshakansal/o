import React, { useEffect, useState } from "react";
import GrapesNumberInput from "./GrapesNumberInput";

export default function AnimationInputs(props) {
  const [actionVisible, setActionVisible] = useState(props.node.hasOwnProperty(props.prop));

  // init the initial state of the animation if visible
  useEffect(() => {
    if (actionVisible && !props.node[props.prop]) {
      props.node[props.prop] = {};
      props.node[props.prop].initial = props.defaultInitial;
      props.node[props.prop].animate = props.defaultAnimate;
      props.node[props.prop].exit = props.defaultExit;
    } else if (!actionVisible) {
      delete props.node[props.prop];
    }
  }, [actionVisible]);
  return (
    <div style={{ marginBottom: "1em", border: " 1px solid #171717", backgroundColor: "#222222", padding: "0.5em", borderRadius: "2.5px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
        <input type="checkbox" defaultChecked={actionVisible} onChange={() => setActionVisible(!actionVisible)} /> <span>{props.animationName}</span>
      </div>
      {actionVisible ? (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", padding: "0.5em" }}>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "1em" }}>
            <GrapesNumberInput
              label="In"
              onChange={(e) => {
                props.node[props.prop].initial = e.target.value;
              }}
              defaultValue={props.node[props.prop]?.initial || props?.defaultInitial}
            ></GrapesNumberInput>

            {/* 'Here' animation, moddle point */}

            {/* <GrapesNumberInput
                label="here"
                onChange={(e) => {
                  props.node[props.prop].animate = e.target.value;
                }}
                defaultValue={props.node[props.prop]?.animate || props?.defaultAnimate}
              ></GrapesNumberInput> */}

            <GrapesNumberInput
              label="Out"
              onChange={(e) => {
                props.node[props.prop].exit = e.target.value;
              }}
              defaultValue={props.node[props.prop]?.exit || props?.defaultExit}
            ></GrapesNumberInput>
          </div>
        </div>
      ) : null}
    </div>
  );
}
