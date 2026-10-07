import { Button } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import { useEffect, useState } from "react";

import {
  useCurrentScene,
  useEditorOverlay,
  useEditorState,
  useUpdateEditorOverlay,
  useUpdateEditorState,
  useUpdateViewportSize,
} from "../../badProvider/functions";
import { Elements } from "./Elements";
import Essentials from "./Essentials";
import Marqueeno from "./Marqueeno";
import { OverlayNode } from "./Nodes/OverlayNode";
import Outliner from "./Outliner";
import { SidebarButtonGroup } from "./SidebarButtonGroup";

const Sidebar = () => {
  const theme = useTheme();

  const scene = useCurrentScene();

  const editorState = useEditorState();

  const editorOverlay = useEditorOverlay();

  const updateEditorState = useUpdateEditorState();
  const updateViewportSize = useUpdateViewportSize();
  const updateEditorOverlay = useUpdateEditorOverlay();

  setTimeout(() => {
    scene.getEngine().resize();
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [collapse, setCollapse] = useState(false);
  const [customSize, setCustomSize] = useState({
    width: document.getElementById("renderCanvas").offsetWidth,
    height: document.getElementById("renderCanvas").offsetHeight,
  });

  useEffect(() => {
    // if (scene.sceneData?.editorState && (editorState === "elements" || editorState === "outliner" || editorState === "essentials")) {
    //   updateEditorState(scene.sceneData.editorState);
    // } else {

    updateEditorState("outliner");
    // }
  }, []);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onViewportChange = (value) => {
    updateViewportSize(value);
  };

  const onClickCloseOverlayEditor = () => {
    updateEditorOverlay(null);
  };

  const onVEditorStateChange = (value) => {
    scene.sceneData.editorState = value;

    updateEditorState(value);
  };

  const toggleCollapse = () => {
    setCollapse(!collapse);

    // scene.getEngine.resize();
  };

  return scene ? (
    <>
      {!editorOverlay ? (
        <button
          onClick={toggleCollapse}
          style={{
            position: "absolute",
            top: "50%",
            height: "3em",
            width: "1.5em",
            marginTop: "-1.5em",

            background: theme.palette.background.dark,
            marginLeft: "-1.5em",
            borderRadius: "3em 0 0 3em",
            padding: "0.5em",
            textAlign: "left",
          }}
        >
          {collapse ? <span className="material-symbols-outlined"> chevron_left</span> : <span className="material-symbols-outlined"> chevron_right</span>}
        </button>
      ) : null}
      <div id="editorSidebar" style={{ background: theme.palette.background.dark, display: collapse ? "none" : "flex" }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 12,
            background: theme.palette.background.dark,
            borderBottom: `solid 1px ${theme.palette.grey.main}`,
          }}
        >
          {!editorOverlay ? (
            <>
              <div style={{ display: "flex", width: "100%", justifyContent: "space-between", borderBottom: "solid 1px" + theme.palette.grey.main }}>
                <Button
                  variant={editorState === "elements" ? "contained" : "text"}
                  style={{ borderRadius: 0, boxShadow: "none", width: "50%", border: "none", padding: 0 }}
                  onClick={() => onVEditorStateChange("elements")}
                >
                  <span style={{ marginRight: "0.5em" }} className="material-symbols-outlined">
                    add
                  </span>{" "}
                  Elements
                </Button>
                <Button
                  variant={editorState === "essentials" ? "contained" : "text"}
                  style={{ borderRadius: 0, boxShadow: "none", width: "50%", border: "none", padding: 0 }}
                  onClick={() => onVEditorStateChange("essentials")}
                >
                  <span style={{ marginRight: "0.5em" }} className="material-symbols-outlined">
                    rocket_launch
                  </span>{" "}
                  Essentials
                </Button>
                <Button
                  variant={editorState === "outliner" ? "contained" : "text"}
                  style={{ borderRadius: 0, boxShadow: "none", width: "50%", border: "none", padding: 0 }}
                  onClick={() => onVEditorStateChange("outliner")}
                >
                  <span style={{ marginRight: "0.5em" }} className="material-symbols-outlined">
                    account_tree
                  </span>{" "}
                  Outliner
                </Button>
              </div>
              {scene.mainData.name || scene.mainData.handle ? (
                <div style={{ display: "flex", width: "100%", justifyContent: "space-between", padding: "0.25em 1em" }}>
                  <Marqueeno text={scene.mainData.name || scene.mainData.handle} />
                </div>
              ) : null}
            </>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr" }}>
              <Button
                style={{
                  justifyContent: "flex-start",
                }}
                onClick={() => onClickCloseOverlayEditor()}
              >
                <span className="material-symbols-outlined">arrow_back</span> back to 3D
              </Button>
            </div>
          )}
        </div>
        <div style={{ height: "100%", overflow: "auto" }}>
          {editorOverlay ? (
            <OverlayNode node={editorOverlay} />
          ) : editorState === "outliner" ? (
            <Outliner />
          ) : editorState === "elements" ? (
            <Elements />
          ) : editorState === "essentials" ? (
            <Essentials />
          ) : null}
        </div>

        <SidebarButtonGroup />
      </div>
    </>
  ) : null;
};

export default Sidebar;
