import { Button } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import React, { useState } from "react";
import { useCurrentScene, useIsMappingActive, useOpenNodes, useUpdateActiveGroups, useUpdateOpenNodes } from "../../badProvider/functions";
import { sceneProps } from "../../nodesProps";
import LightningsView from "./EssentialsViews/LightningsView";
import ThreeDView from "./EssentialsViews/ThreeDView";
import NodeField from "./NodeField";
import Fields from "./NodeFields";

export default function Essentials() {
  const scene = useCurrentScene();
  const theme = useTheme();
  const isMappingActive = useIsMappingActive();
  const updateActiveGroups = useUpdateActiveGroups();

  const openNodes = useOpenNodes();
  const updateOpenNodes = useUpdateOpenNodes();
  const [essentialsState, setEssentialsState] = useState("3d");

  return (
    <>
      <div style={{ height: "100%" }} className="essentialsView">
        <div
          style={{
            position: "sticky",
            top: "0em",
            background: theme.palette.background.dark,
            zIndex: 2,
            borderBottom: "1px solid " + theme.palette.grey.main,
          }}
        >
          <Button
            variant={essentialsState === "scene" ? "contained" : "text"}
            style={{ borderRadius: 0, boxShadow: "none", width: "25%" }}
            onClick={() => {
              updateOpenNodes({});
              setEssentialsState("scene");
            }}
          >
            <span style={{ marginRight: "0.25em" }} className="material-symbols-outlined">
              settings
            </span>
            Scene
          </Button>

          <Button
            style={{
              borderRadius: 0,
              boxShadow: "none",
              width: "25%",
              backgroundColor: essentialsState === "3d" && theme.palette.turquoise.main,
              color: essentialsState === "3d" && theme.palette.background.dark,
            }}
            onClick={() => {
              updateOpenNodes({});
              setEssentialsState("3d");
            }}
          >
            <span style={{ marginRight: "0.25em" }} className="material-symbols-outlined">
              deployed_code
            </span>{" "}
            3D
          </Button>

          <Button
            style={{
              borderRadius: 0,
              boxShadow: "none",
              width: "25%",
              backgroundColor: essentialsState === "lightning" && theme.palette.yellow.main,
              color: essentialsState === "lightning" && theme.palette.background.dark,
            }}
            onClick={() => {
              updateOpenNodes({});
              setEssentialsState("lightning");
            }}
          >
            <span style={{ marginRight: "0.25em" }} className="material-symbols-outlined">
              emoji_objects
            </span>{" "}
            Lightning
          </Button>

          <Button
            variant={essentialsState === "fx" ? "contained" : "text"}
            style={{ borderRadius: 0, boxShadow: "none", width: "25%" }}
            onClick={() => {
              updateOpenNodes({});
              setEssentialsState("fx");
            }}
          >
            <span style={{ marginRight: "0.25em" }} className="material-symbols-outlined">
              lens_blur
            </span>
            FX
          </Button>
        </div>

        {essentialsState === "scene" ? (
          <>
            <div
              className="nodeInner"
              style={{
                backgroundColor: theme.palette.grey.main,
                borderRadius: "0.5em",
                margin: ".5em",
                maxHeight: "50vh",
                overflowY: "auto",
                padding: "0.5em",
              }}
            >
              <b>Settings</b>

              {NodeField(scene, "clearColorTransparent", { ...sceneProps.clearColorTransparent, label: "Transparent Background", showInEssentials: true })}
              {NodeField(scene, "clearColor", { ...sceneProps.clearColor, showInEssentials: true })}
            </div>

            <div
              className="nodeInner"
              style={{
                borderRadius: "0.5em",
                margin: ".5em",
                padding: ".5em",
                background: theme.palette.grey.main,
              }}
            >
              <b
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5em",
                }}
              >
                <span
                  className="material-symbols-outlined collapseButtonIcon"
                  style={{
                    color: theme.palette.violet.main,
                  }}
                >
                  videocam
                </span>
                {scene.activeCamera.displayName || scene.activeCamera.name}
              </b>

              <Fields node={scene.activeCamera} />
            </div>
          </>
        ) : essentialsState === "3d" ? (
          <ThreeDView scene={scene} openNodes={openNodes} theme={theme} />
        ) : essentialsState === "lightning" ? (
          <LightningsView scene={scene} openNodes={openNodes} theme={theme} updateOpenNodes={updateOpenNodes} />
        ) : essentialsState === "fx" ? (
          <div className="nodeInner" style={{ backgroundColor: theme.palette.grey.main, borderRadius: "0.5em", margin: ".5em", padding: "0.5em" }}>
            <Fields node={scene.effects} />
          </div>
        ) : null}
      </div>
    </>
  );
}
