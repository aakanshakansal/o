import React from "react";

import useTheme from "@mui/material/styles/useTheme";
import { Add3DElementPrompt } from "./Add3DElementPrompt";
import { Add3DTextPrompt } from "./Add3DTextPrompt";
import { AddActionPrompt } from "./AddActionPrompt";
import { AddAssetPrompt } from "./AddAssetPrompt";
import { AddCameraPrompt } from "./AddCameraPrompt";
import { AddLightPrompt } from "./AddLightPrompt";
import { AddMaterialPrompt } from "./AddMaterialPrompt";
import { AddReplacePrompt } from "./AddReplacePrompt";
import { AddShaderMaterialPrompt } from "./AddShaderMaterialPrompt";
import { AddTexturePrompt } from "./AddTexturePrompt";
import { DuplicateMeshPrompt } from "./DuplicateMeshPrompt";
import { MeshesArrayReferencePrompt } from "./MeshesArrayReferencePrompt";

export function PromptContainer(props) {
  const theme = useTheme();
  return (
    <div className="promptContainer" style={{ background: "rgba(100, 100, 100, 0.5)" }}>
      <div className="prompt">
        {props.openPrompt === "add3DElement" ? (
          <Add3DElementPrompt {...props} />
        ) : props.openPrompt === "addAsset" ? (
          <AddAssetPrompt {...props} />
        ) : props.openPrompt === "add3DText" ? (
          <Add3DTextPrompt {...props} />
        ) : props.openPrompt === "addCamera" ? (
          <AddCameraPrompt {...props} />
        ) : props.openPrompt === "addMaterial" ? (
          <AddMaterialPrompt {...props} />
        ) : props.openPrompt === "addShaderMaterial" ? (
          <AddShaderMaterialPrompt {...props} />
        ) : props.openPrompt === "addTexture" ? (
          <AddTexturePrompt {...props} />
        ) : props.openPrompt === "addLight" ? (
          <AddLightPrompt {...props} />
        ) : props.openPrompt === "addAction" ? (
          <AddActionPrompt {...props} />
        ) : props.openPrompt === "meshesArrayReferenece" ? (
          <MeshesArrayReferencePrompt {...props} />
        ) : props.openPrompt === "duplicateMesh" ? (
          <DuplicateMeshPrompt {...props} />
        ) : props.openPrompt === "addReplace" ? (
          <AddReplacePrompt {...props} />
        ) : null}
      </div>
    </div>
  );
}
