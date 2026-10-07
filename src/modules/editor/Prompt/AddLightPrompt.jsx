import { Button } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import React, { useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";
import { Card } from "../Components/Card";
import { createNode } from "../createNode";

export function AddLightPrompt() {
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
          <strong style={{ color: theme.palette.yellow.main }}>Add Light</strong>
          <p style={{ maxWidth: "360px", marginBottom: "1em" }}>
            Lights bring life to 3D scenes, providing illumination and enhancing visual appeal. With properties like intensity, color, and position, lights
            create shadows, smooth shading, and set the scene&apos;s atmosphere.
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
            id="PointLight"
            title="Point Light"
            description="Project light in all direction from its position in the scene. Can cast shadows."
            style={{
              color: selection === "PointLight" ? theme.palette.yellow.main : theme.palette.text.primary,
              outline: selection === "PointLight" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("PointLight");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.yellow.main }}>
                  emoji_objects
                </span>
              </div>
            }
          />
          <Card
            id="DirectionalLight"
            title="Directional Light"
            description="Project light following an absolute direction regardless its position in the scene. Can cast shadows."
            style={{
              color: selection === "DirectionalLight" ? theme.palette.yellow.main : theme.palette.text.primary,
              outline: selection === "DirectionalLight" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("DirectionalLight");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.yellow.main }}>
                  light_mode
                </span>
              </div>
            }
          />
          <Card
            id="SpotLight"
            title="Spot Light"
            description="Projects a cone shaped light from its position in the scene toward a target. Can cast shadows."
            style={{
              color: selection === "SpotLight" ? theme.palette.yellow.main : theme.palette.text.primary,
              outline: selection === "SpotLight" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("SpotLight");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.yellow.main }}>
                  highlight
                </span>
              </div>
            }
          />
          <Card
            id="HemisphericLight"
            title="Hemispheric Light"
            description="Creates a gradient light effect. Cannot cast shadows."
            style={{
              color: selection === "HemisphericLight" ? theme.palette.yellow.main : theme.palette.text.primary,
              outline: selection === "HemisphericLight" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("HemisphericLight");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.yellow.main }}>
                  language
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
            {selection ? "Confirm" : "Select Light Type"}
          </Button>
        </div>
      </div>
    </div>
  );
}
