import { Color3, Vector3 } from "@babylonjs/core";
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
          title: "PBR Material Guide",
          description: "We will import an asset from Badvisor's library, create a PBR Material to make it shine like gold.  ",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(".collapseButton.meshes .material-symbols-outlined").textContent = "add_circle";
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
            "First of all, let's import a 3D asset from Badvisor's library. You can open the open the 3D Elements menu by hovering and clicking on the (+) button.",

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
          title: "Nice!",
          description: "As you can see, the asset is now in the scene. Move it up a bit: by adjusting the pY (position Y).",

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
        element: `.nodeActions:last-child > button:last-child`,
        popover: {
          title: "Close the node!",
          description: "We can now close the asset's node and open the mesh node.",

          onNextClick: () => {
            document.querySelector(`.nodeActions:last-child > button:last-child`).click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // opening the mesh node

      {
        element: `.collapseButton.meshes`,
        popover: {
          title: "Open 3D Elements",
          description: "Under 3D Elements we can find all the meshes, click it and see what happens.",

          onNextClick: () => {
            document.querySelector(`.collapseButton.meshes button`).click();

            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.outlinerGroup.meshes`,
        popover: {
          title: "",
          description: "By clicking 3D Elements we can find all the meshes, let's expand it to see them more clearly.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // clicking expand

      {
        element: `.outlinerGroup.meshes > div > button:first-child`,
        popover: {
          title: "",
          description: "Click here to expand it.",

          onNextClick: () => {
            document.querySelector(`.outlinerGroup.meshes > div > button:first-child`).click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.outlinerGroup button[id*="Mesh_Primitive_Sphere_Asset_"]`,
        popover: {
          title: "Select mesh",
          description: "Now we can select the mesh.",

          onNextClick: () => {
            mesh.nodePosition = { x: 800, y: 50 };
            document.querySelector(`#${mesh.name}MeshButton`).click();

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
          description: "Move the mesh's node aside and create a material node. ",

          onNextClick: () => {
            document.querySelector(`#${mesh.name}MeshButton`).click();

            setTimeout(() => {
              document.querySelector(".collapseButton.materials .material-symbols-outlined").textContent = "add_circle";

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // material prompt light THEN select PBR material

      {
        element: `.collapseButton.materials`,
        popover: {
          title: "Materials",
          description: "To make it shine we'll have to create a PBR material.",

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
          description: "Once again the menu. Select the 'Phisical Based Material' (PBR).",

          onNextClick: () => {
            document.querySelector(`.prompt .nodeInner div button:nth-child(1)`).click();
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      // material selected
      {
        element: `.prompt .nodeInner div button:nth-child(1)`,
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
          title: "Connections",
          description: "Easy, now let's connect the material to the asset.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `div[data-handleid*="Material_"]`,
        popover: {
          title: "",
          description: "So, connect the material by dragging from the arrow...",

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
          description: "To the material connector of the mesh.",

          onNextClick: () => {
            const materialId = document.querySelector(`.react-flow__node-Material .nodeHidden input`).value;
            material = scene.getMaterialByName(materialId);

            asset.getDescendants()[0].material = material;

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
          description: "Awesome, now let's play with the material's properties to make it shine.",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.react-flow__node-Material`,
        popover: {
          title: "Steps",
          description: "First, let's change the (base) color to yellow and then the metallic .",

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
          description: "A nice yellow will do the trick.",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(`.react-flow__node-Material .nodeInner .Color3.field input`).value = "#ffcc00";
              material.albedoColor = Color3.FromHexString("#ffcc00");
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "It looks great!",
          description: "One last thing, let's increase the metalness. ",

          onNextClick: () => {
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          },
        },
      },

      {
        element: `.react-flow__node-Material .Range.field`,
        popover: {
          title: "Metallic",
          description: "Now let's set the metallic to 1, that way will be shinier.",

          onNextClick: () => {
            setTimeout(() => {
              document.querySelector(`.react-flow__node-Material .Range.field input[type="range"]`).value = 1;
              document.querySelector(`.react-flow__node-Material .Range.field input[type="number"]`).value = 1;
              material.metallic = 1;

              driverObj.moveNext();
            }, 100);
          },
        },
      },

      //

      {
        element: `#renderCanvasContainer`,
        popover: {
          title: "✨ WE ARE RICH ✨",
          description: "",

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
          description: "You have just learned the basics of creating a PBR Material. ",

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

export default function PBRMaterialDriver({ setToggleHelpPopup }) {
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
          <strong>🌈 PBR Material</strong>
        </div>
        <div>Learn the basics of the PBR Material</div>
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
