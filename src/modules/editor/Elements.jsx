import useTheme from "@mui/material/styles/useTheme";
import { useState } from "react";
import { useCurrentScene } from "../../badProvider/functions";
import { StringInput } from "./Components/StringInput";
import { createNode } from "./createNode";

export function Elements() {
  const theme = useTheme();

  const scene = useCurrentScene();

  const handleStyle = {
    position: "absolute",
    width: "10px",
    height: "10px",
    borderRadius: "0.5em",
  };

  const initialElements = [
    { label: "3D Elements" },
    {
      title: "3D Asset",
      type: "Asset",
      icon: "deployed_code",
      color: theme.palette.turquoise.main,
      leftHandles: [40],
      rightHandles: [60, 70, 80],
      leftHandlesColor: theme.palette.green.main,
      rightHandlesColor: theme.palette.red.main,
      tooltip: "Insert multiple 3d Assets from your library or the Badvisor library. (.glb, .obj, .stl and .vrm)",
    },
    {
      title: "3D Text",
      type: "3DText",
      icon: "text_fields",
      color: theme.palette.turquoise.main,
      tooltip: "Generate 3D text.",
      leftHandles: [40],
      rightHandles: [60, 70, 80],
      leftHandlesColor: theme.palette.green.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "Photo Dome",
      type: "PhotoDome",
      icon: "public",
      color: theme.palette.turquoise.main,
      tooltip: "Generate a Photo Dome by selecting an image.",
    },
    // {
    //   title: "GSplat",
    //   type: "GSplat",
    //   icon: "public",
    //   color: theme.palette.violet.main,
    // },
    { label: "Cameras" },
    {
      title: "Orbit Camera",
      type: "ArcRotateCamera",
      icon: "360",
      color: theme.palette.violet.main,
      tooltip: "Allows users to orbit around a target object or point of interest, providing a dynamic and immersive view of the 3D scene.",
    },
    {
      title: "First Person Camera",
      type: "UniversalCamera",
      icon: "photo_camera",
      color: theme.palette.violet.main,
      tooltip: "Enables user navigation and exploration from a first-person perspective in virtual environments.",
    },

    { label: "Lights" },
    {
      title: "Point Light",
      type: "PointLight",
      icon: "emoji_objects",
      color: theme.palette.yellow.main,
      tooltip: "Project light in all direction from its position in the scene. Can cast shadows.",
    },
    {
      title: "Directional Light",
      type: "DirectionalLight",
      icon: "light_mode",
      color: theme.palette.yellow.main,
      tooltip: "Project light following an absolute direction regardless its position in the scene. Can cast shadows.",
    },
    {
      title: "Spot Light",
      type: "SpotLight",
      icon: "highlight",
      color: theme.palette.yellow.main,
      tooltip: "Projects a cone shaped light from its position in the scene toward a target. Can cast shadows.",
    },
    {
      title: "Hemispheric Light",
      type: "HemisphericLight",
      icon: "language",
      color: theme.palette.yellow.main,
      tooltip: "Creates a gradient light effect. Cannot cast shadows.",
    },
    { label: "Materials" },
    {
      title: "PBR Material",
      type: "PBRMaterial",
      icon: "deployed_code",
      color: theme.palette.green.main,
      tooltip: "Physically Based Materials provide realistic shading and behavior for lifelike graphics.",
      leftHandles: [30, 40, 50, 60, 70, 80],
      rightHandles: [10],
      leftHandlesColor: theme.palette.orange.main,
      rightHandlesColor: theme.palette.green.main,
    },
    {
      title: "Shadow Only Material",
      type: "ShadowOnlyMaterial",
      icon: "ev_shadow",
      color: theme.palette.green.main,
      tooltip: "Renders only shadows, without any visible appearance.",
      rightHandles: [10],
      rightHandlesColor: theme.palette.green.main,
    },

    {
      title: "Transmission Material",
      type: "TransmissionMaterial",
      icon: "sound_detection_glass_break",
      color: theme.palette.green.main,
      tooltip: "This material exhibits dynamic light transmission, chromatic aberration, and light distortion.",
      rightHandles: [10],
      rightHandlesColor: theme.palette.green.main,
    },

    // {
    //   title: "Diamond Material",
    //   type: "DiamondMaterial",
    //   icon: "sound_detection_glass_break",
    //   color: theme.palette.green.main,
    //   tooltip: "This material exhibits dynamic light transmission, chromatic aberration, and light distortion.",
    //   rightHandles: [10],
    //   rightHandlesColor: theme.palette.green.main,
    // },
    // {
    //   title: "Shader Material",
    //   type: "ShaderMaterial",
    //   icon: "star",
    //   color: theme.palette.green.main,
    //   tooltip: "Uses custom vertex and fragment code, allowing for advanced rendering effects and customization.",
    //   rightHandles: [10],
    //   rightHandlesColor: theme.palette.green.main,
    // },
    { label: "Textures" },
    {
      title: "Texture",
      type: "Texture",
      icon: "texture",
      color: theme.palette.orange.main,
      tooltip: "Image used to customize PBR material properties",
      rightHandles: [10],
      rightHandlesColor: theme.palette.orange.main,
    },
    {
      title: "Cube Texture",
      type: "CubeTexture",
      icon: "deployed_code",
      color: theme.palette.orange.main,
      tooltip: "Image used for reflections and skyboxes. IBL Format",
      rightHandles: [10],
      rightHandlesColor: theme.palette.orange.main,
    },
    {
      title: "HDRCube Texture",
      type: "HDRCubeTexture",
      icon: "deployed_code",
      color: theme.palette.orange.main,
      tooltip: "Image used for reflections and skyboxes. HDR Format",
      rightHandles: [10],
      rightHandlesColor: theme.palette.orange.main,
    },
    {
      title: "Video Texture",
      type: "VideoTexture",
      icon: "movie",
      color: theme.palette.orange.main,
      tooltip: "Allows videos to be played back within a PBR material channel.",
      rightHandles: [10],
      rightHandlesColor: theme.palette.orange.main,
    },
    {
      title: "Dynamic Texture",
      type: "DynamicTexture",
      icon: "text_fields",
      color: theme.palette.orange.main,
      tooltip: "A dynamic texture works by creating a canvas onto which you can write text, change font and colors.",
      rightHandles: [10],
      rightHandlesColor: theme.palette.orange.main,
    },
    {
      title: "Color Grading Texture",
      type: "ColorGradingTexture",
      icon: "gradient",
      color: theme.palette.orange.main,
      tooltip:
        "A color grading texture can be used to achieve color correction instead of using curves. you can connect this texture in the section Effects > Image Processing > Color Grading Texture. (.3dl)",
      rightHandles: [10],
      rightHandlesColor: theme.palette.orange.main,
    },
    { label: "Overlays" },
    {
      title: "Overlay",
      type: "Overlay",
      icon: "web_asset",
      color: theme.palette.text.primary,
      tooltip: "Add UIs and 2D elements to your scene.",
    },
    { label: "Actions" },
    {
      title: "Animate",
      type: "Animate",
      icon: "directions_run",
      color: theme.palette.red.main,
      toolbar: "Create animations by selecting scene and assets properties and change them over time.",
      leftHandles: [10],
      rightHandles: [30, 40, 50, 60, 70, 80],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "Condition",
      type: "Condition",
      icon: "equal",
      color: theme.palette.red.main,
      tooltip:
        "Trigger specific actions depending on true or false results. It allows to control the flow of execution and create interactive and responsive experiences.",
      leftHandles: [10],
      rightHandles: [60, 70],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "Timeline",
      type: "Timeline",
      icon: "schedule",
      color: theme.palette.red.main,
      tooltip: "Schedule and loop multiple actions over a defined timeframe, allowing for versatile animations with precise timing control.",
      leftHandles: [10],
      rightHandles: [30, 40, 50, 60, 70, 80],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "Math",
      type: "Math",
      icon: "functions",
      color: theme.palette.red.main,
      tooltip: "Operate between scene values by adding, subtracting, multiplying, divinding and setting custom values or existing values within the scene.",
      leftHandles: [10],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },

    {
      title: "Expression",
      type: "Expression",
      icon: "function",
      color: theme.palette.red.main,
      tooltip: "Set properties by writing expressions combining node values and operations.",
      leftHandles: [10],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "Sequencer",
      type: "Sequencer",
      icon: "chevron_right",
      color: theme.palette.red.main,
      tooltip: "Play multiple actions in a step-by-step fashion.",
      leftHandles: [10],
      rightHandles: [50],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "Overlays",
      type: "Overlays",
      icon: "web_asset",
      color: theme.palette.red.main,
      toolbar: "Manage visibility of interface components and elements in the scene",
      leftHandles: [10],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "EnterAR",
      type: "EnterAR",
      icon: "view_in_ar",
      color: theme.palette.red.main,
      tooltip: "Enables Augmented Reality feature projecting digital content onto the physical environment.",
      leftHandles: [10],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "EnterVTO",
      type: "EnterVTO",
      icon: "ar_on_you",
      color: theme.palette.red.main,
      tooltip: "Enables Virtual Try-on feature projecting digital content onto person's body.",
      leftHandles: [10],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "ExternalLink",
      type: "ExternalLink",
      icon: "link",
      color: theme.palette.red.main,
      tooltip: "Open and external URL to point to web content or to concatenate scenes.",
      leftHandles: [10],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "AddReplace",
      type: "AddReplace",
      icon: "move_down",
      color: theme.palette.red.main,
      tooltip: "Seamlessly blend new elements into a your scene or replace existing components.",
      leftHandles: [10],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "SaveConfig",
      type: "SaveConfig",
      icon: "save",
      color: theme.palette.red.main,
      tooltip:
        "This action will generate a sharable configuration link based on all the tracked actions in your scene. It will also send the current configuration to the parent window in a human readable format.",
      leftHandles: [10],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "Screenshot",
      type: "Screenshot",
      icon: "capture",
      color: theme.palette.red.main,
      tooltip: "Trigger a screenshot of the scene.",
      leftHandles: [10],
      leftHandlesColor: theme.palette.red.main,
      rightHandlesColor: theme.palette.red.main,
    },
    {
      title: "Export Scene",
      type: "ExportScene",
      icon: "download",
      color: theme.palette.red.main,
      tooltip: "Download the scene as a Glb file.",
      leftHandlesColor: theme.palette.dark.main,
      rightHandlesColor: theme.palette.dark.main,
    },

    { label: "Sound" },
    {
      title: "Sound",
      type: "Sound",
      icon: "volume_mute",
      color: theme.palette.blue.main,
      tooltip: "Add sounds to your scene.",
    },
    { label: "Utilities" },
    {
      title: "Variable",
      type: "Variable",
      icon: "code_blocks",
      color: theme.palette.text.primary,
      tooltip: "A variable is a value that can be changed in the scene and used in conditional nodes.",
    },
    {
      title: "Collection",
      type: "Collection",
      icon: "library_add",
      color: theme.palette.text.primary,
      tooltip: "Group your nodes with collections.",
    },
    {
      title: "Control Node",
      type: "ControlNode",
      icon: "nest_remote",
      color: theme.palette.text.primary,
      tooltip: "Group node properties together.",
    },
  ];
  const [elements, setElements] = useState(initialElements);

  return (
    <>
      <div style={{ padding: "1.6em", position: "sticky", top: 0, backgroundColor: theme.palette.dark.main, zIndex: 1 }}>
        <StringInput
          label={
            <span style={{ fontSize: "1.4em" }} className="material-symbols-outlined">
              search
            </span>
          }
          style={{
            borderRadius: "0.5em",
          }}
          placeholder="Search..."
          inputStyle={{ textAlign: "left" }}
          type="text"
          onChange={(e) => {
            if (e.target.value) {
              setElements(initialElements.filter((n) => n.title && n.title.toLowerCase().includes(e.target.value.toLowerCase())));
            } else {
              setElements(initialElements);
            }
          }}
        />
      </div>
      {elements.length ? (
        <div style={{ padding: "0 2em 2em 2em", textAlign: "center", opacity: 0.5, fontSize: "0.8em" }}>
          Drag or double click to add elements in the viewport
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1em",
          boxSizing: "border-box",
          padding: "0em 2em 2em 2em",
          width: "100%",
        }}
      >
        {!elements.length ? (
          <div
            style={{
              height: "50vh",
              width: "100%",
              gridColumnStart: 1,
              gridColumnEnd: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              ¯\_(ツ)_/¯
              <br />
              Nothing to see here...
            </div>
          </div>
        ) : null}
        {elements.map((node, i) => {
          if (node.label) {
            return (
              <div
                key={i}
                style={{
                  width: "100%",
                  gridColumnStart: 1,
                  gridColumnEnd: 4,
                  marginBottom: "-0.5em",
                  // position: "sticky",
                  // top: "5em",
                  // backgroundColor: theme.palette.background.dark,
                  // zIndex: 1,
                }}
              >
                {node.label}
              </div>
            );
          } else {
            return (
              <div
                key={i}
                style={{ padding: "0.5em", cursor: "pointer" }}
                onDragStart={(e) => {
                  e.dataTransfer.setData("node", node.type);
                }}
                onDoubleClick={(e) => {
                  createNode({ scene, type: node.type });
                }}
                draggable
              >
                <div
                  className="elementNode"
                  title={node.tooltip}
                  style={{
                    position: "relative",
                    backgroundColor: "transparent",
                    aspectRatio: "3/4",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "center",
                    alignItems: "center",
                    gap: "0.5em",
                    border: "solid 1px",
                    fontSize: "0.8em",
                    borderRadius: "0.5em",

                    color: theme.palette.dark.main,
                    borderColor: node.color,
                    padding: "1em 1px 1px 1px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: "column",
                      justifyContent: "center",
                      backgroundColor: node.color,
                      width: "100%",
                      height: "100%",
                      borderRadius: "0 0 0.5em 0.5em",
                    }}
                  >
                    {node.title}
                    <span className="material-symbols-outlined" style={{ fontSize: "2.5em" }}>
                      {node.icon}
                    </span>

                    {node.leftHandles
                      ? node.leftHandles.map((h, i) => {
                          return (
                            <div
                              key={i}
                              style={{
                                ...handleStyle,
                                left: "-0.5em",
                                top: h + "%",
                                backgroundColor: theme.palette.dark.main,
                                border: "solid 1px" + (node.leftHandlesColor || node.color),
                              }}
                            ></div>
                          );
                        })
                      : null}
                    {node.rightHandles
                      ? node.rightHandles.map((h, i) => {
                          return (
                            <div
                              key={i}
                              style={{
                                ...handleStyle,
                                right: "-0.5em",
                                top: h + "%",
                                backgroundColor: theme.palette.dark.main,
                                border: "solid 1px" + (node.rightHandlesColor || node.color),
                              }}
                            ></div>
                          );
                        })
                      : null}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
    </>
  );
}
