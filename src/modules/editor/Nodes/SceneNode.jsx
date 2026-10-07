import React, { useState } from "react";
import Fields from "../NodeFields";

import { Handle, Position, useReactFlow } from "reactflow";
import { ActionButton } from "../Buttons/ActionButton";

import { actionsDispatcher } from "../../../sceneFunctions/actionDispatcher";

import { Button, Tooltip } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import { toast } from "sonner";
import { useCollapsedNodes, useCurrentScene, useUpdateCollapsedNodes } from "../../../badProvider/functions";
export function SceneNode(props) {
  const [showOnBeforeRenderRefs, setShowOnBeforeRenderRefs] = useState(false);

  const [showOnAfterRenderRefs, setShowOnAfterRenderRefs] = useState(false);

  const [showOnLoadRefs, setShowOnLoadRefs] = useState(false);

  const [showPointerPickRefs, setShowPointerPickRefs] = useState(false);
  const [showPointerDownRefs, setShowPointerDownRefs] = useState(false);
  const [showPointerMoveRefs, setShowPointerMoveRefs] = useState(false);

  const [showPointerUpRefs, setShowPointerUpRefs] = useState(false);

  const [showPointerDoubleTapRefs, setShowPointerDoubleTapRefs] = useState(false);

  const theme = useTheme();
  const reactFlowInstance = useReactFlow();
  const scene = useCurrentScene();

  const collapsedNodes = useCollapsedNodes();
  const updateCollapsedNodes = useUpdateCollapsedNodes();

  const node = props.data.node;

  const collapsed = collapsedNodes.includes(node.name);
  const setCollapsed = (nodeName) => {
    const collapsedCopy = [...collapsedNodes];

    if (collapsedCopy.includes(nodeName)) {
      collapsedCopy.splice(collapsedCopy.indexOf(nodeName), 1);
    } else {
      collapsedCopy.push(nodeName);
    }
    updateCollapsedNodes(collapsedCopy);
  };

  node.name = "scene";

  if (props.data.node["nodePosition"]) {
    props.data.node["nodePosition"] = { x: props.xPos, y: props.yPos };
  }
  if (!node.hasOwnProperty("badChanges")) {
    node.badChanges = {};
  }
  // node.badChanges["nodePosition"] = props.data.node["nodePosition"];

  const onClose = () => {
    scene.closeNode(node.name);
  };
  return (
    <div className="node" style={{ background: theme.palette.background.default, outlineColor: theme.palette.grey.main }}>
      <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
        <strong className="nodeTitle">
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
            panorama
          </span>
          <span onClick={() => setCollapsed(node.name)}>Scene Settings</span>
        </strong>

        <div className="nodeActions">
          <Tooltip title="Close" arrow placement="top">
            <button className="nodeHeaderAction" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </Tooltip>
        </div>
      </div>
      {!collapsed ? (
        <div className="nodeInner">
          {/* <Fields node={scene.getEngine()} /> */}
          <Fields node={node} />
          {/* <Fields node={scene.effects.defaultRenderingPipeline} /> */}

          <div className="referenceHandle">
            {node.onLoadTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowOnLoadRefs(!showOnLoadRefs)}>
                  Actions
                  {showOnLoadRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showOnLoadRefs ? (
                  <div className="referencesList">
                    {node.onLoadTrigger.map((a, i) => {
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
                    node["onLoadTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton sceneTriggerButton"
                >
                  On Start
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onLoadTrigger && node.onLoadTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onLoadTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onLoadTrigger"].includes(e.target) && target.type === "Action") {
                      return node["onLoadTrigger"].push(e.target);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="referenceHandle">
            {node.onBeforeFrameTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowOnBeforeRenderRefs(!showOnBeforeRenderRefs)}>
                  Actions
                  {showOnBeforeRenderRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showOnBeforeRenderRefs ? (
                  <div className="referencesList">
                    {node.onBeforeFrameTrigger.map((a, i) => {
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
                    node["onBeforeFrameTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton sceneTriggerButton"
                >
                  On Before Frame
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onBeforeFrameTrigger && node.onBeforeFrameTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onBeforeFrameTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onBeforeFrameTrigger"].includes(e.target) && target.type === "Action") {
                      return node["onBeforeFrameTrigger"].push(e.target);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="referenceHandle">
            {node.onAfterFrameTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowOnAfterRenderRefs(!showOnAfterRenderRefs)}>
                  Actions
                  {showOnAfterRenderRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showOnAfterRenderRefs ? (
                  <div className="referencesList">
                    {node.onAfterFrameTrigger.map((a, i) => {
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
                    node["onAfterFrameTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton sceneTriggerButton"
                >
                  On After Frame
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onAfterFrameTrigger && node.onAfterFrameTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onAfterFrameTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onAfterFrameTrigger"].includes(e.target) && target.type === "Action") {
                      return node["onAfterFrameTrigger"].push(e.target);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="referenceHandle">
            {node.onPointerPickTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowPointerPickRefs(!showPointerPickRefs)}>
                  Actions
                  {showPointerPickRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showPointerPickRefs ? (
                  <div className="referencesList">
                    {node.onPointerPickTrigger.map((a, i) => {
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
                    node["onPointerPickTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton sceneTriggerButton"
                >
                  On Click
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onPointerPickTrigger && node.onPointerPickTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onPointerPickTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onPointerPickTrigger"].includes(e.target) && target.type === "Action") {
                      return node["onPointerPickTrigger"].push(e.target);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="referenceHandle">
            {node.onPointerDoubleTapTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowPointerDoubleTapRefs(!showPointerDoubleTapRefs)}>
                  Actions
                  {showPointerUpRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showPointerUpRefs ? (
                  <div className="referencesList">
                    {node.onPointerDoubleTapTrigger.map((a, i) => {
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
                    node["onPointerDoubleTapTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton sceneTriggerButton"
                >
                  On Double Click
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onPointerDoubleTapTrigger && node.onPointerDoubleTapTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onPointerDoubleTapTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onPointerDoubleTapTrigger"].includes(e.target) && target.type === "Action") {
                      return node["onPointerDoubleTapTrigger"].push(e.target);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="referenceHandle">
            {node.onPointerDownTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowPointerDownRefs(!showPointerDownRefs)}>
                  Actions
                  {showPointerDownRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showPointerDownRefs ? (
                  <div className="referencesList">
                    {node.onPointerDownTrigger.map((a, i) => {
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
                    node["onPointerDownTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton sceneTriggerButton"
                >
                  On Pointer Down
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onPointerDownTrigger && node.onPointerDownTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onPointerDownTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onPointerDownTrigger"].includes(e.target) && target.type === "Action") {
                      return node["onPointerDownTrigger"].push(e.target);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="referenceHandle">
            {node.onPointerMoveTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowPointerMoveRefs(!showPointerMoveRefs)}>
                  Actions
                  {showPointerMoveRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showPointerMoveRefs ? (
                  <div className="referencesList">
                    {node.onPointerMoveTrigger.map((a, i) => {
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
                    node["onPointerMoveTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton sceneTriggerButton"
                >
                  On Pointer Move
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onPointerMoveTrigger && node.onPointerMoveTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onPointerMoveTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onPointerMoveTrigger"].includes(e.target) && target.type === "Action") {
                      return node["onPointerMoveTrigger"].push(e.target);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="referenceHandle">
            {node.onPointerUpTrigger.length ? (
              <div className="references" style={{ backgroundColor: theme.palette.background.default, width: "100%" }}>
                <div className="referencesTitle" onClick={() => setShowPointerUpRefs(!showPointerUpRefs)}>
                  Actions
                  {showPointerUpRefs ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </div>
                {showPointerUpRefs ? (
                  <div className="referencesList">
                    {node.onPointerUpTrigger.map((a, i) => {
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
                    node["onPointerUpTrigger"].forEach((a) => {
                      if (scene.actions.hasOwnProperty(a)) {
                        //  console.log("starting", scene.actions[id]);
                        return actionsDispatcher(scene, scene.actions[a]);
                      }
                    });
                  }}
                  className="FunctionButton sceneTriggerButton"
                >
                  On Pointer Up
                </Button>
                <Handle
                  className={"sourceHandle multiple red " + (node.onPointerUpTrigger && node.onPointerUpTrigger.length ? "connected" : "")}
                  type="source"
                  id={"onPointerUpTrigger"}
                  position={Position.Right}
                  onConnect={(e) => {
                    const target = reactFlowInstance.getNode(e.target);
                    if (!node["onPointerUpTrigger"].includes(e.target) && target.type === "Action") {
                      return node["onPointerUpTrigger"].push(e.target);
                    }
                    return toast.error("Bad Connection :(");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="nodeHidden">
            <span>Type: {node.getClassName()}</span>
            <br />
            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Id: {node.name}</span>
              <span
                className="material-symbols-outlined"
                onClick={() => {
                  navigator.clipboard.writeText(node.name);
                  toast("Id copied to clipboard");
                }}
                style={{ marginLeft: "0.5em", cursor: "pointer" }}
              >
                content_copy
              </span>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
