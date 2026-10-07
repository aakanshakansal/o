import { Button } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import React, { useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";
import { Card } from "../Components/Card";
import { createNode } from "../createNode";

export function AddActionPrompt() {
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
          <strong style={{ color: theme.palette.red.main }}>Add Action</strong>
          <p style={{ maxWidth: "360px", marginBottom: "1em" }}>
            Actions are the key to bringing 3D scenes to life. They empower creators to craft engaging, dynamic, and interactive experiences by enabling
            animations, integrating external content, and more.
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
            id="animate"
            title="Animate"
            description="Create animations by selecting scene and assets properties and change them over time."
            style={{
              color: selection === "Animate" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "Animate" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("Animate");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  directions_run
                </span>
              </div>
            }
          />
          <Card
            id="condition"
            title="Condition"
            description="Trigger specific actions depending on true or false results. It allows to control the flow of execution and create interactive and responsive experiences."
            style={{
              color: selection === "Condition" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "Condition" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("Condition");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  equal
                </span>
              </div>
            }
          />
          <Card
            id="timeline"
            title="Timeline"
            description="Schedule and loop multiple actions over a defined timeframe, allowing for versatile animations with precise timing control."
            style={{
              color: selection === "Timeline" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "Timeline" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("Timeline");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  schedule
                </span>
              </div>
            }
          />
          <Card
            id="math"
            title="Math"
            description="Operate between scene values by adding, subtracting, multiplying, divinding and setting custom values or existing values within the scene."
            style={{
              color: selection === "Math" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "Math" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("Math");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  functions
                </span>
              </div>
            }
          />
          <Card
            id="expression"
            title="Expression"
            description="Set properties by writing expressions combining node values and operations."
            style={{
              color: selection === "Expression" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "Expression" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("Expression");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  function
                </span>
              </div>
            }
          />
          <Card
            id="sequencer"
            title="Sequencer"
            description="Play multiple actions in a step-by-step fashion."
            style={{
              color: selection === "Sequencer" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "Sequencer" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("Sequencer");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  chevron_right
                </span>
              </div>
            }
          />
          <Card
            id="overlays"
            title="Overlays"
            description="Manage visibility of interface components and elements in the scene"
            style={{
              color: selection === "Overlays" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "Overlays" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("Overlays");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  web_asset
                </span>
              </div>
            }
          />
          <Card
            id="enterAR"
            title="Enter AR"
            description="Enables Augmented Reality feature projecting digital content onto the physical environment."
            style={{
              color: selection === "EnterAR" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "EnterAR" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("EnterAR");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  view_in_ar
                </span>
              </div>
            }
          />

          <Card
            id="enterVTO"
            title="Enter VTO"
            description="Enables Virtual Try-on feature projecting digital content onto person's body."
            style={{
              color: selection === "EnterVTO" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "EnterVTO" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("EnterVTO");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  person
                </span>
              </div>
            }
          />

          <Card
            id="externalLink"
            title="External Link"
            description="Open and external URL to point to web content or to concatenate scenes."
            style={{
              color: selection === "ExternalLink" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "ExternalLink" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("ExternalLink");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  link
                </span>
              </div>
            }
          />
          <Card
            id="AddReplace"
            title="Add / Replace"
            description="Seamlessly blend new elements into a your scene or replace existing components."
            style={{
              color: selection === "AddReplace" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "AddReplace" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("AddReplace");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  move_down
                </span>
              </div>
            }
          />
          <Card
            id="saveConfig"
            title="Save Configuration"
            description="This action will generate a sharable configuration link based on all the tracked actions in your scene. It will also send the current configuration to the parent window in a human readable format."
            style={{
              color: selection === "SaveConfig" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "SaveConfig" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("SaveConfig");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  save
                </span>
              </div>
            }
          />

          <Card
            id="screenshot"
            title="Screenshot"
            description="Trigger a screenshot of the current scene."
            style={{
              color: selection === "SaveConfig" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "SaveConfig" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("Screenshot");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  capture
                </span>
              </div>
            }
          />

          <Card
            id="exportscene"
            title="Export Scene"
            description="Download the scene as a Glb file."
            style={{
              color: selection === "ExportScene" ? theme.palette.red.main : theme.palette.text.primary,
              outline: selection === "ExportScene" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("ExportScene");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.red.main }}>
                  download
                </span>
              </div>
            }
          />
        </div>

        <div className="buttonGroup">
          <Button
            id="cancelButton"
            color="red"
            style={{ width: "auto" }}
            onClick={() => {
              scene.openPrompt(null);
            }}
          >
            Cancel
          </Button>

          <Button variant="contained" id="confirmButton" disabled={selection ? false : true} style={{ maxWidth: "none", width: "auto" }} onClick={confirm}>
            {selection ? "Confirm" : "Select Action Type"}
          </Button>
        </div>
      </div>
    </div>
  );
}
