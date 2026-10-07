import React, { useEffect, useState } from "react";

import grapesjs from "grapesjs";

import { MenuItem, Select, Tooltip } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import { cleanFirebaseUrl, getOrganizationPages } from "../../../helpers";
import { overlayProps } from "../../../nodesProps";
import { ConfirmDialog } from "../ConfirmDialog";
import NodeField from "../NodeField";
import AnimationInputs from "./OverlayNodeComponents/AnimationInputs";
import { AssetList } from "./OverlayNodeComponents/AssetList";
import GrapesNumberInput from "./OverlayNodeComponents/GrapesNumberInput";
import { overlayConfig } from "./OverlayNodeComponents/overlayConfig";
import { overlayTypes } from "./OverlayNodeComponents/overlayTypes";

import cssbeautify from "cssbeautify";
import { storageUrl } from "../../../Router";
import { useCurrentScene, useUpdateEditorOverlay, useViewportSize } from "../../../badProvider/functions";
import { textureExtensions } from "../../../constants";
let editor;

function isValidCSS(cssString) {
  // Create a <style> element
  const styleElement = document.createElement("style");

  // Set the text content of the <style> element to the CSS string
  styleElement.textContent = cssString;

  // Try to insert the <style> element into the document
  try {
    document.head.appendChild(styleElement);

    // If the CSS was inserted without errors, it's valid
    return true;
  } catch (error) {
    // If there was an error, it's not valid CSS
    return false;
  } finally {
    // Clean up by removing the <style> element
    document.head.removeChild(styleElement);
  }
}
export function OverlayNode(props) {
  const theme = useTheme();

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAm, setOpenAm] = useState();
  const [ready, setReady] = useState(false);

  const viewportSize = useViewportSize();
  const updateEditorOverlay = useUpdateEditorOverlay();
  const scene = useCurrentScene();
  const node = props.node;

  const onDuplicate = () => {
    const id = "Overlay_" + Date.now();

    //  scene.actions[id] = { ...props.data.node };
    scene.overlays[id] = JSON.parse(JSON.stringify(node));
    scene.overlays[id].name = id;
    scene.overlays[id].displayName = node.displayName + " Copy";
    scene.overlays[id].getClassName = () => {
      return "Overlay";
    };

    updateEditorOverlay(null);
    setTimeout(() => {
      updateEditorOverlay(scene.overlays[id]);
    });
  };
  const onRemove = () => {
    scene.overlays[node.name] = null;
    delete scene.overlays[node.name];

    updateEditorOverlay(null);
  };

  useEffect(() => {
    if (ready) return;

    node.animationDurartion = node.animationDurartion || 0.5;
    node.animationDelay = node.animationDelay || 0;
    node.animationEase = node.animationEase || "linear";
    var editorFrame = document.createElement("div");
    editorFrame.id = "overlayEditorFrame";

    document.getElementById("overAll").appendChild(editorFrame);

    editor = grapesjs
      .init(overlayConfig)
      .setStyle(
        "body { background-color: transparent; height:100%;font-family: sans-serif;margin:0} * {box-sizing:border-box} .material-symbols-outlined {font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48;}"
      );

    overlayTypes(editor, scene, node);
    // sceneContext.dispatch({
    //   type: UPDATE_EDITOR_OVERLAY,
    //   payload: editor,
    // });
    // editor.on("load", () => {
    //   const blockBtn = editor.Panels.getButton("views", "open-sm");
    //   blockBtn.set("active", 1);
    // });

    editor.Commands.add("open-assets", {
      run(editor, sender, opts) {
        const assettarget = opts.target;
        scene.openPrompt("addAsset", {
          single: true,
          extensions: textureExtensions,

          callback: (data) => {
            data.forEach((v, i) => {
              const ref = v.id;

              const url = v.customUrl || cleanFirebaseUrl(v.url);

              // const ext = url.split(".").pop();
              // setAssetUrl(url);
              assettarget.set("REF", ref);
              assettarget.set("src", url);
              scene.openPrompt(null);
            });
          },
          cancel: () => scene.openPrompt(null),
        });

        // const assettarget = opts.target;
        // setOpenAm(assettarget);
      },
    });

    editor.DeviceManager.select(
      viewportSize.width === null ? "large" : viewportSize.width === 1024 ? "medium" : viewportSize.width === 480 ? "small" : "large"
    );

    editorFrame.style.position = "fixed";
    editorFrame.style.top = "0";
    editorFrame.style.width = document.getElementById("renderCanvasContainer").offsetWidth + "px";
    editorFrame.style.height = "100%";
    editorFrame.style.zIndex = "1";
    if (node.hasOwnProperty("overlayData")) {
      editor.setStyle(node.overlayData.css);
      editor.setComponents(JSON.parse(node.overlayData.json));
    } else {
      // var wrapper = editor.DomComponents.getWrapper();
      // editor.Css.setRule("html", { height: "100%" });
      // wrapper.set("style", { height: "100%", "min-height": "100%" });
    }

    var wrapper = editor.DomComponents.getWrapper();

    editor.Css.setRule("html", { height: "100%" });

    wrapper.set("style", { height: "100%", "min-height": "100%" });

    const globalCssTextarea = document.getElementById("globalCss");

    editor.on("update", (e) => {
      if (globalCssTextarea) {
        globalCssTextarea.value = cssbeautify(editor.getCss({ avoidProtected: true })); // Add newlines for formatting
      }
      node.overlayData = { json: JSON.stringify(editor.getComponents()), html: editor.getHtml(), css: editor.getCss({ avoidProtected: true }) };
    });

    async function loadCustomFont(fontName, fontUrl) {
      return `
        @font-face {
          font-family: "${fontName}";
          src: url("${fontUrl}");
        }
      `;
    }

    async function addFontsFromMainData(editor, fonts) {
      const cssRules = await Promise.all(
        Object.entries(fonts).map(async ([key, value]) => {
          const fontName = value.url.split("/")[6].split(".")[0];
          return loadCustomFont(fontName, storageUrl + value.url);
        })
      );

      const cssContent = cssRules.join("\n");

      const style = editor.Canvas.getFrameEl().contentDocument.createElement("style");
      style.innerHTML = cssContent;
      editor.Canvas.getFrameEl().contentDocument.head.appendChild(style);
    }

    editor.on("load", async () => {
      if (scene.mainData.fonts) {
        await addFontsFromMainData(editor, scene.mainData.fonts);

        const styleManager = editor.StyleManager;
        const fontProperty = styleManager.getProperty("typography", "font-family");
        var list = [];

        Object.entries(scene.mainData.fonts).map(([k, v], i) => {
          const fontName = v.url.split("/")[6].split(".")[0];

          return fontProperty.addOption({ name: fontName, value: fontName });
        });

        fontProperty.set("list", list);
      }

      if (globalCssTextarea) {
        // Add dot before class selectors
        globalCssTextarea.value = cssbeautify(editor.getCss({ avoidProtected: true })); // Add newlines for formatting

        // update
        globalCssTextarea.addEventListener("blur", (event) => {
          try {
            editor.setStyle(event.target.value); // DOES NOT FIRE ONUPDATE
            globalCssTextarea.value = cssbeautify(editor.getCss({ avoidProtected: true })); // Add newlines for formatting
            editor.trigger("update");
            const currentSelected = editor.getSelected();
            if (currentSelected) {
              editor.selectToggle(currentSelected);
              setTimeout(() => {
                editor.selectToggle(currentSelected);
              }, 10);
            }
            node.overlayData = { json: JSON.stringify(editor.getComponents()), html: editor.getHtml(), css: editor.getCss({ avoidProtected: true }) };
          } catch (error) {
            console.warn("update error on Editor", error);
          }
        });
      }
    });

    setReady(true);

    function updateCssRules(editor, oldId, newId) {
      const cssComposer = editor.CssComposer;
      const rules = cssComposer.getAll();

      rules.each((rule) => {
        if (rule.selectorsToString() === `#${oldId}`) {
          rule.set("selectors", [{ name: newId, label: newId, active: true, type: 1 }]);
        }
      });
    }

    function generateRandomId() {
      let result = "";
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

      // Ensure the first character is a letter
      result += letters.charAt(Math.floor(Math.random() * letters.length));

      // Generate the next three characters, which can be anything
      for (let i = 0; i < 3; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      return result;
    }

    editor.on("component:add", (component) => {
      traverseAndUpdate(component);
    });

    function traverseAndUpdate(component) {
      const oldId = component.getId();
      const newId = generateRandomId();

      // Update the component ID
      component.setId(newId);

      // Update CSS rules if any
      updateCssRules(editor, oldId, newId);

      // Recursively update for all subcomponents
      component.get("components").each((subComponent) => {
        traverseAndUpdate(subComponent);
      });
    }
    const bm = editor.Blocks;

    getOrganizationPages(window.location.pathname.split("/")[1]).then((pages) => {
      pages.forEach((page) => {
        if (page.json === undefined || page.json === null) {
          return;
        }

        bm.add(page.handle, {
          media: "<span class='material-symbols-outlined'>web</span>",
          category: window.location.pathname.split("/")[1] + "'s Pages",
          label: page.name,
          content: [JSON.parse(page.json), "<style>" + page.css + "<style>"],
        });
        const categories = editor.BlockManager.getCategories();
        categories.each((category) => {
          category.set("open", false).on("change:open", (opened) => {
            opened.get("open") &&
              categories.each((category) => {
                category !== opened && category.set("open", false);
              });
          });
        });
      });
    });

    // getOrganizationPages(badvisorOrganizationId).then((pages) => {
    //   pages.forEach((page) => {
    //     if (page.tags) {
    //       if (page.tags.split(",").includes("enabled")) {
    //         let category = "Templates Library";

    //         page.tags.split(",").forEach((tag) => {
    //           if (tag.indexOf("cat-") === 0) {
    //             category = tag.substring(4).charAt(0).toUpperCase() + tag.substring(4).slice(1);
    //           }
    //         });

    //         bm.add(page.handle, {
    //           media: "<span class='material-symbols-outlined'>web</span>",
    //           category: category,
    //           label: page.name,
    //           content: [JSON.parse(page.json), "<style>" + page.css + "<style>"],
    //         });
    //         const categories = editor.BlockManager.getCategories();
    //         categories.each((category) => {
    //           category.set("open", false).on("change:open", (opened) => {
    //             opened.get("open") &&
    //               categories.each((category) => {
    //                 category !== opened && category.set("open", false);
    //               });
    //           });
    //         });
    //       }
    //     }
    //   });
    // });

    const categories = editor.BlockManager.getCategories();
    categories.each((category) => {
      category.set("open", false).on("change:open", (opened) => {
        opened.get("open") &&
          categories.each((category) => {
            category !== opened && category.set("open", false);
          });
      });
    });

    return () => {
      editorFrame.remove();
      editor.destroy();
      updateEditorOverlay(null);

      scene.forceUpdate();
    };
  }, []);

  useEffect(() => {
    if (ready && editor.DeviceManager) {
      editor.DeviceManager.select(
        viewportSize.width === null ? "large" : viewportSize.width === 1024 ? "medium" : viewportSize.width === 480 ? "small" : "large"
      );
    }
  }, [viewportSize, ready]);

  const setAssetUrl = (url) => {
    openAm.set("src", url);
  };

  const accordionData = [
    {
      key: "Layers",
      icon: "layers",
      content: <div id="overlayEditorLayers" style={{ height: "100%" }} />,
    },
    {
      key: "Settings",
      icon: "settings",
      content: (
        <>
          <div id="overlayEditorSelectors" style={{ height: "100%" }} />
          <div id="overlayEditorTraits" style={{ height: "100%" }} />
          <div id="overlayEditorStyles" style={{ height: "100%" }} />
        </>
      ),
    },
    {
      key: "Blocks",
      icon: "grid_view",
      content: <div id="overlayEditorBlocks" style={{ height: "100%" }} />,
    },
    {
      key: "Animations",
      icon: "animation",
      content: (
        <div style={{ padding: "1em 0 2em" }}>
          Scroll Animation
          <Select
            sx={{ backgroundColor: theme.palette.background.light }}
            style={{ width: "100%" }}
            defaultValue={node.scrollAnimation || "$NULL$"}
            onChange={(e) => (node.scrollAnimation = e.target.value)}
          >
            <MenuItem key={"default"} value={"$NULL$"}>
              Select Animate Action
            </MenuItem>
            {Object.entries(scene.actions)
              .filter(([k, v]) => v.type === "Animate")
              .map(([k, v]) => {
                return (
                  <MenuItem value={v.name} key={v.name}>
                    {v.displayName || v.name}
                  </MenuItem>
                );
              })}
          </Select>
          <br />
          <br />
          <AnimationInputs animationName={"Opacity (0-1)"} prop="opacity" node={node} defaultInitial={0} defaultAnimate={1} defaultExit={0} />
          <AnimationInputs animationName={"Scale (0-1)"} prop="scale" node={node} defaultInitial={0} defaultAnimate={1} defaultExit={0} />
          <AnimationInputs animationName={"Rotation (deg)"} prop="rotate" node={node} defaultInitial={90} defaultAnimate={0} defaultExit={-90} />
          <AnimationInputs animationName={"Position X (px)"} prop="x" node={node} defaultInitial={100} defaultAnimate={0} defaultExit={-100} />
          <AnimationInputs animationName={"Position Y (px)"} prop="y" node={node} defaultInitial={100} defaultAnimate={0} defaultExit={-100} />
          <div style={{ display: "flex", flexDirection: "row", gap: "1em" }}>
            <GrapesNumberInput label="Duration (s)" defaultValue={node.animationDurartion} onChange={(e) => (node.animationDurartion = e.target.value)} />
            <GrapesNumberInput label="Delay (s)" defaultValue={node.animationDelay} onChange={(e) => (node.animationDelay = e.target.value)} />
          </div>
          <span style={{ paddingRight: "1em" }}>Ease</span>
          <select
            style={{ marginTop: "1em", backgroundColor: "#1a1a1a", padding: "0.5em" }}
            defaultValue={node.animationEase}
            onChange={(e) => (node.animationEase = e.target.value)}
          >
            <option value="linear">Linear</option>
            <option value="easeIn">Ease In</option>
            <option value="easeOut">Ease Out</option>
            <option value="easeInOut">Ease In-Out</option>
          </select>
        </div>
      ),
    },
    {
      key: "Css",
      icon: "palette",
      content: (
        <div style={{ position: "relative", width: "100%" }}>
          <textarea
            id="globalCss"
            style={{
              resize: "none",
              color: "#bada55",
              width: "100%",
              height: "50vh",
              backgroundColor: "transparent",
              padding: "1em",
              marginBottom: "1em",
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ background: theme.palette.background.dark }} className={"overlayNode"}>
      <div className="nodeHeader" style={{ position: "sticky", top: "0", zIndex: 1000, paddingTop: "0.2em", background: theme.palette.background.dark }}>
        <strong className="nodeTitle">{node.displayName || node.name}</strong>

        <div className="nodeActions">
          <Tooltip title="Delete" arrow placement="top">
            <button
              className="nodeHeaderAction"
              style={{ color: "#f44336" }}
              onClick={() => {
                setOpenConfirmDialog(true);
              }}
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </Tooltip>

          <Tooltip title="Duplicate" arrow placement="top">
            <button className="nodeHeaderAction" onClick={onDuplicate}>
              <span className="material-symbols-outlined">content_copy</span>
            </button>
          </Tooltip>

          {/* <Tooltip title="Close" arrow placement="top">
            <button className="nodeHeaderAction" onClick={() => onClickCloseOverlayEditor()}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </Tooltip> */}
        </div>

        {/* <button className="nodeHeaderAction" onClick={onClose}>
          <IoMdClose />
        </button> */}
      </div>

      {openAm ? (
        <div id="customAm">
          <div>
            <span onClick={(e) => setOpenAm(null)} className="material-symbols-outlined close">
              close
            </span>

            <strong>Insert Image</strong>
            <br />

            <br />

            <AssetList
              setAsset={(url) => {
                setAssetUrl(url);
                setOpenAm(null);
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="nodeInner" style={{ paddingBottom: "4em" }}>
        {Object.entries(overlayProps).map(([k, v], i) => {
          return NodeField(node, k, v);
        })}

        {accordionData.map(({ key, content, icon }) => (
          <Tabs key={key} keyName={key} icon={icon}>
            {content}
          </Tabs>
        ))}
        {/* <div className="nodeHidden">
          <span>Type: {node.getClassName()}</span>
          <br />
          <span style={{ display: "flex", alignItems: "center" }}>
            Id: <input type="text" defaultValue={node.name} />
          </span>
        </div> */}
      </div>
      <ConfirmDialog
        open={openConfirmDialog}
        confirm={() => {
          setOpenConfirmDialog(false);
          onRemove();
        }}
        cancel={() => {
          setOpenConfirmDialog(false);
        }}
        text="Are you sure you want to remove this overlay?"
      />
    </div>
  );
}

function Accordion({ keyName, children, icon }) {
  const [activeAccordions, setActiveAccordions] = useState(["Layers", "Settings", "Blocks"]);
  const theme = useTheme();

  return (
    <div
      key={keyName}
      style={{
        width: "100%",
        padding: "0em 0.5em",

        minHeight: "1.6em",

        marginTop: "1em",

        backgroundColor: activeAccordions.includes(keyName) ? theme.palette.background.default : theme.palette.background.default,
        borderRadius: "0.5em",
        border: activeAccordions.includes(keyName) ? "solid 1px " + theme.palette.primary.main : "solid 1px " + theme.palette.border.main,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          height: "1.6em",
          backgroundColor: "rgb(17,17,17)",
          position: "sticky",
          top: "1.6em",
          zIndex: 11,
        }}
        onClick={() => {
          if (!activeAccordions.includes(keyName)) {
            setActiveAccordions([...activeAccordions, keyName]);
          } else {
            setActiveAccordions(activeAccordions.filter((item) => item !== keyName));
          }
        }}
      >
        <strong style={{ display: "flex", alignItems: "center", gap: ".5em" }}>
          <span className="material-symbols-outlined">{icon}</span>

          <span>{keyName}</span>
        </strong>
        {activeAccordions.includes(keyName) ? (
          <span className="material-symbols-outlined">expand_more</span>
        ) : (
          <span className="material-symbols-outlined">chevron_right</span>
        )}
      </div>

      <div
        key={keyName}
        style={{
          display: activeAccordions.includes(keyName) ? "flex" : "none",
          borderTop: "solid 1px " + theme.palette.primary.main,
          marginTop: "0.2em",
          paddingTop: "0.4em",
          width: "100%",
          flexWrap: "wrap",
          paddingBottom: "0.5em",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Tabs({ keyName, children, icon }) {
  const [activeAccordions, setActiveAccordions] = useState(["Layers", "Settings", "Blocks"]);
  const theme = useTheme();

  return (
    <div
      key={keyName}
      style={{
        width: "100%",
        padding: "0em 0.5em",

        minHeight: "1.6em",

        // marginTop: "1em",

        backgroundColor: activeAccordions.includes(keyName) ? theme.palette.background.grey : theme.palette.background.default,
        borderRadius: "0.5em",
        // border: activeAccordions.includes(keyName) ? "solid 1px " + theme.palette.primary.main : "solid 1px " + theme.palette.border.main,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          height: "1.6em",

          position: "sticky",
          top: "1.6em",
          zIndex: 11,
        }}
        onClick={() => {
          if (!activeAccordions.includes(keyName)) {
            setActiveAccordions([...activeAccordions, keyName]);
          } else {
            setActiveAccordions(activeAccordions.filter((item) => item !== keyName));
          }
        }}
      >
        <strong style={{ display: "flex", alignItems: "center", gap: ".5em" }}>
          <span className="material-symbols-outlined">{icon}</span>

          <span>{keyName}</span>
        </strong>
        {activeAccordions.includes(keyName) ? (
          <span className="material-symbols-outlined">expand_more</span>
        ) : (
          <span className="material-symbols-outlined">chevron_right</span>
        )}
      </div>

      <div
        key={keyName}
        style={{
          display: activeAccordions.includes(keyName) ? "flex" : "none",
          //  borderTop: "solid 1px " + theme.palette.primary.main,
          marginTop: "0.2em",
          paddingTop: "0.4em",
          width: "100%",
          flexWrap: "wrap",
          paddingBottom: "0.5em",
        }}
      >
        {children}
      </div>
    </div>
  );
}
