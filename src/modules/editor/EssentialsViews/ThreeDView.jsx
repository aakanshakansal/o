import { Button } from "@mui/material";
import React, { useState } from "react";
import { toast } from "sonner";
import { createPBRMaterial } from "../../../sceneFunctions/createSceneElements";
import { MeshesList } from "../Lists/MeshesList";
import Marqueeno from "../Marqueeno";
import Fields from "../NodeFields";

export default function ThreeDView({ openNodes, theme, scene }) {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <div
      style={{
        height: "95%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          gap: "0.5em",
        }}
      >
        <div style={{ backgroundColor: theme.palette.background.dark }}>
          <Button
            className="addNew"
            onClick={() => scene.openPrompt("add3DElement")}
            style={{
              margin: "0.5em",
              marginBottom: "0",
              padding: "1.3em",
              color: theme.palette.turquoise.main,
              borderRadius: "0.5em",
              width: "calc(100% - 1em)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5em",
            }}
          >
            <span className="material-symbols-outlined">add_circle</span> <span>Add 3D Element</span>
          </Button>
        </div>

        <div style={{ overflowY: "auto", minHeight: 0, maxHeight: "33vh" }}>
          <div className="list" style={{ margin: " 0 0.5em" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75em", gap: "0.5em" }}>
              <Button
                className="FunctionButton"
                style={{ width: "1.6em", padding: "0" }}
                onClick={() => {
                  if (expandAll === false) {
                    setExpandAll(0);
                  } else {
                    setExpandAll(false);
                  }
                  setExpandAll(true);
                }}
              >
                <span className="material-symbols-outlined">expand_content</span>
              </Button>
              <Button
                className="FunctionButton"
                style={{ width: "1.6em", padding: "0" }}
                onClick={() => {
                  if (expandAll === true) {
                    setExpandAll(1);
                  } else {
                    setExpandAll(true);
                  }

                  setExpandAll(false);
                }}
              >
                <span className="material-symbols-outlined">collapse_content</span>
              </Button>
            </div>

            <MeshesList nodes={scene.badAssets} expandAll={expandAll} />
          </div>
        </div>

        <div
          style={{
            overflowY: "auto",
            minHeight: 0,
            flex: 1,
          }}
        >
          {Object.entries(openNodes).map(([key, node], i) => {
            let hasMaterial = false;
            if (node?.data?.node && node?.data?.node?.material !== undefined && node?.data?.node?.material !== null) {
              hasMaterial = true;
            }

            let hasSubMaterials = false;
            if (node?.data?.node && node?.data?.node?.getChildren && node?.data?.node?.getChildren()?.length) {
              hasSubMaterials = true;
            }

            return (
              <div key={key}>
                <ThreeDElem node={node.data.node} theme={theme} />

                {Object.entries(openNodes).map(([key, node], i) => {
                  if (node?.data?.node && node?.data?.node?.getClassName() === "Mesh" && node?.data?.node?.getDescendants(false).length === 0) {
                    return (
                      <Button
                        key={i}
                        className="addNew"
                        onClick={() => {
                          const newMaterial = createPBRMaterial(scene, null, null);
                          node.data.node.material = newMaterial;
                          if (node.data.node.badChanges === undefined) {
                            node.data.node.badChanges = {
                              material: newMaterial.name,
                            };
                          }
                          newMaterial.displayName = "PBR Material";
                          newMaterial.badChanges = {
                            displayName: "PBR Material",
                          };
                          const nodeToReopen = node.data.node;
                          scene.closeNodes();
                          toast("New Material Attached.");
                          scene.openNode("Mesh", nodeToReopen);
                        }}
                        style={{
                          margin: ".5em",
                          padding: "1.3em",
                          color: theme.palette.green.main,
                          borderRadius: "0.5em",
                          width: "calc(100% - 1em)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5em",
                        }}
                      >
                        <span className="material-symbols-outlined">add_circle</span> <span>Attach New Material</span>
                      </Button>
                    );
                  }
                })}

                <div>
                  {hasMaterial && <SubMaterial node={node.data.node} theme={theme} open={true} />}

                  {hasSubMaterials && (
                    <div>
                      <div style={{ padding: "0.5em 0.5em 0 0.5em" }}>
                        <strong>Child Materials</strong>
                      </div>
                      {node?.data?.node?.getDescendants(false).map((node, i) => {
                        if (node.material) {
                          return <SubMaterial key={i} node={node} theme={theme} open={false} />;
                        }
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const SubMaterial = ({ node, theme, open, key }) => {
  const [isOpen, setIsOpen] = useState(open);

  return (
    <div
      key={key}
      className="nodeInner"
      style={{
        borderRadius: "0.5em",
        margin: ".5em",
        //   background: theme.palette.grey.main,
      }}
    >
      <div
        style={{ display: "flex", gap: "0.5em", justifyContent: "space-between", width: "100%", overflow: "hidden", cursor: "pointer" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          style={{
            display: "flex",
            gap: "0.5em",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <span
            className="material-symbols-outlined collapseButtonIcon"
            style={{
              color: theme.palette.green.main,
            }}
          >
            deployed_code
          </span>
          <strong>
            <Marqueeno text={node.material.displayName || node.material.name} />
          </strong>
        </div>

        <span className="material-symbols-outlined">{isOpen ? "expand_more" : "chevron_right"}</span>
      </div>

      {isOpen ? <Fields node={node.material} /> : null}
    </div>
  );
};

const ThreeDElem = ({ node, theme }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className="nodeInner"
      style={{
        borderRadius: "0.5em",
        margin: "0 .5em",
        padding: ".5em",
        background: theme.palette.grey.main,
      }}
    >
      <div
        style={{ display: "flex", gap: "0.5em", justifyContent: "space-between", width: "100%", overflow: "hidden", cursor: "pointer" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          style={{
            display: "flex",
            gap: "0.5em",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <span
            className="material-symbols-outlined collapseButtonIcon"
            style={{
              color: theme.palette.turquoise.main,
            }}
          >
            deployed_code
          </span>
          <strong>
            <Marqueeno text={node.displayName || node.name} />
          </strong>
        </div>
        <span className="material-symbols-outlined">{isOpen ? "expand_more" : "chevron_right"}</span>
      </div>
      {isOpen ? <Fields node={node} /> : null}
    </div>
  );
};

// export const SubMaterialList = ({ node, theme }) => {
//   const [renderedMaterials, setRenderedMaterials] = useState([]);
//   const hasSubMaterials = node.data?.node?.getDescendants(false).some((descendant) => descendant.material);

//   const lazyRenderMaterials = (materials) => {
//     let index = 0;

//     const renderBatch = () => {
//       const batchSize = 10; // Adjust this number based on your performance needs
//       const nextBatch = materials.slice(index, index + batchSize);

//       setRenderedMaterials((prev) => [...prev, ...nextBatch]);

//       index += batchSize;
//       if (index < materials.length) {
//         requestIdleCallback(renderBatch);
//       }
//     };

//     renderBatch();
//   };

//   useEffect(() => {
//     if (hasSubMaterials) {
//       const materials = node.data.node.getDescendants(false).filter((node) => node.material);
//       setRenderedMaterials([]); // Clear previous rendered materials
//       lazyRenderMaterials(materials); // Render the new materials incrementally
//     }
//   }, [node]);

//   return hasSubMaterials ? (
//     <div>
//       {renderedMaterials.map((materialNode, i) => (
//         <div
//           key={i}
//           className="nodeInner"
//           style={{
//             borderRadius: "0.5em",
//             margin: ".5em",
//             background: theme.palette.grey.main,
//           }}
//         >
//           <div style={{ display: "flex", gap: "0.5em", width: "100%", overflow: "hidden" }}>
//             <span
//               className="material-symbols-outlined collapseButtonIcon"
//               style={{
//                 color: theme.palette.green.main,
//               }}
//             >
//               deployed_code
//             </span>
//             <Marqueeno text={materialNode.displayName} />
//           </div>
//           {/* <Fields node={materialNode.material} /> */}
//         </div>
//       ))}
//     </div>
//   ) : null;
// };
