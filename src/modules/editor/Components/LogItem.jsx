import useTheme from "@mui/material/styles/useTheme";
import { useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";
import { getSceneElementByName } from "../../../helpers";
import { ActionButton } from "../Buttons/ActionButton";

export default function LogItem(props) {
  const theme = useTheme();
  const scene = useCurrentScene();

  const [collapse, setCollapse] = useState(false);

  const getItem = (a) => {
    if (!props.actionsLog) return null;
    return props.actionsLog.find((action) => action.name === a);
  };

  return (
    <div style={{ overflow: "hidden" }}>
      <span style={{ opacity: 0.5, fontSize: "0.6em" }}>{new Date(props.action.firedTime).toISOString().substr(11, 8)}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "0.2em" }}>
        {props.action.actions?.length || props.action.trueActions?.length || props.action.falseActions?.length || props.action.steps ? (
          <span className="material-symbols-outlined" onClick={() => setCollapse(!collapse)}>
            {collapse ? "expand_more" : "chevron_right"}
          </span>
        ) : null}
        <Icons item={props.action} />
        <ActionButton node={getSceneElementByName(scene, props.action.name)} />
      </div>

      {collapse && props.action.subAction && getSceneElementByName(scene, props.action.subAction) && (
        <div style={{ borderLeft: "1px solid " + theme.palette.red.main, marginLeft: "0.6em" }}>
          <div style={{ marginLeft: "1.25em", display: "flex", alignItems: "center", gap: "0.2em" }}>
            <Icons item={getItem(props.action.subAction)} />
            <ActionButton node={getSceneElementByName(scene, props.action.subAction)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Icons(props) {
  const theme = useTheme();
  if (!props.item) return null;
  return (
    <span style={{ color: theme.palette.red.main }} className="material-symbols-outlined">
      {props.item.type === "Animate" ? (
        <span className="material-symbols-outlined">directions_run</span>
      ) : props.item.type === "Timeline" ? (
        <span className="material-symbols-outlined">schedule</span>
      ) : props.item.type === "Sequencer" ? (
        <span className="material-symbols-outlined">chevron_right</span>
      ) : props.item.type === "Overlays" ? (
        <span className="material-symbols-outlined">web_asset</span>
      ) : props.item.type === "EnterAR" ? (
        <span className="material-symbols-outlined">view_in_ar</span>
      ) : props.item.type === "SaveConfig" ? (
        <span className="material-symbols-outlined">save</span>
      ) : props.item.type === "ExternalLink" ? (
        <span className="material-symbols-outlined">link</span>
      ) : props.item.type === "Condition" ? (
        <span className="material-symbols-outlined">equal</span>
      ) : props.item.type === "Math" ? (
        <span className="material-symbols-outlined">functions</span>
      ) : props.item.type === "AddReplace" ? (
        <span className="material-symbols-outlined">move_down</span>
      ) : null}
    </span>
  );
}
