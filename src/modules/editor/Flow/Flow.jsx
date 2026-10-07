import { useEffect, useState } from "react";
import ReactFlow, { useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css";
import { useCurrentScene } from "../../../badProvider/functions";
import { getDeep, setDeep } from "../../../helpers";
import { PBRMaterialProps, effectsProps, sceneProps } from "../../../nodesProps";
import { EffectsFields } from "../Effects";
import { ActionNode } from "../Nodes/ActionNode";
import { AnimationGroupNode } from "../Nodes/AnimationGroupNode";
import { CameraNode } from "../Nodes/CameraNode";
import { CaptureNode } from "../Nodes/CaptureNode";
import { CollectionNode } from "../Nodes/CollectionNode";
import { ControlNodeNode } from "../Nodes/ControlNodeNode";
import { EngineNode } from "../Nodes/EngineNode";
import { LightNode } from "../Nodes/LightNode";
import { MaterialNode } from "../Nodes/MaterialNode";
import { MeshNode } from "../Nodes/MeshNode";
import { OverlayNode } from "../Nodes/OverlayNode";
import { SceneNode } from "../Nodes/SceneNode";
import { SoundNode } from "../Nodes/SoundNode";
import { TextureNode } from "../Nodes/TextureNode";
import { VariableNode } from "../Nodes/VariableNode";
import RemoveButtonEdge from "./Edges/RemoveButtonEdge";
const nodeTypes = {
  Engine: EngineNode,
  Scene: SceneNode,
  Effects: EffectsFields,
  CaptureNode: CaptureNode,
  Camera: CameraNode,
  Mesh: MeshNode,
  Light: LightNode,
  Material: MaterialNode,
  Texture: TextureNode,
  Sound: SoundNode,
  Overlay: OverlayNode,
  Action: ActionNode,
  AnimationGroup: AnimationGroupNode,
  ControlNode: ControlNodeNode,
  Variable: VariableNode,
  Collection: CollectionNode,
};

const edgeTypes = {
  removable: RemoveButtonEdge,
};

const Flow = (props) => {
  const [spaceDown, setSpaceDown] = useState(false);

  const scene = useCurrentScene();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [ready, setReady] = useState(false);
  const [params, setParams] = useState(null);
  const [update, setUpdate] = useState(false);

  const edgeOptions = {
    style: {
      //  stroke: "white",
    },
  };

  const onConnect = (params) => {
    scene.forceUpdate();
    setUpdate(!update);
  };

  scene.updateReactFlow = () => {
    scene.forceUpdate();
    setUpdate(!update);
  };

  const onConnectStart = (e, p) => {};

  const onConnectEnd = (e) => {
    scene.forceUpdate();
    setUpdate(!update);
  };

  const onEdgesDelete = (eds) => {
    try {
      eds[0].data.onDelete();
    } catch (error) {
      console.warn(error);
    }
    scene.forceUpdate();
    setUpdate(!update);
  };

  const isNodeSourceOpen = (nodeId, edges, nodes) => {
    const incomingEdges = edges.filter((edge) => edge.target === nodeId);
    for (let edge of incomingEdges) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode && sourceNode.isOpen) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    document.addEventListener("keydown", (event) => {
      //var name = event.key;
      var code = event.code;

      if (code === "Space") {
        //  return (spaceDown = true);
        return setSpaceDown(true);
      }
    });

    document.addEventListener("keyup", (event) => {
      //var name = event.key;
      var code = event.code;

      if (code === "Space") {
        //  return (spaceDown = true);
        return setSpaceDown(false);
      }
    });

    const initialNodes = [];
    const initialEdges = [];

    Object.values(props.openNodes).forEach((node, i) => {
      const n = node.data.node;

      //
      //
      //
      //
      //
      // ACTION - ACTION EDGES
      //
      //
      //
      //
      //

      if (n.endActions) {
        n.endActions.forEach((a, i) => {
          let target = a;

          const edge = {
            id: n.name + "_" + a + "_end" + i,
            source: n.name,
            sourceHandle: n.name + "end",
            target: target,
            targetHandle: target,
            style: { stroke: "#f44336", strokeWidth: 3 },
            data: {
              onDelete: () => {
                n.endActions.splice(i, 1);
              },
            },
          };
          initialEdges.push(edge);
        });
      }

      if (n.type === "Timeline") {
        n.actions.forEach((a, i) => {
          let target = a.name;

          const edge = {
            id: n.name + "_" + a.name + "_" + i,
            source: n.name,
            sourceHandle: a.name,
            target: target,
            targetHandle: target,
            style: { stroke: "#f44336", strokeWidth: 3 },
            data: {
              onDelete: () => {
                n.actions.splice(i, 1);
              },
            },
          };
          initialEdges.push(edge);
        });
      }

      if (n.type === "Condition") {
        n.trueActions.forEach((a, i) => {
          let target = a;

          const edge = {
            id: n.name + "_" + a.name + "_" + i + "_true",
            source: n.name,
            sourceHandle: "true",
            target: target,
            targetHandle: target,
            style: { stroke: "#f44336", strokeWidth: 3 },
            data: {
              onDelete: () => {
                n.trueActions.splice(i, 1);
              },
            },
          };
          initialEdges.push(edge);
        });

        n.falseActions.forEach((a, i) => {
          let target = a;

          const edge = {
            id: n.name + "_" + a.name + "_" + i + "_false",
            source: n.name,
            sourceHandle: "false",
            target: target,
            targetHandle: target,
            style: { stroke: "#f44336", strokeWidth: 3 },
            data: {
              onDelete: () => {
                n.falseActions.splice(i, 1);
              },
            },
          };
          initialEdges.push(edge);
        });
      }

      if (n.type === "Sequencer") {
        Object.entries(n.steps).forEach(([step, actions], i) => {
          actions.forEach((action, i2) => {
            let target = action;

            const edge = {
              id: n.name + "_" + action + "_" + step + "_" + i,
              source: n.name,
              sourceHandle: "step" + step,
              target: target,
              targetHandle: target,
              style: { stroke: "#f44336", strokeWidth: 3 },

              data: {
                onDelete: () => {
                  n.steps[step].splice(i2, 1);
                },
              },
            };
            initialEdges.push(edge);
          });
        });
      }

      //
      //
      //
      //
      //
      // TRIGGER - ACTION EDGES
      //
      //
      //
      //
      //

      if (
        typeof n.getClassName === "function" &&
        (n.getClassName() === "Mesh" || n.getClassName() === "3DText" || n.getClassName() === "Scene" || n.getClassName() === "Effects")
      ) {
        const triggerTypes = [
          "onPickTrigger",
          "onPointerOverTrigger",
          "onDoublePickTrigger",
          "onPointerOutTrigger",
          "onDragStartTrigger",
          "onDragTrigger",
          "onDragEndTrigger",
          //SCENE
          "onLoadTrigger",
          "onBeforeFrameTrigger",
          "onAfterFrameTrigger",
          "onPointerPickTrigger",
          "onPointerDownTrigger",
          "onPointerMoveTrigger",
          "onPointerUpTrigger",
          "onPointerDoubleTapTrigger",
        ];

        triggerTypes.forEach((triggerType) => {
          if (n.hasOwnProperty(triggerType)) {
            n[triggerType].forEach((a, i) => {
              let target = a;

              const edge = {
                id: n.name + "_" + triggerType + "_" + target + "_" + i,
                source: n.name,
                sourceHandle: triggerType,
                target: target,
                targetHandle: target,
                style: { stroke: "#f44336", strokeWidth: 3 },
                data: {
                  onDelete: () => {
                    n[triggerType].splice(i, 1);
                  },
                },
              };
              initialEdges.push(edge);
            });
          }
        });

        //
        //
        //
        //
        //
        // TEXTURE - MATERIALFIELD EDGES
        //
        //
        //
        //
        //

        Object.entries(sceneProps).forEach(([k, v], i) => {
          if (v.type === "Texture" && getDeep(n, k) && getDeep(n, k).name) {
            const edge = {
              id: n.name + "_" + getDeep(n, k).name + "_" + k + "_" + i,
              source: getDeep(n, k).name,
              target: n.name,
              targetHandle: k,
              style: { stroke: "#ff9800", strokeWidth: 3 },

              data: {
                onDelete: () => {
                  if (!n.hasOwnProperty("badChanges")) {
                    n.badChanges = {};
                  }
                  n.badChanges[k] = "$NULL$";

                  setDeep(n, k, null);
                },
              },
            };

            initialEdges.push(edge);
          }
        });

        Object.entries(effectsProps).forEach(([k, v], i) => {
          if (v.type === "Texture" && getDeep(n, k) && getDeep(n, k).name) {
            const edge = {
              id: n.name + "_" + getDeep(n, k).name + "_" + k + "_" + i,
              source: getDeep(n, k).name,
              target: n.name,
              targetHandle: k,
              style: { stroke: "#ff9800", strokeWidth: 3 },

              data: {
                onDelete: () => {
                  if (!n.hasOwnProperty("badChanges")) {
                    n.badChanges = {};
                  }
                  n.badChanges[k] = "$NULL$";

                  setDeep(n, k, null);
                },
              },
            };

            initialEdges.push(edge);
          }

          if (v.type === "Texture" && getDeep(n, k) && getDeep(n, k).name) {
            const edge = {
              id: n.name + "_" + getDeep(n, k).name + "_" + k + "_" + i,
              source: getDeep(n, k).name,
              target: n.name,
              targetHandle: k,
              style: { stroke: "#ff9800", strokeWidth: 3 },

              data: {
                onDelete: () => {
                  if (!n.hasOwnProperty("badChanges")) {
                    n.badChanges = {};
                  }
                  n.badChanges[k] = "$NULL$";

                  setDeep(n, k, null);
                },
              },
            };

            initialEdges.push(edge);
          }
        });
      }

      if (typeof n.getClassName === "function" && n.getClassName() === "PBRMaterial") {
        Object.entries(PBRMaterialProps).forEach(([k, v], i) => {
          if (v.type === "Texture" && getDeep(n, k) && getDeep(n, k).name) {
            const edge = {
              id: n.name + "_" + getDeep(n, k).name + "_" + k + "_" + i,
              source: getDeep(n, k).name,
              target: n.name,
              targetHandle: k,
              style: { stroke: "#ff9800", strokeWidth: 3 },

              data: {
                onDelete: () => {
                  if (!n.hasOwnProperty("badChanges")) {
                    n.badChanges = {};
                  }
                  n.badChanges[k] = "$NULL$";
                  setDeep(n, k, null);
                },
              },
            };

            initialEdges.push(edge);
          }
        });
      }
      //

      //
      //
      //
      //
      //
      // MATERIAL - MESHES EDGES
      //
      //
      //
      //
      //

      if (node.type === "Material") {
        if (typeof n.getBindedMeshes === "function" && n.getBindedMeshes()) {
          n.getBindedMeshes().forEach((m, i) => {
            const edge = {
              id: n.name + "_" + m.name + "_" + i,
              source: n.name,
              target: m.name,
              style: { stroke: "#bada55", strokeWidth: 3 },

              data: {
                onDelete: () => {
                  if (!n.hasOwnProperty("badChanges")) {
                    m.badChanges = {};
                  }
                  m.badChanges["material"] = "$NULL$";
                  m.material = null;
                },
              },
            };
            initialEdges.push(edge);
          });
        }
      }
      //

      node.position = n["nodePosition"] && typeof n["nodePosition"] === "object" ? n["nodePosition"] : { x: 16, y: 70 + i * 34 };
      n["nodePosition"] = node.position;

      initialNodes.push(node);
    });

    // const validEdges = initialEdges.filter((edge) => {
    //   // check if source and target nodes of the edge are present in initialNodes
    //   return initialNodes.some((node) => node.id === edge.source) && initialNodes.some((node) => node.id === edge.target);
    // });

    // validEdges.forEach((edge) => {
    //   initialNodes.forEach((node) => {
    //     if (edge.target === node.id) {
    //       const sourceNode = initialNodes
    //         .filter((n) => edge.source === n.id)
    //         .map((n) => {
    //           return n;
    //         });
    //       if (!editorContext.state.collapsedNodes.includes(node.id)) {
    //         node.position.x = sourceNode[0].position.x + 400;
    //       }
    //     }
    //   });
    // });
    initialEdges.forEach((e) => {
      e.type = "removable";
    });

    setNodes(initialNodes);
    setEdges(initialEdges);

    // console.log("nodes_________________________", initialNodes);
    // console.log("edges_________________________", initialEdges);

    setReady(true);
  }, [props.openNodes, params, update]);

  return (
    <div
      id="flowContainer"
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        width: "100%",
        height: "100%",
        zIndex: 999,
        pointerEvents: spaceDown ? "all" : "none",
      }}
    >
      {ready ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgesDelete={onEdgesDelete}
          edgeTypes={edgeTypes}
          edgeoptions={edgeOptions}
          onConnect={onConnect}
          maxZoom={1.6}
          zoom={1}
          minZoom={0.4}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={edgeOptions}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          autoPanOnConnect={false}
          autoPanOnNodeDrag={false}
          connectionRadius={30}
        />
      ) : null}
    </div>
  );
};
//onEdgeClick={handleEdgeClick}
// {Object.values(props.openNodes).length > 0 ? <MiniMap nodeColor={nodeColor} /> : null}
//  <Background />
//    <MiniMap />
// <Controls />

export default Flow;
