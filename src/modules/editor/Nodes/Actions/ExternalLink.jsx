import React from "react";
import NodeField from "../../NodeField";

const fields = {
  newTab: { type: "Boolean", label: "Open in New Tab" },
  url: { type: "String", label: "Link" },
};

const ExternalLink = (props) => {
  const node = props.node;

  // useEffect(() => {
  //   node.elements = elements;
  // }, [elements]);

  return (
    <div className="nodeInner">
      {NodeField(node, "newTab", fields.newTab)}
      {NodeField(node, "url", fields.url)}
    </div>
  );
};

export default ExternalLink;
