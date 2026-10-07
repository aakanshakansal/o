import { Color3, Color4, HighlightLayer, MeshBuilder, PBRMaterial, PointerEventTypes, SceneLoader, UtilityLayerRenderer, Vector3 } from "@babylonjs/core";
import { Fab, Tooltip } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import React, { useEffect, useState } from "react";
import { useReactFlow } from "reactflow";
import { createCollection, createControlNode, createOverlay, createVariable } from "../../sceneFunctions/createSceneElements";
import Flow from "./Flow/Flow";
import { PromptContainer } from "./Prompt/Container";
import Sidebar from "./Sidebar";

import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";

import {
  useCurrentScene,
  useEditorOverlay,
  useEditorState,
  useIsMappingActive,
  useOpenNodes,
  useUpdateCollapsedNodes,
  useUpdateEditorOverlay,
  useUpdateHighlightedMeshButton,
  useUpdateOpenNodes,
  useUpdateUserOrganizations,
} from "../../badProvider/functions";
import { badvisorOrganizationId } from "../../constants";
import { getSearchObject, sendDataToAdmin } from "../../helpers";

let shiftDown = false;
let ctrlDown = false;
let altDown = false;
let keySDown = false;
let commandDown = false;

const Editor = () => {
  const reactFlowInstance = useReactFlow();
  const scene = useCurrentScene();
  const editorState = useEditorState();
  const [ready, setReady] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [highlightedMeshButton, setHighlightedMeshButton] = useState(null);

  // const [editMode, setEditMode] = useState("edit");
  const [openPrompt, setOpenPrompt] = useState(null);
  const [promptOptions, setPromptOptions] = useState(null);

  const [hideFlow, setHideFlow] = useState(false);

  const editorOverlay = useEditorOverlay();
  const openNodes = useOpenNodes();

  const isMappingActive = useIsMappingActive();

  const updateOpenNodes = useUpdateOpenNodes();
  const updateCollapsedNodes = useUpdateCollapsedNodes();
  const updateHighlightedMesButton = useUpdateHighlightedMeshButton();
  const updateEditorOverlay = useUpdateEditorOverlay();
  const updateUserOrganizations = useUpdateUserOrganizations();
  useEffect(() => {
    updateHighlightedMesButton(highlightedMeshButton);
  }, [openNodes, highlightedMeshButton]);

  const theme = createTheme({
    typography: {
      // fontSize: ["14px"],
      fontFamily: ["Figtree", '"Helvetica Neue"', "Arial", "sans-serif", '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'].join(","),
    },
    // typography: {
    //   fontSize: 12.8,
    // },
    palette: {
      mode: "dark",

      background: {
        light: "rgba(117,117,117,0.6)",
        grey: "rgba(68,68,68,0.7)",
        default: "rgba(34,34,34,0.8)",
        dark: "rgba(17,17,17,1)",
      },
      text: {
        primary: "#ffffff",
      },

      border: {
        main: "#717171",
      },

      primary: {
        main: "#bada55",
      },

      secondary: {
        main: "#ff9800",
      },
      green: {
        main: "#bada55",
      },
      orange: {
        main: "#ff9800",
      },
      red: {
        main: "#f44336",
      },
      blue: {
        main: "#64d4fc",
      },
      yellow: {
        main: "#ffeb3b",
      },
      turquoise: {
        main: "#34c5b7",
      },
      violet: {
        main: "#d90ffc",
      },
      black: {
        main: "#000000",
      },
      dark: {
        main: "#111111",
      },
      default: {
        main: "#222222",
      },
      grey: {
        main: "#454545",
      },
      light: {
        main: "#dedede",
      },
      white: {
        main: "#ffffff",
      },
    },
    shape: {
      borderRadius: "0.5em",
    },
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiInputBase: {
        // margin: "dense",
        styleOverrides: {
          root: {
            fontSize: 12.8,
            // height: "2em",
            // textTransform: "unset",
            background: "rgba(34,34,34,0.6)",
          },
        },
      },
    },
  });

  useEffect(() => {
    scene.axisLayer = new UtilityLayerRenderer(scene);

    generateGrid(scene);
    generateAxis(scene.axisLayer.utilityLayerScene);
    generateHeadTrackHelper(scene);

    if (getSearchObject().uid) {
      async function fetchOrganizationsByUserId(userId) {
        const db = getFirestore();
        const organizationsRef = collection(db, "organizations");
        const q = query(organizationsRef, where(`members.${userId}`, "!=", false));

        const querySnapshot = await getDocs(q);
        const organizations = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        organizations.push({
          id: badvisorOrganizationId,
          name: "badvisor",
        });

        organizations.sort((a, b) => a.name.localeCompare(b.name));

        return organizations;
      }

      fetchOrganizationsByUserId(getSearchObject().uid)
        .then((organizations) => {
          updateUserOrganizations(organizations);
        })
        .catch((error) => {
          console.error("Error getting organizations: ", error);
        });
    } else {
      updateUserOrganizations([{ id: badvisorOrganizationId, name: "badvisor" }]);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", (event) => {
      if (event.metaKey || event.ctrlKey) {
        // event.preventDefault();
      }

      if (event.key === "Escape") {
        scene.openPrompt(null);
      }

      if (event.key === "z" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();

        const last = scene.badHistory.pop();
        if (last && last.fun) {
          last.fun();
          scene.badHistory.splice(-1);
        }
      }
      if (event.code === "KeyS" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        sendDataToAdmin(scene);
      }

      if (event.code === "KeyR" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        window.location.reload();
      }

      if (event.code === "Digit1" && event.altKey) {
        //  event.preventDefault();
        scene.closeNodes();
      }

      if (event.code === "Digit2" && event.altKey) {
        //  event.preventDefault();
        setHideFlow((b) => !b);
      }

      if (event.code === "Digit3" && event.altKey) {
        //  event.preventDefault();

        updateCollapsedNodes(openNodes);

        scene.arrangeNodes();
      }

      // if (event.code === "KeyL" && (event.altKey || event.ctrlKey)) {
      //   scene.openPrompt("addLight");
      // }

      if (event.code === "KeyV" && event.altKey) {
        event.preventDefault();
        scene.openNode("Variable", createVariable(scene));
      }

      if (event.code === "KeyL" && event.altKey) {
        event.preventDefault();
        scene.openPrompt("addLight");
      }

      if (event.code === "KeyL" && event.altKey) {
        event.preventDefault();
        scene.openPrompt("addLight");
      }

      if (event.code === "KeyM" && event.altKey) {
        event.preventDefault();
        scene.openPrompt("addMaterial");
      }

      if (event.code === "KeyD" && event.altKey) {
        event.preventDefault();
        scene.openPrompt("add3DElement");
      }

      if (event.code === "KeyC" && event.altKey) {
        event.preventDefault();
        scene.openPrompt("addCamera");
      }

      if (event.code === "KeyT" && event.altKey) {
        event.preventDefault();
        scene.openPrompt("addTexture");
      }

      if (event.code === "KeyA" && event.altKey) {
        event.preventDefault();
        scene.openPrompt("addAction");
      }

      if (event.code === "KeyS" && event.altKey) {
        event.preventDefault();
        scene.openPrompt("addSound");
      }

      if (event.code === "KeyO" && event.altKey) {
        event.preventDefault();

        updateEditorOverlay(createOverlay(scene));
      }

      if (event.code === "KeyN" && event.altKey) {
        event.preventDefault();
        scene.openNode("ControlNode", createControlNode(scene));
      }

      if (event.code === "KeyK" && event.altKey) {
        event.preventDefault();
        scene.openNode("Collection", createCollection(scene));
        scene.forceUpdate();
      }
    });

    window.numberInputMultiplier = 100;
    document.addEventListener(
      "keydown",
      (event) => {
        //var name = event.key;
        var code = event.code;

        if (code === "ShiftLeft") {
          window.numberInputMultiplier = 1000;
          return (shiftDown = true);
        }

        if (code === "ControlLeft") {
          return (ctrlDown = true);
        }

        // altDown
        if (code === "AltLeft") {
          return (altDown = true);
        }

        if (code === "KeyS") {
          return (keySDown = true);
        }

        if (code === "MetaLeft") {
          event.preventDefault();
          return (commandDown = true);
        }
      },
      false
    );

    document.addEventListener(
      "keyup",
      (event) => {
        var code = event.code;

        if (code === "ShiftLeft") {
          window.numberInputMultiplier = 100;
          return (shiftDown = false);
        }
        if (code === "ControlLeft") {
          return (ctrlDown = false);
        }
        if (code === "AltLeft") {
          return (altDown = false);
        }

        if (code === "KeyS") {
          return (keySDown = false);
        }

        if (code === "MetaLeft") {
          event.preventDefault();
          return (commandDown = false);
        }
      },
      false
    );

    scene.executeWhenReady(() => {
      setTimeout(() => {
        setReady(true);
      }, 500);
    });
  }, [scene]);

  scene.openPrompt = (type, options) => {
    setOpenPrompt(type);
    setPromptOptions(options);
  };

  scene.arrangeNodes = () => {
    reactFlowInstance.setCenter(window.innerWidth / 2 / zoom, window.innerHeight / 2 / zoom, { zoom, duration: 500 });

    const copy = { ...openNodes };

    Object.entries(copy).forEach(([k, n], i) => {
      n.data.node["nodePosition"] = null;
    });

    const sortedEntries = Object.entries(copy).sort((a, b) => {
      if (a[1].type < b[1].type) return -1;
      if (a[1].type > b[1].type) return 1;
      return 0;
    });

    sortedEntries.forEach((e, i) => {
      e.position = { x: 30, y: 30 * i + 30 };
    });

    updateOpenNodes(Object.fromEntries(sortedEntries));
  };

  scene.openNode = (type, node, options) => {
    if (!node) return;

    let copy = {};
    if (editorState === "essentials") {
      copy = {};
    } else {
      copy = { ...openNodes };
    }

    const n = {
      id: node.name,
      type: type,
      dragHandle: ".nodeTitle",
      data: {
        node: node,
      },
      position: { x: 0, y: 0 },
    };
    copy[node.name] = n;

    updateOpenNodes(copy);
  };

  scene.closeNode = (nodeName) => {
    const copy = { ...openNodes };
    if (copy[nodeName]) {
      copy[nodeName].data.node.nodePosition = null;
      delete copy[nodeName];
    }
    updateOpenNodes(copy);
  };

  scene.closeNodes = () => {
    setHideFlow(false);
    const zoom = 1;
    reactFlowInstance.setCenter(window.innerWidth / 2, window.innerHeight / 2, { zoom, duration: 500 });

    updateOpenNodes({});
  };

  scene.createOverlayNode = () => {
    updateEditorOverlay(createOverlay(scene));
  };

  useEffect(() => {
    if (!scene.highlightLayer) {
      scene.highlightLayer = new HighlightLayer("hl1", scene);
      scene.highlightLayer.blurHorizontalSize = 1;
      scene.highlightLayer.blurVerticalSize = 1;
    }

    scene.editPointerObservables = scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERMOVE:
          scene.highlightLayer.removeAllMeshes();

          setHighlightedMeshButton(null);

          if (shiftDown && !ctrlDown && pointerInfo.pickInfo.pickedMesh) {
            let node;
            const getParent = (n) => {
              if (n.parent) {
                getParent(n.parent);
              } else {
                node = n;
              }
            };

            getParent(pointerInfo.pickInfo.pickedMesh);
          }

          if (shiftDown && ctrlDown && pointerInfo.pickInfo.pickedMesh) {
            setHighlightedMeshButton(pointerInfo.pickInfo.pickedMesh.name);
            scene.highlightLayer.addMesh(pointerInfo.pickInfo.pickedMesh, Color3.FromHexString("#ff0000").toLinearSpace());
          }

          break;
        case PointerEventTypes.POINTERDOWN:
          break;
        case PointerEventTypes.POINTERUP:
          break;

        case PointerEventTypes.POINTERWHEEL:
          break;
        case PointerEventTypes.POINTERPICK:
          if (shiftDown && !ctrlDown && !altDown && pointerInfo.pickInfo.pickedMesh) {
            let node;
            const getParent = (n) => {
              if (n.parent) {
                getParent(n.parent);
              } else {
                node = n;
              }
            };

            getParent(pointerInfo.pickInfo.pickedMesh);

            scene.openNode("Mesh", node);
          }
          if (shiftDown && ctrlDown && !altDown && pointerInfo.pickInfo.pickedMesh) {
            let node = pointerInfo.pickInfo.pickedMesh;

            scene.openNode("Mesh", node);
          }

          if (ctrlDown && altDown && pointerInfo.pickInfo.pickedMesh) {
            let node = pointerInfo.pickInfo.pickedMesh.material;

            scene.openNode("Material", node);
          }

          // }
          if (pointerInfo.pickInfo.pickedMesh) {
            return;
          }
          break;
        case PointerEventTypes.POINTERTAP:
          break;
        case PointerEventTypes.POINTERDOUBLETAP:
          break;
        default:
          break;
      }
    });

    return () => {
      scene.onPointerObservable.remove(scene.editPointerObservables);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div
        className="editorPrelaod"
        style={{
          pointerEvents: ready ? "none" : "all",
          opacity: ready ? 0 : 1,
        }}
      >
        {/* <div
          className="beh"
          style={{
            width: "160px",
          }}
        >
          <img alt="loading" id="loadingLogo" src={"/assets/logotext.png"} />
        </div> */}
      </div>
      {ready ? (
        <>
          <div id="editor" style={{ color: theme.palette.text.primary, height: "100%" }} className={"dark"}>
            <>
              {Object.values(openNodes).length > 0 && editorState !== "essentials" ? (
                <div className="nodesButtons wrapperTransparent">
                  <Tooltip title="Close All Node (alt + 1)" arrow>
                    <span>
                      <Fab
                        style={{ display: "flex", alignItems: "center" }}
                        onClick={() => {
                          scene.closeNodes();
                          setHideFlow(false);
                        }}
                      >
                        <span className="material-symbols-outlined">close</span>
                      </Fab>
                    </span>
                  </Tooltip>
                  <Tooltip title="Hide / Show Node (alt + 2)" arrow>
                    <span>
                      <Fab
                        style={{ display: "flex", alignItems: "center" }}
                        onClick={() => {
                          setHideFlow((b) => !b);
                        }}
                      >
                        {!hideFlow ? (
                          <span className="material-symbols-outlined">horizontal_rule</span>
                        ) : (
                          <span className="material-symbols-outlined">check_box_outline_blank</span>
                        )}
                      </Fab>
                    </span>
                  </Tooltip>
                  <Tooltip title="Reorganize Nodes (alt + 3)" arrow>
                    <span>
                      <Fab
                        style={{ display: "flex", alignItems: "center" }}
                        onClick={() => {
                          updateCollapsedNodes(Object.keys(openNodes));

                          scene.arrangeNodes();
                        }}
                      >
                        <span className="material-symbols-outlined">filter_none</span>
                      </Fab>
                    </span>
                  </Tooltip>

                  <Tooltip title="Zoom In" arrow>
                    <span>
                      <Fab
                        style={{ display: "flex", alignItems: "center" }}
                        onClick={() => {
                          reactFlowInstance.zoomIn();
                        }}
                      >
                        <span className="material-symbols-outlined">zoom_in</span>
                      </Fab>
                    </span>
                  </Tooltip>

                  <Tooltip title="Zoom Out" arrow>
                    <span>
                      <Fab
                        style={{ display: "flex", alignItems: "center" }}
                        onClick={() => {
                          reactFlowInstance.zoomOut();
                        }}
                      >
                        <span className="material-symbols-outlined">zoom_out</span>
                      </Fab>
                    </span>
                  </Tooltip>
                </div>
              ) : null}
              {hideFlow || editorOverlay || editorState === "essentials" ? null : <Flow openNodes={openNodes} />}
              {openPrompt ? <PromptContainer openPrompt={openPrompt} options={promptOptions} /> : null}
            </>

            <Sidebar />
          </div>
          {isMappingActive ? (
            <div
              style={{
                position: "fixed",
                zIndex: "99999",
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                border: "4px solid " + theme.palette.red.main,
                pointerEvents: "none",
              }}
            ></div>
          ) : null}
        </>
      ) : null}
    </ThemeProvider>
  );
};

export default Editor;

const generateAxis = (scene) => {
  // Compass lines data
  var lines = [];
  var colors = [];
  var length = 10000; // Length of each axis line

  // X axis in red
  lines.push([Vector3.Zero(), new Vector3(length, 0, 0)]);
  colors.push([new Color4(1, 0, 0, 1), new Color4(1, 0, 0, 1)]);

  // Y axis in green
  lines.push([Vector3.Zero(), new Vector3(0, length, 0)]);
  colors.push([new Color4(0, 1, 0, 1), new Color4(0, 1, 0, 1)]);

  // Z axis in blue
  lines.push([Vector3.Zero(), new Vector3(0, 0, length)]);
  colors.push([new Color4(0, 0, 1, 1), new Color4(0, 0, 1, 1)]);

  scene.axisHelper = MeshBuilder.CreateLineSystem("axisHelper", { lines: lines, colors: colors, updatable: true }, scene);
  scene.axisHelper.isPickable = false;
  return scene.axisHelper;
};

const generateGrid = (scene) => {
  // Compass lines data
  var gridSize = 10;
  var spacing = 1; // 1 meter spacing

  // Lines data
  var lines = [];

  // Create vertical lines
  for (var i = -gridSize / 2; i <= gridSize / 2; i += spacing) {
    const start = new Vector3(i, 0, -gridSize / 2);
    const end = new Vector3(i, 0, gridSize / 2);
    lines.push([start, end]);
  }

  // Create horizontal lines
  for (var j = -gridSize / 2; j <= gridSize / 2; j += spacing) {
    const start = new Vector3(-gridSize / 2, 0, j);
    const end = new Vector3(gridSize / 2, 0, j);
    lines.push([start, end]);
  }

  // Create line system
  scene.gridHelper = MeshBuilder.CreateLineSystem("gridHelper", { lines: lines, updatable: true }, scene);
  scene.gridHelper.color = new Color3(0.6, 0.6, 0.6); // White lines
  scene.gridHelper.isPickable = false;
  return scene.gridHelper;
};

const generateHeadTrackHelper = async (scene) => {
  const headMaterial = new PBRMaterial("faceMaterial", scene);

  const result = await SceneLoader.ImportMeshAsync("", "/assets/", "human_head.glb", scene);

  result.meshes[0].position.z = 0;

  result.meshes[0].position.y = 0;

  result.meshes[0].scaling.x = 1;
  result.meshes[0].scaling.y = 1;
  result.meshes[0].scaling.z = 1;
  result.meshes[0].name = "headTrackHelper";

  result.meshes[0].material = headMaterial;
  result.meshes[1].material = headMaterial;

  result.meshes[1].material.albedoColor = new Color3(1, 1, 1);
  result.meshes[1].material.roughness = 0.5;
  result.meshes[1].material.metallic = 0.2;
  result.meshes[1].material.backFaceCulling = false;

  result.meshes[1].isVisible = false;
  result.meshes[1].name = "headTrackHelper";
  scene.headTrackHelper = [result.meshes[1]];

  return scene.headTrackHelper;
};
