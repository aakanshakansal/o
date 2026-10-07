import { Vector3 } from "@babylonjs/core";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import React from "react";

import { useCurrentScene } from "../../../badProvider/functions";

export const driverObj = () => {
  let asset = {};
  let mesh = {};
  let material = {};

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
          title: "Animate - Timeline",
          description:
            "Actions are key to any interactive scene to move, rotate, change color and animate any other property! Let's quick import an asset so we can animate it.",

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
              if (document.querySelector(`#fKfE65VnAf5X6kvMb5BV`)) {
                clearInterval(waitForAssets);

                setTimeout(() => {
                  document.querySelector(`#VaLaiXZxGYzHmEfHsmUK`).click();
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

                      driverObj.moveNext();
                    }
                  }, 100);
                });
              }
            }, 100);
          },
        },
      },

      {
        element: "#renderCanvasContainer",
        popover: {
          title: "Asset imported",
          description: "We are going to animate the sphere by moving it up and change it's color, reverse it and then loop it from a timeline.",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(".collapseButton.actions .material-symbols-outlined").textContent = "add_circle";

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.collapseButton.actions`,
        popover: {
          title: "Actions",
          description: "Click here to open the actions.",

          onNextClick: () => {
            document.querySelector(".collapseButton.actions .material-symbols-outlined").textContent = "movie";
            scene.openPrompt("addAction");
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: "#animate",
        popover: {
          title: "",
          description: "Create an Animate node.",

          onNextClick: () => {
            document.querySelector("#animate").click();

            scene.actions.firstAnimate = {
              name: "firstAnimate",
              displayName: "Animate",
              duration: 250,
              nodes: {},
              type: "Animate",
              nodePosition: {
                x: 450,
                y: 20,
              },
            };
            scene.actions.firstAnimate.getClassName = function () {
              return "Action";
            };
            scene.openPrompt(null);

            setTimeout(() => {
              driverObj.moveNext();
              scene.closeNode(scene.actions.firstAnimate.name);
              scene.openNode("Action", scene.actions.firstAnimate);
            }, 100);
          },
        },
      },

      {
        element: "#renderCanvasContainer",
        popover: {
          title: "Animate Node",
          description:
            "The Animate node is divided in three parts: on the top we find the Map Properties switch, in the middle we have the timeline and at the bottom we have the list of the mapped properties.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".mappingSwitch input",
        popover: {
          title: "Start Mapping",
          description: "By clicking on the switch start mapping.",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(".mappingSwitch input").click();
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".react-flow__node-Mesh",
        popover: {
          title: "Mapping properties",
          description: "Small squares appeared next to the inputs on the right, allowing you to map a keyframe and animate their value.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".react-flow__node-Mesh .positiony",
        popover: {
          title: "",
          description: "As we want to move up the mesh...",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".react-flow__node-Mesh .positiony .mapper",
        popover: {
          title: "",
          description: "Click here to map the Y position of the asset.",

          onNextClick: () => {
            scene.actions.firstAnimate = {
              name: "firstAnimate",
              displayName: "Animate",
              duration: 60,
              nodes: {
                [mesh.name]: {
                  nodeType: "Mesh",
                  props: {
                    "position.y": {
                      keyFrames: {
                        0: {
                          value: "0",
                        },
                      },
                    },
                  },
                },
              },
              type: "Animate",
              nodePosition: {
                x: 450,
                y: 20,
              },
            };
            scene.actions.firstAnimate.getClassName = function () {
              return "Action";
            };

            scene.forceUpdate();
            scene.closeNode(scene.actions.firstAnimate.name);
            scene.openNode("Action", scene.actions.firstAnimate);
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".react-flow__node-Action .positiony",
        popover: {
          title: "",
          description: "As you can se we now have sucesfully mapped the property in the Animate node.",

          onNextClick: () => {
            const assetId = document.querySelector(`.react-flow__node-Mesh .nodeHidden input`).value;
            asset = scene.getMeshByName(assetId);
            mesh = asset.getDescendants()[0];
            material = mesh.material;
            scene.openNode("Material", material);

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // open the material node to map color input

      {
        element: ".react-flow__node-Material .Color3 .mapper",
        popover: {
          title: "",
          description: "I've open the material node for you. Let's now map the color of the sphere.",

          onNextClick: () => {
            scene.actions.firstAnimate = {
              name: "firstAnimate",
              displayName: "Animate",
              duration: 60,
              nodes: {
                [mesh.name]: {
                  nodeType: "Mesh",
                  props: {
                    "position.y": {
                      keyFrames: {
                        0: {
                          value: "0",
                        },
                      },
                    },
                  },
                },

                [material.name]: {
                  nodeType: "PBRMaterial",
                  props: {
                    albedoColor: {
                      keyFrames: {
                        0: {
                          value: "#e6e6e6",
                        },
                      },
                    },
                  },
                },
              },
              type: "Animate",
              nodePosition: {
                x: 450,
                y: 20,
              },
            };
            scene.actions.firstAnimate.getClassName = function () {
              return "Action";
            };

            scene.forceUpdate();
            scene.closeNode(scene.actions.firstAnimate.name);
            scene.openNode("Action", scene.actions.firstAnimate);
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".react-flow__node-Action .Color3",
        popover: {
          title: "",
          description: "And now also the color is mapped.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".react-flow__node-Action .nowheel",
        popover: {
          title: "All set up!",
          description: "Now that we have every property ready, let's start animating.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // duration

      {
        element: ".durationInput input",
        popover: {
          title: "Timing",
          description: "Set the duration of the timeline, let's make it 60 frames (1 second).",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(".durationInput input").focus();
              document.querySelector(".durationInput input").value = 60;
              document.querySelector(".durationInput input").blur();

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      //range animation

      {
        element: ".frameInput",
        popover: {
          title: "Target frame",
          description: "Let's move the timeline's keyframe cursor to the 60th keyframe, to make our animation 1 second in length.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".react-flow__node-Action .positiony",
        popover: {
          title: "",
          description: "Set the desired value: position Y to 2.",

          onNextClick: () => {
            document.querySelector(".react-flow__node-Action .positiony input").value = 2;

            scene.actions.firstAnimate = {
              name: "firstAnimate",
              displayName: "Animate",
              duration: 60,
              nodes: {
                [mesh.name]: {
                  nodeType: "Mesh",
                  props: {
                    "position.y": {
                      keyFrames: {
                        0: {
                          value: "0",
                        },
                        60: {
                          value: "2",
                        },
                      },
                    },
                  },
                },

                [material.name]: {
                  nodeType: "PBRMaterial",
                  props: {
                    albedoColor: {
                      keyFrames: {
                        0: {
                          value: "#e6e6e6",
                        },
                      },
                    },
                  },
                },
              },
              type: "Animate",
              nodePosition: {
                x: 450,
                y: 20,
              },
            };
            scene.actions.firstAnimate.getClassName = function () {
              return "Action";
            };

            scene.forceUpdate();
            scene.closeNode(scene.actions.firstAnimate.name);
            scene.openNode("Action", scene.actions.firstAnimate);
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".react-flow__node-Action .positiony .mapper",
        popover: {
          title: "Trigger moment",
          description: "Click on the keyframe icon to set the new value.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".react-flow__node-Action .Color3.field",
        popover: {
          title: "Changing color",
          description: "Using the same method, change the color from white to red (#ff3333).",

          onNextClick: () => {
            scene.actions.firstAnimate = {
              name: "firstAnimate",
              displayName: "Animate",
              duration: 60,
              nodes: {
                [mesh.name]: {
                  nodeType: "Mesh",
                  props: {
                    "position.y": {
                      keyFrames: {
                        0: {
                          value: "0",
                        },
                        60: {
                          value: "2",
                        },
                      },
                    },
                  },
                },

                [material.name]: {
                  nodeType: "PBRMaterial",
                  props: {
                    albedoColor: {
                      keyFrames: {
                        0: {
                          value: "#e6e6e6",
                        },

                        60: {
                          value: "#ff3333",
                        },
                      },
                    },
                  },
                },
              },
              type: "Animate",
              nodePosition: {
                x: 450,
                y: 20,
              },
            };
            scene.actions.firstAnimate.getClassName = function () {
              return "Action";
            };

            scene.forceUpdate();
            scene.closeNode(scene.actions.firstAnimate.name);
            scene.openNode("Action", scene.actions.firstAnimate);

            setTimeout(() => {
              document.querySelector(".react-flow__node-Action .Color3.field input").focus();
              document.querySelector(".react-flow__node-Action .Color3.field input").value = "#ff3333";
              document.querySelector(".react-flow__node-Action .Color3.field .colorValue").innerText = "#ff3333";

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".react-flow__node-Action .Color3 .mapper",
        popover: {
          title: "Trigger moment",
          description: "Click on the keyframe icon to set the new value.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".actionInputHandle > button",
        popover: {
          title: "",
          description: "Click on Start button to preview the animation.",

          onNextClick: () => {
            document.querySelector(".actionInputHandle > button").click();

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
          description: "It's moving up and changing color! Nice!",

          onNextClick: () => {
            driverObj.moveNext();
          },
        },
      },

      {
        element: ".mappingSwitch input",
        popover: {
          title: "Stop mapping",
          description: "If you are happy with the result, click the switch to stop mapping.",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(".mappingSwitch input").click();
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: "#renderCanvasContainer",
        popover: {
          title: "Reverse animation",
          description: "Often you'll have to do a reverse animation to reset the scene, here is how.",
          onNextClick: () => {
            driverObj.moveNext();
          },
        },
      },

      {
        element: ".react-flow__node-Action .nodeActions button:nth-child(2)",
        popover: {
          title: "Duplicate node",
          description: "Click here to duplicate the Animate node.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".react-flow__node-Action .animateRowSettings div button",
        popover: {
          title: "Reverse animation",
          description: "Click the direction arrow to reverse the animation. This time it's moving down and changing color from red to white.",

          onNextClick: () => {
            scene.actions.invertedFirstAnimate = {
              name: "invertedFirstAnimate",
              displayName: "Animate inverted",
              duration: 60,
              nodes: {
                [mesh.name]: {
                  nodeType: "Mesh",

                  props: {
                    "position.y": {
                      inverted: true,
                      keyFrames: {
                        0: {
                          value: "2",
                        },
                        60: {
                          value: "0",
                        },
                      },
                    },
                  },
                },

                [material.name]: {
                  nodeType: "PBRMaterial",

                  props: {
                    albedoColor: {
                      inverted: true,
                      keyFrames: {
                        0: {
                          value: "#f33333",
                        },

                        60: {
                          value: "#e6e6e6",
                        },
                      },
                    },
                  },
                },
              },
              type: "Animate",
              nodePosition: {
                x: 400,
                y: 100,
              },
            };
            scene.actions.invertedFirstAnimate.getClassName = function () {
              return "Action";
            };

            scene.closeNode(scene.actions.invertedFirstAnimate.name);
            scene.openNode("Action", scene.actions.invertedFirstAnimate);

            scene.forceUpdate();

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: "#renderCanvasContainer",
        popover: {
          title: "Almost there!",
          description: "Reverse animation completed.",

          onNextClick: () => {
            driverObj.moveNext();
          },
        },
      },

      {
        element: "#renderCanvasContainer",
        popover: {
          title: "",
          description: "Timelines are helpfull to trigger mutiple animations, we'll see more in a few setps, first let's create it.",

          onNextClick: () => {
            document.querySelector(".collapseButton.actions .material-symbols-outlined").textContent = "add_circle";
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.collapseButton.actions`,
        popover: {
          title: "",
          description: "Open the actions menu.",

          onNextClick: () => {
            document.querySelector(".collapseButton.actions .material-symbols-outlined").textContent = "movie";
            scene.openPrompt("addAction");
            setTimeout(() => {
              // close material and mesh nodes

              scene.closeNodes();

              setTimeout(() => {
                scene.actions.invertedFirstAnimate.nodePosition = {
                  x: 750,
                  y: 550,
                };
                scene.openNode("Action", scene.actions.invertedFirstAnimate);
              }, 300);

              setTimeout(() => {
                scene.actions.firstAnimate.nodePosition = {
                  x: 800,
                  y: 100,
                };
                scene.openNode("Action", scene.actions.firstAnimate);
              }, 100);

              driverObj.moveNext();
            }, 200);
          },
        },
      },

      {
        element: "#timeline",
        popover: {
          title: "",
          description: "Create a Timeline node.",

          onNextClick: () => {
            document.querySelector("#timeline").click();

            setTimeout(() => {
              scene.openPrompt(null);

              scene.actions.firstTimeline = {
                name: "firstTimeline",
                displayName: "Timeline",
                type: "Timeline",
                actions: [],
                duration: 120,
                loopMode: "Infinite",
                nodePosition: {
                  x: 20,
                  y: 200,
                },
              };

              scene.closeNode(scene.actions.firstTimeline.name);
              scene.openNode("Action", scene.actions.firstTimeline);
              scene.forceUpdate();

              driverObj.moveNext();
            }, 250);
          },
        },
      },

      {
        element: "#renderCanvasContainer",
        popover: {
          title: "Timeline",
          description: `From the timeline node, we can trigger multiple action nodes at various moments by linking the timeline's output arrow to the action's input trigger.`,
          onNextClick: () => {
            scene.actions.firstTimeline = {
              name: "firstTimeline",
              displayName: "Timeline",
              type: "Timeline",
              actions: [
                {
                  start: 0,
                  name: "firstAnimate",
                },
                // {
                //   start: 60,
                //   name: "invertedFirstAnimate",
                // },
              ],

              duration: 120,
              loopMode: "Infinite",
              nodePosition: {
                x: 20,
                y: 200,
              },
            };

            scene.closeNode(scene.actions.firstTimeline.name);
            scene.openNode("Action", scene.actions.firstTimeline);
            scene.forceUpdate();

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `div[data-id="firstTimeline"] .MuiSelect-select`,
        popover: {
          title: "",
          description:
            "You can trigger the timeline once by selecting [None], trigger a loop for a specific number of times with [Constant] or infinite times with [Infinite].",

          onNextClick: () => {
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
          description: `Let's connect the first animation.`,

          onNextClick: () => {
            scene.actions.firstTimeline = {
              name: "firstTimeline",
              displayName: "Timeline",
              type: "Timeline",
              actions: [
                {
                  start: 0,
                  name: "firstAnimate",
                },
                {
                  start: 60,
                  name: "invertedFirstAnimate",
                },
              ],
              duration: 120,
              loopMode: "Infinite",
              nodePosition: {
                x: 20,
                y: 200,
              },
            };

            scene.closeNode(scene.actions.firstTimeline.name);
            scene.openNode("Action", scene.actions.firstTimeline);
            scene.forceUpdate();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "",
          description: "And with the second animation, we can now close the Animation nodes and open the mesh node.",

          onNextClick: () => {
            driverObj.moveNext();
          },
        },
      },

      {
        element: `div[data-id="firstTimeline"] `,
        popover: {
          title: "",
          description: "Everything is hooked up!",

          onNextClick: () => {
            setTimeout(() => {
              scene.closeNodes();
              mesh.onPickTrigger = ["firstTimeline"];
              setTimeout(() => {
                scene.actions.firstTimeline.nodePosition = {
                  x: 600,
                  y: 20,
                };

                setTimeout(() => {
                  scene.openNode("Action", scene.actions.firstTimeline);

                  setTimeout(() => {
                    scene.openNode("Mesh", mesh);

                    driverObj.moveNext();
                  }, 200);
                }, 200);
              }, 200);
            }, 100);
          },
        },
      },

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "",
          description: "Click the sphere to start the loop.",

          onNextClick: () => {
            document.querySelector(`div[data-id="firstTimeline"] .actionInputHandle > button`).click();

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        popover: {
          title: "🎉 Guide completed 🎉",
          description: "Now you know how to use Animate and Timeline nodes! ",

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
          <strong>🏄🏻‍♀️ Animate - Timeline</strong>
        </div>
        <div>Learn to animate any asset property.</div>
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
