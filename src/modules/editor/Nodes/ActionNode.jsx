import React, { useEffect, useState } from "react";

import { Handle, Position } from "reactflow";
import Animate from "./Actions/Animate";
import Sequencer from "./Actions/Sequencer";
import Timeline from "./Actions/Timeline";

import { actionsDispatcher } from "../../../sceneFunctions/actionDispatcher";

import EnterAR from "./Actions/EnterAR";
import Overlays from "./Actions/Overlays";
import SaveConfig from "./Actions/SaveConfig";

import { Button, Tooltip, useTheme } from "@mui/material";
import { toast } from "sonner";
import { useCollapsedNodes, useCurrentScene, useUpdateCollapsedNodes } from "../../../badProvider/functions";
import { ActionButton } from "../Buttons/ActionButton";
import { AddtoCollectionButton } from "../Components/AddToCollectionButton";
import { ConfirmDialog } from "../ConfirmDialog";
import Marqueeno from "../Marqueeno";
import Fields from "../NodeFields";
import AddReplace from "./Actions/AddReplace";
import Condition from "./Actions/Condition";
import EnterVTO from "./Actions/EnterVTO";
import ExportScene from "./Actions/ExportScene";
import Expression from "./Actions/Expression";
import ExternalLink from "./Actions/ExternalLink";
import Math from "./Actions/Math";
import Screenshot from "./Actions/Screenshot";

export function ActionNode(props) {
  const theme = useTheme();
  const scene = useCurrentScene();
  const collapsedNodes = useCollapsedNodes();
  const updateCollapsedNodes = useUpdateCollapsedNodes();
  const node = props.data.node;
  const [showReferences, setShowReferences] = useState(false);
  const [showEndReferences, setShowEndReferences] = useState(false);
  const [showButtonScript, setShowButtonScript] = useState(false);

  const [triggeredByState, setTriggeredByState] = useState({});

  const [endActionsState, setEndActionsState] = useState({});

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

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
  if (props.data.node["nodePosition"]) {
    props.data.node["nodePosition"] = { x: props.xPos, y: props.yPos };
  }
  if (!node.hasOwnProperty("badChanges")) {
    node.badChanges = {};
  }
  // node.badChanges["nodePosition"] = props.data.node["nodePosition"];

  useEffect(() => {
    const endActions = {};
    const triggeredBy = {};
    try {
      if (node.endActions !== undefined && node.endActions.length > 0) {
        node.endActions.forEach((action) => {
          if (scene.actions[action] !== undefined) {
            endActions[action] = scene.actions[action];
          }
        });
      }

      scene.meshes.forEach((m) => {
        if (
          m.onPickTrigger?.includes(node.name) ||
          m.onDoublePickTrigger?.includes(node.name) ||
          m.onPointerOverTrigger?.includes(node.name) ||
          m.onPointerOutTrigger?.includes(node.name) ||
          m.onDragStartTrigger?.includes(node.name) ||
          m.onDragTrigger?.includes(node.name) ||
          m.onDragEndTrigger?.includes(node.name)
        ) {
          triggeredBy[m.name] = m;
        }
      });

      if (
        scene.onLoadTrigger?.includes(node.name) ||
        scene.onBeforeFrameTrigger?.includes(node.name) ||
        scene.onAfterFrameTrigger?.includes(node.name) ||
        scene.onPointerPickTrigger?.includes(node.name) ||
        scene.onPointerDoubleTapTrigger?.includes(node.name) ||
        scene.onPointerDownTrigger?.includes(node.name) ||
        scene.onPointerMoveTrigger?.includes(node.name) ||
        scene.onPointerUpTrigger?.includes(node.name)
      ) {
        triggeredBy["Scene"] = scene;
      }

      Object.values(scene.actions).map((a) => {
        if (a.endActions !== undefined && a.endActions.length > 0 && a.name !== node.name) {
          a.endActions.forEach((action) => {
            if (scene.actions[action] !== undefined && action === node.name) {
              triggeredBy[a.name] = scene.actions[a.name];
            }
          });
        }

        if (a.type === "Sequencer") {
          return Object.values(a.steps).map((s) => {
            if (s.includes(node.name)) {
              return (triggeredBy[a.name] = a);
            }
          });
        } else if (a.type === "Timeline") {
          return a.actions.map((s) => {
            if (s.name === node.name) {
              return (triggeredBy[a.name] = a);
            }
          });
        } else if (a.type === "Condition") {
          if (a.trueActions && a.trueActions.includes(node.name)) {
            return (triggeredBy[a.name] = a);
          } else if (a.falseActions && a.falseActions.includes(node.name)) {
            return (triggeredBy[a.name] = a);
          }
        }
        return null;
      });

      Object.values(scene.overlays).map((o) => {
        if (o.overlayData?.json && o.overlayData.json.includes(node.name)) {
          return (triggeredBy[o.name] = o);
        } else {
          return null;
        }
      });

      setTriggeredByState(triggeredBy);
      setEndActionsState(endActions);
    } catch (error) {
      console.warn(error);
    }
  }, []);

  const onDuplicate = () => {
    const id = "Action_" + Date.now();
    //  scene.actions[id] = { ...props.data.node };
    scene.actions[id] = JSON.parse(JSON.stringify(props.data.node));
    delete scene.actions[id].nodePosition;
    scene.actions[id].name = id;
    scene.actions[id].displayName = props.data.node.displayName + " Copy";
    scene.actions[id].getClassName = () => {
      return "Action";
    };
    setTimeout(() => {
      scene.openNode("Action", scene.actions[id]);
    });
  };

  const onClose = () => {
    scene.closeNode(node.name);
  };

  const onRemove = () => {
    delete scene.actions[node.name];
    scene.closeNode(node.name);
  };

  const onStartAction = (opt) => {
    actionsDispatcher(scene, node, opt);
  };

  const onEndActions = (opt) => {
    if (props.onEnd !== undefined) {
      props.onEnd.forEach((endAction) => {
        if (scene.actions[endAction]) {
          actionsDispatcher(scene, scene.actions[endAction], opt);
        }
      });
    }
  };

  return (
    <div
      className="node"
      style={{ background: theme.palette.background.default, outlineColor: theme.palette.red.main, minWidth: "360px", width: collapsed ? "" : "auto" }}
    >
      <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
        <strong className="nodeTitle">
          {node.type === "Animate" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              directions_run
            </span>
          ) : node.type === "Timeline" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              schedule
            </span>
          ) : node.type === "Sequencer" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              chevron_right
            </span>
          ) : node.type === "Overlays" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              web_asset
            </span>
          ) : node.type === "EnterAR" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              view_in_ar
            </span>
          ) : node.type === "EnterVTO" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              person
            </span>
          ) : node.type === "SaveConfig" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              save
            </span>
          ) : node.type === "ExternalLink" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              link
            </span>
          ) : node.type === "Condition" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              equal
            </span>
          ) : node.type === "Math" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              functions
            </span>
          ) : node.type === "AddReplace" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              move_down
            </span>
          ) : node.type === "Screenshot" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              capture
            </span>
          ) : node.type === "ExportScene" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              download
            </span>
          ) : node.type === "Expression" ? (
            <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
              function
            </span>
          ) : null}

          <span
            onClick={() => {
              setCollapsed(node.name);
            }}
          >
            <Marqueeno text={node.displayName || node.name} />
          </span>
        </strong>
        <div className="nodeActions">
          <Tooltip title="Add to Collection" arrow placement="top">
            <span>
              <AddtoCollectionButton node={node} />
            </span>
          </Tooltip>
          {collapsed ? (
            <Tooltip title="Start Action" arrow placement="top">
              <button className="nodeHeaderAction" onClick={onStartAction}>
                <span className="material-symbols-outlined"> play_arrow</span>
              </button>
            </Tooltip>
          ) : null}

          <Tooltip title="Duplicate" arrow placement="top">
            <button className="nodeHeaderAction" onClick={onDuplicate}>
              <span className="material-symbols-outlined">content_copy</span>
            </button>
          </Tooltip>
          <Tooltip title="Delete" arrow placement="top">
            <button
              className="nodeHeaderAction"
              style={{ color: "#f44336" }}
              onClick={() => {
                setOpenConfirmDialog(true);
              }}
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </Tooltip>

          <Tooltip title="Close" arrow placement="top">
            <button className="nodeHeaderAction" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </Tooltip>
        </div>
      </div>
      {!collapsed ? (
        <div className="nodeInner" style={{ display: "block" }}>
          <div className="actionHandles">
            <div className="actionInputHandle" style={{ marginBottom: "1em" }}>
              <Button onClick={onStartAction} className="FunctionButton" style={{ width: "200px" }}>
                Start
                <span className="material-symbols-outlined">play_arrow</span>
              </Button>
              <Handle className="targetHandle multiple red connected" type="target" onConnect={(e) => {}} id={node.name} position={Position.Left} />
            </div>

            {/* <div className="field Boolean" style={{ width: "160px", justifyContent: "flex-end" }}>
              <span style={{ color: theme.palette.text.primary }}>Track Event</span>
              <Switch
                size="small"
                defaultChecked={node.trackEvent}
                onChange={(e) => {
                  node.trackEvent = e.target.checked;
                }}
              ></Switch>
            </div> */}

            {node.type === "Animate" ||
            node.type === "Overlays" ||
            node.type === "Math" ||
            node.type === "Expression" ||
            node.type === "Condition" ||
            node.type === "SaveConfig" ? (
              <div className="actionEndHandle" style={{ marginBottom: "1em" }}>
                <Button onClick={onEndActions} className="FunctionButton" style={{ width: "200px" }}>
                  End
                  <span className="material-symbols-outlined">play_arrow</span>
                </Button>
                <Handle
                  className="sourceHandle multiple red connected"
                  type="source"
                  onConnect={(e) => {
                    // const target = reactFlowInstance.getNode(e.target);
                    console.log(e.target);
                    if (scene.actions.hasOwnProperty(e.target)) {
                      if (node.endActions === undefined) {
                        node.endActions = [];
                      }

                      if (!node.endActions.includes(e.target) && e.target !== node.name) {
                        return node.endActions.push(e.target);
                      }
                    }
                    return toast.error("Bad Connection :(");
                  }}
                  id={node.name + "end"}
                  position={Position.Right}
                />
              </div>
            ) : null}
          </div>
          <div className="nodeInner" style={{ width: "360px", padding: 0 }}>
            <Fields node={node} />
          </div>
          {node.type === "Timeline" ? (
            <Timeline node={node} />
          ) : node.type === "Sequencer" ? (
            <Sequencer node={node} />
          ) : node.type === "Animate" ? (
            <Animate node={node} />
          ) : node.type === "Overlays" ? (
            <Overlays node={node} />
          ) : node.type === "EnterAR" ? (
            <EnterAR node={node} />
          ) : node.type === "EnterVTO" ? (
            <EnterVTO node={node} />
          ) : node.type === "SaveConfig" ? (
            <SaveConfig node={node} />
          ) : node.type === "ExternalLink" ? (
            <ExternalLink node={node} />
          ) : node.type === "Condition" ? (
            <Condition node={node} />
          ) : node.type === "Math" ? (
            <Math node={node} />
          ) : node.type === "AddReplace" ? (
            <AddReplace node={node} />
          ) : node.type === "Screenshot" ? (
            <Screenshot node={node} />
          ) : node.type === "ExportScene" ? (
            <ExportScene node={node} />
          ) : node.type === "Expression" ? (
            <Expression node={node} />
          ) : null}

          {Object.values(triggeredByState).length ? (
            <div className="references" style={{ backgroundColor: theme.palette.background.light, width: "100%", marginTop: "0.5em" }}>
              <div className="referencesTitle" onClick={() => setShowReferences(!showReferences)}>
                Triggered by{" "}
                {showReferences ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )}
              </div>
              {showReferences ? (
                <div className="referencesList">
                  {Object.values(triggeredByState).map((e) => {
                    if (e.getClassName !== undefined && e.getClassName() === "Action") {
                      return <ActionButton key={e.id} node={e} />;
                    }
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          {node.endActions !== undefined && node.endActions.length ? (
            <div className="references" style={{ backgroundColor: theme.palette.background.light, width: "100%", marginTop: "0.5em" }}>
              <div className="referencesTitle" onClick={() => setShowEndReferences(!showEndReferences)}>
                On End
                {showEndReferences ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )}
              </div>
              {showEndReferences ? (
                <div className="referencesList">
                  {Object.values(endActionsState).map((e) => {
                    return <ActionButton key={e.name} node={e} />;
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          <div
            className="references"
            style={{
              width: "100%",
              backgroundColor: theme.palette.background.light,
              marginTop: "0.5em",
            }}
          >
            <div className="referencesTitle" onClick={() => setShowButtonScript(!showButtonScript)}>
              Button Script{" "}
              {showButtonScript ? (
                <span className="material-symbols-outlined">expand_more</span>
              ) : (
                <span className="material-symbols-outlined">chevron_right</span>
              )}
            </div>
            {showButtonScript ? (
              <div className="referencesList">
                <textarea
                  value={`<button
onclick='
document.getElementById("badvisor")
.contentWindow.postMessage(
{ type: "startAction", name: "${node.displayName}"}, "*")'
>
${node.displayName}
</button>`}
                  style={{
                    width: "100%",
                    height: "180px",
                    marginTop: "1em",
                    background: theme.palette.background.dark,
                    color: theme.palette.text.default,
                  }}
                />
              </div>
            ) : null}
          </div>

          {/* <div className="nodeHidden">
            <span>Type: {node.type}</span>
            <br />
            <span style={{ display: "flex", alignItems: "center" }}>
              Id: <input type="text" defaultValue={node.name} /> <span></span>
            </span>
          </div> */}
        </div>
      ) : null}
      <ConfirmDialog
        open={openConfirmDialog}
        confirm={() => {
          setOpenConfirmDialog(false);
          onRemove();
        }}
        cancel={() => {
          setOpenConfirmDialog(false);
        }}
        text="Are you sure you want to remove this action?"
      />
    </div>
  );
}
