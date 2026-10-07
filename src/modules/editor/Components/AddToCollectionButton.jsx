import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";
import { createCollection } from "../../../sceneFunctions/createSceneElements";

export const AddtoCollectionButton = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const scene = useCurrentScene();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (name) => {
    setAnchorEl(null);
  };

  return (
    <>
      <button className="nodeHeaderAction" onClick={handleClick}>
        <span className="material-symbols-outlined">library_add</span>
      </button>
      <Menu
        style={{ fontSize: "0.8em" }}
        size="small"
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {Object.entries(scene.collections).map(([k, v], i) => {
          return (
            <MenuItem
              style={{
                backgroundColor: scene.collections[v.name].nodes.includes(props.node.name) ? "#bada55" : "",
                color: scene.collections[v.name].nodes.includes(props.node.name) ? "#111111" : "",
              }}
              key={i}
              onClick={() => {
                if (!scene.collections[v.name].nodes.includes(props.node.name)) {
                  scene.collections[v.name].nodes.push(props.node.name);
                } else {
                  scene.collections[v.name].nodes.splice(scene.collections[v.name].nodes.indexOf(props.node.name), 1);
                }
                scene.forceUpdate();
                handleClose();
              }}
            >
              {v.displayName}
            </MenuItem>
          );
        })}
        <MenuItem
          key={"new"}
          onClick={() => {
            const id = "Collection_" + Date.now();
            scene.openNode("Collection", createCollection(scene, null, id));
            scene.collections[id].nodes.push(props.node.name);
            scene.forceUpdate();
            handleClose();
          }}
        >
          <span className="material-symbols-outlined">add</span> Add to New Collection
        </MenuItem>
      </Menu>
    </>
  );
};
