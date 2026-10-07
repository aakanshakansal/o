import { Button } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import React, { useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";

export function AddShaderMaterialPrompt(props) {
  const theme = useTheme();
  const scene = useCurrentScene();

  // const [menu, setMenu] = useState();
  const [vertex, setVertex] = useState(`
  precision highp float;
  // Attributes
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  // Uniforms
  uniform mat4 worldViewProjection;
  uniform float time;

  // Varying
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUV;

  void main(void) {
      vec3 v = position;
      v.x += sin(2.0 * position.y + (time)) * 0.5;
      
      gl_Position = worldViewProjection * vec4(v, 1.0);
      
      vPosition = position;
      vNormal = normal;
      vUV = uv;
  }`);
  const [fragment, setFragment] = useState(`
  precision highp float;

  // Varying
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUV;

  // Uniforms
  uniform mat4 world;

  // Refs
  uniform vec3 cameraPosition;
  uniform sampler2D textureSampler;

  void main(void) {
      vec3 vLightPosition = vec3(0,20,10);
      
      // World values
      vec3 vPositionW = vec3(world * vec4(vPosition, 1.0));
      vec3 vNormalW = normalize(vec3(world * vec4(vNormal, 0.0)));
      vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
      
      // Light
      vec3 lightVectorW = normalize(vLightPosition - vPositionW);
      vec3 color = texture2D(textureSampler, vUV).rgb;
      
      // diffuse
      float ndl = max(0., dot(vNormalW, lightVectorW));
      
      // Specular
      vec3 angleW = normalize(viewDirectionW + lightVectorW);
      float specComp = max(0., dot(vNormalW, angleW));
      specComp = pow(specComp, max(1., 64.)) * 2.;
      
      gl_FragColor = vec4(color * ndl + vec3(specComp), 1.);
  }`);

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

          <div style={{ width: "100%" }}>
            <br />

            <div className="field">
              <strong>Shaders are written in Graphics Library Shader Language (GLSL)</strong>
            </div>
            <div style={{ display: "flex" }}>
              <div className="field" style={{ width: "50%" }}>
                <span>Vertex Code</span>
                <textarea
                  style={{ width: "100%", height: "100px", background: "transparent", border: "solid 1px" }}
                  value={vertex}
                  // onInput={setId(selection)}
                  onInput={(e) => {
                    setVertex(`${e.target.value}`);
                  }}
                />
              </div>
              <div className="field" style={{ width: "50%" }}>
                <span>Fragment Code</span>
                <textarea
                  style={{ width: "100%", height: "100px", background: "transparent", border: "solid 1px" }}
                  value={fragment}
                  // onInput={setId(selection)}
                  onInput={(e) => {
                    setFragment(`${e.target.value}`);
                  }}
                />
              </div>
            </div>
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
            <Button
              variant="contained"
              id="confirmButton"
              style={{ maxWidth: "none", width: "auto" }}
              onClick={() => {
                props.options.callback({ vertex, fragment });
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
