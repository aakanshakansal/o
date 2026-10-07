import { useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";
import { assetsExtensions, soundExtensions, splatExtensions, textureExtensions, videoTextureExtensions } from "../../../constants";
import { insertAssets, postToParentWindow } from "../../../helpers";
import { createNode } from "../createNode";

export const DropWrapper = (props) => {
  const [fileDragEnter, setFileDragEnter] = useState(false);
  const scene = useCurrentScene();
  return window.location.search.indexOf("editmode=true") !== -1 || window.location.pathname === "/sandbox" ? (
    <div
      onDragEnd={(e) => {
        e.preventDefault();
      }}
      onDragOver={(e) => {
        e.preventDefault();

        // const type = e.dataTransfer.getData("text/plain");
        // console.log(type);
        if (e.dataTransfer.items.length) {
          const allAreFiles = Array.from(e.dataTransfer.items).every((item) => item.kind === "file");
          if (allAreFiles) {
            setFileDragEnter(true);
          }
        }
      }}
      onDrop={async (e) => {
        e.preventDefault();

        const type = e.dataTransfer.getData("node");

        createNode({
          scene,
          type: type,
        });
      }}
      style={{ height: "100%", width: "100%" }}
    >
      {fileDragEnter ? (
        <div
          onDragLeave={(e) => {
            e.preventDefault();
            setFileDragEnter(false);
          }}
          onDrop={async (e) => {
            e.preventDefault();

            if (window.location.pathname === "/sandbox") {
              const processFile = (file) => {
                return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  let filenameWithoutExtension = file.name.substring(0, file.name.lastIndexOf("."));

                  reader.onloadend = function () {
                    var base64data = reader.result;
                    resolve({
                      name: filenameWithoutExtension,
                      id: filenameWithoutExtension,
                      size: file.size,
                      type: file.name.split(".").pop().toLowerCase(),
                      url: base64data,
                    });
                  };

                  reader.onerror = reject;

                  reader.readAsDataURL(file);
                });
              };

              const handleFiles = async (files) => {
                try {
                  const fileProcessingPromises = Object.values(files).map((file) => processFile(file));
                  const assets = await Promise.all(fileProcessingPromises);
                  insertAssets(assets, props.scene);
                } catch (error) {
                  console.error("Error processing files:", error);
                }
              };
              setFileDragEnter(false);
              handleFiles(e.dataTransfer.files);
            }

            // if (window.location.search.indexOf("editmode=true") !== -1) {
            //   setDragEnter(false);

            //   //
            //   window.parent.postMessage({ type: "insertAssets", data: e.dataTransfer.files }, "*");
            // }

            if (window.location.search.indexOf("editmode=true") !== -1) {
              setFileDragEnter(false);
              try {
                // Convert FileList to an array of promises, each resolving with file information
                const filePromises = Array.from(e.dataTransfer.files).map((file) => {
                  try {
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = function (event) {
                        resolve({
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          base64: event.target.result, // base64 encoded string
                        });
                      };
                      reader.onerror = function (error) {
                        reject(error);
                      };
                      reader.readAsDataURL(file); // Read the file
                    });

                    //... make file base64 for sending trough postmessage
                  } catch (error) {
                    console.error("Error reading file content:", error);
                    throw error; // Propagate the error to the outer catch block
                  }
                });

                const filesData = await Promise.all(filePromises);

                // Send the array of file information to the parent window
                postToParentWindow({ type: "insertAssets", data: filesData });
              } catch (error) {
                console.error("Error processing files:", error);
              }
            }
          }}
          style={{
            height: "100%",
            width: "100%",
            background: "rgba(0,0,0,0.9)",
            position: "absolute",
            zIndex: 99999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#f1f1f1",
            flexDirection: "column",
          }}
        >
          <div style={{ width: "320px", fontSize: "0.8em" }}>
            <div style={{ fontSize: "1.6em", fontWeight: "bold" }}>Drop here your files</div>
            <br />
            <strong>Supported file types:</strong>
            <br />
            <br />
            <strong>3D Elements:</strong> {assetsExtensions.toString()},{splatExtensions.toString()}
            <br />
            <strong>Textures:</strong> {textureExtensions.toString()}
            <br />
            <strong>Sounds:</strong> {soundExtensions.toString()}
            <br />
            <strong>Video:</strong> {videoTextureExtensions.toString()}
          </div>
        </div>
      ) : null}

      {props.children}
    </div>
  ) : (
    props.children
  );
};

async function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      // Resolve with the file information, including content
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        content: event.target.result, // This is the file content
      });
    };

    reader.onerror = function (error) {
      // Reject with the error
      reject(error);
    };

    // Read the file as text (you can adjust this based on your needs)
    reader.readAsText(file);
  });
}

function base64ToBlob(base64, mimeType) {
  const byteString = atob(base64.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}
