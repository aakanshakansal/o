import { Button } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import React, { useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";
import { Card } from "../Components/Card";
import { createNode } from "../createNode";

export function Add3DElementPrompt() {
  const theme = useTheme();
  const scene = useCurrentScene();

  const [selection, setSelection] = useState(null);

  const confirm = async (e) => {
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
          <strong style={{ color: theme.palette.turquoise.main }}>Add 3D Element</strong>
          <p style={{ maxWidth: "360px", marginBottom: "1em" }}>
            Incorporate 3D assets either from your personal library, the Badvisor library, or create a captivating photo dome by simply choosing an
            equirectangular image.
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
            title="3D Asset"
            id="threeDAsset"
            description="Insert multiple 3d Assets from your library or the Badvisor library. (.glb, .obj, .stl and .vrm)"
            style={{
              color: selection === "Asset" ? theme.palette.turquoise.main : theme.palette.text.primary,
              outline: selection === "Asset" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("Asset");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.turquoise.main }}>
                  deployed_code
                </span>
              </div>
            }
          />
          {/* <Card
            title="Gaussian Splat"
            id="gSplat"
            description="Enhance your scene with complex and detailed point cloud representations by adding Gaussian splat files (.splat)"
            style={{
              color: selection === "GSplat" ? theme.palette.turquoise.main : theme.palette.text.primary,
              outline: selection === "GSplat" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("GSplat");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.turquoise.main }}>
                  lens_blur
                </span>
              </div>
            }
          /> */}
          <Card
            title="Photo Dome"
            id="photoDome"
            description="Generate a Photo Dome by selecting an image."
            style={{
              color: selection === "PhotoDome" ? theme.palette.turquoise.main : theme.palette.text.primary,
              outline: selection === "PhotoDome" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("PhotoDome");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.turquoise.main }}>
                  public
                </span>
              </div>
            }
          />

          <Card
            title="3D Text"
            id="threeDText"
            description="Generate 3D text."
            style={{
              color: selection === "3DText" ? theme.palette.turquoise.main : theme.palette.text.primary,
              outline: selection === "3DText" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("3DText");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.turquoise.main }}>
                  text_fields
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
          <Button id="confirmButton" variant="contained" disabled={selection ? false : true} style={{ maxWidth: "none", width: "auto" }} onClick={confirm}>
            {selection ? "Confirm" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  );
}
