import React, { useState } from "react";

import { Handle, Position, useReactFlow } from "reactflow";
import { actionsDispatcher } from "../../../../sceneFunctions/actionDispatcher";
import { ActionButton } from "../../Buttons/ActionButton";

import { Button } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import { toast } from "sonner";
import { useCurrentScene } from "../../../../badProvider/functions";
const MeshTriggers = (props) => {
  const theme = useTheme();
  const scene = useCurrentScene();
  const reactFlowInstance = useReactFlow();
  const node = props.node;

  const [showOnPointerPickRefs, setShowOnPointerPickRefs] = useState(false);
  const [showOnDoublePickRefs, setShowOnDoublePickRefs] = useState(false);
  const [showOnPointerOverRefs, setShowOnPointerOverRefs] = useState(false);
  const [showOnPointerOutRefs, setShowOnPointerOutRefs] = useState(false);

  const [showOnDragStartRefs, setShowOnDragStartRefs] = useState(false);
  const [showOnDragRefs, setShowOnDragRefs] = useState(false);
  const [showOnDragEndRefs, setShowOnDragEndRefs] = useState(false);

  return (
    <>
      {node.hasOwnProperty("onPickTrigger") ? (
        <>
          <div className="referenceHandle">
            {node.onPickTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowOnPointerPickRefs(!showOnPointerPickRefs)}>
                  Actions{" "}
                  {showOnPointerPickRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showOnPointerPickRefs ? (
                  <div className="referencesList">
                    {node.onPickTrigger.map((a, i) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        return <ActionButton key={i} node={scene.actions[a]} />;
                      }
                      return null;
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <div />
            )}
            <div>
              <div className="handles">
                <Button
                  // style={{ background: theme.palette.default.main, color: theme.palette.light.main }}
                  onClick={() => {
                    node["onPickTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton meshTriggerButton"
                >
                  On Click
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onPickTrigger && node.onPickTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onPickTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onPickTrigger"].includes(e.targetHandle) && target.type === "Action") {
                      return node["onPickTrigger"].push(e.targetHandle);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : null}

      {node.hasOwnProperty("onDoublePickTrigger") ? (
        <>
          <div className="referenceHandle">
            {node.onDoublePickTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowOnDoublePickRefs(!showOnDoublePickRefs)}>
                  Actions{" "}
                  {showOnDoublePickRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showOnDoublePickRefs ? (
                  <div className="referencesList">
                    {node.onDoublePickTrigger.map((a, i) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        return <ActionButton key={i} node={scene.actions[a]} />;
                      }
                      return null;
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <div />
            )}
            <div>
              <div className="handles">
                <Button
                  // style={{ background: theme.palette.default.main, color: theme.palette.light.main }}
                  onClick={() => {
                    node["onDoublePickTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton meshTriggerButton"
                >
                  On Double Click
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onDoublePickTrigger && node.onDoublePickTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onDoublePickTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);

                    if (!node["onDoublePickTrigger"].includes(e.targetHandle) && target.type === "Action") {
                      return node["onDoublePickTrigger"].push(e.targetHandle);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : null}
      {node.hasOwnProperty("onPointerOverTrigger") ? (
        <>
          <div className="referenceHandle">
            {node.onPointerOverTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowOnPointerOverRefs(!showOnPointerOverRefs)}>
                  Actions{" "}
                  {showOnPointerOverRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showOnPointerOverRefs ? (
                  <div className="referencesList">
                    {node.onPointerOverTrigger.map((a, i) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        return <ActionButton key={i} node={scene.actions[a]} />;
                      }
                      return null;
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <div />
            )}
            <div>
              <div className="handles">
                <Button
                  // style={{ background: theme.palette.default.main, color: theme.palette.light.main }}
                  onClick={() => {
                    node["onPointerOverTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton meshTriggerButton"
                >
                  On Over
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onPointerOverTrigger && node.onPointerOverTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onPointerOverTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);

                    if (!node["onPointerOverTrigger"].includes(e.targetHandle) && target.type === "Action") {
                      return node["onPointerOverTrigger"].push(e.targetHandle);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : null}
      {node.hasOwnProperty("onPointerOutTrigger") ? (
        <>
          <div className="referenceHandle">
            {node.onPointerOutTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowOnPointerOutRefs(!showOnPointerOutRefs)}>
                  Actions{" "}
                  {showOnPointerOutRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showOnPointerOutRefs ? (
                  <div className="referencesList">
                    {node.onPointerOutTrigger.map((a, i) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        return <ActionButton key={i} node={scene.actions[a]} />;
                      }
                      return null;
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <div />
            )}
            <div>
              <div className="handles">
                <Button
                  // style={{ background: theme.palette.default.main, color: theme.palette.light.main }}
                  onClick={() => {
                    node["onPointerOutTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton meshTriggerButton"
                >
                  On Over Out
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onPointerOutTrigger && node.onPointerOutTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onPointerOutTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onPointerOutTrigger"].includes(e.target) && target.type === "Action") {
                      return node["onPointerOutTrigger"].push(e.targetHandle);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : null}

      {node.hasOwnProperty("pointerDragBehavior") ? (
        <>
          <div className="referenceHandle">
            {node.onDragStartTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowOnDragStartRefs(!showOnDragStartRefs)}>
                  Actions{" "}
                  {showOnDragStartRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showOnDragStartRefs ? (
                  <div className="referencesList">
                    {node.onDragStartTrigger.map((a, i) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        return <ActionButton key={i} node={scene.actions[a]} />;
                      }
                      return null;
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <div />
            )}
            <div>
              <div className="handles">
                <Button
                  // style={{ background: theme.palette.default.main, color: theme.palette.light.main }}
                  onClick={() => {
                    node["onDragStartTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton meshTriggerButton"
                >
                  On Drag Start
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onDragStartTrigger && node.onDragStartTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onDragStartTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onDragStartTrigger"].includes(e.targetHandle) && target.type === "Action") {
                      return node["onDragStartTrigger"].push(e.targetHandle);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="referenceHandle">
            {node.onDragTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowOnDragRefs(!showOnDragRefs)}>
                  Actions{" "}
                  {showOnDragRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showOnDragRefs ? (
                  <div className="referencesList">
                    {node.onDragTrigger.map((a, i) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        return <ActionButton key={i} node={scene.actions[a]} />;
                      }
                      return null;
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <div />
            )}
            <div>
              <div className="handles">
                <Button
                  // style={{ background: theme.palette.default.main, color: theme.palette.light.main }}
                  onClick={() => {
                    node["onDragTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton meshTriggerButton"
                >
                  On Drag
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onDragTrigger && node.onDragTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onDragTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onDragTrigger"].includes(e.targetHandle) && target.type === "Action") {
                      return node["onDragTrigger"].push(e.targetHandle);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="referenceHandle">
            {node.onDragEndTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowOnDragEndRefs(!showOnDragEndRefs)}>
                  Actions{" "}
                  {showOnDragEndRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showOnDragEndRefs ? (
                  <div className="referencesList">
                    {node.onDragEndTrigger.map((a, i) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        return <ActionButton key={i} node={scene.actions[a]} />;
                      }
                      return null;
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <div />
            )}
            <div>
              <div className="handles">
                <Button
                  // style={{ background: theme.palette.default.main, color: theme.palette.light.main }}
                  onClick={() => {
                    node["onDragEndTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton meshTriggerButton"
                >
                  On Drag End
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onDragEndTrigger && node.onDragEndTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onDragEndTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onDragEndTrigger"].includes(e.targetHandle) && target.type === "Action") {
                      return node["onDragEndTrigger"].push(e.targetHandle);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default MeshTriggers;
