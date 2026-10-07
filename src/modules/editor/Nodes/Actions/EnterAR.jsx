import React from "react";
import { textureExtensions } from "../../../../constants";
import NodeField from "../../NodeField";

const fields = {
  glb: { type: "AssetReference", label: "GLB", extensions: ["glb"] },
  usdz: { type: "AssetReference", label: "USDZ", extensions: ["usdz"] },
  customText: { type: "String", label: "QR Custom Text" },
  splashTitle: { type: "Title", label: "Ar Splash" },
  showInArSplash: { type: "Boolean", label: "Show in AR Splash" },
  buttonText: { type: "String", label: "Button Text" },
  buttonColor: {
    type: "Color3",
    label: "Button Color",
    onChange: (e, scene, node) => {
      node.buttonColor = e.target.value;

      // node.badChanges[key] = url;
      // node.badChanges[key + "REF"] = ref;
      // node.updateURL(url);
      // node.url = url;
      // node.urlREF = ref;
    },
  },
  buttonTextColor: {
    type: "Color3",
    label: "Button Text Color",
    onChange: (e, scene, node) => {
      node.buttonTextColor = e.target.value;

      // node.badChanges[key] = url;
      // node.badChanges[key + "REF"] = ref;
      // node.updateURL(url);
      // node.url = url;
      // node.urlREF = ref;
    },
  },
  swatch: {
    type: "AssetReference",
    label: "Swatch",
    extensions: textureExtensions,

    onSet: (scene, node, value) => {
      // if (value !== null) {
      //   node.updateURL(value);
      //   node.url = value;
      // }
    },
    onChange: (e, scene, node, key, url, ref) => {
      node.swatchREF = ref;
      node.swatch = url;

      // node.badChanges[key] = url;
      // node.badChanges[key + "REF"] = ref;
      // node.updateURL(url);
      // node.url = url;
      // node.urlREF = ref;
    },
  },
};

const EnterAR = (props) => {
  const node = props.node;

  // useEffect(() => {
  //   node.elements = elements;
  // }, [elements]);

  return (
    <div className="nodeInner">
      {NodeField(node, "glb", fields.glb)}
      {NodeField(node, "usdz", fields.usdz)}
      {NodeField(node, "customText", fields.customText)}
      {NodeField(node, "splashTitle", fields.splashTitle)}
      {NodeField(node, "showInArSplash", fields.showInArSplash)}
      {NodeField(node, "buttonText", fields.buttonText)}
      {NodeField(node, "buttonColor", fields.buttonColor)}
      {NodeField(node, "buttonTextColor", fields.buttonTextColor)}
      {NodeField(node, "swatch", fields.swatch)}
    </div>
  );
};

export default EnterAR;
