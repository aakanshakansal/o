import { Vector3 } from "@babylonjs/core";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import React from "react";

import { useCurrentScene } from "../../../badProvider/functions";

export const driverObj = () => {
  let asset = {};
  let mesh = {};

  const driverObj = driver({
    disableActiveInteraction: true,
    popoverClass: "driverjs-theme",
    allowClose: false,
    showButtons: ["next", "close"],
    showProgress: true,
    smoothScroll: true,
    allowKeyboardControl: false,

    steps: [
      {
        element: "#editorSidebar",
        popover: {
          title: "Animation Groups",
          description:
            "In this tutorial you'll learn how to trigger animations imported within your 3D asset by clicking a mesh. We will first import an asset, then map the animation group to an Animate node and finally we will trigger it by clicking on it.",

          onNextClick: async () => {
            scene.openPrompt("add3DElement");

            setTimeout(() => {
              document.querySelector(".prompt .nodeInner button:nth-child(1)").click();
            });

            setTimeout(() => {
              document.querySelector(".prompt .nodeInner .buttonGroup #confirmButton").click();
            });

            setTimeout(() => {
              setTimeout(() => {
                const select = document.querySelector(`#orgSelector`);

                // Create a mouse click event
                const event = new MouseEvent("mousedown", {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                });

                select.dispatchEvent(event);
              }, 200);

              setTimeout(() => {
                document.querySelector(`#gYJadyreDWnTGS7ezKrk`).click();
                const waitForAssets = setInterval(() => {
                  if (document.querySelector(`#fKfE65VnAf5X6kvMb5BV`)) {
                    clearInterval(waitForAssets);
                    driverObj.moveNext();
                  }
                }, 100);
              }, 200);
            });

            const waitForAssets = setInterval(() => {
              if (document.querySelector(`#mH70wvg7fLEH6WKxZSef`)) {
                clearInterval(waitForAssets);

                setTimeout(() => {
                  document.querySelector(`#mH70wvg7fLEH6WKxZSef`).click();
                });

                setTimeout(() => {
                  document.querySelector(`#confirmButton`).click();

                  const waitForAsset = setInterval(() => {
                    if (document.querySelector(`.react-flow__node`)) {
                      clearInterval(waitForAsset);
                      const assetId = document.querySelector(`.react-flow__node .nodeHidden input`).value;

                      asset = scene.getMeshByName(assetId);
                      mesh = asset.getDescendants()[0];

                      document.querySelector(".nodeActions button:nth-child(6)").click();
                      scene.closeNodes();

                      setTimeout(() => {
                        document.querySelector(".collapseButton.animationGroups button").click();
                      }, 300);

                      setTimeout(() => {
                        driverObj.moveNext();
                      }, 300);
                    }
                  }, 100);
                });
              }
            }, 100);
          },
        },
      },

      {
        element: ".collapseButton.animationGroups + div",
        popover: {
          title: "Animation Groups",
          description: "Here it's the list of all available Animation Groups.",

          onNextClick: () => {
            document.querySelector(".outlinerGroup > div > div > button").click();
            setTimeout(() => {
              document.querySelector(".collapseButton.actions .material-symbols-outlined").textContent = "add_circle";

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.react-flow__node-AnimationGroup`,
        popover: {
          title: "Animation Groups node",
          description: "Here you can find all controls needed to play back your animation.",

          onNextClick: () => {
            scene.actions.firstAnimate = {
              name: "firstAnimate",
              displayName: "Animate",
              duration: 250,
              nodes: {},
              type: "Animate",
              nodePosition: {
                x: 600,
                y: 20,
              },
            };
            scene.actions.firstAnimate.getClassName = function () {
              return "Action";
            };

            scene.openNode("Action", scene.actions.firstAnimate);

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".mappingSwitch input",
        popover: {
          title: "Animate node",
          description: "Enable mapping on your Animate Node .",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(".mappingSwitch input").click();
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: "#play .mapper",
        popover: {
          title: "",
          description: "Click on the keyframe icon to map the action.",

          onNextClick: () => {
            document.querySelector("#play .mapper").click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".mappingSwitch input",
        popover: {
          title: "",
          description: "Stop mapping, and open the Mesh node.",

          onNextClick: () => {
            document.querySelector(".mappingSwitch input").click();
            document.querySelector(".collapseButton.meshes button").click();

            setTimeout(() => {
              document.querySelector(".outlinerGroup.meshes > div > button").click();
            });

            setTimeout(() => {
              document.querySelector('button[id*="Mesh_Ch43_Asset_"]').click();
            }, 500);

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: "#renderCanvasContainer",
        popover: {
          title: "",
          description: "Connect the Mesh node 'On Click' trigger to the animate.",

          onNextClick: () => {
            const meshId = document.querySelector(`.react-flow__node-Mesh .nodeHidden input`).value;
            mesh = scene.getMeshByName(meshId);

            mesh.onPickTrigger = ["firstAnimate"];
            setTimeout(() => {
              scene.updateReactFlow();

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: "#renderCanvasContainer",
        popover: {
          title: "",
          description: "Now if we click on the mesh the animation will play back.",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(".actionInputHandle > button").click();

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: "#renderCanvasContainer",
        popover: {
          title: "Great success",
          description: "The figure is dancing!",

          onNextClick: () => {
            scene.closeNode(scene.actions.firstAnimate.name);

            setTimeout(() => {
              scene.actions.firstAnimate.nodePosition = {
                x: 1200,
                y: 20,
              };
            }, 100);

            setTimeout(() => {
              document.querySelector(".nodesButtons.wrapperTransparent span:nth-child(5) button").click();

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // timeline

      {
        element: "#renderCanvasContainer",
        popover: {
          title: "Loops",
          description: "Now let's see how to loop the animation with the Timeline node.",

          onNextClick: () => {
            scene.openNode("Action", scene.actions.firstAnimate);

            setTimeout(() => {
              scene.actions.firstTimeline = {
                name: "firstTimeline",
                displayName: "Loop Animation Group",
                type: "Timeline",
                actions: [
                  {
                    start: 0,
                    name: "firstAnimate",
                  },
                ],
                duration: 1180,
                loopMode: "Infinite",
                nodePosition: {
                  x: 450,
                  y: 300,
                },
              };

              scene.closeNode(scene.actions.firstTimeline.name);
              scene.openNode("Action", scene.actions.firstTimeline);

              const meshId = document.querySelector(`.react-flow__node-Mesh .nodeHidden input`).value;
              mesh = scene.getMeshByName(meshId);

              mesh.onPickTrigger = ["firstTimeline"];

              scene.forceUpdate();
            }, 100);

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: "#renderCanvasContainer",
        popover: {
          title: "Timeline",
          description:
            "By setting the loop type to [Infinite] our animation will play back continously. Hint: to achive a seamless loop, make sure that the Timeline duration matches the Animation Group frame length.",
          onNextClick: () => {
            setTimeout(() => {
              document.querySelector('div[data-id="firstTimeline"] .actionInputHandle > button').click();
              document.querySelector('div[data-id="firstTimeline"] .actionInputHandle > button').click();
              document.querySelector('div[data-id="firstTimeline"] .actionInputHandle > button').click();
              document.querySelector('div[data-id="firstTimeline"] .actionInputHandle > button').click();
            }, 100);

            setTimeout(() => {
              scene.closeNodes();
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        popover: {
          title: "🎉 Guide completed 🎉",
          description: "Now you can experiment with Animation Groups! ",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },
    ],
  });

  driverObj.drive();
};

export default function QuickStartDriver({ setToggleHelpPopup }) {
  const scene = useCurrentScene();

  return (
    <div
      style={{
        fontWeight: "normal",
        textAlign: "left",
        padding: "1em",
        width: "100%",
        backgroundColor: "#bada55",
        color: "#111",
        borderRadius: "0.5em",
        marginBottom: "2.5em",
        height: "11em",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div>
          <strong>💣 Animation Groups</strong>
        </div>
        <div>Play any animation from your assets.</div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "1em",
        }}
      >
        <button
          onClick={() => {
            scene.activeCamera.radius = 1;
            scene.activeCamera.alpha = 0.8;
            scene.activeCamera.beta = 0.8;
            scene.activeCamera.target = new Vector3(0, 0.1, 0);

            setToggleHelpPopup(false);
            scene.closeNodes();
            driverObj();
          }}
          style={{
            padding: "0.25em 0.5em",
            borderRadius: "0.5em",
            backgroundColor: "#111",
            color: "#dedede",
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
}
