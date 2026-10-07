import { Button } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import React, { useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";
import { Card } from "../Components/Card";
import { createNode } from "../createNode";

export function AddCameraPrompt() {
  const theme = useTheme();
  const scene = useCurrentScene();

  const [selection, setSelection] = useState(null);

  const confirm = (e) => {
    if (selection) {
      scene.openPrompt(null);
      createNode({
        scene,
        type: selection,
      });
    }
  };

  return (
    <div
      className="promptInner node"
      style={{ background: theme.palette.background.default, borderColor: theme.palette.default.main, maxWidth: "600px", width: "100%" }}
    >
      <div className="nodeInner">
        <div className="field">
          <strong style={{ color: theme.palette.violet.main }}>Add Camera</strong>
          <p style={{ maxWidth: "360px", marginBottom: "1em" }}>
            Cameras provide versatile viewing perspectives in 3D scenes. They enable navigation, control the viewpoint, and define how the scene is rendered.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1em",
            flexWrap: "wrap",
            overflow: "auto",
            maxHeight: "70vh",
            justifyContent: "center",
            padding: "2px",
          }}
        >
          <Card
            id="arcRotateCamera"
            title="Orbit Camera"
            description="Allows users to orbit around a target object or point of interest, providing a dynamic and immersive view of the 3D scene."
            style={{
              color: selection === "ArcRotateCamera" ? theme.palette.violet.main : theme.palette.text.primary,
              outline: selection === "ArcRotateCamera" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("ArcRotateCamera");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.violet.main }}>
                  360
                </span>
              </div>
            }
          />
          <Card
            id="universalCamera"
            title="First Person Camera"
            description="Enables user navigation and exploration from a first-person perspective in virtual environments."
            style={{
              color: selection === "UniversalCamera" ? theme.palette.violet.main : theme.palette.text.primary,
              outline: selection === "UniversalCamera" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("UniversalCamera");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.violet.main }}>
                  photo_camera
                </span>
              </div>
            }
          />
        </div>

        <div className="buttonGroup">
          <Button
            id="cancelButton"
            style={{ width: "auto" }}
            color="red"
            onClick={() => {
              scene.openPrompt(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" id="confirmButton" disabled={selection ? false : true} style={{ maxWidth: "none", width: "auto" }} onClick={confirm}>
            {selection ? "Confirm" : "Select Camera Type"}
          </Button>
        </div>
      </div>
    </div>
  );
}
