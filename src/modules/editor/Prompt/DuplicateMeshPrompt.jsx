import { Button, useTheme } from "@mui/material";
import React, { useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";
import { createMeshClone, createMeshInstance } from "../../../sceneFunctions/createSceneElements";
import { Card } from "../Components/Card";

export function DuplicateMeshPrompt(props) {
  const theme = useTheme();
  const scene = useCurrentScene();
  const [id, setId] = useState("clone");

  const [selection, setSelection] = useState(null);

  const confirm = (e) => {
    if (selection === "Instance") {
      const instance = createMeshInstance(scene, null, props.options.node);

      instance.displayName = "Instance of " + props.options.node.displayName;

      if (!instance.hasOwnProperty("badChanges")) {
        instance.badChanges = {};
      }

      instance.badChanges.displayName = "Instance of " + props.options.node.displayName;

      scene.openPrompt(null);
      scene.openNode("Mesh", instance);
    }

    if (selection === "Clone") {
      const clone = createMeshClone(scene, null, props.options.node);

      clone.displayName = (props.options.node.displayName || props.options.node.name) + " Clone";

      if (!clone.hasOwnProperty("badChanges") || clone.badChanges === null) {
        clone.badChanges = {};
      }

      clone.badChanges.displayName = (props.options.node.displayName || props.options.node.name) + " Clone";
      scene.openPrompt(null);
      scene.openNode("Mesh", clone);
    }
  };

  return (
    <div
      className="promptInner node"
      style={{ background: theme.palette.background.default, borderColor: theme.palette.default.main, maxWidth: "600px", width: "100%" }}
    >
      <div className="nodeInner">
        <div className="field">
          <strong style={{ color: theme.palette.turquoise.main }}>Copy of Asset</strong>
          <p style={{ maxWidth: "360px", marginBottom: "1em" }}>
            Using instances and clones, you can efficiently render many identical meshes. Instances ensure consistent materials via hardware-accelerated
            rendering, while clones provide flexibility with individual adjustments, all while saving memory.
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
            title="Create Instance"
            description="Instances are an excellent way to draw a huge number of identical meshes. Each instance has the same material as the original mesh."
            style={{
              color: selection === "Instance" ? theme.palette.turquoise.main : theme.palette.text.primary,
              outline: selection === "Instance" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("Instance");
              setId("Instance");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.turquoise.main }}>
                  copy_all
                </span>
              </div>
            }
          />
          <Card
            title="Create Clone"
            description="Generate a deep copy of the original mesh by sharing the geometry. Each clone can have its own material and transformation."
            style={{
              color: selection === "Clone" ? theme.palette.turquoise.main : theme.palette.text.primary,
              outline: selection === "Clone" ? "solid 1px" : "",
              borderRadius: "0.5em",
            }}
            onClick={() => {
              setSelection("Clone");
              setId("Clone");
            }}
            image={
              <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5em", color: theme.palette.turquoise.main }}>
                  content_copy
                </span>
              </div>
            }
          />
        </div>

        {/* {selection ? (
          <div className="field">
            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" style={{ fontWeight: "bold" }}>
                    Title:
                  </InputAdornment>
                ),
              }}
              value={id}
              // onInput={setId(selection)}
              onInput={(e) => {
                setId(e.target.value);
              }}
            />
          </div>
        ) : null} */}

        <div className="buttonGroup">
          <Button
            style={{ width: "auto" }}
            color="red"
            onClick={() => {
              scene.openPrompt(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" disabled={id && selection ? false : true} style={{ maxWidth: "none", width: "auto" }} onClick={confirm}>
            {id && selection ? "Duplicate" : "Select Duplication Type"}
          </Button>
        </div>
      </div>
    </div>
  );
}
