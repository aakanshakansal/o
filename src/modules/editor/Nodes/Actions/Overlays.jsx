import { Autocomplete, Checkbox, TextField, createFilterOptions, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useCurrentScene } from "../../../../badProvider/functions";

const Overlays = (props) => {
  const scene = useCurrentScene();
  const theme = useTheme();
  const node = props.node;

  const [overlaysToEnable, setOverlaysToEnable] = useState(
    node.overlaysToEnable ? (Array.isArray(node.overlaysToEnable) ? node.overlaysToEnable : node.overlaysToEnable.split(",")) : []
  );
  const [overlaysToDisable, setOverlaysToDisable] = useState(
    node.overlaysToDisable ? (Array.isArray(node.overlaysToDisable) ? node.overlaysToDisable : node.overlaysToDisable.split(",")) : []
  );

  const [elementsToShow, setElementsToShow] = useState(
    node.elementsToShow ? (Array.isArray(node.elementsToShow) ? node.elementsToShow : node.elementsToShow.split(",")) : []
  );
  const [elementsToHide, setElementsToHide] = useState(
    node.elementsToHide ? (Array.isArray(node.elementsToHide) ? node.elementsToHide : node.elementsToHide.split(",")) : []
  );

  // keep the text in the Autocomplete when you select an option
  const [autocompleteValues, setAutocompleteValues] = useState({
    elementsToHideInput: "",
    elementsToShowInput: "",
    overlaysToDisableInput: "",
    overlaysToEnableInput: "",
  });

  useEffect(() => {
    node.overlaysToEnable = overlaysToEnable;
    node.overlaysToDisable = overlaysToDisable;
    node.elementsToShow = elementsToShow;
    node.elementsToHide = elementsToHide;
  }, [overlaysToEnable, overlaysToDisable, elementsToShow, elementsToHide]);

  let overlays = Object.values(scene.overlays).map((overlay) => {
    return overlay.name;
  });

  let ids = [];

  const scrapeElem = (elem) => {
    if (elem.hasOwnProperty("attributes") && elem.attributes.id) {
      if (!ids.some((item) => item.id === elem.attributes.id)) {
        ids.push({ id: elem.attributes.id, customName: elem["custom-name"] || elem.type });
      }
    }

    if (elem.hasOwnProperty("components")) {
      elem.components.forEach((subelem) => {
        if (subelem.hasOwnProperty("attributes") && subelem.attributes.id) {
          if (!ids.some((item) => item.id === subelem.attributes.id)) {
            ids.push({ id: subelem.attributes.id, customName: subelem["custom-name"] || subelem.type });
          }
        }

        if (subelem.hasOwnProperty("components")) {
          scrapeElem(subelem);
        }
      });
    }
  };

  Object.values(scene.overlays).forEach((overlay) => {
    if (overlay.hasOwnProperty("overlayData")) {
      const json = JSON.parse(overlay.overlayData.json);
      json.forEach((elem) => {
        scrapeElem(elem);
      });
    }
  });

  const filter = createFilterOptions({
    stringify: (option) => option.customName || option.id,
  });

  return Object.values(scene.overlays).length ? (
    <div className="nodeInner" style={{ maxWidth: "420px" }}>
      <div className="field MeshesArrayReference">
        <span
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            paddingRight: "1em",
          }}
        >
          Enable Overlays
        </span>

        <Autocomplete
          sx={{ backgroundColor: theme.palette.background.light }}
          style={{ width: "100%", borderRadius: "0.5em" }}
          size="small"
          multiple
          value={overlaysToEnable}
          options={overlays}
          disableCloseOnSelect
          getOptionLabel={(option) => {
            return scene.overlays[option]?.displayName || option;
          }}
          renderOption={(props, option, { selected }) => (
            <li {...props} style={{ height: "1.6em" }}>
              <Checkbox style={{ marginRight: 8 }} checked={selected} size="tiny" />

              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{scene.overlays[option]?.displayName || option}</span>
            </li>
          )}
          renderInput={(params) => <TextField style={{ width: "100%" }} {...params} label="" placeholder="Search Overlays" />}
          onChange={(e, v) => {
            setOverlaysToEnable(v);
          }}
          inputValue={autocompleteValues.overlaysToEnableInput}
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setAutocompleteValues((prev) => ({ ...prev, overlaysToEnableInput: newInputValue }));
            }
          }}
          onBlur={() => {
            setAutocompleteValues((prev) => ({ ...prev, overlaysToEnableInput: "" }));
          }}
        />
      </div>
      <div className="field MeshesArrayReference">
        <span
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            paddingRight: "1em",
          }}
        >
          Disable Overlays
        </span>

        <Autocomplete
          sx={{ backgroundColor: theme.palette.background.light }}
          style={{ width: "100%", borderRadius: "0.5em" }}
          size="small"
          multiple
          value={overlaysToDisable}
          options={overlays}
          disableCloseOnSelect
          getOptionLabel={(option) => {
            return scene.overlays[option]?.displayName || option;
          }}
          renderOption={(props, option, { selected }) => (
            <li {...props} style={{ height: "1.6em" }}>
              <Checkbox style={{ marginRight: 8 }} checked={selected} size="tiny" />
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{scene.overlays[option]?.displayName || option}</span>
            </li>
          )}
          renderInput={(params) => <TextField style={{ width: "100%" }} {...params} label="" placeholder="Search Overlays" />}
          onChange={(e, v) => {
            setOverlaysToDisable(v);
          }}
          inputValue={autocompleteValues.overlaysToDisableInput}
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setAutocompleteValues((prev) => ({ ...prev, overlaysToDisableInput: newInputValue }));
            }
          }}
          onBlur={() => {
            setAutocompleteValues((prev) => ({ ...prev, overlaysToDisableInput: "" }));
          }}
        />
      </div>

      <div className="field MeshesArrayReference">
        <span
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            paddingRight: "1em",
          }}
        >
          Show Overlay Elements
        </span>

        <Autocomplete
          sx={{ backgroundColor: theme.palette.background.light }}
          style={{ width: "100%", borderRadius: "0.5em" }}
          size="small"
          multiple
          value={ids.filter((idObj) => elementsToShow.includes(idObj.id))}
          options={ids}
          disableCloseOnSelect
          getOptionLabel={(option) => {
            return option.customName;
          }}
          renderOption={(props, option, { selected }) => {
            props.key = props.id;
            return (
              <li {...props} style={{ height: "1.6em" }}>
                <Checkbox style={{ marginRight: 8 }} checked={selected} size="tiny" />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}> {option.customName || option.id}</span>
              </li>
            );
          }}
          renderInput={(params) => <TextField style={{ width: "100%" }} {...params} label="" placeholder="Search Overlay Elements" />}
          onChange={(e, v) => {
            setElementsToShow(v.map((option) => option.id));
          }}
          inputValue={autocompleteValues.elementsToShowInput}
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setAutocompleteValues((prev) => ({ ...prev, elementsToShowInput: newInputValue }));
            }
          }}
          onBlur={() => {
            setAutocompleteValues((prev) => ({ ...prev, elementsToShowInput: "" }));
          }}
        />
      </div>

      <div className="field MeshesArrayReference">
        <span
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            paddingRight: "1em",
          }}
        >
          Hide Overlay Elements
        </span>

        <Autocomplete
          sx={{ backgroundColor: theme.palette.background.light }}
          style={{ width: "100%", borderRadius: "0.5em" }}
          size="small"
          multiple
          value={ids.filter((idObj) => elementsToHide.includes(idObj.id))}
          options={ids}
          disableCloseOnSelect
          getOptionLabel={(option) => {
            return option.customName;
          }}
          renderOption={(props, option, { selected }) => {
            props.key = props.id;
            return (
              <li {...props} style={{ height: "1.6em" }}>
                <Checkbox style={{ marginRight: 8 }} checked={selected} size="tiny" />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}> {option.customName || option.id}</span>
              </li>
            );
          }}
          renderInput={(params) => <TextField style={{ width: "100%" }} {...params} label="" placeholder="Search Overlay Elements" />}
          onChange={(e, v) => {
            setElementsToHide(v.map((option) => option.id));
          }}
          inputValue={autocompleteValues.elementsToHideInput}
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setAutocompleteValues((prev) => ({ ...prev, elementsToHideInput: newInputValue }));
            }
          }}
          onBlur={() => {
            setAutocompleteValues((prev) => ({ ...prev, elementsToHideInput: "" }));
          }}
        />
      </div>
    </div>
  ) : null;
};

export default Overlays;
