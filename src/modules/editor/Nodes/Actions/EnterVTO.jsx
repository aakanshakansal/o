import React from "react";
import NodeField from "../../NodeField";

const fields = {
  mode: { type: "Select", label: "Mode", options: { head: "Head", exit: "Exit VTO Mode" } },
  newTab: { type: "Boolean", label: "Open in New Tab" },
};

const EnterVTO = (props) => {
  const node = props.node;

  // useEffect(() => {
  //   node.elements = elements;
  // }, [elements]);

  return (
    <div class="nodeInner">
      {NodeField(node, "mode", fields.mode)}
      {NodeField(node, "newTab", fields.newTab)}
    </div>
  );
};

export default EnterVTO;
