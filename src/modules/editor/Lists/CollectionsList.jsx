import React, { useState } from "react";

import { useCurrentScene } from "../../../badProvider/functions";
import { getSceneElementByName, getSceneElementPropsByName } from "../../../helpers";
import { ActionButton } from "../Buttons/ActionButton";
import { AnimationGroupButton } from "../Buttons/AnimationGroupButton";
import { CameraButton } from "../Buttons/CameraButton";
import { CollectionButton } from "../Buttons/CollectionButton";
import { ControlNodeButton } from "../Buttons/ControlNodeButton";
import { LightButton } from "../Buttons/LightButton";
import { MaterialButton } from "../Buttons/MaterialButton";
import { MeshButton } from "../Buttons/MeshButton";
import SceneButton from "../Buttons/SceneButton";
import { SoundButton } from "../Buttons/SoundButton";
import { TextureButton } from "../Buttons/TextureButton";
import { VariableButton } from "../Buttons/VariableButton";
import { EffectsButton } from "../Effects";

const List = (props) => {
  const scene = useCurrentScene();

  const [toggle, setToggle] = useState(false);

  const node = props.node;

  return (
    <div key={node.name}>
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", width: "100%" }}>
        <button onClick={() => setToggle(!toggle)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "1.6em", flexShrink: 0 }}>
          {toggle ? <span className="material-symbols-outlined">expand_more</span> : <span className="material-symbols-outlined">chevron_right</span>}
        </button>
        <span style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <CollectionButton node={node} />
        </span>
      </div>
      {toggle ? (
        <div style={{ width: "100%" }}>
          {node.nodes.map((nodeName, i) => {
            if (getSceneElementByName(scene, nodeName) && getSceneElementPropsByName(scene, nodeName)) {
              const elem = getSceneElementByName(scene, nodeName);

              const elemClass = elem.getClassName();

              return (
                <div key={i} style={{ display: "flex", alignItems: "center", borderLeft: "solid 1px #dedede5a", marginLeft: "0.8em", paddingLeft: "0.8em" }}>
                  {elemClass === "PBRMaterial" || elemClass === "ShadowOnlyMaterial" || elemClass === "TransmissionMaterial" ? (
                    <MaterialButton node={scene.getMaterialByName(nodeName)} />
                  ) : elemClass === "TransformNode" ? (
                    <MeshButton node={scene.getTransformNodeByName(nodeName)} />
                  ) : elemClass === "Mesh" ? (
                    <MeshButton node={scene.getMeshByName(nodeName)} />
                  ) : elemClass === "ArcRotateCamera" || elemClass === "UniversalCamera" ? (
                    <CameraButton node={scene.getCameraByName(nodeName)} />
                  ) : elemClass === "Texture" || elemClass === "CubeTexture" || elemClass === "VideoTexture" ? (
                    <TextureButton node={scene.getTextureByName(nodeName)} />
                  ) : elemClass === "Sound" ? (
                    <SoundButton node={scene.getSoundByName(nodeName)} />
                  ) : elemClass === "PointLight" || elemClass === "DirectionalLight" || elemClass === "SpotLight" ? (
                    <LightButton node={scene.getLightByName(nodeName)} />
                  ) : elemClass === "Scene" ? (
                    <SceneButton node={scene} />
                  ) : elemClass === "Effects" ? (
                    <EffectsButton node={scene.effects} />
                  ) : elemClass === "AnimationGroup" ? (
                    <AnimationGroupButton node={scene.getAnimationGroupByName(nodeName)} />
                  ) : elemClass === "Variable" ? (
                    <VariableButton node={elem} />
                  ) : elemClass === "Action" ? (
                    <ActionButton node={elem} />
                  ) : elemClass === "ControlNode" ? (
                    <ControlNodeButton node={elem} />
                  ) : null}
                </div>
              );
            } else {
              return null;
            }
          })}
        </div>
      ) : null}
    </div>
  );
};

export function CollectionsList(props) {
  return props.nodes
    ? Object.values(props.nodes)
        .sort(function (a, b) {
          var textA = a.displayName.toLowerCase() || a.name.toLowerCase();
          var textB = b.displayName.toLowerCase() || b.name.toLowerCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        })
        .map((node, i) => {
          if (node === null) {
            return null;
          }
          if (props.search && node.displayName && !node.displayName.toLowerCase().includes(props.search)) {
            return null;
          }
          return <List key={`item-${node.name}`} index={i} node={node} />;
        })
    : null;
}
