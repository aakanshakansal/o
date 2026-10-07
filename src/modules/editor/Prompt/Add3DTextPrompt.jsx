import { Button, MenuItem, Select } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";
import React, { useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";
import { NumberInput } from "../Components/NumberInput";
import { StringInput } from "../Components/StringInput";

export function Add3DTextPrompt(props) {
  const theme = useTheme();
  const scene = useCurrentScene();

  const [selection, setSelection] = useState("3DText");

  const [text, setText] = useState("Text");
  const [font, setFont] = useState("https://cdn.badvisor.io/jsonFonts/Figtree Medium_Regular.json");

  const [resolution, setResolution] = useState(16);

  return (
    <div
      className="promptInner node"
      style={{ background: theme.palette.background.default, borderColor: theme.palette.default.main, maxWidth: "600px", width: "100%" }}
    >
      <div className="nodeInner">
        <div className="field">
          <strong style={{ color: theme.palette.turquoise.main }}>Add 3D Text</strong>
          <p style={{ maxWidth: "360px", marginBottom: "1em" }}>Generate 3D text.</p>
        </div>

        {selection === "3DText" ? (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1em" }}>
            <div className="field" style={{ width: "100%" }}>
              <span>Text</span>
              <StringInput
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                }}
              />
            </div>

            <div className="field" style={{ width: "50%" }}>
              <span>Font</span>

              <Select
                sx={{ backgroundColor: theme.palette.background.light }}
                style={{ width: "100%" }}
                defaultValue={font}
                onChange={(e) => {
                  setFont(e.target.value);
                }}
              >
                <MenuItem value="https://cdn.badvisor.io/jsonFonts/Abril Fatface_Regular.json">Abril Fatface</MenuItem>
                <MenuItem value="https://cdn.badvisor.io/jsonFonts/Figtree Medium_Regular.json">Figtree Medium</MenuItem>
                <MenuItem selected value="https://cdn.badvisor.io/jsonFonts/Figtree_Bold.json">
                  Figtree Bold
                </MenuItem>
                <MenuItem value="https://cdn.badvisor.io/jsonFonts/Figtree Black_Regular.json">Figtree Black</MenuItem>
                <MenuItem value="https://cdn.badvisor.io/jsonFonts/Gasoek One_Regular.json">Gasoek One Regular</MenuItem>
                <MenuItem value="https://cdn.badvisor.io/jsonFonts/Playfair Display Medium_Regular.json">Playfair Display Medium</MenuItem>
                <MenuItem value="https://cdn.badvisor.io/jsonFonts/Playfair Display_Bold.json">Playfair Display Bold</MenuItem>
                <MenuItem value="https://cdn.badvisor.io/jsonFonts/Playfair Display Black_Regular.json">Playfair Display Black</MenuItem>
                <MenuItem value="https://cdn.badvisor.io/jsonFonts/Roboto Slab Medium_Regular.json">Roboto Slab Medium</MenuItem>
                <MenuItem value="https://cdn.badvisor.io/jsonFonts/Roboto Slab_Bold.json">Roboto Slab Bold</MenuItem>
                <MenuItem value="https://cdn.badvisor.io/jsonFonts/Roboto Slab Black_Regular.json">Roboto Slab Black</MenuItem>
              </Select>
            </div>

            <div className="field" style={{ width: "50%" }}>
              <span>Resolution</span>
              <NumberInput
                value={resolution}
                onChange={(e) => {
                  setResolution(e.target.value);
                }}
              />
            </div>
          </div>
        ) : null}

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
            id="confirmButton"
            variant="contained"
            disabled={selection ? false : true}
            style={{ maxWidth: "none", width: "auto" }}
            onClick={() => {
              props.options.callback({ text, font, resolution });
            }}
          >
            {selection ? "Confirm" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  );
}
