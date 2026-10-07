export const overlayTypes = (editor, scene, node) => {
  editor.DomComponents.addType("Iframe", {
    model: {
      defaults: {
        traits: [
          {
            type: "text",
            label: "id",
            name: "id",
          },
          {
            type: "text",
            label: "Name",
            name: "name",
          },

          {
            type: "text",
            label: "Src",
            name: "src",
          },
        ],
      },
      init: function () {
        this.on("change:attributes:id", (e) => {
          let id = this.getId();
          id = id.replace(/[^a-zA-Z0-9]/g, "");
          this.setId(id);
        });
      },
    },
  });

  editor.Components.addType("actionButton", {
    model: {
      class: "actionButton",
      defaults: {
        action: "",
        script: function (properties) {
          const actionButtonListner = () => {
            if (properties.defaultActions && window.scene) {
              function toggleFullScreen() {
                if (!document.fullscreenElement) {
                  // If not in full-screen mode, enter it
                  document.documentElement.requestFullscreen().catch((e) => {
                    console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
                  });
                } else {
                  // If in full-screen mode, exit it
                  document.exitFullscreen().catch((e) => {
                    console.error(`Error attempting to exit full-screen mode: ${e.message} (${e.name})`);
                  });
                }
              }

              function enterFullScreen() {
                //  if (!document.fullscreenElement) {
                // If not in full-screen mode, enter it
                document.documentElement.requestFullscreen().catch((e) => {
                  console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
                });
                // } else {
                //   // If in full-screen mode, exit it
                //   document.exitFullscreen().catch((e) => {
                //     console.error(`Error attempting to exit full-screen mode: ${e.message} (${e.name})`);
                //   });
                // }
              }

              function exitFullScreen() {
                // if (!document.fullscreenElement) {
                //   // If not in full-screen mode, enter it
                //   document.documentElement.requestFullscreen().catch((e) => {
                //     console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
                //   });
                // } else {
                // If in full-screen mode, exit it
                document.exitFullscreen().catch((e) => {
                  console.error(`Error attempting to exit full-screen mode: ${e.message} (${e.name})`);
                });
                // }
              }

              function closeThisOverlay(overlay) {
                if (window.scene.overlays[overlay]) {
                  window.scene.overlays[overlay].enabled = false;
                  window.scene.forceUpdate();
                }
              }

              if (properties.defaultActions === "enterFullscreen") {
                enterFullScreen();
              }

              if (properties.defaultActions === "exitFullscreen") {
                exitFullScreen();
              }

              if (properties.defaultActions === "toggleFullscreen") {
                toggleFullScreen();
              }

              if (properties.defaultActions.indexOf("closeThisOverlay_") !== -1) {
                const overlay = properties.defaultActions.split(/_(.*)/s)[1];

                closeThisOverlay(overlay);
              }
            }

            if (properties.action && window.scene && window.scene.actions[properties.action]) {
              window.scene.actionsDispatcher(window.scene, window.scene.actions[properties.action], { trigger: "ActionButton", trackEvent: true });
            }
          };

          this.addEventListener("click", actionButtonListner);
        },
        traits: [
          { type: "text", name: "id", label: "Id" },
          { type: "text", name: "title", label: "Tooltip" },
          {
            type: "select",
            name: "defaultActions",
            label: "Default Actions",
            changeProp: true,
            options: [
              { value: "none", name: "none" },
              { value: "enterFullscreen", name: "Enter Fullscreen" },
              { value: "exitFullscreen", name: "Exit Fullscreen" },
              { value: "toggleFullscreen", name: "Toggle Fullscreen" },
              { value: "closeThisOverlay_" + node.name, name: "Close This Overlay" },
            ],
          },

          {
            type: "select",
            name: "action",
            label: "Scene Action",
            changeProp: true,
            options: Object.entries({ ...scene.actions }).map(([k, v]) => {
              return { value: k, name: v.displayName };
            }),
          },
        ],
        "script-props": ["action", "defaultActions"],
      },
      init: function () {
        this.on("change:attributes:id", (e) => {
          let id = this.getId();
          id = id.replace(/[^a-zA-Z0-9]/g, "");
          this.setId(id);
        });
      },

      // init: function () {
      //   this.set("attributes", { class: "actionButton" });
      // },
    },
  });

  // editor.Components.addType("actionButtonGroup", {
  //   model: {
  //     class: "actionButtonGroup",
  //     defaults: {
  //       action: "",
  //       script: function (properties) {
  //         var buttons = this.querySelectorAll(".groupedActionButton");
  //         for (var i = 0; i < buttons.length; i++) {
  //           buttons[i].onclick = (e) => {
  //             for (var j = 0; j < buttons.length; j++) {
  //               buttons[j].classList.remove("active");
  //             }
  //             e.currentTarget.classList.add("active");
  //           };
  //         }
  //       },
  //       "script-props": [""],
  //     },
  //     // init: function () {
  //     //   this.set("attributes", { class: "actionButton" });
  //     // },
  //   },
  // });

  editor.Components.addType("actionButtonGroup", {
    model: {
      class: "actionButtonGroup",
      defaults: {
        script: function (properties) {
          const buttons = this.children;

          for (let index = 0; index < buttons.length; index++) {
            const element = buttons[index];

            const actionButtonGroupListner = () => {
              for (let index = 0; index < buttons.length; index++) {
                buttons[index].classList.remove("active");
              }
              element.classList.add("active");
            };

            element.addEventListener("click", actionButtonGroupListner);
          }
        },

        "script-props": [""],
      },
      init: function () {
        this.on("change:attributes:id", (e) => {
          let id = this.getId();
          id = id.replace(/[^a-zA-Z0-9]/g, "");
          this.setId(id);
        });

        // setTimeout(() => {
        //   this.view.el.querySelector(".badAccordionSummary").onclick = () => {
        //     this.view.el.classList.toggle("open");
        //   };
        // }, 1);
      },
    },
  });

  editor.Components.addType("accordion", {
    model: {
      class: "accordion",
      defaults: {
        script: function (properties) {
          this.querySelector(".badAccordionSummary").onclick = () => {
            this.classList.toggle("open");
          };
        },

        "script-props": [""],
      },
      init: function () {
        this.on("change:attributes:id", (e) => {
          let id = this.getId();
          id = id.replace(/[^a-zA-Z0-9]/g, "");
          this.setId(id);
        });

        setTimeout(() => {
          this.view.el.querySelector(".badAccordionSummary").onclick = () => {
            this.view.el.classList.toggle("open");
          };
        }, 1);
      },
    },
  });

  editor.Components.addType("sidebar", {
    model: {
      class: "sidebar",
      defaults: {
        script: function (properties) {
          this.querySelector(".badSidebarToggler").onclick = () => {
            this.classList.toggle("open");
          };
        },

        "script-props": [""],
      },
      init: function () {
        this.on("change:attributes:id", (e) => {
          let id = this.getId();
          id = id.replace(/[^a-zA-Z0-9]/g, "");
          this.setId(id);
        });
        setTimeout(() => {
          this.view.el.querySelector(".badSidebarToggler").onclick = () => {
            this.view.el.classList.toggle("open");
          };
        }, 1);
        // this.querySelector(".badSidebarToggler").onclick = () => {
        //   this.classList.toggle("open");
        // };
      },
    },
  });

  editor.Components.addType("dynamicTextureInput", {
    model: {
      class: "dynamicTextureInput",
      defaults: {
        action: "",
        script: function (properties) {
          this.oninput = (e) => {
            if (properties.hasOwnProperty("texture")) {
              if (window.scene.getTextureByName(properties.texture)) {
                const node = window.scene.getTextureByName(properties.texture);

                node.text = e.target.value;

                const ctx = node.getContext();

                let fontStyle = node.fontStyle || "normal";

                const size = 10;
                ctx.font = fontStyle + " " + size + "px " + node.fontFamily;
                const textWidth = ctx.measureText(node.text).width;
                const ratio = textWidth / size;
                const fontSize = Math.floor(1024 / (ratio * 1));
                ctx.clearRect(0, 0, 1024, 1024);
                let font;

                if (node.autoSize) {
                  font = fontStyle + " " + fontSize + "px " + node.fontFamily;
                } else {
                  font = fontStyle + " " + node.fontSize + "px " + node.fontFamily;
                }

                node.drawText(node.text, null, null, font, node.fontColor, "transparent", false, true);

                if (!window.configLog) {
                  window.configLog = {};
                }

                if (!window.configLog[node.name]) {
                  window.configLog[node.name] = { displayName: node.displayName, className: node.getClassName(), props: {} };
                }

                window.configLog[node.name].props.text = { value: node.text };
              }
            }
          };
        },

        traits(component) {
          const result = [
            {
              type: "select",
              name: "texture",
              changeProp: true,
              options: scene.textures
                .filter((e) => e.getClassName() === "DynamicTexture")
                .map((e) => {
                  return { value: e.name, name: e.displayName };
                }),
            },
          ];

          //  console.log(component);

          return result;
        },

        "script-props": ["texture"],
      },
      init: function () {
        this.on("change:attributes:id", (e) => {
          let id = this.getId();
          id = id.replace(/[^a-zA-Z0-9]/g, "");
          this.setId(id);
        });
      },

      // init() {
      //   this.on("change:texture", this.handleTextureChange);
      //   //  this.on("change:prop", this.handleCollectionChange);
      // },
    },
  });

  editor.Components.addType("textureInput", {
    model: {
      class: "textureInput",
      defaults: {
        action: "",
        script: function (properties) {
          this.oninput = (e) => {
            const file = e.target.files[0];

            const blob = new Blob([file], { type: file.type });

            const url = URL.createObjectURL(blob);

            if (properties.hasOwnProperty("texture")) {
              if (window.scene.getTextureByName(properties.texture)) {
                window.scene.getTextureByName(properties.texture).updateURL(url);
              }
            }
          };
        },

        traits(component) {
          const result = [
            {
              type: "select",
              name: "texture",
              changeProp: true,
              options: scene.textures.map((e) => {
                return { value: e.name, name: e.displayName };
              }),
            },
          ];

          //  console.log(component);

          return result;
        },

        "script-props": ["texture"],
      },
      init: function () {
        this.on("change:attributes:id", (e) => {
          let id = this.getId();
          id = id.replace(/[^a-zA-Z0-9]/g, "");
          this.setId(id);
        });
      },

      // init() {
      //   this.on("change:texture", this.handleTextureChange);
      //   //  this.on("change:prop", this.handleCollectionChange);
      // },
    },
  });

  editor.Components.addType("numberInput", {
    model: {
      class: "numberInput",
      defaults: {
        action: "",
        script: function (properties) {
          this.oninput = (e) => {
            //  console.log(e.target.value, properties);
            if (!properties.prop) return;
            if (properties.collection === "cameras") {
              if (properties.hasOwnProperty("camera")) {
                if (window.scene.getCameraByName(properties.camera)) {
                  window.scene.geCameraByName(properties.camera)[properties.prop] = e.target.value;
                }
              }
            }
            if (properties.collection === "lights") {
              if (properties.hasOwnProperty("light")) {
                if (window.scene.getLightByName(properties.light)) {
                  window.scene.getLightByName(properties.light)[properties.prop] = e.target.value;
                }
              }
            }
            if (properties.collection === "meshes") {
              if (properties.hasOwnProperty("mesh")) {
                if (window.scene.getMeshByName(properties.mesh)) {
                  window.scene.getMeshByName(properties.mesh)[properties.prop] = e.target.value;
                }
              }
            }
            if (properties.collection === "materials") {
              if (properties.hasOwnProperty("material")) {
                if (window.scene.getMaterialByName(properties.material)) {
                  window.scene.getMaterialByName(properties.material)[properties.prop] = e.target.value;
                }
              }
            }
            if (properties.collection === "textures") {
              if (properties.hasOwnProperty("texture")) {
                if (window.scene.getTextureByName(properties.texture)) {
                  window.scene.getTextureByName(properties.texture)[properties.prop] = e.target.value;
                }
              }
            }
          };
        },

        traits(component) {
          const result = [
            {
              type: "number",
              name: "min",
              label: "Min",
            },
            {
              type: "number",
              name: "max",
              label: "Max",
            },
            {
              type: "number",
              name: "step",
              label: "Step",
            },
            {
              type: "select",
              name: "collection",
              changeProp: true,
              options: [
                { value: "cameras", name: "Camera" },
                { value: "lights", name: "Light" },
                { value: "meshes", name: "Mesh" },
                { value: "materials", name: "Material" },
                { value: "textures", name: "Texture" },
              ],
            },
          ];

          //  console.log(component);

          return result;
        },

        "script-props": ["collection", "camera", "light", "mesh", "material", "texture", "prop"],
      },

      init() {
        this.on("change:collection", this.handleCollectionChange);
        this.on("change:camera", this.handleCameraChange);
        this.on("change:light", this.handleLightChange);
        this.on("change:mesh", this.handleMeshChange);
        this.on("change:material", this.handleMaterialChange);
        this.on("change:texture", this.handleTextureChange);
        this.on("change:attributes:id", (e) => {
          let id = this.getId();
          id = id.replace(/[^a-zA-Z0-9]/g, "");
          this.setId(id);
        });
        //  this.on("change:prop", this.handleCollectionChange);
      },

      handleCollectionChange() {
        //  console.log("Input collection changed to: ", this.attributes.collection);
        if (this.attributes.collection === "cameras") {
          this.removeTrait("camera");
          this.removeTrait("light");
          this.removeTrait("mesh");
          this.removeTrait("material");
          this.removeTrait("texture");

          this.addTrait({
            type: "select",
            name: "camera",
            changeProp: true,
            options: scene.cameras.map((e) => {
              return { value: e.name, name: e.displayName };
            }),
          });
        }

        if (this.attributes.collection === "lights") {
          this.removeTrait("camera");
          this.removeTrait("light");
          this.removeTrait("mesh");
          this.removeTrait("material");
          this.removeTrait("texture");

          this.addTrait({
            type: "select",
            name: "light",
            changeProp: true,
            options: scene.lights.map((e) => {
              return { value: e.name, name: e.displayName };
            }),
          });
        }

        if (this.attributes.collection === "meshes") {
          this.removeTrait("camera");
          this.removeTrait("light");
          this.removeTrait("mesh");
          this.removeTrait("material");
          this.removeTrait("texture");

          this.addTrait({
            type: "select",
            name: "mesh",
            changeProp: true,
            options: scene.meshes.map((e) => {
              return { value: e.name, name: e.displayName };
            }),
          });
        }
        if (this.attributes.collection === "materials") {
          this.removeTrait("camera");
          this.removeTrait("light");
          this.removeTrait("mesh");
          this.removeTrait("material");
          this.removeTrait("texture");

          this.addTrait({
            type: "select",
            name: "material",
            changeProp: true,
            options: scene.materials.map((e) => {
              return { value: e.name, name: e.displayName };
            }),
          });
        }

        if (this.attributes.collection === "textures") {
          this.removeTrait("camera");
          this.removeTrait("light");
          this.removeTrait("mesh");
          this.removeTrait("material");
          this.removeTrait("texture");

          this.addTrait({
            type: "select",
            name: "texture",
            changeProp: true,
            options: scene.textures.map((e) => {
              return { value: e.name, name: e.displayName };
            }),
          });
        }
      },

      handleCameraChange() {
        //  console.log("Input Camera changed to: ", this.attributes.camera);

        this.removeTrait("prop");

        this.addTrait({
          type: "string",
          name: "prop",
          changeProp: true,
        });
      },

      handleLightChange() {
        //  console.log("Input Light changed to: ", this.attributes.light);

        this.removeTrait("prop");

        this.addTrait({
          type: "string",
          name: "prop",
          changeProp: true,
        });
      },

      handleMeshChange() {
        //  console.log("Input Mesh changed to: ", this.attributes.mesh);

        this.removeTrait("prop");

        this.addTrait({
          type: "string",
          name: "prop",
          changeProp: true,
        });
      },

      handleMaterialChange() {
        //  console.log("Input Material changed to: ", this.attributes.material);

        this.removeTrait("prop");

        this.addTrait({
          type: "string",
          name: "prop",
          changeProp: true,
        });
      },

      handleTextureChange() {
        //  console.log("Input Texture changed to: ", this.attributes.texture);

        this.removeTrait("prop");

        this.addTrait({
          type: "string",
          name: "prop",
          changeProp: true,
        });
      },
    },
  });

  editor.Components.addType("colorInput", {
    model: {
      class: "colorInput",
      defaults: {
        action: "",
        script: function (properties) {
          this.oninput = (e) => {
            function hexToColor3(hex) {
              var c;
              if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split("");
                if (c.length === 3) {
                  c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c = "0x" + c.join("");

                return { r: (c >> 16) & 255, g: (c >> 8) & 255, b: c & 255 };
                //  return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
              }
              throw new Error("Bad Hex");
            }

            const color = hexToColor3(e.target.value);

            //  console.log(e.target.value, properties);
            if (!properties.prop) return;
            // if (properties.collection === "cameras") {
            //   if (properties.hasOwnProperty("camera")) {
            //     if (window.scene.getCameraByName(properties.camera)) {
            //       window.scene.geCameraByName(properties.camera)[properties.prop] = e.target.value;
            //     }
            //   }
            // }
            if (properties.collection === "lights") {
              if (properties.hasOwnProperty("light")) {
                if (window.scene.getLightByName(properties.light)) {
                  window.scene.getLightByName(properties.light)[properties.prop] = color;
                }
              }
            }
            // if (properties.collection === "meshes") {
            //   if (properties.hasOwnProperty("mesh")) {
            //     if (window.scene.getMeshByName(properties.mesh)) {
            //       window.scene.getMeshByName(properties.mesh)[properties.prop] = e.target.value;
            //     }
            //   }
            // }
            if (properties.collection === "materials") {
              if (properties.hasOwnProperty("material")) {
                if (window.scene.getMaterialByName(properties.material)) {
                  window.scene.getMaterialByName(properties.material)[properties.prop] = color;
                }
              }
            }
            // if (properties.collection === "textures") {
            //   if (properties.hasOwnProperty("texture")) {
            //     if (window.scene.getTextureByName(properties.texture)) {
            //       window.scene.getTextureByName(properties.texture)[properties.prop] = e.target.value;
            //     }
            //   }
            // }
          };
        },

        traits(component) {
          const result = [
            {
              type: "select",
              name: "collection",
              changeProp: true,
              options: [
                // { value: "cameras", name: "Camera" },
                { value: "lights", name: "Light" },
                // { value: "meshes", name: "Mesh" },
                { value: "materials", name: "Material" },
                // { value: "textures", name: "Texture" },
              ],
            },
          ];

          //  console.log(component);

          return result;
        },

        "script-props": ["collection", "camera", "light", "mesh", "material", "texture", "prop"],
      },

      init() {
        this.on("change:collection", this.handleCollectionChange);
        this.on("change:camera", this.handleCameraChange);
        this.on("change:light", this.handleLightChange);
        this.on("change:mesh", this.handleMeshChange);
        this.on("change:material", this.handleMaterialChange);
        this.on("change:texture", this.handleTextureChange);
        //  this.on("change:prop", this.handleCollectionChange);
        this.on("change:attributes:id", (e) => {
          let id = this.getId();
          id = id.replace(/[^a-zA-Z0-9]/g, "");
          this.setId(id);
        });
      },

      handleCollectionChange() {
        //  console.log("Input collection changed to: ", this.attributes.collection);
        if (this.attributes.collection === "cameras") {
          this.removeTrait("camera");
          this.removeTrait("light");
          this.removeTrait("mesh");
          this.removeTrait("material");
          this.removeTrait("texture");

          this.addTrait({
            type: "select",
            name: "camera",
            changeProp: true,
            options: scene.cameras.map((e) => {
              return { value: e.name, name: e.displayName };
            }),
          });
        }

        if (this.attributes.collection === "lights") {
          this.removeTrait("camera");
          this.removeTrait("light");
          this.removeTrait("mesh");
          this.removeTrait("material");
          this.removeTrait("texture");

          this.addTrait({
            type: "select",
            name: "light",
            changeProp: true,
            options: scene.lights.map((e) => {
              return { value: e.name, name: e.displayName };
            }),
          });
        }

        if (this.attributes.collection === "meshes") {
          this.removeTrait("camera");
          this.removeTrait("light");
          this.removeTrait("mesh");
          this.removeTrait("material");
          this.removeTrait("texture");

          this.addTrait({
            type: "select",
            name: "mesh",
            changeProp: true,
            options: scene.meshes.map((e) => {
              return { value: e.name, name: e.displayName };
            }),
          });
        }
        if (this.attributes.collection === "materials") {
          this.removeTrait("camera");
          this.removeTrait("light");
          this.removeTrait("mesh");
          this.removeTrait("material");
          this.removeTrait("texture");

          this.addTrait({
            type: "select",
            name: "material",
            changeProp: true,
            options: scene.materials.map((e) => {
              return { value: e.name, name: e.displayName };
            }),
          });
        }

        if (this.attributes.collection === "textures") {
          this.removeTrait("camera");
          this.removeTrait("light");
          this.removeTrait("mesh");
          this.removeTrait("material");
          this.removeTrait("texture");

          this.addTrait({
            type: "select",
            name: "texture",
            changeProp: true,
            options: scene.textures.map((e) => {
              return { value: e.name, name: e.displayName };
            }),
          });
        }
      },

      handleCameraChange() {
        //  console.log("Input Camera changed to: ", this.attributes.camera);

        this.removeTrait("prop");

        this.addTrait({
          type: "string",
          name: "prop",
          changeProp: true,
        });
      },

      handleLightChange() {
        //  console.log("Input Light changed to: ", this.attributes.light);

        this.removeTrait("prop");

        this.addTrait({
          type: "string",
          name: "prop",
          changeProp: true,
        });
      },

      handleMeshChange() {
        //  console.log("Input Mesh changed to: ", this.attributes.mesh);

        this.removeTrait("prop");

        this.addTrait({
          type: "string",
          name: "prop",
          changeProp: true,
        });
      },

      handleMaterialChange() {
        //  console.log("Input Material changed to: ", this.attributes.material);

        this.removeTrait("prop");

        this.addTrait({
          type: "string",
          name: "prop",
          changeProp: true,
        });
      },

      handleTextureChange() {
        //  console.log("Input Texture changed to: ", this.attributes.texture);

        this.removeTrait("prop");

        this.addTrait({
          type: "string",
          name: "prop",
          changeProp: true,
        });
      },
    },
  });

  editor.Components.addType("container", {
    model: {
      defaults: {
        traits: [{ type: "text", name: "id", label: "Id" }],
      },
      init: function () {
        this.on("change:attributes:id", (e) => {
          let id = this.getId();
          id = id.replace(/[^a-zA-Z0-9]/g, "");
          this.setId(id);
        });
      },
      // init: function () {
      //   this.set("attributes", { id: "id" + Date.now() });
      // },
    },
  });

  editor.Components.addType("text", {
    model: {
      defaults: { traits: [{ type: "text", name: "id", label: "Id" }] },
      init: function () {
        this.on("change:attributes:id", (e) => {
          let id = this.getId();
          id = id.replace(/[^a-zA-Z0-9]/g, "");
          this.setId(id);
        });
      },
      // init: function () {
      //   this.set("attributes", { id: "id" + Date.now() });
      // },
    },
  });
};
