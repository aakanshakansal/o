import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/OBJ";
import "@babylonjs/loaders/STL";

import { ActionManager, Animation, EasingFunction, ExecuteCodeAction, PointerDragBehavior, SineEase, Vector3 } from "@babylonjs/core";
import { actionsDispatcher } from "./actionDispatcher";

//import "babylonjs-loaders";
//import "@babylonjs/loaders/glTF";

function encodeURIComponentWithoutSpaces(str) {
  return encodeURIComponent(str).replace(/%20/g, " ");
}

const SHARED_SECRET = "CHANGE_THIS_TO_A_LONG_RANDOM_STRING";
const encoder = new TextEncoder();
let cachedAesKeyPromise;
let cachedHmacKeyPromise;

function getSignedUrlConcurrency() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const effectiveType = connection?.effectiveType;
  const saveData = connection?.saveData === true;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (saveData) {
    return 2;
  }

  if (effectiveType === "slow-2g" || effectiveType === "2g") {
    return 2;
  }

  if (effectiveType === "3g" || isIOS) {
    return 3;
  }

  return 5;
}

function getAesKey() {
  if (!cachedAesKeyPromise) {
    cachedAesKeyPromise = crypto.subtle
      .digest("SHA-256", encoder.encode(SHARED_SECRET))
      .then((hash) => crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt"]));
  }

  return cachedAesKeyPromise;
}

function getHmacKey() {
  if (!cachedHmacKeyPromise) {
    cachedHmacKeyPromise = crypto.subtle.importKey("raw", encoder.encode(SHARED_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  }

  return cachedHmacKeyPromise;
}

async function encryptPayload(payload) {
  const [aesKey, hmacKey] = await Promise.all([getAesKey(), getHmacKey()]);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = encoder.encode(JSON.stringify(payload));

  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encoded));

  const sigBuf = await crypto.subtle.sign("HMAC", hmacKey, new Uint8Array([...iv, ...encrypted]));

  const sig = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    iv: Array.from(iv),
    data: Array.from(encrypted),
    sig,
  };
}

async function runWithConcurrency(items, limit, worker) {
  if (!items.length) {
    return;
  }

  const normalizedLimit = Math.max(1, limit);
  let cursor = 0;

  const runners = new Array(Math.min(normalizedLimit, items.length)).fill(null).map(async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  });

  await Promise.all(runners);
}

// import validator from "gltf-validator";
export const attachActionManagers = (scene, mesh) => {
  mesh.actionManager = new ActionManager(scene);
  mesh.onPickTrigger = [];

  // mesh.physicsImpostor = new PhysicsImpostor(mesh, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);

  // mesh.physicsImpostor.applyImpulse(new Vector3(0, 0.5, 0), mesh.getAbsolutePosition());
  mesh.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, function (e) {
      if (scene.activeCamera.walkableMeshes && scene.activeCamera.walkableMeshes.length && !scene.disableActions) {
        scene.activeCamera.walkableMeshes.forEach((m) => {
          if (mesh.name === m) {
            if (scene.activeCamera.walkableBehavior === "animation") {
              const easingFun = new SineEase();
              easingFun.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
              Animation.CreateAndStartAnimation(
                "walk",
                scene.activeCamera,
                "position",
                60,
                120,
                scene.activeCamera.position,
                new Vector3(
                  e.additionalData.pickedPoint.x,
                  e.additionalData.pickedPoint.y + scene.activeCamera.walkableHeight || 1.8,
                  e.additionalData.pickedPoint.z,
                ),
                0,
                easingFun,
              );
            } else {
              scene.activeCamera.position = new Vector3(
                e.additionalData.pickedPoint.x,
                e.additionalData.pickedPoint.y + scene.activeCamera.walkableHeight || 1.8,
                e.additionalData.pickedPoint.z,
              );
            }
          }
        });
      }

      mesh.onPickTrigger.forEach((id, i) => {
        if (scene.actions.hasOwnProperty(id)) {
          return actionsDispatcher(scene, scene.actions[id], { trigger: "Pick", trackEvent: true });
        }
      });
    }),
  );

  mesh.onDoublePickTrigger = [];
  mesh.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnDoublePickTrigger, function () {
      mesh.onDoublePickTrigger.forEach((id, i) => {
        if (scene.actions.hasOwnProperty(id)) {
          return actionsDispatcher(scene, scene.actions[id], { trigger: "DoublePick", trackEvent: true });
        }
      });
    }),
  );

  mesh.onPointerOverTrigger = [];
  mesh.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, function () {
      mesh.onPointerOverTrigger.forEach((id, i) => {
        if (scene.actions.hasOwnProperty(id)) {
          return actionsDispatcher(scene, scene.actions[id], { trigger: "PointerOver" });
        }
      });
    }),
  );

  mesh.onPointerOutTrigger = [];
  mesh.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function () {
      mesh.onPointerOutTrigger.forEach((id, i) => {
        if (scene.actions.hasOwnProperty(id)) {
          return actionsDispatcher(scene, scene.actions[id], { trigger: "PointerOut", trackEvent: true });
        }
      });
    }),
  );

  // DRAG BEHAVIOR

  mesh.pointerDragBehavior = new PointerDragBehavior();
  mesh.pointerDragBehavior.enabled = false;
  mesh.pointerDragBehavior.useObjectOrientationForDragging = false;
  //mesh.addBehavior(mesh.pointerDragBehavior);
  mesh.onDragStartTrigger = [];

  mesh.pointerDragBehavior.onDragStartObservable.add(() => {
    mesh.onDragStartTrigger.forEach((id, i) => {
      if (scene.actions.hasOwnProperty(id)) {
        return actionsDispatcher(scene, scene.actions[id], { trigger: "DragStart", trackEvent: true });
      }
    });
  });

  function isMeshIntersectingAny(mesh, scene) {
    for (let otherMesh of scene.meshes) {
      if (otherMesh.checkCollisions && mesh.checkCollisions && otherMesh.name !== mesh.name && mesh.intersectsMesh(otherMesh, false)) {
        return true;
      }
    }
    return false;
  }

  mesh.onDragTrigger = [];
  mesh.pointerDragBehavior.onDragObservable.add(() => {
    mesh.onDragTrigger.forEach((id, i) => {
      if (scene.actions.hasOwnProperty(id)) {
        return actionsDispatcher(scene, scene.actions[id], { trigger: "Drag" });
      }
    });
  });

  // mesh.lastPosition = mesh.position.clone();
  // scene.onBeforeRenderObservable.add(() => {
  //   mesh.computeWorldMatrix();

  //   // Check for collision with any other mesh
  //   if (isMeshIntersectingAny(mesh, scene)) {
  //     console.log("DETECTED");
  //     // If a collision is detected, revert to the last position

  //     mesh.position.copyFrom(mesh.lastPosition);
  //   } else {
  //     // If no collision is detected, store the current position
  //   }

  //   mesh.lastPosition = mesh.position.clone();
  // });

  mesh.onDragEndTrigger = [];
  mesh.pointerDragBehavior.onDragEndObservable.add(() => {
    // const previousPosition = mesh.position.clone();

    // // Update the mesh position to the drag point
    // mesh.position.copyFrom(event.dragPlanePoint);
    let snappedX = mesh.position.x;
    let snappedY = mesh.position.y;
    let snappedZ = mesh.position.z;

    if (mesh.dragSnapDistanceX) {
      snappedX = Math.round(mesh.position.x / mesh.dragSnapDistanceX) * mesh.dragSnapDistanceX;
    }

    if (mesh.dragSnapDistanceY) {
      snappedY = Math.round(mesh.position.y / mesh.dragSnapDistanceY) * mesh.dragSnapDistanceY;
    }

    if (mesh.dragSnapDistanceZ) {
      snappedZ = Math.round(mesh.position.z / mesh.dragSnapDistanceZ) * mesh.dragSnapDistanceZ;
    }

    mesh.position = new Vector3(snappedX, snappedY, snappedZ);

    // // Check for collision with any other mesh
    // if (isMeshIntersectingAny(mesh, scene)) {
    //   console.log("DETECTED");
    //   // If a collision is detected, revert to the previous position
    //   mesh.position.copyFrom(previousPosition);
    // }

    //mesh.position = new Vector3(Math.round(mesh.position.x, 0.1), Math.round(mesh.position.y, 0.1), Math.round(mesh.position.z, 0.1));
    mesh.onDragEndTrigger.forEach((id, i) => {
      if (scene.actions.hasOwnProperty(id)) {
        return actionsDispatcher(scene, scene.actions[id], { trigger: "DragEnd", trackEvent: true });
      }
    });
  });
};

export const normalizeAssetNames = (scene, mesh, rootName) => {
  mesh.displayName = encodeURIComponentWithoutSpaces(mesh.name);
  mesh.name = mesh.getClassName() + "_" + encodeURIComponentWithoutSpaces(mesh.name) + "_" + encodeURIComponentWithoutSpaces(rootName);
  mesh.fromAsset = encodeURIComponentWithoutSpaces(rootName);

  if (mesh.material) {
    if (!mesh.material.displayName) {
      mesh.material.displayName = encodeURIComponentWithoutSpaces(mesh.material.name);
      mesh.material.name =
        mesh.material.getClassName() + "_" + encodeURIComponentWithoutSpaces(mesh.material.name) + "_" + encodeURIComponentWithoutSpaces(mesh.name);
      mesh.material.fromAsset = encodeURIComponentWithoutSpaces(rootName);

      mesh.material.getActiveTextures().forEach((t) => {
        t.fromAsset = encodeURIComponentWithoutSpaces(rootName);
      });
    }
  }

  if (mesh.animations && mesh.animations.length) {
    mesh.animations.forEach((a) => {
      a.fromAsset = encodeURIComponentWithoutSpaces(rootName);
    });
  }
};

export const normalizeAsset = (scene, asset, options) => {
  console.log("Asset " + asset.name + " successfuly loaded");

  // if (asset.getClassName() === "Mesh" && !asset.getDescendants(false).length) {
  //   attachActionManagers(scene, asset);
  //   asset.useVertexColors = false;
  // }

  scene.badAssets[asset.name] = asset;

  if (asset.rotationQuaternion) {
    asset.rotation = asset.rotationQuaternion.toEulerAngles();
    asset.rotationQuaternion = null;
  }

  scene.badAssets[asset.name].getDescendants(false).forEach((child, i) => {
    if (child.rotationQuaternion) {
      child.rotation = child.rotationQuaternion.toEulerAngles();
      child.rotationQuaternion = null;
    }

    normalizeAssetNames(scene, child, asset.name, options);
    if (child.getClassName() === "Mesh") {
      attachActionManagers(scene, child);
      child.useVertexColors = false;
    }
  });
};

export const loadAssets = (assetsData, scene, assetsManager) => {
  if (document.getElementById("curtain") && assetsManager.name === "defaultAssetManager") {
    document.getElementById("curtain").style.display = "flex";
    document.getElementById("curtainProgressBar").style.width = 0 + "%";
    document.getElementById("curtainProgress").innerHTML = "Importing asset " + 0 + " of " + Object.keys(assetsData).length;
  }

  if (document.getElementById("loadingScreen") && assetsManager.name === "initAssetManager") {
    document.getElementById("loadingScreenProgressBar").style.width = 0 + "%";
    document.getElementById("loadingScreenProgress").innerHTML = "Loading asset " + 0 + " of " + Object.keys(assetsData).length;
  }

  Promise.all(
    Object.entries(assetsData).map(([id, asset]) => {
      return { [id]: asset };
    })
  )
    .then((normalizedAssets) => {
      normalizedAssets.forEach((obj) => {
        const id = encodeURIComponentWithoutSpaces(Object.keys(obj)[0]);
        const file = obj[id].asset;
        const assetData = obj[id];

        const setTask = (file) => {
          const task = assetsManager.addMeshTask(id, "", "", file);
          task.onProgress = function (remainingCount, totalCount, task) {
            //  console.log(task, remainingCount);
          };
          task.onError = function (task, message, exception) {
            console.warn(message, exception);
          };
          task.onSuccess = (task) => {
            // fetch(file)
            //   .then((response) => response.arrayBuffer())
            //   .then((asset) => validator.validateBytes(new Uint8Array(asset)))
            //   .then((report) => {
            //     root.validation = report;
            //   })
            //   .catch((error) => console.error("Validation failed: ", error));

            var root = task.loadedMeshes[0];

            root.name = id;
            root.displayName = encodeURIComponentWithoutSpaces(assetData.name) || id;

            if (task.loadedAnimationGroups) {
              root.animationGroups = task.loadedAnimationGroups;
              root.animationGroups.forEach((anim, i) => {
                anim.displayName = encodeURIComponentWithoutSpaces(anim.name);
                anim.name = anim.getClassName() + "_" + encodeURIComponentWithoutSpaces(anim.name) + "_" + encodeURIComponentWithoutSpaces(root.name);
                anim.fromAsset = id;
                anim.stop();
              });
            }

            root.isAsset = true;
            root.REF = assetData.assetREF;

            normalizeAsset(scene, root);
          };
        };

        if (file) {
          setTask(file);
        }
      });

      return assetsManager.load();

      // You can continue with your logic after all assets are cached
    })
    .catch((error) => {
      console.error("Error fetching and caching assets:", error);
    });
  setTimeout(() => {
    if (scene.refreshHotspots) {
      scene.refreshHotspots();
    }
  }, 2000);
};