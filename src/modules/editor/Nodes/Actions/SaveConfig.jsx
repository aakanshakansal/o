import React from "react";
import NodeField from "../../NodeField";

const fields = {
  naked: { type: "Boolean", label: "Naked" },
  notification: { type: "String", label: "Notification", override: "The link was copied in your clipboard." },
};

const SaveConfig = (props) => {
  const node = props.node;

  // useEffect(() => {
  //   node.elements = elements;
  // }, [elements]);

  return (
    <div className="nodeInner">
      {NodeField(node, "naked", fields.naked)}
      {NodeField(node, "notification", fields.notification)}
    </div>
  );
};

export default SaveConfig;
