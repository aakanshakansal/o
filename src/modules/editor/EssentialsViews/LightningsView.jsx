import { Button } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  cubeTextureProps,
  PBRMaterialProps,
  sceneProps,
} from "../../../nodesProps";
import { badDB, storageUrl } from "../../../Router";
import { LightsList } from "../Lists/LightsList";
import { MaterialsList } from "../Lists/MaterialsList";
import Marqueeno from "../Marqueeno";
import NodeField from "../NodeField";
import Fields from "../NodeFields";

export default function LightningsView({
  scene,
  openNodes,
  theme,
  updateOpenNodes,
}) {
  const [imageData, setImageData] = useState(null);
  const [openEnv, setOpenEnv] = useState(true);
  const [view, setView] = useState("lights");

  useEffect(() => {
    try {
      const node = scene.environmentTexture;

      const internalTexture = node.getInternalTexture();

      if (
        typeof node.getClassName === "function" &&
        node.getClassName() === "CubeTexture"
      ) {
        const assetId = node.url.split("assets")[1].split("/")[1];

        const assetRef = doc(badDB, "assets", assetId);

        getDoc(assetRef).then((doc) => {
          if (doc.data() && doc.data().thumbnail) {
            return setImageData(storageUrl + doc.data().thumbnail);
          }
        });
      } else if (internalTexture && internalTexture._buffer) {
        const url = URL.createObjectURL(
          new Blob([internalTexture._buffer], { type: "image/jpg" }),
        );
        setImageData(url);
      } else if (internalTexture && internalTexture.url) {
        async function getImageBlob(imageUrl) {
          const response = await fetch(imageUrl);
          return response.blob();
        }

        getImageBlob(internalTexture.url).then((blob) => {
          if (blob.type.indexOf("image/") === 0) {
            setImageData(internalTexture.url);
          }
        });
      }
    } catch (error) {
      console.warn(error);
    }
  }, []);

  return (
    <div style={{ height: "95%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          gap: "0.5em",
        }}
      >
        <div
          style={{
            backgroundColor: theme.palette.background.dark,
          }}
        >
          <Button
            variant={view === "lights" ? "contained" : "text"}
            style={{
              borderRadius: 0,
              boxShadow: "none",
              width: "50%",
              background:
                view === "lights" ? theme.palette.yellow.main : "unset",
              borderBottom: "1px solid " + theme.palette.grey.main,
            }}
            onClick={() => {
              updateOpenNodes({});
              setView("lights");
            }}
          >
            <span
              style={{ marginRight: "0.25em" }}
              className="material-symbols-outlined"
            >
              emoji_objects
            </span>
            Lights
          </Button>
          <Button
            variant={view === "materials" ? "contained" : "text"}
            style={{
              borderRadius: 0,
              boxShadow: "none",
              width: "50%",
              borderBottom: "1px solid " + theme.palette.grey.main,
            }}
            onClick={() => {
              updateOpenNodes({});
              setView("materials");
            }}
          >
            <span
              style={{ marginRight: "0.25em" }}
              className="material-symbols-outlined"
            >
              gradient
            </span>
            Materials
          </Button>

          {view === "lights" ? (
            <>
              <div
                className="nodeInner"
                style={{
                  borderRadius: "0.5em",
                  margin: ".5em",
                  padding: ".5em",
                  background: theme.palette.grey.main,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.5em",
                    justifyContent: "space-between",
                    width: "100%",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onClick={() => setOpenEnv(!openEnv)}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5em",
                      width: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <strong>Environment Map</strong>
                  </div>
                  <span className="material-symbols-outlined">
                    {openEnv ? "expand_more" : "chevron_right"}
                  </span>
                </div>
                {openEnv ? (
                  <div className="nodeInner">
                    {imageData && (
                      <img
                        alt={"Environment Map"}
                        style={{ width: "100%", borderRadius: "0.5em" }}
                        src={imageData}
                      />
                    )}
                    {NodeField(scene.environmentTexture, "url", {
                      ...cubeTextureProps.url,
                      label: "",
                      showInEssentials: true,
                    })}
                    {NodeField(scene, "environmentIntensity", {
                      ...sceneProps.environmentIntensity,
                      showInEssentials: true,
                    })}
                    {NodeField(scene.environmentTexture, "rotationY", {
                      ...cubeTextureProps.rotationY,
                      showInEssentials: true,
                    })}
                  </div>
                ) : null}
              </div>

              <Button
                className="addNew"
                onClick={() => scene.openPrompt("addLight")}
                style={{
                  margin: "0.25em .5em",
                  marginBottom: "0",
                  padding: "1.3em",
                  color: theme.palette.yellow.main,
                  borderRadius: "0.5em",
                  width: "calc(100% - 1em)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5em",
                }}
              >
                <span className="material-symbols-outlined">add_circle</span>{" "}
                <span>Add Light</span>
              </Button>
            </>
          ) : null}
        </div>

        {view === "lights" && (
          <>
            <div
              style={{
                overflowY: "auto",
                minHeight: 0,
                maxHeight: Object.keys(openNodes).length ? "33vh" : "100%",
              }}
            >
              <div className="list" style={{ margin: "0 0.5em" }}>
                <LightsList nodes={scene.lights} />
              </div>
            </div>

            {Object.entries(openNodes).map(([key, node], i) => {
              return (
                <div
                  key={i}
                  style={{
                    overflowY: "auto",
                    minHeight: 0,
                    flex: 1,
                  }}
                >
                  <div
                    className="nodeInner"
                    style={{
                      borderRadius: "0.5em",
                      margin: "0 0.5em",
                      padding: ".5em",
                      backgroundColor: theme.palette.grey.main,
                    }}
                    key={key}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5em",
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <span
                        className="material-symbols-outlined collapseButtonIcon"
                        style={{
                          color: theme.palette.yellow.main,
                        }}
                      >
                        emoji_objects
                      </span>
                      <strong>
                        <Marqueeno
                          text={
                            node.data.node.displayName || node.data.node.name
                          }
                        />
                      </strong>
                    </div>

                    <Fields node={node.data.node} />
                  </div>
                </div>
              );
            })}
          </>
        )}

        {view === "materials" && (
          <>
            <div
              style={{
                overflowY: "auto",
                minHeight: 0,
                maxHeight: "80vh",
              }}
            >
              <div className="list" style={{ margin: "0 0.5em" }}>
                <MaterialsList
                  nodes={Object.values(scene.materials).filter(
                    (m) =>
                      (m.fromAsset || m.isCustom || m.cloneOf) &&
                      typeof m.getClassName === "function" &&
                      m.getClassName() === "PBRMaterial",
                  )}
                />
              </div>
            </div>

            <div
              style={{
                margin: "0 0.5em",
                borderRadius: "0.5em",
                background: theme.palette.grey.main,
              }}
            >
              {Object.entries(openNodes).map(([key, node], i) => {
                return (
                  <div key={key} className="nodeInner">
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5em",
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <span
                        className="material-symbols-outlined collapseButtonIcon"
                        style={{
                          color: theme.palette.green.main,
                        }}
                      >
                        gradient
                      </span>
                      <strong>
                        <Marqueeno text={node.data.node.displayName} />
                      </strong>
                    </div>

                    {NodeField(node.data.node, "environmentIntensity", {
                      ...PBRMaterialProps.environmentIntensity,
                      showInEssentials: true,
                    })}
                    {NodeField(node.data.node, "directIntensity", {
                      ...PBRMaterialProps.directIntensity,
                      showInEssentials: true,
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
