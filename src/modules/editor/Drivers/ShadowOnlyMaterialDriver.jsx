import { Color3, Vector3 } from "@babylonjs/core";
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
          title: "Shadow Only Tutorial 👻",
          description:
            "1. Enable Plane 2. Import an asset from Badvisor's library, 3. Create a light 4. Create Shadow Only Material 5. Conntect material to plane! Easy peasy! Let's dyve in!",

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
          description: "Step 1, enable the plane to reflect the shadows; collapse the 3D element group...",

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
          title: "",
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
            "Step 2, let's import a 3D asset from Badvisor's library. You can open the open the 3D Elements menu by hovering and clicking on the (+) button.",

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
          description: "Click '3D Asset' to select the asset library.",

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
          description: "Here you can find the libraries of your organizations including Badvisor's.",

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

      // selects sphere from badvisor's library

      {
        element: `#VaLaiXZxGYzHmEfHsmUK`,
        popover: {
          title: "Select Asset",
          description: "Once decided the assets you want to import, click on them. In this case, we will only select this sphere.",

          onNextClick: () => {
            document.querySelector(`#VaLaiXZxGYzHmEfHsmUK`).click();

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
                const assetId = document.querySelector(`.react-flow__node .nodeHidden input`).value;

                asset = scene.getMeshByName(assetId);
                mesh = asset.getDescendants()[0];

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
          title: "",
          description: "Great! The asset is now in the scene. But let's move a up the asset a little",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // positioning up the mesh

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
          description: "Or you could type directly the value you want to set. In this case, we will increase the value of the Y axis.",

          onNextClick: () => {
            const assetId = document.querySelector(`.nodeInner .nodeHidden input`).value;
            scene.getMeshByName(assetId).position.y = 1;

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "Nice!",
          description: "What now? Step 3, Create a light.",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(".collapseButton.lights .material-symbols-outlined").textContent = "add_circle";

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // create the light

      {
        element: `.collapseButton.lights`,
        popover: {
          title: "Lights",
          description: "Hover on the lightbulb and click (+) to choose a light.",

          onNextClick: () => {
            document.querySelector(`.collapseButton.lights .addNew`).click();
            setTimeout(() => {
              document.querySelector(".collapseButton.lights .material-symbols-outlined").textContent = "lightbulb";

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
          description: "Lights menu has opened...",

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
          description: "Click 'Confirm'.",

          onNextClick: () => {
            document.querySelector(`.prompt .buttonGroup #confirmButton`).click();
            setTimeout(() => {
              scene.lights[0].position.y = 2.4;
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
          title: "",
          description: "Here you can enable shadows. Let's click it.",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(`.react-flow__node-Light div[id*="Shadows"]  > div .Boolean:first-child input`).click();

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // blur

      {
        element: `.react-flow__node-Light .nodeInner .shadowGeneratorblurKernel `,
        popover: {
          title: "Blur",
          description: "Make the shadow a little bit softer.",

          onNextClick: () => {
            setTimeout(() => {
              const light = scene.getLightByName(document.querySelector(`.react-flow__node-Light .nodeHidden input`).value);

              light.shadowGenerator.blurKernel = 120;

              document.querySelector(`.shadowGeneratorblurKernel input[type="range"]`).value = 120;
              document.querySelector(`.shadowGeneratorblurKernel input[type="number"]`).value = 120;

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "Awesome!",
          description: "Almost there! Step 4: Create a Shadow Only Material. But first close the nodes. We don't need them anymore.",

          onNextClick: () => {
            setTimeout(() => {
              scene.closeNodes();
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // material prompt light THEN select Shadow Only Material

      {
        element: `.collapseButton.materials`,
        popover: {
          title: "Materials",
          description: "To make it shine we'll have to create a Shadow Only Material.",

          onNextClick: () => {
            document.querySelector(".collapseButton.materials .material-symbols-outlined").textContent = "gradient";

            document.querySelector(`.collapseButton.materials .addNew`).click();
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
          title: "Materials menu",
          description: "Once again the menu. This time select the 'Shadow Only Material'.",

          onNextClick: () => {
            document.querySelector(`.prompt .nodeInner div button:nth-child(2)`).click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // material selected
      {
        element: `.prompt .nodeInner div button:nth-child(2)`,
        popover: {
          title: "",
          description: "Like this.",

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
          description: "And click 'Confirm'.",

          onNextClick: () => {
            document.querySelector(`.prompt .buttonGroup #confirmButton`).click();
            setTimeout(() => {
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
          description: "The material is now created. Let's connect it to the plane.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // open plane
      // clicking expand

      {
        element: `.collapseButton.meshes`,
        popover: {
          title: "",
          description: "Click here to expand.",

          onNextClick: () => {
            document.querySelector(`.collapseButton.meshes button`).click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // click plane

      {
        element: `.outlinerGroup #Mesh_EnvironmentPlaneMeshButton`,
        popover: {
          title: "",
          description: "Click the plane mesh to open it.",

          onNextClick: () => {
            scene.getMeshByName("Mesh_EnvironmentPlane").nodePosition = { x: 600, y: 50 };
            document.querySelector(`#Mesh_EnvironmentPlaneMeshButton`).click();

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "Nice!",
          description: "Step 5: Let's connect them now.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // connect material to plane

      {
        element: `div[data-handleid*="Material_"]`,
        popover: {
          title: "",
          description: "To do so we have to: connect the material...",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.Material.field button`,
        popover: {
          title: "",
          description: "To the asset.",

          onNextClick: () => {
            const material = scene.getMaterialByName(document.querySelector(`.react-flow__node-Material .nodeHidden input`).value);
            scene.getMeshByName("Mesh_EnvironmentPlane").material = material;

            setTimeout(() => {
              scene.updateReactFlow();
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "Connected!",
          description: "Awesome, now let's play with the material's properties to make it a little bit darker.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.react-flow__node-Material .nodeInner .Color3.field input`,
        popover: {
          title: "Base color",
          description: "This gray will do the trick.",

          onNextClick: () => {
            setTimeout(() => {
              const material = scene.getMaterialByName(document.querySelector(`.react-flow__node-Material .nodeHidden input`).value);
              document.querySelector(`.react-flow__node-Material .nodeInner .Color3.field input`).value = "#545454";
              material.shadowColor = Color3.FromHexString("#545454");

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        popover: {
          element: `#renderCanvasContainer`,
          title: "",
          description: "Fancy!",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        popover: {
          title: "🎇 Guide completed 🎆",
          description: "You have just learned the basics of the Shadow Only Material. ",

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

export default function ShadowOnlyMaterialDriver({ setToggleHelpPopup }) {
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
          <strong>👻 Shadow Only</strong>
        </div>
        <div>Cast a shadow onto a transparent object</div>
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
