import React from "react";
import NodeField from "../../NodeField";

const fields = {
  exp: { type: "String", label: "Expression" },
  expInstructions: { type: "Title", label: 'format: "nodeId.property" = expression' },
  expInstructions2: { type: "Title", label: "Copy ids at the bottom of the nodes and get properties by hovering node fields." },
};

const Expression = (props) => {
  const node = props.node;

  // useEffect(() => {
  //   node.elements = elements;
  // }, [elements]);

  return (
    <div style={{ width: "800px" }}>
      {NodeField(node, "exp", fields.exp)}
      {NodeField(node, "expInstructions", fields.expInstructions)}
      {NodeField(node, "expInstructions2", fields.expInstructions2)}
    </div>
  );
};

export default Expression;
