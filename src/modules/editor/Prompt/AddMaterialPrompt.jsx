import { Button } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import React, { useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";
import { Card } from "../Components/Card";
import { createNode } from "../createNode";

export function AddMaterialPrompt() {
  const [selection, setSelection] = useState(null);
  const theme = useTheme();
  const scene = useCurrentScene();

  // const [menu, setMenu] = useState();

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
    <>
      <div
        className="promptInner node"
        style={{ background: theme.palette.background.default, borderColor: theme.palette.default.main, maxWidth: "600px", width: "100%" }}
      >
        <div className="nodeInner">
          <div className="field">
            <strong style={{ color: theme.palette.green.main }}>Add Material</strong>
            <p style={{ maxWidth: "360px", marginBottom: "1em" }}>
              Materials enhance the visual appearance of 3D objects, providing them with realistic textures, colors, and shading for a more immersive and
              engaging experience.
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
              id="pbrMaterial"
              title="Phisical Based Material"
              description="Physically Based Materials provide realistic shading and behavior for lifelike graphics."
              style={{
                color: selection === "PBRMaterial" ? theme.palette.green.main : theme.palette.text.primary,
                outline: selection === "PBRMaterial" ? "solid 1px" : "",
                borderRadius: "0.5em",
              }}
              onClick={() => {
                setSelection("PBRMaterial");
              }}
              image={
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.green.main }}>
                    deployed_code
                  </span>
                </div>
              }
            />
            <Card
              id="shadowOnlyMaterial"
              title="Shadow Only Material"
              description="Renders only shadows, without any visible appearance."
              style={{
                color: selection === "ShadowOnlyMaterial" ? theme.palette.green.main : theme.palette.text.primary,
                outline: selection === "ShadowOnlyMaterial" ? "solid 1px" : "",
                borderRadius: "0.5em",
              }}
              onClick={() => {
                setSelection("ShadowOnlyMaterial");
              }}
              image={
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.green.main }}>
                    ev_shadow
                  </span>
                </div>
              }
            />
            <Card
              id="transmissionMaterial"
              title="Transmission Material"
              description="This material exhibits dynamic light transmission, chromatic aberration, and light distortion."
              style={{
                color: selection === "TransmissionMaterial" ? theme.palette.green.main : theme.palette.text.primary,
                outline: selection === "TransmissionMaterial" ? "solid 1px" : "",
                borderRadius: "0.5em",
              }}
              onClick={() => {
                setSelection("TransmissionMaterial");
              }}
              image={
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.green.main }}>
                    sound_detection_glass_break
                  </span>
                </div>
              }
            />
            <Card
              id="shaderMaterial"
              title="Shader Material"
              description="Uses custom vertex and fragment code, allowing for advanced rendering effects and customization."
              style={{
                color: selection === "ShaderMaterial" ? theme.palette.green.main : theme.palette.text.primary,
                outline: selection === "ShaderMaterial" ? "solid 1px" : "",
                borderRadius: "0.5em",
              }}
              onClick={() => {
                setSelection("ShaderMaterial");
              }}
              image={
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.green.main }}>
                    star
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
              {selection ? "Confirm" : "Select Material Type"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
