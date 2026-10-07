import { Button } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import React, { useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";
import { Card } from "../Components/Card";
import { createNode } from "../createNode";
// import { getUserAssets } from "../../../apis/asset";

export function AddTexturePrompt() {
  const theme = useTheme();
  const [selection, setSelection] = useState(null);
  const scene = useCurrentScene();

  const confirm = (e) => {
    scene.openPrompt(null);

    scene.openPrompt(null);

    if (selection) {
      createNode({
        scene,
        type: selection,
      });
    }

    return;
  };
  return (
    <>
      <div
        className="promptInner node"
        style={{ background: theme.palette.background.default, borderColor: theme.palette.default.main, maxWidth: "600px", width: "100%" }}
      >
        <div className="nodeInner">
          <div className="field">
            <strong style={{ color: theme.palette.orange.main }}>Add Texture</strong>
            <p style={{ maxWidth: "360px", marginBottom: "1em" }}>
              Textures add visual details and realism to 3D objects, enhancing their appearance and immersion in virtual scenes.
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
              id="texture"
              title="Texture"
              description="Image used to customize PBR material properties"
              style={{
                color: selection === "Texture" ? theme.palette.orange.main : theme.palette.text.primary,
                outline: selection === "Texture" ? "solid 1px" : "",
                borderRadius: "0.5em",
              }}
              onClick={() => {
                setSelection("Texture");
              }}
              image={
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.orange.main }}>
                    texture
                  </span>
                </div>
              }
            />
            <Card
              id="cubeTexture"
              title="Cube Texture"
              description="Image used for reflections and skyboxes. IBL Format"
              style={{
                color: selection === "CubeTexture" ? theme.palette.orange.main : theme.palette.text.primary,
                outline: selection === "CubeTexture" ? "solid 1px" : "",
                borderRadius: "0.5em",
              }}
              onClick={() => {
                setSelection("CubeTexture");
              }}
              image={
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.orange.main }}>
                    deployed_code
                  </span>
                </div>
              }
            />
            <Card
              id="hdrCubeTexture"
              title="HDR Cube Texture"
              description="Image used for reflections and skyboxes. HDR Format"
              style={{
                color: selection === "HDRCubeTexture" ? theme.palette.orange.main : theme.palette.text.primary,
                outline: selection === "HDRCubeTexture" ? "solid 1px" : "",
                borderRadius: "0.5em",
              }}
              onClick={() => {
                setSelection("HDRCubeTexture");
              }}
              image={
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.orange.main }}>
                    deployed_code
                  </span>
                </div>
              }
            />
            <Card
              id="videoTexture"
              title="Video Texture"
              description="Allows videos to be played back within a PBR material channel."
              style={{
                color: selection === "VideoTexture" ? theme.palette.orange.main : theme.palette.text.primary,
                outline: selection === "VideoTexture" ? "solid 1px" : "",
                borderRadius: "0.5em",
              }}
              onClick={() => {
                setSelection("VideoTexture");
              }}
              image={
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.orange.main }}>
                    movie
                  </span>
                </div>
              }
            />

            <Card
              id="dynamicTexture"
              title="Dynamic Texture"
              description="A dynamic texture works by creating a canvas onto which you can write text, change font and colors."
              style={{
                color: selection === "DynamicTexture" ? theme.palette.orange.main : theme.palette.text.primary,
                outline: selection === "DynamicTexture" ? "solid 1px" : "",
                borderRadius: "0.5em",
              }}
              onClick={() => {
                setSelection("DynamicTexture");
              }}
              image={
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.orange.main }}>
                    text_fields
                  </span>
                </div>
              }
            />

            <Card
              id="colorGradingTexture"
              title="Color Grading Texture"
              description="A color grading texture can be used to achieve color correction instead of using curves. you can connect this texture in the section Effects > Image Processing > Color Grading Texture. (.3dl)"
              style={{
                color: selection === "ColorGradingTexture" ? theme.palette.orange.main : theme.palette.text.primary,
                outline: selection === "ColorGradingTexture" ? "solid 1px" : "",
                borderRadius: "0.5em",
              }}
              onClick={() => {
                setSelection("ColorGradingTexture");
              }}
              image={
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.orange.main }}>
                    gradient
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
              {selection ? "Confirm" : "Select Texture Type"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
