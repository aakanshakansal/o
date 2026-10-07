import { Button, Tooltip, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { EngineButton } from "./Buttons/EngineButton";
import { SceneButton } from "./Buttons/SceneButton";
import { EffectsButton } from "./Effects";
import { ActionsList } from "./Lists/ActionsList";
import { AnimationGroupsList } from "./Lists/AnimationGroupsList";
import { CamerasList } from "./Lists/CamerasList";
import { LightsList } from "./Lists/LightsList";
import { MaterialsList } from "./Lists/MaterialsList";
import { MeshesList } from "./Lists/MeshesList";
import { SoundsList } from "./Lists/SoundsList";
import { TexturesList } from "./Lists/TexturesList";

import { OverlaysList } from "./Lists/OverlaysList";

import { ControlNodesList } from "./Lists/ControlNodesList";

import { toast } from "sonner";
import { useActiveGroups, useCurrentScene, useUpdateActiveGroups } from "../../badProvider/functions";
import { createControlNode } from "../../sceneFunctions/createSceneElements";
import ActionConsole from "./Components/ActionConsole";
import { StringInput } from "./Components/StringInput";
import HelpPopup from "./HelpPopup";
import { CollectionsList } from "./Lists/CollectionsList";
import { VariablesList } from "./Lists/VariablesList";
import Marqueeno from "./Marqueeno";
import PerformanceMeter from "./PerformanceMeter";
import { createNode } from "./createNode";

const Outliner = (props) => {
  const theme = useTheme();

  const scene = useCurrentScene();
  const activeGroups = useActiveGroups();
  const updateActiveGroups = useUpdateActiveGroups();
  const [search, setSearch] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const toggleGroup = (group) => {
    const copy = [...activeGroups];

    if (copy.indexOf(group) === -1) {
      copy.push(group);
    } else {
      copy.splice(copy.indexOf(group), 1);
    }
    updateActiveGroups(copy);

    // setActiveGroups(copy);
  };

  useEffect(() => {
    const allGroups = [
      "collections",
      "controlNodes",
      "cameras",
      "lights",
      "meshes",
      "materials",
      "textures",
      "actions",
      "variables",
      "animationGroups",
      "sounds",
      "overlays",
    ];

    if (search.length > 0) {
      updateActiveGroups(allGroups);
    } else {
      updateActiveGroups([]);
    }
  }, [search]);
  // if (darkMode) {
  //   document.getElementById("scene").classList.remove("light");
  // } else {
  //   document.getElementById("scene").classList.add("light");
  // }

  function hideAllOverlays() {
    Object.values(scene.overlays).forEach((node) => {
      if (node.hasOwnProperty("enabled")) {
        node.enabled = false;
        scene.forceUpdate();
      }
    });
  }

  function showAllOverlays() {
    Object.values(scene.overlays).forEach((node) => {
      if (node.hasOwnProperty("enabled")) {
        node.enabled = true;
        scene.forceUpdate();
      }
    });
  }

  return (
    <div id="outliner">
      <div className="outlinerInner">
        <PerformanceMeter />

        <div className="treeView">
          <div className="collapseButton" style={{ top: "3em", height: "3em", padding: "0 1em", gap: "0.5em" }}>
            <StringInput
              label={
                <span style={{ fontSize: "1.4em" }} className="material-symbols-outlined">
                  search
                </span>
              }
              placeholder={"Search..."}
              style={{
                borderRadius: "0.5em",
              }}
              inputStyle={{ textAlign: "left" }}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value.toLowerCase());
              }}
            />
            {window.location.pathname === "/sadbox" ? null : <AddReplaceButton scene={scene} />}
          </div>

          <div className="collapseButton" id="actionConsole" key={"actionConsole"} style={{ zIndex: 1, backgroundColor: theme.palette.background.dark }}>
            <Button
              onClick={() => {
                const sidebar = document.getElementById("editorSidebar");
                if (sidebar && sidebar.scrollTop > 200) {
                  sidebar.scrollTo({ top: 0, behavior: "smooth" });
                  if (activeGroups.indexOf("actionConsole") === -1) {
                    toggleGroup("actionConsole");
                  }
                } else {
                  toggleGroup("actionConsole");
                }
              }}
              style={{ color: theme.palette.text.primary }}
            >
              <span className="material-symbols-outlined collapseButtonIcon" style={{ marginRight: "0.5em", color: theme.palette.red.main }}>
                terminal
              </span>
              <span style={{ display: "flex", width: "100%", overflow: "hidden" }}>
                <Marqueeno text={"Action Console"}></Marqueeno>
              </span>

              {activeGroups.indexOf("actionConsole") !== -1 ? (
                <span className="material-symbols-outlined">expand_more</span>
              ) : (
                <span className="material-symbols-outlined">chevron_right</span>
              )}
            </Button>
          </div>
          {activeGroups.indexOf("actionConsole") !== -1 ? (
            <div className="outlinerGroup" style={{ borderColor: theme.palette.red.main }}>
              <ActionConsole />
            </div>
          ) : null}

          <HelpPopup />

          <div className="collapseButton" key={"settings"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button className="" onClick={() => toggleGroup("settings")} style={{ color: theme.palette.text.primary }}>
              <span className="material-symbols-outlined collapseButtonIcon" style={{ marginRight: "0.5em", color: theme.palette.text.default }}>
                settings
              </span>
              <span style={{ width: "100%", textAlign: "left" }}> Settings</span>

              {activeGroups.indexOf("settings") !== -1 ? (
                <span className="material-symbols-outlined">expand_more</span>
              ) : (
                <span className="material-symbols-outlined">chevron_right</span>
              )}
            </Button>
          </div>
          {activeGroups.indexOf("settings") !== -1 ? (
            <div className=" outlinerGroup">
              <EngineButton node={scene.getEngine()} />
              <SceneButton node={scene} />
              <EffectsButton node={scene.effects} />
            </div>
          ) : null}

          <div className="collapseButton" key={"capture"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button
              className=""
              onClick={() => {
                scene.openNode("CaptureNode", { name: "capture", displayName: "Capture" });
              }}
              node={scene}
              style={{ color: theme.palette.text.primary }}
            >
              <span className="material-symbols-outlined collapseButtonIcon" style={{ marginRight: "0.5em", color: theme.palette.text.default }}>
                capture
              </span>
              <span>Capture</span>
            </Button>
          </div>

          <div className="collapseButton collections" key={"collections"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button onClick={() => toggleGroup("collections")} style={{ color: theme.palette.text.primary }}>
              <span className="material-symbols-outlined collapseButtonIcon">library_add</span>
              <span style={{ color: theme.palette.text.primary, width: "100%", textAlign: "left" }}>Collections</span>
              <span className={Object.keys(scene.collections).length ? "" : "emptyQuantity"}>{Object.keys(scene.collections).length}</span>

              {Object.keys(scene.collections).length ? (
                activeGroups.indexOf("collections") !== -1 ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )
              ) : null}
            </Button>
            <Button
              className="addNew"
              onClick={() => {
                createNode({ scene, type: "Collection" });
              }}
              style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}
            >
              <Tooltip enterNextDelay={200} title="alt + K" arrow placement="left">
                <span className="material-symbols-outlined">add_circle</span>
              </Tooltip>
            </Button>
          </div>

          {activeGroups.indexOf("collections") !== -1 ? (
            <div className="outlinerGroup" style={{ borderColor: theme.palette.text.primary }}>
              <CollectionsList search={search} nodes={scene.collections} />
            </div>
          ) : null}

          <div className="collapseButton controlNodes" key={"controlNodes"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button onClick={() => toggleGroup("controlNodes")} style={{ color: theme.palette.text.primary }}>
              <span className="material-symbols-outlined collapseButtonIcon">nest_remote</span>
              <span style={{ color: theme.palette.text.primary, width: "100%", textAlign: "left" }}>Control Nodes</span>
              <span className={Object.keys(scene.controlNodes).length ? "" : "emptyQuantity"}>{Object.keys(scene.controlNodes).length}</span>

              {Object.keys(scene.controlNodes).length ? (
                activeGroups.indexOf("controlNodes") !== -1 ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )
              ) : null}
            </Button>
            <Button
              className="addNew"
              onClick={() => {
                scene.openNode("ControlNode", createControlNode(scene));
              }}
              style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}
            >
              <Tooltip enterNextDelay={200} title="alt + N" arrow placement="left">
                <span className="material-symbols-outlined">add_circle</span>
              </Tooltip>
            </Button>
          </div>

          {activeGroups.indexOf("controlNodes") !== -1 ? (
            <div className="outlinerGroup" style={{ borderColor: theme.palette.text.primary }}>
              <ControlNodesList search={search} nodes={scene.controlNodes} />
            </div>
          ) : null}

          <div className="collapseButton cameras" key={"cameras"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button onClick={() => toggleGroup("cameras")} style={{ color: theme.palette.violet.main }}>
              <span className="material-symbols-outlined collapseButtonIcon">videocam</span>
              <span style={{ color: theme.palette.text.primary, width: "100%", textAlign: "left" }}> Cameras</span>
              <span className={Object.keys(scene.cameras).length ? "" : "emptyQuantity"}>{Object.keys(scene.cameras).length}</span>

              {Object.keys(scene.cameras).length ? (
                activeGroups.indexOf("cameras") !== -1 ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )
              ) : null}
            </Button>
            <Button
              className="addNew"
              onClick={() => scene.openPrompt("addCamera")}
              style={{ color: theme.palette.violet.main, background: theme.palette.background.dark }}
            >
              <Tooltip enterNextDelay={200} title="alt + C" arrow placement="left">
                <span className="material-symbols-outlined">add_circle</span>
              </Tooltip>
            </Button>
          </div>

          {activeGroups.indexOf("cameras") !== -1 ? (
            <div className="outlinerGroup cameras" style={{ borderColor: theme.palette.violet.main }}>
              <CamerasList search={search} nodes={scene.cameras} />
            </div>
          ) : null}
          <div className="collapseButton lights" key={"lights"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button onClick={() => toggleGroup("lights")} style={{ color: theme.palette.yellow.main }}>
              <span className="material-symbols-outlined collapseButtonIcon">emoji_objects</span>
              <span style={{ color: theme.palette.text.primary, width: "100%", textAlign: "left" }}> Lights</span>
              <span className={Object.keys(scene.lights).length ? "" : "emptyQuantity"}>{Object.keys(scene.lights).length}</span>

              {Object.keys(scene.lights).length ? (
                activeGroups.indexOf("lights") !== -1 ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )
              ) : null}
            </Button>
            <Button
              className="addNew"
              onClick={() => scene.openPrompt("addLight")}
              style={{ color: theme.palette.yellow.main, background: theme.palette.background.dark }}
            >
              <Tooltip title="alt + L" arrow placement="left">
                <span className="material-symbols-outlined">add_circle</span>
              </Tooltip>
            </Button>
          </div>
          {activeGroups.indexOf("lights") !== -1 ? (
            <div className="outlinerGroup lights" style={{ borderColor: theme.palette.yellow.main }}>
              <LightsList search={search} nodes={scene.lights} />
            </div>
          ) : null}

          <div className="collapseButton meshes" key={"meshes"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button onClick={() => toggleGroup("meshes")} style={{ color: theme.palette.turquoise.main }}>
              <span className="material-symbols-outlined collapseButtonIcon">deployed_code</span>
              <span style={{ color: theme.palette.text.primary, width: "100%", textAlign: "left" }}> 3D Elements</span>

              <span>{Object.values(scene.badAssets).length}</span>

              <div className="arrows">
                {activeGroups.indexOf("meshes") !== -1 ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )}
              </div>
            </Button>
            <Button
              className="addNew"
              onClick={() =>
                // callback texture

                scene.openPrompt("add3DElement")
              }
              style={{ color: theme.palette.turquoise.main, background: theme.palette.background.dark }}
            >
              <Tooltip enterNextDelay={200} title="alt + D" arrow placement="left">
                <span className="material-symbols-outlined">add_circle</span>
              </Tooltip>
            </Button>
          </div>

          {activeGroups.indexOf("meshes") !== -1 ? (
            <div className="outlinerGroup meshes" style={{ borderColor: theme.palette.turquoise.main }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75em", marginRight: "1em", gap: "0.5em" }}>
                <Button
                  className="FunctionButton"
                  style={{ width: "1.6em", padding: "0" }}
                  onClick={() => {
                    if (expandAll === false) {
                      setExpandAll(0);
                    } else {
                      setExpandAll(false);
                    }
                    setExpandAll(true);
                  }}
                >
                  <span className="material-symbols-outlined">expand_content</span>
                </Button>
                <Button
                  className="FunctionButton"
                  style={{ width: "1.6em", padding: "0" }}
                  onClick={() => {
                    if (expandAll === true) {
                      setExpandAll(1);
                    } else {
                      setExpandAll(true);
                    }

                    setExpandAll(false);
                  }}
                >
                  <span className="material-symbols-outlined">collapse_content</span>
                </Button>
              </div>

              <MeshesList expandAll={expandAll} search={search} nodes={scene.badAssets} />

              {/* <div className="list">
                <div className="sublistHeader" style={{ borderColor: theme.palette.turquoise.main }}>
                  <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.turquoise.main }}>
                    deployed_code
                  </span>
                  Assets
                </div>
                <div className="sublistGroup">
                  <MeshesList expandAll={expandAll} search={search} nodes={scene.badAssets} />
                </div>
              </div> */}

              {/* <div className="list">
                <div className="sublistHeader" style={{ borderColor: theme.palette.turquoise.main }}>
                  <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.turquoise.main }}>
                    water_lux
                  </span>
                  Default Environment
                </div>
                <div className="sublistGroup">
                  <MeshesList
                    expandAll={expandAll}
                    search={search}
                    nodes={Object.values(scene.meshes).filter((elem) => elem.name === "Mesh_EnvironmentPlane" || elem.name === "Mesh_Skybox")}
                  />
                </div>
              </div> */}
            </div>
          ) : null}

          <div className="collapseButton materials" key={"materials"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button onClick={() => toggleGroup("materials")} style={{ color: theme.palette.green.main }}>
              <span className="material-symbols-outlined collapseButtonIcon">gradient</span>
              <span style={{ color: theme.palette.text.primary, width: "100%", textAlign: "left" }}> Materials</span>
              <span className={Object.values(scene.materials).filter((v) => v.fromAsset || v.isCustom || v.cloneOf).length ? "" : "emptyQuantity"}>
                {Object.values(scene.materials).filter((v) => v.fromAsset || v.isCustom || v.cloneOf).length}
              </span>

              <div className={Object.values(scene.materials).filter((v) => v.fromAsset || v.isCustom || v.cloneOf).length ? "arrows" : "empty"}>
                {Object.values(scene.materials).filter((v) => v.fromAsset || v.isCustom || v.cloneOf).length ? (
                  activeGroups.indexOf("materials") !== -1 ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )
                ) : null}
              </div>
            </Button>
            <Button
              className="addNew"
              onClick={() => scene.openPrompt("addMaterial")}
              style={{ color: theme.palette.green.main, background: theme.palette.background.dark }}
            >
              <Tooltip enterNextDelay={200} title="alt + M" arrow placement="left">
                <span className="material-symbols-outlined">add_circle</span>
              </Tooltip>
            </Button>
          </div>
          {activeGroups.indexOf("materials") !== -1 ? (
            <div className="outlinerGroup materials" style={{ borderColor: theme.palette.green.main }}>
              <MaterialsList search={search} nodes={Object.values(scene.materials).filter((v) => v.fromAsset || v.isCustom || v.cloneOf)} />
            </div>
          ) : null}

          <div className="collapseButton textures" key={"textures"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button onClick={() => toggleGroup("textures")} style={{ color: theme.palette.orange.main }}>
              <span className="material-symbols-outlined collapseButtonIcon">texture</span>
              <span style={{ color: theme.palette.text.primary, width: "100%", textAlign: "left" }}> Textures</span>
              <span className={Object.values(scene.textures).filter((v) => v.fromAsset || v.isCustom || v.cloneOf).length ? "" : "emptyQuantity"}>
                {Object.values(scene.textures).filter((v) => v.fromAsset || v.isCustom || v.cloneOf).length}
              </span>

              {Object.values(scene.textures).filter((v) => v.fromAsset || v.isCustom || v.cloneOf).length ? (
                activeGroups.indexOf("textures") !== -1 ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )
              ) : null}
            </Button>
            <Button
              className="addNew"
              onClick={() => scene.openPrompt("addTexture")}
              style={{ color: theme.palette.orange.main, background: theme.palette.background.dark }}
            >
              <Tooltip enterNextDelay={200} title="alt + T" arrow placement="left">
                <span className="material-symbols-outlined">add_circle</span>
              </Tooltip>
            </Button>
          </div>
          {activeGroups.indexOf("textures") !== -1 ? (
            <div className="outlinerGroup textures" style={{ borderColor: theme.palette.orange.main }}>
              <TexturesList search={search} nodes={Object.values(scene.textures).filter((v) => v.fromAsset || v.isCustom || v.cloneOf)} />
            </div>
          ) : null}

          <div className="collapseButton actions" key={"actions"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button onClick={() => toggleGroup("actions")} style={{ color: theme.palette.red.main }}>
              <span className="material-symbols-outlined collapseButtonIcon">movie</span>
              <span style={{ color: theme.palette.text.primary, width: "100%", textAlign: "left" }}> Actions</span>
              <span className={Object.keys(scene.actions).length ? "" : "emptyQuantity"}>{Object.keys(scene.actions).length}</span>

              {Object.keys(scene.actions).length ? (
                activeGroups.indexOf("actions") !== -1 ? (
                  <span className="material-symbols-outlined">expand_more</span>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )
              ) : null}
            </Button>
            <Button
              className="addNew"
              onClick={() => scene.openPrompt("addAction")}
              style={{ color: theme.palette.red.main, background: theme.palette.background.dark }}
            >
              <Tooltip enterNextDelay={200} title="alt + A" arrow placement="left">
                <span className="material-symbols-outlined">add_circle</span>
              </Tooltip>
            </Button>
          </div>
          {activeGroups.indexOf("actions") !== -1 ? (
            <div className="outlinerGroup actions" style={{ borderColor: theme.palette.red.main }}>
              <ActionsList search={search} nodes={scene.actions} />
            </div>
          ) : null}

          <div className="collapseButton variables" key={"variables"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button onClick={() => toggleGroup("variables")} style={{ color: theme.palette.text.primary }}>
              <span className="material-symbols-outlined collapseButtonIcon">code_blocks</span>
              <span style={{ color: theme.palette.text.primary, width: "100%", textAlign: "left" }}>Variables</span>

              <span className={Object.keys(scene.variables).length ? "" : "emptyQuantity"}>{Object.keys(scene.variables).length}</span>

              {Object.keys(scene.variables).length ? (
                <>
                  {activeGroups.indexOf("variables") !== -1 ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </>
              ) : null}
            </Button>
            <Button
              className="addNew"
              onClick={() => {
                createNode({ scene, type: "Variable" });
              }}
              style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}
            >
              <Tooltip enterNextDelay={200} title="alt + V" arrow placement="left">
                <span className="material-symbols-outlined">add_circle</span>
              </Tooltip>
            </Button>
          </div>
          {activeGroups.indexOf("variables") !== -1 ? (
            <div className="outlinerGroup variables" style={{ borderColor: theme.palette.text.primary }}>
              <VariablesList search={search} nodes={scene.variables} />
            </div>
          ) : null}

          {scene.animationGroups?.length ? (
            <>
              <div className="collapseButton animationGroups" key={"animationGroups"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
                <Button onClick={() => toggleGroup("animationGroups")} style={{ color: theme.palette.text.primary }}>
                  <span className="material-symbols-outlined collapseButtonIcon">directions_run</span>
                  <span style={{ color: theme.palette.text.primary, width: "100%", textAlign: "left" }}> Animation Groups</span>
                  <span>{Object.keys(scene.animationGroups).length}</span>
                  {activeGroups.indexOf("animationGroups") !== -1 ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </Button>
              </div>

              {activeGroups.indexOf("animationGroups") !== -1 ? (
                <div className="outlinerGroup " style={{ borderColor: theme.palette.text.primary }}>
                  <AnimationGroupsList search={search} nodes={scene.animationGroups} />
                </div>
              ) : null}
            </>
          ) : null}

          <div className="collapseButton sounds" key={"sounds"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button onClick={() => toggleGroup("sounds")} style={{ color: theme.palette.blue.main }}>
              <span className="material-symbols-outlined collapseButtonIcon">volume_mute</span>
              <span style={{ color: theme.palette.text.primary, width: "100%", textAlign: "left" }}>Sounds</span>

              <span className={scene.mainSoundTrack.soundCollection.length ? "" : "emptyQuantity"}>{scene.mainSoundTrack.soundCollection.length}</span>

              {scene.mainSoundTrack.soundCollection.length ? (
                <>
                  {activeGroups.indexOf("sounds") !== -1 ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </>
              ) : null}
            </Button>
            <Button
              className="addNew"
              onClick={() => {
                createNode({
                  scene,
                  type: "Sound",
                });
              }}
              style={{ color: theme.palette.blue.main, background: theme.palette.background.dark }}
            >
              <Tooltip enterNextDelay={200} title="alt + S" arrow placement="left">
                <span className="material-symbols-outlined">add_circle</span>
              </Tooltip>
            </Button>
          </div>
          {activeGroups.indexOf("sounds") !== -1 ? (
            <div className="outlinerGroup sounds" style={{ borderColor: theme.palette.blue.main }}>
              <SoundsList search={search} nodes={scene.mainSoundTrack.soundCollection} />
            </div>
          ) : null}

          <div className="collapseButton overlays" key={"overlays"} style={{ backgroundColor: theme.palette.background.dark, zIndex: 1 }}>
            <Button onClick={() => toggleGroup("overlays")} style={{ color: theme.palette.text.primary }}>
              <span className="material-symbols-outlined collapseButtonIcon">web_asset</span>
              <span style={{ color: theme.palette.text.primary, width: "100%", textAlign: "left" }}> Overlays</span>
              <span className={Object.keys(scene.overlays).length ? "" : "emptyQuantity"}> {Object.keys(scene.overlays).length}</span>

              {Object.keys(scene.overlays).length ? (
                <>
                  {activeGroups.indexOf("overlays") !== -1 ? (
                    <span className="material-symbols-outlined">expand_more</span>
                  ) : (
                    <span className="material-symbols-outlined">chevron_right</span>
                  )}
                </>
              ) : null}
            </Button>
            <Button
              className="addNew"
              onClick={() => {
                scene.createOverlayNode();
              }}
              style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}
            >
              <Tooltip enterNextDelay={200} title="alt + O" arrow placement="left">
                <span className="material-symbols-outlined">add_circle</span>
              </Tooltip>
            </Button>
          </div>
          {activeGroups.indexOf("overlays") !== -1 ? (
            <div className="outlinerGroup overlays" style={{ borderColor: theme.palette.text.primary }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75em", marginRight: "1em", gap: "0.5em" }}>
                <Button
                  className="FunctionButton"
                  style={{ width: "auto", display: "flex", alignItems: "center", gap: "0.25em" }}
                  onClick={() => {
                    hideAllOverlays();
                  }}
                >
                  <span className="material-symbols-outlined">visibility_off</span>
                  <span> Hide All</span>
                </Button>
                <Button
                  className="FunctionButton"
                  style={{ width: "auto", display: "flex", alignItems: "center", gap: "0.25em" }}
                  onClick={() => {
                    showAllOverlays();
                  }}
                >
                  <span className="material-symbols-outlined">visibility</span>
                  <span> Show All</span>
                </Button>
              </div>

              <OverlaysList search={search} nodes={scene.overlays} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Outliner;

function AddReplaceButton(props) {
  const scene = props.scene;

  return (
    <Button
      className="FunctionButton"
      style={{ width: "auto", padding: "0 0.8em", height: "1.6em", flexShrink: 0, justifyContent: "center", display: "flex", alignItems: "center" }}
      title="Add / Replace"
      onClick={async () => {
        scene.openPrompt("addReplace", {
          organizationId: window.organizationId,
          // hideSelectors: true,
          data: {
            // mergeMaterials: true
          },
          callback: (data, dataToMerge) => {
            scene.openPrompt(null);
            toast("Importing data from Scene: " + dataToMerge.name);
            scene.updateData(data);
          },
          cancel: () => {
            scene.openPrompt(null);
          },
        });
      }}
    >
      <span style={{ fontSize: "0.8em", display: "flex", justifyContent: "center", alignItems: "center" }}>
        Add / Replace
        <span style={{ marginLeft: "0.2em" }} className="material-symbols-outlined">
          move_down
        </span>
      </span>
    </Button>
  );
}
