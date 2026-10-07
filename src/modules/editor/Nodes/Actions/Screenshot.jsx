import React from "react";
import NodeField from "../../NodeField";

const fields = {
  tit: { type: "Title", label: "Custom Size (leave empty to use the screen size)" },
  width: { type: "Number", label: "Width (px)", forceInt: true },
  height: { type: "Number", label: "Height (px)", forceInt: true },
  quality: { type: "Number", label: "Quality" },
};

const Screenshot = (props) => {
  const node = props.node;

  // useEffect(() => {
  //   node.elements = elements;
  // }, [elements]);

  return (
    <div className="nodeInner">
      {NodeField(node, "tit", fields.tit)}
      {NodeField(node, "width", fields.width)}
      {NodeField(node, "height", fields.height)}
      {NodeField(node, "quality", fields.quality)}
    </div>
  );
};

export default Screenshot;
