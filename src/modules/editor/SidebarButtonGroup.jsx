import { GLTF2Export } from "@babylonjs/serializers";
import { Button, Input, Menu, MenuItem } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";
import { useEffect, useState } from "react";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { postToParentWindow, sendDataToAdmin } from "../../helpers";
import { createSceneData } from "../../sceneFunctions/createSceneData";

import { USDZExporter } from "three/addons/exporters/USDZExporter.js";
import { useCurrentScene, useUpdateEditorOverlay, useUpdateViewportSize, useViewportSize } from "../../badProvider/functions";

export function SidebarButtonGroup(props) {
  const theme = useTheme();

  const scene = useCurrentScene();
  const viewportSize = useViewportSize();
  const updateViewportSize = useUpdateViewportSize();
  const updateEditorOverlay = useUpdateEditorOverlay();
  const onViewportChange = (value) => {
    updateViewportSize(value);
  };

  const onClickCloseOverlayEditor = () => {
    updateEditorOverlay(null);
    // setOpenNodes([]);
  };

  const [customSize, setCustomSize] = useState({
    width: document.getElementById("renderCanvas").offsetWidth,
    height: document.getElementById("renderCanvas").offsetHeight,
  });

  const [viewportEl, setViewportEl] = useState(null);
  const handleViewportMenuOpen = (event) => {
    setViewportEl(event.currentTarget);
  };
  const handleViewportMenuClose = () => {
    setViewportEl(null);
  };

  const [exportEl, setExportEl] = useState(null);
  const handleExportMenuOpen = (event) => {
    setExportEl(event.currentTarget);
  };
  const handleExportMenuClose = () => {
    setExportEl(null);
  };

  const [helpersEl, setHelpersEl] = useState(null);
  const handleHelpersMenuOpen = (event) => {
    setHelpersEl(event.currentTarget);
  };
  const handleHelpersMenuClose = () => {
    setHelpersEl(null);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          padding: "0.5em ",
          gap: "0.25em",
          background: theme.palette.background.dark,
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {window.location.pathname === "/sandbox" || window.self === window.top ? null : <CloseEditorButton scene={scene} />}

        <SceneHelpersButton scene={scene} />

        <div>
          <Button variant="outlined" style={{ width: "1.6em", fontSize: "1em", padding: "0 0.5em" }} onClick={handleViewportMenuOpen}>
            <span className="material-symbols-outlined">
              {viewportSize.width === 480
                ? "phone_iphone"
                : viewportSize.width === 1024
                  ? "tablet_mac"
                  : viewportSize.width
                    ? "fullscreen_exit"
                    : "desktop_windows"}
            </span>
          </Button>
          <Menu id="viewport-menu" anchorEl={viewportEl} keepMounted open={Boolean(viewportEl)} onClose={handleViewportMenuClose}>
            <MenuItem onClick={() => onViewportChange({ width: null, height: null })}>
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                desktop_windows
              </span>
              Desktop
            </MenuItem>
            <MenuItem onClick={() => onViewportChange({ width: 1024, height: null })}>
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                tablet_mac
              </span>
              Tablet
            </MenuItem>
            <MenuItem onClick={() => onViewportChange({ width: 480, height: null })}>
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                phone_iphone
              </span>
              Mobile
            </MenuItem>
            <MenuItem onClick={() => onViewportChange({ width: customSize.width, height: customSize.height })}>
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                fullscreen_exit
              </span>
              Custom
              <Input
                placeholder="Width"
                className="sizeInput"
                defaultValue={viewportSize.width || customSize.width}
                onChange={(e) => {
                  setCustomSize({ width: e.target.value, height: viewportSize.height });
                  onViewportChange({ width: e.target.value, height: viewportSize.height });
                }}
                onBlur={(e) => {
                  setCustomSize({ width: e.target.value, height: viewportSize.height });
                  onViewportChange({ width: e.target.value, height: viewportSize.height });
                }}
              />
              <Input
                placeholder="Height"
                className="sizeInput"
                defaultValue={viewportSize.height || customSize.height}
                onChange={(e) => onViewportChange({ height: e.target.value, width: viewportSize.width })}
                onBlur={(e) => onViewportChange({ height: e.target.value, width: viewportSize.width })}
              />
            </MenuItem>
          </Menu>
        </div>
        {window.location.pathname !== "/sandbox" && window.self === window.top ? null : <div>
          <Button style={{ fontSize: "1em", width: "4em", padding: "0 0.5em" }} variant="outlined" onClick={handleExportMenuOpen}>
            Export
          </Button>
          <Menu id="viewport-menu" anchorEl={exportEl} keepMounted open={Boolean(exportEl)} onClose={handleExportMenuClose}>
            <ExportToGLBButton scene={scene} />

            <ExportToUSDZButton scene={scene} />
          </Menu>
        </div>}

        <DisableActionsButton scene={scene} />

        {window.location.pathname === "/sandbox" || window.self === window.top ? null : <SaveSceneButton scene={scene} />}
      </div>
    </div>
  );
}

function SaveSceneButton(props) {
  const scene = props.scene;
  return (
    <Button
      title="Save Scene"
      variant="contained"
      style={{ width: "100%", fontSize: "1em", padding: "0 0.5em" }}
      onClick={() => {
        sendDataToAdmin(scene);
      }}
    >
      <span style={{ marginRight: "0.2em" }} className="material-symbols-outlined">
        save
      </span>{" "}
      Save
    </Button>
  );
}

function CloseEditorButton(props) {
  const scene = props.scene;
  return (
    <Button
      title="Close Editor"
      color="error"
      style={{ width: "auto", fontSize: "1em", padding: "0 0.5em", flexShrink: 0 }}
      variant="contained"
      onClick={() => {
        try {
          if (JSON.stringify(scene.sceneData) === JSON.stringify(createSceneData(scene, scene.sceneData))) {
            postToParentWindow({ type: "closeEditor" });
          } else {
            if (window.confirm("Unsaved data will be lost. Continue?") === true) {
              postToParentWindow({ type: "closeEditor" });
            }
          }
        } catch (error) {
          postToParentWindow({ type: "closeEditor" });
        }
      }}
    >
      <span style={{ marginRight: "0.2em" }} className="material-symbols-outlined">
        arrow_back
      </span>{" "}
      Exit{" "}
    </Button>
  );
}

function DisableActionsButton(props) {
  const scene = props.scene;
  const [actionsDisabled, setActionsDisabled] = useState(scene.disableActions);

  return (
    <Button
      title="Disable Action Triggers"
      onClick={() => {
        scene.disableActions = !scene.disableActions;
        setActionsDisabled(scene.disableActions);
      }}
      style={{ width: "1.6em", fontSize: "1em", padding: "0 0.5em", flexShrink: 0 }}
      variant={actionsDisabled ? "outlined" : "contained"}
    >
      {actionsDisabled ? <span className="material-symbols-outlined">play_arrow</span> : <span className="material-symbols-outlined">pause</span>}
    </Button>
  );
}

function SceneHelpersButton(props) {
  const scene = props.scene;
  const [helpersDisabled, setHelperDisabled] = useState(false);
  const [headTrackHelperDisabled, setHeadTrackHelperDisabled] = useState(true);
  useEffect(() => {
    scene.headTrackHelper[0].isVisible = false;
    if (window.localStorage.getItem("helperDisabled" + props.scene.mainData.id) === "true") {
      scene.gridHelper.isVisible = false;
      scene.axisLayer.utilityLayerScene.axisHelper.isVisible = false;
      setHelperDisabled(true);
    } else {
      scene.gridHelper.isVisible = true;
      scene.axisLayer.utilityLayerScene.axisHelper.isVisible = true;
      setHelperDisabled(false);
    }
  }, []);

  return (
    <>
      <div>
        <Button
          variant={helpersDisabled ? "outlined" : "contained"}
          onClick={() => {
            scene.gridHelper.isVisible = !scene.gridHelper.isVisible;
            scene.axisLayer.utilityLayerScene.axisHelper.isVisible = !scene.axisLayer.utilityLayerScene.axisHelper.isVisible;
            window.localStorage.setItem("helperDisabled" + props.scene.mainData.id, !scene.gridHelper.isVisible);
            setHelperDisabled(!scene.gridHelper.isVisible);
          }}
          style={{ fontSize: "1em", width: "1.6em", padding: "0 0.5em", flexShrink: 0 }}
        >
          <span className="material-symbols-outlined">grid_4x4</span>
        </Button>
      </div>
      <div>
        <Button
          variant={headTrackHelperDisabled ? "outlined" : "contained"}
          onClick={(e) => {
            scene.headTrackHelper[0].isVisible = !scene.headTrackHelper[0].isVisible;

            setHeadTrackHelperDisabled(!scene.headTrackHelper[0].isVisible);
          }}
          style={{ fontSize: "1em", width: "1.6em", padding: "0 0.5em", flexShrink: 0 }}
        >
          <span className="material-symbols-outlined">face_5</span>
        </Button>
      </div>
    </>
  );
}

function ExportToUSDZButton(props) {
  const scene = props.scene;
  return (
    <MenuItem
      title="Export USDZ"
      style={{ width: "auto", flexShrink: 0 }}
      onClick={() => {
        if (document.getElementById("curtain")) {
          document.getElementById("curtain").style.display = "flex";
          document.getElementById("curtainProgress").innerHTML = "Preparing your file...";
        }

        let options = {
          shouldExportNode: function (node) {
            return (
              node.isEnabled() &&
              node.getClassName() !== "ArcRotateCamera" &&
              node.getClassName() !== "FreeCamera" &&
              node.getClassName() !== "UniversalCamera" &&
              node.getClassName() !== "PointLight" &&
              node.getClassName() !== "HemisphericLight" &&
              node.getClassName() !== "SpotLight" &&
              node.getClassName() !== "DirectionalLight" &&
              node.name !== "gridHelper" &&
              node.name !== "axisHelper" &&
              node.name !== "headTrackHelper"
            );
          },
        };

        GLTF2Export.GLBAsync(scene, "scene", options).then((glb) => {
          const glbBlob = glb.glTFFiles["scene.glb"];

          // Create an object URL from the Blob
          const objectURL = URL.createObjectURL(glbBlob);
          // glb.downloadFiles();
          const loader = new GLTFLoader();
          const exporter = new USDZExporter();
          loader.load(objectURL, async (gltf) => {
            const arraybuffer = await exporter.parse(gltf.scene);
            const blob = new Blob([arraybuffer], { type: "application/octet-stream" });

            const link = document.createElement("a");
            document.body.appendChild(link); // Append it to the body

            // Set link properties for download
            link.href = URL.createObjectURL(blob);
            link.download = "scene.usdz";
            link.style.display = "none";

            link.click(); // Trigger the download
            if (document.getElementById("curtain")) {
              document.getElementById("curtain").style.display = "none";
              document.getElementById("curtainProgress").innerHTML = "";
            }
            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(objectURL);
            URL.revokeObjectURL(link.href);
          });
        });
      }}
    >
      <span style={{ marginRight: "0.2em" }} className="material-symbols-outlined">
        download
      </span>{" "}
      USDZ
    </MenuItem>
  );
}

function ExportToGLBButton(props) {
  const scene = props.scene;
  return (
    <MenuItem
      title="Export GLB"
      style={{ width: "auto", flexShrink: 0 }}
      onClick={() => {
        if (document.getElementById("curtain")) {
          document.getElementById("curtain").style.display = "flex";
          document.getElementById("curtainProgress").innerHTML = "Preparing your file...";
        }
        let options = {
          shouldExportNode: function (node) {
            return (
              node.isEnabled() &&
              node.getClassName() !== "ArcRotateCamera" &&
              node.getClassName() !== "FreeCamera" &&
              node.getClassName() !== "UniversalCamera" &&
              node.getClassName() !== "PointLight" &&
              node.getClassName() !== "HemisphericLight" &&
              node.getClassName() !== "SpotLight" &&
              node.getClassName() !== "DirectionalLight" &&
              node.name !== "gridHelper" &&
              node.name !== "axisHelper" &&
              node.name !== "headTrackHelper"
            );
          },
        };

        GLTF2Export.GLBAsync(scene, "scene", options).then((glb) => {
          glb.downloadFiles();
          if (document.getElementById("curtain")) {
            document.getElementById("curtain").style.display = "none";
            document.getElementById("curtainProgress").innerHTML = "";
          }
        });
      }}
    >
      <span style={{ marginRight: "0.2em" }} className="material-symbols-outlined">
        download
      </span>{" "}
      GLB
    </MenuItem>
  );
}
