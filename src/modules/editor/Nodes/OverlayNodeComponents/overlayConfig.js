import grapesjscustomcode from "grapesjs-custom-code";

import grapesjsTabs from "grapesjs-tabs";
import grapesjsTouch from "grapesjs-touch";
import "./grapesFlexIcons.css";

const escapeName = (name) => `${name}`.trim().replace(/([^a-z0-9\w-:/]+)/gi, "-");
export const overlayConfig = {
  protectedCss: "",
  container: "#overlayEditorFrame",

  canvas: {
    // The same would be for external styles
    //  styles: ["https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.4/flowbite.min.css"],
    styles: [
      "https://cdn.badvisor.io/tailwind.min.css",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,1,0",
      "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
    ],
  },
  plugins: [grapesjscustomcode, grapesjsTabs, grapesjsTouch],
  pluginsOpts: {
    [grapesjscustomcode]: {
      blockCustomCode: {
        label: "Custom HTML",

        media: `<span class="material-symbols-outlined">code</span>`,
        category: "Components",
      },
    },
    [grapesjsTabs]: {
      label: "Tabs",
      templateTab: (tab) =>
        `<span style="
        background-color: #f1f1f1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5em 1em;
        margin: 0.5em;
        gap: 0.5em;
        border-radius: 0.5em;
        pointer-events: all;
        border: solid 1px #dedede;
        " data-gjs-highlightable="false">Tab   <span
        data-gjs-type="text"
        class="material-symbols-outlined"
        style="font-size: 1em"
      >arrow_forward</span></span>`,
      templateTabContent: (tab) => `<div data-gjs-type="container" style="
      min-height: 50px;
      padding: 0.5em;
      display: flex;
      width:100%;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;"
      ></div>`,

      // Default style for tabs
      style: (config) => `


            .${config.classTab} {
                display: inline-block;
                opacity:0.5;
                padding:0.5em 0;
            }
    
            .${config.classTab}:focus {
                outline: none;
            }
    
            .${config.classTab}.${config.classTabActive} {
              opacity:1;
              
            }
    
            .${config.classTabContainer} {
                display: flex;
                justify-content: flex-start;

            }
    
            .${config.classTabContent} {
                animation: fadeEffect 1s;
            }
    
            .${config.classTabContents} {
                min-height: 100px;
                padding: 10px;
            }
    
            @keyframes fadeEffect {
                from {opacity: 0;}
                to {opacity: 1;}
            }
        `,
      tabsBlock: {
        media: `<span class="material-symbols-outlined">tabs</span>`,
        category: "Components",
      },
    },
  },
  deviceManager: {
    devices: [
      {
        id: "large",
        name: "Desktop",
        width: "", // default size
      },
      {
        id: "medium",
        name: "Tablet",
        width: "1024px", // default size
        widthMedia: "1024px", // this value will be used in CSS @media
      },
      {
        id: "small",
        name: "Mobile",
        width: "480px", // this value will be used on canvas width
        widthMedia: "480px", // this value will be used in CSS @media
      },
    ],
  },

  traitManager: {
    appendTo: "#overlayEditorTraits",
  },

  selectorManager: {
    componentFirst: true,
    escapeName,
    appendTo: "#overlayEditorSelectors",
  },

  layerManager: {
    appendTo: "#overlayEditorLayers",
  },

  styleManager: {
    appendTo: "#overlayEditorStyles",
    sectors: [
      {
        name: "General",
        open: false,
        properties: ["display", "float", "position", "top", "right", "left", "bottom", "z-index", "pointer-events", "opacity", "overflow-y", "overflow-x"],
      },
      {
        name: "Flex",
        open: false,
        properties: [
          // {
          //   name: "Flex Container",
          //   property: "display",
          //   type: "select",
          //   defaults: "block",
          //   list: [
          //     { value: "block", name: "Disable" },
          //     { value: "flex", name: "Enable" },
          //   ],
          // },
          // {
          //   name: "Flex Parent",
          //   property: "label-parent-flex",
          //   type: "integer",
          // },
          {
            name: "Direction",
            property: "flex-direction",
            type: "radio",
            defaults: "row",
            list: [
              {
                value: "row",
                name: "Row",
                className: "icons-flex icon-dir-row",
                title: "Row",
              },
              {
                value: "row-reverse",
                name: "Row reverse",
                className: "icons-flex icon-dir-row-rev",
                title: "Row reverse",
              },
              {
                value: "column",
                name: "Column",
                title: "Column",
                className: "icons-flex icon-dir-col",
              },
              {
                value: "column-reverse",
                name: "Column reverse",
                title: "Column reverse",
                className: "icons-flex icon-dir-col-rev",
              },
            ],
          },
          {
            name: "Justify",
            property: "justify-content",
            type: "radio",
            defaults: "flex-start",
            list: [
              {
                value: "flex-start",
                className: "icons-flex icon-just-start",
                title: "Start",
              },
              {
                value: "flex-end",
                title: "End",
                className: "icons-flex icon-just-end",
              },
              {
                value: "space-between",
                title: "Space between",
                className: "icons-flex icon-just-sp-bet",
              },
              {
                value: "space-around",
                title: "Space around",
                className: "icons-flex icon-just-sp-ar",
              },
              {
                value: "center",
                title: "Center",
                className: "icons-flex icon-just-sp-cent",
              },
            ],
          },
          {
            name: "Align",
            property: "align-items",
            type: "radio",
            defaults: "center",
            list: [
              {
                value: "flex-start",
                title: "Start",
                className: "icons-flex icon-al-start",
              },
              {
                value: "flex-end",
                title: "End",
                className: "icons-flex icon-al-end",
              },
              {
                value: "stretch",
                title: "Stretch",
                className: "icons-flex icon-al-str",
              },
              {
                value: "center",
                title: "Center",
                className: "icons-flex icon-al-center",
              },
            ],
          },
          {
            property: "flex-wrap",
          },
          {
            property: "order",
          },
          {
            property: "gap",
          },
          {
            property: "flex-grow",
          },
          {
            property: "flex-shrink",
          },
        ],
      },
      {
        name: "Dimension",
        open: false,
        properties: ["width", "height", "min-width", "min-height", "max-width", "max-height", "margin", "padding"],
      },
      {
        name: "Typography",
        open: false,

        properties: [
          {
            name: "Font",
            type: "select",
            property: "font-family",
            list: [
              { name: "Default", value: "sans-serif" },
              { name: "Figtree", value: "Figtree, sans-serif" },
              { name: "Montserrat", value: "Montserrat, sans-serif" },
              { name: "Arial", value: "Arial, Helvetica, sans-serif" },
              { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
              { name: "Helvetica", value: "Helvetica, Arial, sans-serif" },
              { name: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
              { name: "Trebuchet MS", value: "Trebuchet MS, Helvetica, sans-serif" },
              { name: "Times New Roman", value: "Times New Roman, Times, serif" },
              { name: "Georgia", value: "Georgia, serif" },
              { name: "Garamond", value: "Garamond, serif" },
              { name: "Courier New", value: "Courier New, Courier, monospace" },
              { name: "Brush Script MT", value: "Brush Script MT, cursive" },
              { name: "Material Symbols", value: "material symbols outlined" },
            ],
          },
          // { name: "Custom Font", property: "font-family" },

          "font-size",
          "font-weight",
          "letter-spacing",
          "color",
          "line-height",
          "text-align",
          "text-shadow",
          "text-decoration",
        ],
      },
      {
        name: "Decorations",
        open: false,
        properties: [
          "background-color",
          "border-radius",
          "border",
          "outline",
          "box-shadow",
          // "background",
          "backdrop-filter",
        ],
      },
      {
        name: "Extra",
        open: false,
        properties: ["transition", "transform"],
      },
    ],
  },

  blockManager: {
    appendTo: "#overlayEditorBlocks",
    blocks: [
      {
        category: "Components",
        id: "container",
        label: "Container",
        media: `<span class="material-symbols-outlined">square</span>`,
        select: true,
        content: `
        <div data-gjs-type="container" style="
        min-height: 50px;
        padding: 0.5em;
        display: flex;
        gap:1em;
        width:100%;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;"
        ></div>`,
        activate: true,
      },

      {
        category: "Components",
        media: `<span class="material-symbols-outlined">iframe</span>`,
        label: "Iframe",
        content: `<iframe
                data-gjs-type="Iframe"
                style="
                min-height:600px;
                height:100%;
                width:100%;
                display:block;
                border:none;"
                src=""
                name="iframe"
                allowFullScreen
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; clipboard-read; clipboard-write"
                width="100%"
                height="100%" >
                </iframe>`,
      },
      {
        category: "Components",
        id: "image",
        label: "Image",
        media: `<span class="material-symbols-outlined">image</span>`,
        select: true,
        content: { type: "image" },
        activate: true,
      },
      {
        category: "Components",
        id: "ActionButton",
        label: "Action Button",
        media: `<span class="material-symbols-outlined">directions_run</span>`,
        content: `
        <button
        data-gjs-type="actionButton"
        style="
          background-color: #f1f1f1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5em 1em;
          gap: 0.5em;
          border-radius: 0.5em;
          pointer-events: all;
          border: solid 1px #dedede;
          
        "
      >
        <span data-gjs-type="text"> Action </span>
        <span
          data-gjs-type="text"
          class="material-symbols-outlined"
          style="font-size: 1em"
        >
          play_arrow
        </span>
      </button>
          `,
      },
      //     {
      //       category: "Components",
      //       id: "ActionButtonGroup",
      //       label: "Action Button Group",
      //       media: `<span class="material-symbols-outlined">x</span>`,
      //       content: `
      //       <div data-gjs-type="actionButtonGroup" style="
      //       min-height: 50px;
      //       padding: 0.5em;
      //       display: flex;
      //       width:100%;
      //       justify-content: center;
      //       align-items: center;
      //       flex-wrap: wrap;"
      //       >
      //       <span class="groupedActionButton">
      //       <button
      //       data-gjs-type="actionButton"
      //       style="
      //         background-color: #f1f1f1;
      //         display: inline-flex;
      //         align-items: center;
      //         justify-content: center;
      //         padding: 0.5em 1em;
      //         gap: 0.5em;
      //         border-radius: 0.5em;
      //         pointer-events: all;
      //         border: solid 1px #dedede;

      //       "
      //     >
      //       <span data-gjs-type="text"> Action </span>
      //       <span
      //         data-gjs-type="text"
      //         class="material-symbols-outlined"
      //         style="font-size: 1em"
      //       >
      //         play_arrow
      //       </span>
      //     </button>
      //     </span>
      //     <span class="groupedActionButton">
      //     <button
      //     data-gjs-type="actionButton"
      //     style="
      //       background-color: #f1f1f1;
      //       display: inline-flex;
      //       align-items: center;
      //       justify-content: center;
      //       padding: 0.5em 1em;
      //       gap: 0.5em;
      //       border-radius: 0.5em;
      //       pointer-events: all;
      //       border: solid 1px #dedede;

      //     "
      //   >
      //     <span data-gjs-type="text"> Action </span>
      //     <span
      //       data-gjs-type="text"
      //       class="material-symbols-outlined"
      //       style="font-size: 1em"
      //     >
      //       play_arrow
      //     </span>
      //   </button>
      //   </span>
      //   <span class="groupedActionButton">
      //   <button
      //   data-gjs-type="actionButton"
      //   style="
      //     background-color: #f1f1f1;
      //     display: inline-flex;
      //     align-items: center;
      //     justify-content: center;
      //     padding: 0.5em 1em;
      //     gap: 0.5em;
      //     border-radius: 0.5em;
      //     pointer-events: all;
      //     border: solid 1px #dedede;

      //   "
      // >
      //   <span data-gjs-type="text"> Action </span>
      //   <span
      //     data-gjs-type="text"
      //     class="material-symbols-outlined"
      //     style="font-size: 1em"
      //   >
      //     play_arrow
      //   </span>
      // </button>
      // </span>
      //       </div>
      //         `,
      //     },

      {
        category: "Components",
        id: "ActionButtonSwatch",
        label: "Action Button Swatch",
        media: `<span class="material-symbols-outlined">stroke_full</span>`,
        content: `
        <button
        data-gjs-type="actionButton"
        style="
          background-color: #f1f1f1;
          display: inline-flex;
          height: 3em;
          width: 3em;
          align-items: center;
          justify-content: center;
          padding: 0;
          border-radius: 3em;
          pointer-events: all;
          border: solid 1px #dedede;
          
          overflow: hidden;
        "
      >
        <img
          style="width: 100%; height: 100%; display: block; object-fit: cover"
          src="https://placekitten.com/200/300"
        />
      </button>
          `,
      },

      {
        category: "Components",
        id: "actionButtonGroup",
        label: "Action Button Group",
        media: `<span class="material-symbols-outlined">dialogs</span>`,
        select: true,
        content: `
        <style>
        .actionButtonGroup .active {
          outline: solid 2px #000000 !important;
        }
        </style>
        <div data-gjs-type="actionButtonGroup" class="actionButtonGroup" style="
        min-height: 50px;
        padding: 0.5em;
        display: flex;
        gap:1em;
        width:100%;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;"
        ></div>`,
        activate: true,
      },

      {
        category: "Components",
        id: "TextureInput",
        label: "Texture Input",
        media: `<span class="material-symbols-outlined">texture_add</span>`,
        content: `
        <label
        style="
          background-color: #f1f1f1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5em 1em;
          gap: 0.5em;
          border-radius: 0.5em;
          pointer-events: all;
          border: solid 1px #dedede;
          
          cursor: pointer;
        "
      >
        <span data-gjs-type="text"> Select Image </span>
        <input
          data-gjs-type="textureInput"
          accept="image/png, image/jpeg"
          type="file"
          style="display: none"
        />
      </label>
          `,
      },

      {
        category: "Components",
        id: "DynamicTextureInput",
        label: "Dynamic Texture Input",
        media: `<span class="material-symbols-outlined">text_format</span>`,
        content: `
       
      
        <input
        style="
        background-color: #f1f1f1;
        justify-content: center;
        padding: 0.5em 1em;
        border-radius: 0.5em;
        pointer-events: all;
        border: solid 1px #dedede;
        
        cursor: pointer;
      "
          data-gjs-type="dynamicTextureInput"
         
          type="text"
        
        />
     
          `,
      },

      {
        category: "Components",
        id: "Accordion",
        label: "Accordion",
        media: `<span class="material-symbols-outlined">top_panel_open</span>`,
        content: `
       
    <style>
    .badAccordion .badAccordionDetails {
      display: none;
    }
    .badAccordion .expand_more {
      display: block;
    }
    .badAccordion .expand_less {
      display: none;
    }
    .badAccordion.open .badAccordionDetails {
      display: flex;
    }
    .badAccordion.open .expand_more {
      display: none;
    }
    .badAccordion.open .expand_less {
      display: block;
    }
  </style>
  <div
    style="width: 100%; pointer-events: all;display:inline-block"
    class="badAccordion"
    data-gjs-type="accordion"
  >
    <div
      class="badAccordionSummary"
      style="
        cursor: pointer;
        width: 100%;
        display: flex;
        padding: 0.5em 1em;
        background-color: #f1f1f1;
        justify-content: flex-start;
        align-items: center;
        gap: 0.5em;
        border-bottom: solid 1px #dedede;
        
      "
    >
      <span
        class="material-symbols-outlined expand_more"
        data-gjs-type="text"
        style="font-size: 1em"
        >expand_more</span
      >
      <span
        class="material-symbols-outlined expand_less"
        data-gjs-type="text"
        style="font-size: 1em"
        >expand_less</span
      >
      <span data-gjs-type="text">Accordion</span>
    </div>
    <div
      class="badAccordionDetails"
      style="
        padding: 1em;
        background-color: #f1f1f1;
        width: 100%;
        gap: 1em;
        flex-wrap: wrap;
        font-weight: normal;
      "
    >
      <p data-gjs-type="text">content</p>
    </div>
  </div>
          `,
      },

      {
        category: "Components",
        id: "Sidebar",
        label: "Sidebar",
        media: `<span class="material-symbols-outlined">left_panel_open</span>`,
        content: `
        <style>
        .badSidebar {
          display: inline-flex;
        }
        .badSidebar .badSidebarDetails {
          display: none;
        }
        .badSidebar .navigate_next {
          display: block;
        }
        .badSidebar .chevron_left {
          display: none;
        }
        .badSidebar.open .badSidebarDetails {
          display: flex;
        }
  
        .badSidebar.open .navigate_next {
          display: none;
        }
        .badSidebar.open .chevron_left {
          display: block;
        }
      </style>
      <div
        style="
          position: relative;
          height: 100%;
          display: inline-flex;
          align-items: center;
        "
        class="badSidebar"
        data-gjs-type="sidebar"
      >
        <div
          class="badSidebarDetails"
          style="
            pointer-events: all;
            padding: 1em;
            background-color: #f1f1f1;
            height: 100%;
            gap: 1em;
            flex-wrap: wrap;
            align-items: flex-start;
            flex-direction: column;
          "
        >
          <div style="width: 320px" data-gjs-type="text">content</div>
        </div>
        <div
          class="badSidebarToggler"
          style="
            pointer-events: all;
            cursor: pointer;
            right: -3em;
            width: 2em;
            height: 3em;
            display: flex;
            border: solid 1px #dedede;
            background-color: #f1f1f1;
            justify-content: center;
            align-items: center;
            border-radius: 0 2em 2em 0;
            gap: 0.5em;
          "
        >
          <span
            class="material-symbols-outlined navigate_next"
            data-gjs-type="text"
            style="font-size: 1em"
            >navigate_next</span
          >
          <span
            class="material-symbols-outlined chevron_left"
            data-gjs-type="text"
            style="font-size: 1em"
            >chevron_left</span
          >
        </div>
      </div>
            `,
      },

      {
        category: "Components",
        id: "LinkButton",
        label: "Link Button",
        media: `<span class="material-symbols-outlined">link</span>`,
        content: `
        <a
        href="#"
        style="
          background-color: #f1f1f1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5em 1em;
          gap: 0.5em;
          border-radius: 0.5em;
          pointer-events: all;
          border: solid 1px #dedede;
          
        "
      >
        <span data-gjs-type="text"> Link </span>
        <span
          data-gjs-type="text"
          class="material-symbols-outlined"
          style="font-size: 1em"
        >
          arrow_forward
        </span>
      </a>
          `,
      },
      {
        category: "Components",
        id: "paragraph",
        label: "Paragraph",
        media: `<span class="material-symbols-outlined">format_paragraph</span>`,
        content:
          '<p data-gjs-type="text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged</p>',
      },
    ],
  },
  fromElement: true,
  storageManager: false,
  panels: {
    defaults: [
      {
        id: "panel-switcher",
        el: "#overlayEditorPanelSwitcher",
        buttons: [
          {
            id: "show-blocks",
            active: true,
            label: "Blocks",
            command: "show-blocks",
            className: "FunctionButton",
            togglable: false,
          },
          {
            id: "show-layers",
            active: true,
            label: "Layers",
            command: "show-layers",
            className: "FunctionButton",
            togglable: false,
          },
          {
            id: "show-style",
            active: true,
            label: "Style",
            command: "show-styles",
            className: "FunctionButton",
            togglable: false,
          },
          {
            id: "show-traits",
            active: true,
            label: "Options",
            command: "show-traits",
            className: "FunctionButton",
            togglable: false,
          },
        ],
      },
      {
        id: "panel-buttons",
        el: "#overlayEditorButtons",
        buttons: [
          {
            id: "visibility",
            active: true, // active by default
            label: "Guides",
            command: "sw-visibility", // Built-in command
            togglable: false,
          },
          {
            id: "device-desktop",
            label: "Desktop",
            command: "set-device-desktop",
            active: true,
            togglable: false,
          },
          {
            id: "device-mobile",
            label: "Mobile",
            command: "set-device-mobile",
            togglable: false,
          },
          {
            id: "export",
            className: "btn-open-export",
            label: "Exp",
            command: "export-template",
            context: "export-template",
          },
        ],
      },
    ],
  },
};
