import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { functionsUrl, storageUrl } from "./Router";
import {
  PBRMaterialProps,
  animationGroupProps,
  animationProps,
  arcRotateCameraProps,
  controlNodeProps,
  cubeTextureProps,
  diamondMaterialProps,
  directionalLightProps,
  dynamicTextureProps,
  effectsProps,
  engineProps,
  hdrCubeTextureProps,
  hemisphericLightProps,
  meshProps,
  pointLightProps,
  sceneProps,
  shadowOnlyMaterialProps,
  soundProps,
  spotLightProps,
  textureProps,
  transformNodeProps,
  transmissionMaterialProps,
  universalCameraProps,
  variableProps,
  videoTextureProps,
} from "./nodesProps";
import { createSceneData } from "./sceneFunctions/createSceneData";
import { createCubeTexture, createGSplat, createHDRCubeTexture, createSound, createTexture, createVideoTexture } from "./sceneFunctions/createSceneElements";
import { loadAssets } from "./sceneFunctions/loadAssets";

import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore";

import merge from "deepmerge";
import {
  assetsExtensions,
  cubeTextureExtensions,
  hdrCubeTextureExtensions,
  soundExtensions,
  splatExtensions,
  textureExtensions,
  videoTextureExtensions,
} from "./constants";

export const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === "[::1]" ||
  // 127.0.0.0/8 are considered localhost for IPv4.
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export const getIframeParentOrigin = () => {
  try {
    if (window.location === window.parent.location) {
      return window.location.origin;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const explicitOrigin = searchParams.get("parentOrigin") || searchParams.get("targetOrigin");
    if (explicitOrigin) {
      return new URL(explicitOrigin).origin;
    }

    if (document.referrer) {
      return new URL(document.referrer).origin;
    }
  } catch (error) {
    console.warn("Unable to resolve parent origin", error);
  }

  return "*";
};

export const postToParentWindow = (payload) => {
  const targetOrigin = getIframeParentOrigin();
  window.parent.postMessage(payload, targetOrigin);
};

export const isTrustedParentMessageEvent = (event) => {
  if (!event || typeof event.data !== "object" || event.data === null) {
    return false;
  }

  if (window.location === window.parent.location) {
    return true;
  }

  const expectedOrigin = getIframeParentOrigin();
  if (expectedOrigin === "*") {
    return true;
  }

  return event.origin === expectedOrigin;
};

export const sanitizeFiniteNumber = (value, fallback = 0) => {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return numericValue;
};

export const classifyRuntimeRegressionCause = (message) => {
  const normalizedMessage = String(message || "").toLowerCase();

  if (
    normalizedMessage.includes("webgl_compile_status: false") ||
    normalizedMessage.includes("shader") && (normalizedMessage.includes("nan") || normalizedMessage.includes("infinity")) ||
    normalizedMessage.includes("gl_invalid_value")
  ) {
    return "CAUSE_1_SHADER_NAN_REGRESSION";
  }

  if (
    normalizedMessage.includes("webgl context lost") ||
    normalizedMessage.includes("mreexceptionadvisorylimitactive") ||
    normalizedMessage.includes("gpu process crashed") ||
    normalizedMessage.includes("gpu process") && normalizedMessage.includes("killed")
  ) {
    return "CAUSE_2_VRAM_GPU_PROCESS";
  }

  if (
    normalizedMessage.includes("postmessage") && (normalizedMessage.includes("origin") || normalizedMessage.includes("same origin")) ||
    normalizedMessage.includes("origin mismatch") ||
    normalizedMessage.includes("navigation api")
  ) {
    return "CAUSE_3_SOP_NAVIGATION_API";
  }

  return null;
};

export const reportRuntimeDiagnostic = (label, details) => {
  const normalizedDetails = typeof details === "string" ? details : JSON.stringify(details || {});
  const cause = classifyRuntimeRegressionCause(normalizedDetails);
  const causeTag = cause || "UNCLASSIFIED";
  console.warn(`[DIAG][${causeTag}] ${label}`, details);
};

// Backward-compatible aliases for existing imports.
export const classifySafariRegressionCause = classifyRuntimeRegressionCause;
export const reportSafariRegressionDiagnostic = reportRuntimeDiagnostic;

export const isEditMode = () => {
  return window.location.search.indexOf("editmode=true") !== -1;
};

export const isSandbox = () => {
  return window.location.pathname === "/sandbox";
};
export const degreesToRadiants = (degrees) => {
  var pi = Math.PI;
  return degrees * (pi / 180);
};

export const radiantsToDegrees = (radiants) => {
  var pi = Math.PI;
  return radiants * (180 / pi);
};

export const radiantsToFocalLength = (fovRadians, sensorSize = 35) => {
  // Calculate the focal length
  const focalLength = sensorSize / (2 * Math.tan(fovRadians / 2));
  return focalLength;
};

export const focalLengthToRadiants = (focalLength, sensorSize = 35) => {
  // Calculate the field of view in radians
  const fovRadians = 2 * Math.atan(sensorSize / (2 * focalLength));
  return fovRadians;
};

export const insertAssets = async (assets, scene) => {
  console.log("Inserting Assets:", assets);

  let assetsObj = {};

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const [i, asset] of assets.entries()) {
    await delay(100);
    const assetUrl = window.location.pathname === "/sandbox" || window.location.pathname === "/viewer" ? asset.url : cleanFirebaseUrl(asset.url);

    if (assetsExtensions.includes(asset.type)) {
      assetsObj["Asset_" + Date.now() + "_" + i] = {
        name: asset.name,
        asset: assetUrl,
        assetREF: asset.id,
      };

      continue;
    }

    if (textureExtensions.includes(asset.type)) {
      const texture = createTexture(scene, null, assetUrl, "Texture_" + Date.now() + "_" + i);
      texture.urlREF = asset.id;
      texture.displayName = asset.name;
      texture.badChanges = {};
      texture.badChanges.displayName = asset.name;
      texture.badChanges.url = assetUrl;
      texture.badChanges.urlREF = asset.id;

      scene.openNode("Texture", texture);

      continue;
    }

    if (cubeTextureExtensions.includes(asset.type)) {
      const texture = createCubeTexture(scene, null, assetUrl, "Texture_" + Date.now() + "_" + i);
      texture.urlREF = asset.id;
      texture.displayName = asset.name;
      texture.badChanges = {};
      texture.badChanges.displayName = asset.name;
      texture.badChanges.url = assetUrl;
      texture.badChanges.urlREF = asset.id;
      scene.openNode("Texture", texture);

      continue;
    }

    if (hdrCubeTextureExtensions.includes(asset.type)) {
      const texture = createHDRCubeTexture(scene, null, assetUrl, "Texture_" + Date.now() + "_" + i);
      texture.urlREF = asset.id;
      texture.displayName = asset.name;
      texture.badChanges = {};
      texture.badChanges.displayName = asset.name;
      texture.badChanges.url = assetUrl;
      texture.badChanges.urlREF = asset.id;
      scene.openNode("Texture", texture);

      continue;
    }

    if (videoTextureExtensions.includes(asset.type)) {
      const texture = createVideoTexture(scene, null, assetUrl, "Texture_" + Date.now() + "_" + i);
      texture.urlREF = asset.id;
      texture.displayName = asset.name;
      texture.badChanges = {};
      texture.badChanges.displayName = asset.name;
      texture.badChanges.url = assetUrl;
      texture.badChanges.urlREF = asset.id;
      scene.openNode("Texture", texture);

      continue;
    }

    if (soundExtensions.includes(asset.type)) {
      const sound = createSound(scene, null, assetUrl, "Sound_" + Date.now() + "_" + i);
      sound.urlREF = asset.id;
      sound.displayName = asset.name;
      sound.badChanges = {};
      sound.badChanges.displayName = asset.name;
      sound.badChanges.url = assetUrl;
      sound.badChanges.urlREF = asset.id;
      scene.openNode("Sound", sound);

      continue;
    }

    if (splatExtensions.includes(asset.type)) {
      createGSplat(scene, null, assetUrl, "GSplat_" + Date.now() + "_" + i).then((gSplat) => {
        gSplat.urlREF = asset.id;
        gSplat.displayName = asset.name;
        gSplat.badChanges = {};
        gSplat.badChanges.displayName = asset.name;
        gSplat.badChanges.url = assetUrl;
        gSplat.badChanges.urlREF = asset.id;

        scene.openNode("Mesh", gSplat);
      });

      continue;
    }

    toast.error("Unsupported file: " + asset.name);
  }

  if (Object.keys(assetsObj).length) {
    loadAssets(assetsObj, scene, scene.defaultAssetManager);
  }
};

export const parseSceneData = async (data) => {
  var nodes = null;
  var config = null;
  var urlData = null;

  if (window.location.search.indexOf("data=") !== -1) {
    urlData = getSearchObject().data;
    urlData = JSON.parse(urlData);
  }

  if (window.location.search.indexOf("nodes=") !== -1) {
    nodes = getSearchObject().nodes;
    nodes = JSON.parse(nodes);
  }
  if (window.location.search.indexOf("config=") !== -1) {
    config = getSearchObject().config;
  }

  function isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  if (isJsonString(data.data)) {
    data.data = JSON.parse(data.data);
  } else {
  }

  if (nodes) {
    data.data.nodes = { ...data.data.nodes, ...nodes };
  }

  if (urlData) {
    const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;

    data.data = merge(data.data, urlData, {
      arrayMerge: overwriteMerge,
    });
  }

  // NORMALIZE OLD ASSETS TO PUNCHCARD ASSETS

  if (!data.data.effects) {
    data.data.effects = {};

    if (data.data.defaultRenderingPipeline) {
      data.data.effects.defaultRenderingPipeline = JSON.parse(JSON.stringify(data.data.defaultRenderingPipeline));

      delete data.data.defaultRenderingPipeline;
    }
  }

  if (!data.data.assets) {
    data.data.assets = {};
  }

  // NORMALIZE OLD LIGHT ARRAY TO OBJECT

  async function processObject(obj) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        obj[i] = await processObject(obj[i]);
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (let key in obj) {
        if (key.includes("REF")) {
          const newKey = key.replace("REF", "");
          const assetREF = await getAssetREF(obj[key]);

          if (assetREF) {
            obj[newKey] = assetREF.customUrl || cleanFirebaseUrl(assetREF.url);
          } else {
            console.warn("Couldn't find asset :(", obj);
            obj[newKey] = null;
          }
        } else {
          obj[key] = await processObject(obj[key]);
        }
      }
    }

    return obj;
  }

  async function processOverlayObject(obj, html) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const result = await processOverlayObject(obj[i], html);
        obj[i] = result.obj;
        html = result.html;
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (let key in obj) {
        if (key.includes("REF")) {
          const assetREF = await getAssetREF(obj[key]);

          if (assetREF) {
            html = html.replace(new RegExp(obj.attributes.src, "g"), assetREF.customUrl || cleanFirebaseUrl(assetREF.url));

            obj.attributes.src = assetREF.customUrl || cleanFirebaseUrl(assetREF.url);
          } else {
            console.warn("Couldn't find asset :(", obj);
          }
        } else {
          const result = await processOverlayObject(obj[key], html);
          obj[key] = result.obj;
          html = result.html;
        }
      }
    }

    return { obj, html };
  }

  data = await processObject(data).then((newdata) => newdata);

  if (data.data.overlays) {
    await Promise.all(
      Object.entries(data.data.overlays).map(async ([k, v]) => {
        if (v.overlayData && v.overlayData.json) {
          await processOverlayObject(JSON.parse(v.overlayData.json), v.overlayData.html).then((newData) => {
            data.data.overlays[k].overlayData.json = JSON.stringify(newData.obj);
            data.data.overlays[k].overlayData.html = newData.html;
          });
          //  console.log(JSON.parse(v.overlayData.json));
        }
      })
    );
  }

  return data;
};

export const addVisit = async (organizationId, sceneId) => {
  const res = await fetch(functionsUrl + "/addVisit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      organizationId: organizationId,
      sceneId: sceneId,
    }),
  });

  return res;
};

export const groupBy = (array, getKey) => {
  return array.reduce((accumulator, element) => {
    // Get the key for the current element (e.g., the class name of the node).
    let key;
    if (typeof getKey === "function") {
      key = getKey(element);
    } else {
      key = element[getKey];
    }

    // If the accumulator doesn't have an array for this key yet, create it.
    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    // Add the current element to the array for this key.
    accumulator[key].push(element);

    return accumulator;
  }, {}); // Initial accumulator is an empty object.
};

// export const setDeep = (obj, path, value) => {
//   try {
//     const keys = path.split(".");
//     let cursor = obj;
//     for (let i = 0; i < keys.length - 1; i++) {
//       cursor = cursor[keys[i]];
//     }
//     cursor[keys[keys.length - 1]] = value;
//   } catch (error) {
//     console.warn(error);
//   }
// };

export const setDeep = (obj, path, value) => {
  try {
    const safeValue = typeof value === "number" ? sanitizeFiniteNumber(value, 0) : value;
    const keys = path.split(".");
    let cursor = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      // Check if the key doesn't exist or it's not an object (to avoid overwriting non-object entries)
      if (!(keys[i] in cursor) || typeof cursor[keys[i]] !== "object" || cursor[keys[i]] === null) {
        cursor[keys[i]] = {}; // Initialize it as an empty object
      }
      cursor = cursor[keys[i]]; // Move the cursor to the next level
    }
    cursor[keys[keys.length - 1]] = safeValue; // Set the value
  } catch (error) {
    console.warn(error);
  }
};

export const getDeep = (obj, path) => {
  try {
    const keys = path.split(".");
    let cursor = obj;
    for (let i = 0; i < keys.length; i++) {
      cursor = cursor[keys[i]];
    }
    return cursor;
  } catch (error) {
    console.warn(error);
  }
};

export const delDeep = (obj, path) => {
  try {
    const keys = path.split(".");
    let cursor = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      cursor = cursor[keys[i]];
    }
    delete cursor[keys[keys.length - 1]];
  } catch (error) {
    console.warn(error);
  }
};

export async function takeScreenshot(scene, width, height, quality) {
  try {
    const canvas = scene.getEngine().getRenderingCanvas();
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;
    const screenshotWidth = width || canvas.width;
    const screenshotHeight = height || canvas.height;

    canvas.width = screenshotWidth;
    canvas.height = screenshotHeight;

    scene.render();
    const dataURL = canvas.toDataURL("image/webp", quality || 0.8);

    canvas.width = originalWidth;
    canvas.height = originalHeight;
    scene.getEngine().resize();
    scene.render();

    return dataURL;
  } catch (error) {
    throw new Error("Error during the screenshot process");
  }
}

const hasIndexedMaterials = (sceneData) => {
  if (!sceneData || typeof sceneData !== "object") {
    return false;
  }

  const catalog = sceneData.materialCatalog;
  return Boolean(catalog && typeof catalog === "object" && Object.keys(catalog).length);
};

const hasSceneAssets = (sceneData) => {
  if (!sceneData || typeof sceneData !== "object") {
    return false;
  }

  const assets = sceneData.assets;
  return Boolean(assets && typeof assets === "object" && Object.keys(assets).length);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const summarizeSceneData = (sceneData) => {
  const assets = sceneData?.assets && typeof sceneData.assets === "object" ? Object.keys(sceneData.assets) : [];
  const materials = sceneData?.materials && typeof sceneData.materials === "object" ? Object.keys(sceneData.materials) : [];
  const materialCatalog =
    sceneData?.materialCatalog && typeof sceneData.materialCatalog === "object"
      ? Object.keys(sceneData.materialCatalog)
      : [];
  const nodes = sceneData?.nodes && typeof sceneData.nodes === "object" ? Object.keys(sceneData.nodes) : [];

  return {
    assetsCount: assets.length,
    materialsCount: materials.length,
    materialCatalogCount: materialCatalog.length,
    nodesCount: nodes.length,
    firstAsset: assets[0] || null,
    firstMaterialCatalogItem: materialCatalog[0] || null,
  };
};


const buildStableSceneData = async (scene) => {
  let nextSceneData = createSceneData(scene, scene.sceneData);


  // In production asset imports can finish a bit after the save click.
  // Retry briefly so materialCatalog is captured when assets are present.
  if (hasSceneAssets(nextSceneData) && !hasIndexedMaterials(nextSceneData)) {
    const maxAttempts = 12;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await wait(250);
      nextSceneData = createSceneData(scene, nextSceneData);

      if (hasIndexedMaterials(nextSceneData)) {
        break;
      }
    }
  }


  return nextSceneData;
};

export const sendDataToAdmin = (scene) => {
  const canvas = document.querySelector("#renderCanvas");


  takeScreenshot(scene, 2048, 2048, 0.8).then(async (dataUrl) => {

    const newSceneData = await buildStableSceneData(scene);
    scene.sceneData = newSceneData;

    setTimeout(() => {
      postToParentWindow({ type: "saveData", data: newSceneData, preview: dataUrl });
    }, 1);
  });

  // htmlToImage.toBlob(canvas, { quality: 0.5, pixelRatio: 0.5 }).then((img) => {

  // });

  // Tools.CreateScreenshot(scene.getEngine(), scene.activeCamera, 256, function (imgUrlData) {
  //   canvas.style.width = originalWidth;
  //   canvas.style.height = originalHeight;

  //   scene.getEngine().resize(true);
  //   const newSceneData = createSceneData(scene, scene.sceneData);
  //   scene.sceneData = newSceneData;
  //   setTimeout(() => {
  //     window.parent.postMessage({ type: "saveData", data: newSceneData, preview: imgUrlData }, "*");
  //   }, 1);
  // });
};

export const ConditionalWrapper = ({ condition, wrapper, children }) => (condition ? wrapper(children) : children);

export const getOrganization = async (organizationId) => {
  try {
    const db = getFirestore();

    const organizationRef = doc(db, "/organizations", organizationId);

    const organization = await getDoc(organizationRef);
    if (organization) {
      return organization.data(); // Return the ID of the organization
    } else {
      return null; // Return null if no organization is found
    }
  } catch (error) {
    console.error("Error in getOrganization:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

export const getOrganizationId = async (organizationHandle) => {
  try {
    const db = getFirestore();
    const organizationsRef = collection(db, "organizations"); // Replace 'organizations' with your actual collection name

    const q = query(organizationsRef, where("handle", "==", organizationHandle));

    const querySnapshot = await getDocs(q);

    const organizationDoc = querySnapshot.docs[0]; // Assuming handle is unique and only one document will be returned

    if (organizationDoc) {
      return organizationDoc.id; // Return the ID of the organization
    } else {
      return null; // Return null if no organization is found
    }
  } catch (error) {
    console.error("Error in getOrganizationId:", error);
    //  throw error; // Rethrow the error for the caller to handle
  }
};

export const getOrganizationAssets = async (organizationId) => {
  try {
    // Initialize Firestore
    const db = getFirestore();

    // Query the assets collection
    const assetsQuery = query(collection(db, "/assets"), where("organizationId", "==", organizationId));
    const assetsSnapshot = await getDocs(assetsQuery);

    if (assetsSnapshot.empty) {
      return []; // No assets found, return an empty array
    }

    const assetsArray = assetsSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    // Sort the array based on 'updatedAt'
    //assetsArray.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());

    return assetsArray;
  } catch (error) {
    console.error("Error in getOrganizationAssets:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

export const getOrganizationPages = async (organizationId) => {
  try {
    // Initialize Firestore
    const db = getFirestore();

    // Query the pages collection
    const pagesQuery = query(collection(db, "/pages"), where("organizationId", "==", organizationId));
    const pagesSnapshot = await getDocs(pagesQuery);

    if (pagesSnapshot.empty) {
      return []; // No pages found, return an empty array
    }

    const pagesArray = pagesSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    return pagesArray;
  } catch (error) {
    console.error("Error in getOrganizationPages:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

export const getOrganizationScenes = async (organizationId) => {
  try {
    // Initialize Firestore
    const db = getFirestore();

    // Query the scenes collection
    const scenesQuery = query(collection(db, "/scenes"), where("organizationId", "==", organizationId));
    const scenesSnapshot = await getDocs(scenesQuery);

    if (scenesSnapshot.empty) {
      return []; // No scenes found, return an empty array
    }

    const scenesArray = scenesSnapshot.docs.map((doc) => {
      return {
        ...doc.data(),
        id: doc.id,
      };
    });

    return scenesArray;
  } catch (error) {
    console.error("Error in getOrganizationScenes:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

export const getOrganizationAssetsByExtension = async (organizationId, extensions) => {
  try {
    // Initialize Firestore
    const db = getFirestore();

    // Query the assets collection
    const assetsQuery = query(collection(db, "/assets"), where("organizationId", "==", organizationId));
    const assetsSnapshot = await getDocs(assetsQuery);

    const filteredAssets = assetsSnapshot.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      .filter((asset) => asset.type && extensions.includes(asset.type));

    return filteredAssets;
  } catch (error) {
    console.error("Error in getOrganizationAssetsByExtension:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

export const getCommonAssets = async () => {
  try {
    // Initialize Firestore
    const db = getFirestore();

    // Query the assets collection
    const assetsQuery = query(collection(db, "/assets"), where("organizationId", "==", "badvisor"));
    const assetsSnapshot = await getDocs(assetsQuery);

    const assetsArray = assetsSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    return assetsArray;
  } catch (error) {
    console.error("Error in getCommonAssets:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

export const getCommonAssetsByExtension = async (extensions) => {
  try {
    // Initialize Firestore
    const db = getFirestore();

    // Query the assets collection
    const assetsQuery = query(collection(db, "/assets"), where("organizationId", "==", "badvisor"));
    const assetsSnapshot = await getDocs(assetsQuery);

    const filteredAssets = assetsSnapshot.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      .filter((asset) => asset.type && extensions.includes(asset.type));

    return filteredAssets;
  } catch (error) {
    console.error("Error in getCommonAssetsByExtension:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

export const getPages = async (organizationId) => {
  try {
    // Initialize Firestore
    const db = getFirestore();

    // Query the pages collection
    const pagesQuery = query(collection(db, "/pages"), where("organizationId", "==", organizationId));
    const pagesSnapshot = await getDocs(pagesQuery);

    if (pagesSnapshot.empty) {
      return []; // No pages found, return an empty array
    }

    const pagesArray = pagesSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    return pagesArray;
  } catch (error) {
    console.error("Error in getPages:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

export const getSceneData = async (organizationHandle, projectHandle, sceneHandle) => {
  try {
    // Initialize Firestore
    const db = getFirestore();

    // Query the organizations collection
    const orgsQuery = query(collection(db, "/organizations"), where("handle", "==", organizationHandle));
    const organizationRes = await getDocs(orgsQuery);

    if (organizationRes.empty) {
      throw new Error("Organization not found");
    }

    const organizationId = organizationRes.docs[0].id;

    // Query the projects collection
    const projectsQuery = query(collection(db, "/projects"), where("organizationId", "==", organizationId), where("handle", "==", projectHandle));
    const projectRes = await getDocs(projectsQuery);

    if (projectRes.empty) {
      throw new Error("Project not found");
    }

    const projectId = projectRes.docs[0].id;

    // Query the scenes collection

    const scenesQuery = query(
      collection(db, "scenes"),
      where("handle", "==", sceneHandle),
      where("organizationId", "==", organizationId),
      where("projectId", "==", projectId)
    );
    const sceneRes = await getDocs(scenesQuery);

    if (sceneRes.empty) {
      throw new Error("Scene not found");
    }

    const tmp = sceneRes.docs[0].data();

    if (tmp.id) {
      delete tmp.id;
    }

    const sceneData = { id: sceneRes.docs[0].id, ...tmp };

    let allowed = false;

    if (getSearchObject().version) {
      console.log("Getting version: ", getSearchObject().version);
      // Now, access the subcollection inside the scene document
      const subcollectionDocRef = doc(db, "scenes", sceneRes.docs[0].id, "versions", getSearchObject().version);
      const subcollectionDoc = await getDoc(subcollectionDocRef);

      if (subcollectionDoc.exists()) {
        allowed = true;
        sceneData.data = subcollectionDoc.data().data;
      }
    }

    // Allowed logic

    if (
      document.referrer.indexOf("http://localhost") !== -1 ||
      document.referrer.indexOf("https://badvisor-admin") !== -1 ||
      document.referrer.indexOf("https://admin.badvisor") !== -1 ||
      document.referrer.indexOf("https://badvisor-makerkit.vercel.app") !== -1
    ) {
      allowed = true;
    } else {
      if (sceneData.published) {
        allowed = true;
      }
    }

    if (!allowed) {
      throw new Error("Access to the scene is not allowed");
    }

    return sceneData;
  } catch (error) {
    console.error("Error in getSceneData:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

// Usage

// export const getSceneProjectHandle = async (organizationId, sceneHandle) => {
//   try {
//     // Initialize Firestore
//     const db = getFirestore();

//     // Step 2: Get the scene with the organization ID and scene handle
//     const scenesQuery = query(collection(db, "/scenes"), where("handle", "==", sceneHandle), where("organization_id", "==", organizationId));
//     const scenesSnapshot = await getDocs(scenesQuery);

//     if (scenesSnapshot.empty) {
//       throw new Error("Scene not found");
//     }
//     const projectId = scenesSnapshot.docs[0].data().project_id;

//     // Step 3: Get the project using the project ID
//     const projectDocRef = doc(db, "/projects", projectId);
//     const projectDoc = await getDoc(projectDocRef);

//     if (!projectDoc.exists()) {
//       throw new Error("Project not found");
//     }

//     // Step 4: Return the handle of the project
//     return projectDoc.data().handle;
//   } catch (error) {
//     console.error("Error in getSceneProjectHandle:", error);
//     throw error; // or handle the error as needed
//   }
// };

export const getPage = async (organizationHandle, pageHandle) => {
  try {
    // Initialize Firestore
    const db = getFirestore();

    // Query the organizations collection
    const orgsQuery = query(collection(db, "/organizations"), where("handle", "==", organizationHandle));
    const organizationRes = await getDocs(orgsQuery);

    if (organizationRes.empty) {
      throw new Error("Organization not found");
    }

    const organizationId = organizationRes.docs[0].id;

    // Step 2: Get the page with the organization ID and page handle
    const pagesQuery = query(collection(db, "/pages"), where("handle", "==", pageHandle), where("organizationId", "==", organizationId));
    const pagesSnapshot = await getDocs(pagesQuery);

    if (pagesSnapshot.empty) {
      throw new Error("Page not found");
    }

    // Step 3: Return the data of the page
    return { id: pagesSnapshot.docs[0], ...pagesSnapshot.docs[0].data() };
  } catch (error) {
    console.error("Error in getPage:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

export const getAssetREF = async (assetId) => {
  if (!assetId) {
    return null;
  }

  try {
    // Initialize Firestore
    const db = getFirestore();

    // Create a reference to the asset document
    const assetRef = doc(db, "assets", assetId);

    // Get the document
    const assetSnap = await getDoc(assetRef);

    // Check if the document exists and return its data
    return assetSnap.exists() ? assetSnap.data() : null;
  } catch (error) {
    console.error("Error in getAssetREF:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

export const hexToRgbA = (hex, opacity) => {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + "," + opacity + ")";
  }
  throw new Error("Bad Hex");
};

export const rgbToRgbA = (rgb, opacity) => {
  var colour = rgb;
  var new_col = colour.replace(/rgb/i, "rgba");
  new_col = new_col.replace(/\)/i, "," + opacity + ")");

  return new_col;
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const cleanFirebaseUrl = (url) => {
  // Extract the path from the Firebase URL

  const pathRegex = /\/([^\/]+\/[^\/]+\/.*)$/;

  const match = pathRegex.exec(url);

  if (!match) {
    return null;
    // throw new Error("Invalid Firebase URL");
  }

  return storageUrl + url;
};

export const arGlbUrl = (props) => {
  return `intent://arvr.google.com/scene-viewer/1.1?file=${props.url}&mode=ar_only#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;
};

export const arUsdzUrl = (props) => {
  return `${props.url}`;
};

export const getDevice = () => {
  const a = document.createElement("a");
  var getUserAgent = navigator.userAgent || navigator.vendor || window.opera;
  var device = null;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(getUserAgent)) {
    device = "WindowsPhone";
  } else if (/android/i.test(getUserAgent)) {
    device = "Android";
  } else if (a.relList.supports("ar")) {
    device = "IOS";
  } else if (/iOS/i.test(getUserAgent)) {
    device = "IOS";
  } else {
    device = null;
  }
  return device;
};

export const getSearchObject = () => {
  if (window.location.search) {
    const search = window.location.search.substring(1);
    const obj = JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');

    return obj;
  } else return {};
};

/// LZW-compress a string
export const lzw_encode = (s) => {
  var dict = {};
  var data = (s + "").split("");
  var out = [];
  var currChar;
  var phrase = data[0];
  var code = 256;
  for (var i = 1; i < data.length; i++) {
    currChar = data[i];
    if (dict[phrase + currChar] != null) {
      phrase += currChar;
    } else {
      out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
      dict[phrase + currChar] = code;
      code++;
      phrase = currChar;
    }
  }
  out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
  for (var i = 0; i < out.length; i++) {
    out[i] = String.fromCharCode(out[i]);
  }
  return out.join("");
};

// Decompress an LZW-encoded string
export const lzw_decode = (s) => {
  var dict = {};
  var data = (s + "").split("");
  var currChar = data[0];
  var oldPhrase = currChar;
  var out = [currChar];
  var code = 256;
  var phrase;
  for (var i = 1; i < data.length; i++) {
    var currCode = data[i].charCodeAt(0);
    if (currCode < 256) {
      phrase = data[i];
    } else {
      phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar;
    }
    out.push(phrase);
    currChar = phrase.charAt(0);
    dict[code] = oldPhrase + currChar;
    code++;
    oldPhrase = phrase;
  }
  return out.join("");
};

export const sceneReset = (scene) => {
  scene.transformNodes.forEach((node, i) => {
    //node.visibility = 1;
    //node.setEnabled(true);

    // for (var i = 0; i < 10; i++) {
    //   if (node.name.indexOf(".00" + i) > -1) {
    //     node.name = node.name.replace(".00" + i, "");
    //   }
    // }
    //  node.preserveParentRotationForBillboard = true;
    if (node.rotationQuaternion) {
      node.rotationQuaternion.toEulerAnglesToRef(node.rotation);
      // node.rotation = node.rotationQuaternion.toEulerAngles();
      node.rotationQuaternion = null;
    }
  });
  scene.meshes.forEach((mesh, i) => {
    //mesh.visibility = 1;
    //  mesh.setEnabled(true);
    //mesh.preserveParentRotationForBillboard = true;
    // for (var i = 0; i < 10; i++) {
    //   if (mesh.name.indexOf(".00" + i) > -1) {
    //     mesh.name = mesh.name.replace(".00" + i, "");
    //   }
    // }

    if (mesh.rotationQuaternion) {
      mesh.rotationQuaternion.toEulerAnglesToRef(mesh.rotation);
      // mesh.rotationQuaternion = null;
      //mesh.rotation = mesh.rotationQuaternion.toEulerAngles();
      mesh.rotationQuaternion = null;
    }

    mesh.enablePointerMoveEvents = true;
    if (mesh.name && mesh.name.indexOf(".") === 0) {
      mesh.visibility = 0;
    }
    if (mesh.name && mesh.name.indexOf("_collision") === 0) {
      mesh.isPickable = false;
      mesh.checkCollisions = true;
      mesh.visibility = 0;
    }
    if (mesh.name && mesh.name.indexOf("_walkable") === 0) {
      mesh.isPickable = true;
      mesh.visibility = 0;
    }
  });
};

export const fullscreenHandle = () => {
  const elem = document.documentElement;
  if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
    if (elem.requestFullscreen) {
      // document.getElementById("enterFull").style.display = "none";
      // document.getElementById("exitFull").style.display = "initial";
      elem.requestFullscreen().catch((err) => {
        console.log(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    } else if (elem.msRequestFullscreen) {
      // document.getElementById("enterFull").style.display = "none";
      // document.getElementById("exitFull").style.display = "initial";
      elem.msRequestFullscreen().catch((err) => {
        console.log(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    } else if (elem.mozRequestFullScreen) {
      // document.getElementById("enterFull").style.display = "none";
      // document.getElementById("exitFull").style.display = "initial";
      elem.mozRequestFullScreen().catch((err) => {
        console.log(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    } else if (elem.webkitRequestFullscreen) {
      // document.getElementById("enterFull").style.display = "none";
      // document.getElementById("exitFull").style.display = "initial";
      elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT).catch((err) => {
        console.log(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    }
  } else if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
    if (document.exitFullscreen) {
      // document.getElementById("exitFull").style.display = "none";
      // document.getElementById("enterFull").style.display = "initial";
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      // document.getElementById("exitFull").style.display = "none";
      // document.getElementById("enterFull").style.display = "initial";
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      // document.getElementById("exitFull").style.display = "none";
      // document.getElementById("enterFull").style.display = "initial";
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      // document.getElementById("exitFull").style.display = "none";
      // document.getElementById("enterFull").style.display = "initial";
      document.webkitExitFullscreen();
    }
  }
};

export const useHasChanged = (val) => {
  const prevVal = usePrevious(val);
  return prevVal !== val;
};

export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const getParamsObject = () => {
  let paramString = window.location.search.split("?").filter((e) => e.length > 0);
  let params = paramString[0].split("&");
  let paramObject = {};
  params.forEach((param) => {
    let keyAndValue = param.split("=").filter((e) => e.length > 0);
    paramObject[keyAndValue[0]] = keyAndValue[1];
  });
  return paramObject;
};

export const getSceneElementByName = (scene, name) => {
  if (scene.name === name) return scene;
  if (scene.getEngine().name === name) return scene.getEngine();

  if (scene.effects && scene.effects.name === name) return scene.effects;
  if (scene.effects && scene.effects.defaultRenderingPipeline && scene.effects.defaultRenderingPipeline.name === name)
    return scene.effects.defaultRenderingPipeline;
  if (scene.getMeshByName(name)) return scene.getMeshByName(name);
  if (scene.getTransformNodeByName(name)) return scene.getTransformNodeByName(name);
  if (scene.getLightByName(name)) return scene.getLightByName(name);
  if (scene.getSoundByName(name)) return scene.getSoundByName(name);
  if (scene.getCameraByName(name)) return scene.getCameraByName(name);
  if (scene.getMaterialByName(name)) return scene.getMaterialByName(name);
  if (scene.getTextureByName(name)) return scene.getTextureByName(name);
  if (scene.getAnimationGroupByName(name)) return scene.getAnimationGroupByName(name);
  if (scene.actions.hasOwnProperty(name)) return scene.actions[name];
  if (scene.controlNodes.hasOwnProperty(name)) return scene.controlNodes[name];
  if (scene.variables.hasOwnProperty(name)) return scene.variables[name];
  console.warn("couldn't find element :(", name);
  return null;
};

export const getSceneElementPropsByName = (scene, name) => {
  if (scene.name === name) return sceneProps;
  if (scene.getEngine().name === name) return engineProps;

  if (scene.effects && scene.effects.name === name) return effectsProps;
  if (scene.getTransformNodeByName(name)) return transformNodeProps;
  if (scene.getMeshByName(name) && typeof scene.getMeshByName(name).getDescendants === "function" && scene.getMeshByName(name).getDescendants(true).length)
    return transformNodeProps;
  if (scene.getMeshByName(name)) return meshProps;

  if (scene.getLightByName(name) && scene.getLightByName(name).getClassName() === "PointLight") return pointLightProps;
  if (scene.getLightByName(name) && scene.getLightByName(name).getClassName() === "DirectionalLight") return directionalLightProps;
  if (scene.getLightByName(name) && scene.getLightByName(name).getClassName() === "SpotLight") return spotLightProps;
  if (scene.getLightByName(name) && scene.getLightByName(name).getClassName() === "HemisphericLight") return hemisphericLightProps;
  if (scene.getSoundByName(name)) return soundProps;
  if (scene.getCameraByName(name) && scene.getCameraByName(name).getClassName() === "ArcRotateCamera") return arcRotateCameraProps;
  if (scene.getCameraByName(name) && scene.getCameraByName(name).getClassName() === "UniversalCamera") return universalCameraProps;
  if (scene.getMaterialByName(name) && scene.getMaterialByName(name).getClassName() === "PBRMaterial") return PBRMaterialProps;
  if (scene.getMaterialByName(name) && scene.getMaterialByName(name).getClassName() === "TransmissionMaterial") return transmissionMaterialProps;

  if (scene.getMaterialByName(name) && scene.getMaterialByName(name).getClassName() === "DiamondMaterial") return diamondMaterialProps;
  if (scene.getMaterialByName(name) && scene.getMaterialByName(name).getClassName() === "ShadowOnlyMaterial") return shadowOnlyMaterialProps;
  if (scene.getTextureByName(name) && scene.getTextureByName(name).getClassName() === "Texture") return textureProps;
  if (scene.getTextureByName(name) && scene.getTextureByName(name).getClassName() === "CubeTexture") return cubeTextureProps;

  if (scene.getTextureByName(name) && scene.getTextureByName(name).getClassName() === "HDRCubeTexture") return hdrCubeTextureProps;

  if (scene.getTextureByName(name) && scene.getTextureByName(name).getClassName() === "VideoTexture") return videoTextureProps;
  if (scene.getTextureByName(name) && scene.getTextureByName(name).getClassName() === "DynamicTexture") return dynamicTextureProps;
  if (scene.getAnimationGroupByName(name)) return animationGroupProps;
  if (scene.actions.hasOwnProperty(name)) return animationProps;
  if (scene.controlNodes.hasOwnProperty(name)) return controlNodeProps;
  if (scene.variables.hasOwnProperty(name)) return variableProps;
  console.warn("Couldn't find element :(", name);
  return null;
};

export const getProject = async (projectId) => {
  const db = getFirestore();
  const projectDoc = await getDoc(doc(db, "projects", projectId));

  if (!projectDoc.exists()) {
    throw new Error("Project not found");
  }
  return projectDoc.data();
};

export const getScene = async (sceneId) => {
  const db = getFirestore();
  const sceneDoc = await getDoc(doc(db, "scenes", sceneId));

  if (!sceneDoc.exists()) {
    throw new Error("Scene not found");
  }
  return sceneDoc.data();
};

export const getSceneUrlBySceneData = async (sceneData) => {
  let organizationId = sceneData.organizationId;
  let projectId = sceneData.projectId;
  let sceneHandle = sceneData.handle;

  const organizationData = await getOrganization(organizationId);

  const organizationHandle = organizationData.handle;

  const project = await getProject(projectId);

  const projectHandle = project.handle;

  return "https://app.badvisor.io/" + organizationHandle + "/" + projectHandle + "/" + sceneHandle;
};
