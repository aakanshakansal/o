import React from "react";

import AssetReferenceField from "./NodeFields/AssetReferenceField";
import BooleanField from "./NodeFields/BooleanField";
import Color3Field from "./NodeFields/Color3Field";
import Color4Field from "./NodeFields/Color4Field";
import MaterialField from "./NodeFields/MaterialField";
import MeshesArrayReferenceField from "./NodeFields/MeshesArrayReferenceField";
import NumberField from "./NodeFields/NumberField";
import RangeField from "./NodeFields/RangeField";
import SelectField from "./NodeFields/SelectField";
import StringField from "./NodeFields/StringField";
import TextureField from "./NodeFields/TextureField";

import AnimationGroupReferenceField from "./NodeFields/AnimationGroupReferenceField";
import FunctionButton from "./NodeFields/FunctionButton";

const NodeField = (node, key, opts, options) => {
  if (opts.hidden) {
    return null;
  }

  if (opts.type === "Title") {
    return (
      <div key={key} className="field Title">
        {opts.label}
      </div>
    );
  }

  if (opts.type === "Spacer") {
    return <div key={key} className="field Spacer"></div>;
  }

  // if (val !== undefined) {

  if (opts.type === "String") {
    return <StringField node={node} _key={key} opts={opts} />;
  }
  if (opts.type === "Number") {
    return <NumberField node={node} _key={key} opts={opts} />;
  }
  if (opts.type === "Range") {
    return <RangeField node={node} _key={key} opts={opts} />;
  }
  if (opts.type === "Boolean") {
    return <BooleanField node={node} _key={key} opts={opts} />;
  }
  if (opts.type === "Color3") {
    return <Color3Field node={node} _key={key} opts={opts} />;
  }
  if (opts.type === "Color4") {
    return <Color4Field node={node} _key={key} opts={opts} />;
  }
  if (opts.type === "Material") {
    return <MaterialField node={node} _key={key} opts={opts} />;
  }
  if (opts.type === "Texture") {
    return <TextureField node={node} _key={key} opts={opts} />;
  }
  if (opts.type === "Select") {
    return <SelectField node={node} _key={key} opts={opts} />;
  }
  if (opts.type === "AssetReference") {
    return <AssetReferenceField node={node} _key={key} opts={opts} />;
  }
  if (opts.type === "MeshesArrayReference") {
    return <MeshesArrayReferenceField node={node} _key={key} opts={opts} />;
  }
  if (opts.type === "AnimationGroupReference") {
    return <AnimationGroupReferenceField node={node} _key={key} opts={opts} />;
  }
  if (opts.type === "FunctionButton") {
    return <FunctionButton node={node} _key={key} opts={opts} />;
  }
};

export default NodeField;
