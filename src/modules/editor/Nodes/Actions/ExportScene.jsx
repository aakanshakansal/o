import React from "react";
import NodeField from "../../NodeField";

const fields = {
  excludedMeshes: {
    type: "MeshesArrayReference",
    label: "Excluded Meshes",

    onSet: (scene, node, value) => {
      if (value !== null) {
        node.excludedMeshes = [];
        value.forEach((m, i) => {
          if (scene.getMeshByName(m)) {
            node.excludedMeshes.push(m.name);
          }
        });
        return;
      } else {
        node.excludedMeshes = [];
      }
    },
    onChange: (value, scene, node, key) => {
      var selectedMeshes = [];
      value.forEach((m, i) => {
        if (!selectedMeshes.includes(scene.getMeshByName(m))) {
          selectedMeshes.push(m);
        }
      });

      node.excludedMeshes = selectedMeshes;
    },
  },
  tit: { type: "Title", label: "(Disabled nodes are excluded automatically)" },
};

const ExportScene = (props) => {
  const node = props.node;

  // useEffect(() => {
  //   node.elements = elements;
  // }, [elements]);

  return (
    <div className="nodeInner">
      {NodeField(node, "excludedMeshes", fields.excludedMeshes)}

      {NodeField(node, "tit", fields.tit)}
    </div>
  );
};

export default ExportScene;
