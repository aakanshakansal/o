import { Vector3 } from "@babylonjs/core";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import React from "react";

import { useCurrentScene } from "../../../badProvider/functions";

export const driverObj = () => {
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
          title: "Quick Start",
          description:
            "We will enable the plane, import an asset from Badvisor's library, create a light, make some shadows and make the camera spin all around. Let's go!",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(".collapseButton.meshes button").click();
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // enable plane
      {
        element: ".collapseButton.meshes",
        popover: {
          title: "Enable Plane",
          description: "First of all, we have to enable the plane to reflect the shadows; collapse the 3D element group...",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: ".outlinerGroup.meshes > div:nth-child(2) button",
        popover: {
          title: "Enable Plane",
          description: "And click on the eye to enable it.",

          onNextClick: () => {
            document.querySelector("#Mesh_EnvironmentPlaneMeshButton").parentNode.parentNode.parentNode.firstChild.click();

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: "#renderCanvasContainer",
        popover: {
          title: "Plane enabled",
          description: "This will make the plane visible in the scene.",

          onNextClick: () => {
            document.querySelector(".collapseButton.meshes .material-symbols-outlined").textContent = "add_circle";
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      //opens dropdonw and THEN opens asset prompt
      {
        element: ".collapseButton.meshes",
        popover: {
          title: "Import 3D Element",
          description:
            "Let's now import a 3D asset from Badvisor's library. You can open the open the 3D Elements menu by hovering and clicking on the (+) button.",

          onNextClick: () => {
            document.querySelector(".collapseButton.meshes .material-symbols-outlined").textContent = "deployed_code";
            scene.openPrompt("add3DElement");
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      //  from prompt then select 3d asset

      {
        element: ".prompt .nodeInner",
        popover: {
          title: "3D Elements menu",
          description: "Here you can select the type of element you want to import.",

          onNextClick: () => {
            document.querySelector(".prompt .nodeInner button:nth-child(1)").click();

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },
      {
        element: ".prompt .nodeInner #threeDAsset",
        popover: {
          title: "3D Asset",
          description: "Click 3D Asset to select the asset library.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // focus square and THEN click add

      {
        element: ".prompt .nodeInner .buttonGroup #confirmButton",
        popover: {
          title: "",
          description: "Click 'Confirm' to open the asset library.",

          onNextClick: () => {
            document.querySelector(".prompt .nodeInner .buttonGroup #confirmButton").click();

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // asset library is now open

      {
        element: `.prompt`,
        popover: {
          title: "Asset library",
          description: "Here you can find the libraries of your organizations including Badvisor's with assets you can use to unleash you creativity.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // selects badvisor's library from top

      {
        element: `#orgSelector`,
        popover: {
          title: "Badvisor's library",
          description: "Lets switch to Badvisor's library to choose an asset to import.",

          onNextClick: () => {
            const select = document.querySelector(`#orgSelector`);

            // Create a mouse click event
            const event = new MouseEvent("mousedown", {
              view: window,
              bubbles: true,
              cancelable: true,
            });

            select.dispatchEvent(event);

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // selects drone from badvisor's library

      {
        element: `#gYJadyreDWnTGS7ezKrk`,
        popover: {
          title: "Select Badvisor Organization",
          description: "In the dropdown menu you can find all your organizations you belong to and also the Badvisor library.",

          onNextClick: () => {
            document.querySelector(`#gYJadyreDWnTGS7ezKrk`).click();
            const waitForAssets = setInterval(() => {
              if (document.querySelector(`#fKfE65VnAf5X6kvMb5BV`)) {
                clearInterval(waitForAssets);
                driverObj.moveNext();
              }
            }, 200);
          },
        },
      },

      {
        element: `#fKfE65VnAf5X6kvMb5BV`,
        popover: {
          title: "Select Asset",
          description: "Once decided the assets you want to import, click on them. In this case, we will only select this drone.",

          onNextClick: () => {
            document.querySelector(`#fKfE65VnAf5X6kvMb5BV`).click();

            setTimeout(() => {
              driverObj.moveNext();
            }, 200);
          },
        },
      },

      // confirm

      {
        element: `.prompt #confirmButton`,
        popover: {
          title: "",
          description: "Finally hit 'Confirm'",

          onNextClick: () => {
            document.querySelector(`.prompt #confirmButton`).click();

            const waitForAsset = setInterval(() => {
              if (document.querySelector(`.react-flow__node`)) {
                clearInterval(waitForAsset);
                driverObj.moveNext();
              }
            }, 500);
          },
        },
      },

      // general screen

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "Yay!",
          description: "You've succesfully imported the asset in the scene.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.react-flow__node-Mesh`,
        popover: {
          title: "Mesh node",
          description: "From here you modify transformations, focus the asset and more.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // focusing the mesh

      {
        element: `.node .nodeActions button:nth-child(6)`,
        popover: {
          title: "Focus the mesh",
          description: "Let's focus the asset by clicking on this icon.",

          onNextClick: () => {
            scene.activeCamera.radius = 2;
            scene.activeCamera.alpha = 1;
            scene.activeCamera.beta = 1.3;
            scene.activeCamera.target = new Vector3(0, 0.4, 0);

            scene.activeCamera.radius = 2;
            scene.activeCamera.alpha = 1;
            scene.activeCamera.beta = 1.3;
            scene.activeCamera.target = new Vector3(0, 0.4, 0);

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // positioning up the mesh

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "Make the drone fly",
          description: "By adjusting the pY (position Y), increase the value so it looks like the drone it's flying on top of the plane.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.node .nodeActions button:nth-child(2)`,
        popover: {
          title: "Adjust position",
          description:
            "There are two ways to adjust the position of the asset. You can either click on this icon and use the gizmo (the colored arrows on near the asset).",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.positiony`,
        popover: {
          title: "Adjust position",
          description: "Or else you could type directly the value you want to set. In this case, we will increase the value of the Y axis.",

          onNextClick: () => {
            const assetId = document.querySelector(`.nodeInner .nodeHidden input`).value;
            scene.getMeshByName(assetId).position.y = 0.5;

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "Awesome!",
          description: "Now tilt it a bit. To do so we'll have to rotate the mesh. The process is the same",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.node .nodeActions button:nth-child(3)`,
        popover: {
          title: "Rotation",
          description: "Again, you can rotate with the gizmo",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.rotationz`,
        popover: {
          title: "Rotation",
          description: "Or type the value directly. In this case, we will rotate the mesh on the X axis.",

          onNextClick: () => {
            const assetId = document.querySelector(`.nodeInner .nodeHidden input`).value;
            scene.getMeshByName(assetId).rotation.z = 0.2;

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // rotating the mesh

      // general screen

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "Nice!",
          description: "Now that the drone it's flying, let's make a fancy shadow, shall we?",

          onNextClick: () => {
            document.querySelector(".collapseButton.lights .material-symbols-outlined").textContent = "add_circle";

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // light

      {
        element: `.collapseButton.lights`,
        popover: {
          title: "Lights",
          description: "To do so we'll have to create a light, just like in real life.",

          onNextClick: () => {
            document.querySelector(".collapseButton.lights .material-symbols-outlined").textContent = "emoji_objects";

            document.querySelector(`.collapseButton.lights .addNew`).click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // light prompt light THEN select directional light

      {
        element: `.prompt .nodeInner`,
        popover: {
          title: "Lights menu",
          description: "Once again the menu. Select 'Directional Light'.",

          onNextClick: () => {
            document.querySelector(`.prompt .nodeInner div button:nth-child(2)`).click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // light selected

      {
        element: `.prompt .nodeInner div button:nth-child(2)`,
        popover: {
          title: "",
          description: "Let's select the 'Directional Light' option.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // clicking add

      {
        element: `.prompt .buttonGroup #confirmButton`,
        popover: {
          title: "",
          description: "Click 'Confirm' to confirm the selection.",

          onNextClick: () => {
            document.querySelector(`.prompt .buttonGroup #confirmButton`).click();
            setTimeout(() => {
              scene.lights[0].position.y = 1;
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // general screen

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "",
          description: "The light is now illuminating the asset. Let's give it a shadow.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // light node selected

      {
        element: `.react-flow__node-Light`,
        popover: {
          title: "Light node",
          description: "Here you can edit light's transformations, intensity, color, shadows and more.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // shadow dropdown

      {
        element: `.react-flow__node-Light div[id*="Shadows"]`,
        popover: {
          title: "",
          description: "Let's open the 'Shadows' section.",

          onNextClick: () => {
            document.querySelector(`.react-flow__node-Light div[id*="Shadows"] > div`).click();

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // shadow enabled

      {
        element: `.react-flow__node-Light div[id*="Shadows"]  > div .Boolean:first-child`,
        popover: {
          title: "Enable Shadows",
          description: "Here you can enable shadows. Let's click it.",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(`.react-flow__node-Light div[id*="Shadows"]  > div .Boolean:first-child input`).click();

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // general screen

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "",
          description: "Woah! The asset now has a shadow!",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // camera dropdown in outliner

      {
        element: `.collapseButton.cameras`,
        popover: {
          title: "Cameras",
          description: "Let's open camera's list.",

          onNextClick: () => {
            document.querySelector(`.collapseButton.cameras > button`).click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // camera node selected

      {
        element: `button[id*="CameraButton`,
        popover: {
          title: "Camera node",
          description: "Let's open the active camera node.",

          onNextClick: () => {
            document.querySelector(`button[id*="CameraButton"]`).click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // camera node selected

      {
        element: `.react-flow__node-Camera`,
        popover: {
          title: "Camera node",
          description: "This is an Orbit Camera node. Here you can edit camera's transformations, limits, autorotation and more.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // set from view THEN click button

      {
        element: `#setFromView`,
        popover: {
          title: "Set From View",
          description: "Let's set the camera from the current view. This will make the scene starts in that position.",

          onNextClick: () => {
            document.querySelector(`#setFromView button`).click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // camera node advanced dropdown

      {
        element: `.react-flow__node-Camera div[id*="Camera"]`,
        popover: {
          title: "Autorotation",
          description: "Let's activate the autorotation on the camera, the option it's inside the 'Advanced' section.",

          onNextClick: () => {
            document.querySelector(`.react-flow__node-Camera div[id*="Camera"] div`).click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // autoriotation enabled

      {
        element: `.react-flow__node-Camera div[id*="Camera"] .Boolean:first-child`,
        popover: {
          title: "",
          description: "Let's click it.",

          onNextClick: () => {
            document.querySelector(`.react-flow__node-Camera div[id*="Camera"] .Boolean:first-child input`).click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // general screen

      {
        element: `#renderCanvas`,
        popover: {
          title: "Autorotation activated",
          description: "The camera is now spinning all around the center of the scene!",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        popover: {
          title: "🎉 Guide completed 🎉",
          description: "You've completed your first scene! ",

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
          <strong>🚀 Quick Start</strong>
        </div>
        <div>Create your first scene in a few steps</div>
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
