import React, { useEffect, useState } from "react";

import { MenuItem, Select, Slider } from "@mui/material";
import { Handle, Position } from "reactflow";

import { useTheme } from "@emotion/react";
import { useCurrentScene } from "../../../../badProvider/functions";
import { ActionButton } from "../../Buttons/ActionButton";
import { NumberInput } from "../../Components/NumberInput";
const Timeline = (props) => {
  const scene = useCurrentScene();
  const theme = useTheme();
  const node = props.node;

  const [update, setUpdate] = useState(false);

  const [duration, setDuration] = useState(node.duration);

  const [loopMode, setLoopMode] = useState(node.loopMode || "None");
  const onLoopModeChange = (e) => {
    node.loopMode = e.target.value;
    setLoopMode(e.target.value);
  };
  const onLoopConstantChange = (e) => {
    node.loopConstant = e.target.value;
  };

  useEffect(() => {}, []);

  const onDurationBlur = (e) => {
    setDuration(parseInt(e.target.value));
    node.duration = parseInt(e.target.value);
  };
  return (
    <div>
      <div className="nodeInner">
        <div className="field">
          <NumberInput
            label={
              <span>
                Duration (frames) <span style={{ flexShrink: 0, opacity: 0.5 }}>{(duration / 60).toFixed(2)} s</span>
              </span>
            }
            onBlur={onDurationBlur}
            value={duration}
            disableDrag={true}
          />
        </div>
        <div className="field Select">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                width: "33%",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
                paddingRight: "1em",
              }}
            >
              Loop
            </span>

            <Select sx={{ backgroundColor: theme.palette.background.light }} style={{ width: "66%" }} defaultValue={loopMode} onChange={onLoopModeChange}>
              <MenuItem value="None" key="None">
                None
              </MenuItem>
              <MenuItem value="Constant" key="Constant">
                Constant
              </MenuItem>
              <MenuItem value="Infinite" key="Infinite">
                Infinite
              </MenuItem>
            </Select>
          </div>
        </div>
        {loopMode === "Constant" ? (
          <div className="field">
            <NumberInput label="Repetitions" value={node.loopConstant || 1} type="number" onBlur={onLoopConstantChange} />
          </div>
        ) : null}
      </div>
      <div className="animateRows" style={{ width: "640px" }}>
        {node.actions.map((a, i) => {
          if (scene.actions.hasOwnProperty(a.name)) {
            const actionNode = scene.actions[a.name];
            const onOpenAction = () => {
              return scene.openNode("Action", actionNode);
            };
            const setStart = (e) => {
              a.start = e.target.value;
            };

            return (
              <div key={i} className="animateRowSettings" style={{ justifyContent: "space-between", height: "1.6em", margin: "0.2em 0" }}>
                <span style={{ width: "33%", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <ActionButton node={actionNode} />
                </span>
                <div className="keyFrames">
                  <Slider
                    style={{ width: "100%" }}
                    onChange={setStart}
                    track={false}
                    valueLabelFormat={(value) => <div>{value}</div>}
                    valueLabelDisplay="auto"
                    type="range"
                    step="1"
                    size="small"
                    max={parseInt(duration)}
                    defaultValue={a.start}
                  ></Slider>
                </div>
                <Handle
                  className={"sourceHandle red connected"}
                  type="source"
                  onConnect={(e) => {}}
                  onClick={onOpenAction}
                  id={actionNode.name}
                  position={Position.Right}
                />
              </div>
            );
          } else {
            return null;
          }
        })}
        <div style={{ display: "flex", alignItems: "center" }}>
          <br />
          <Handle
            className={"sourceHandle red "}
            type="source"
            onConnect={(e) => {
              // var exists = false;
              // node.actions.forEach((a) => {
              //   if (a.name === e.targetHandle) {
              //     exists = true;
              //   }
              // });

              //  if (!exists) {
              node.actions.push({ start: 0, name: e.targetHandle });
              //   }

              setUpdate(!update);
            }}
            id={"addNewTimelineConnection"}
            position={Position.Right}
          />
        </div>
      </div>
    </div>
  );
};
export default Timeline;
