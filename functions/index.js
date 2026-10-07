const functions = require("firebase-functions");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const admin = require("firebase-admin");
admin.initializeApp();

const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const cors = require("cors");

const app = express();

app.use(cors({ origin: true }));

// New route to handle URLs with workspaceId, projectId, and sceneId

app.get("*", async (req, res) => {
  const filePath = path.join(__dirname, "build", "index.html");
  const data = await fs.readFile(filePath, "utf-8");
  try {
    const pathSegments = req.path.split("/").filter(Boolean); // Splits the path and removes empty segments

    // Attempt to extract workspaceId, projectId, and sceneId from the URL
    const [workspaceId, projectId, sceneId] = pathSegments;
    // Query Firestore for data

    if (!workspaceId || !projectId || !sceneId || projectId === "pages") {
      return res.send(data);
    }

    const scenesRef = admin.firestore().collection(`workspaces/${workspaceId}/scenes`);
    const querySnapshot = await scenesRef.where("handle", "==", sceneId).get();

    if (querySnapshot.empty) {
      return res.send(data);
    }

    // Assuming you want to use the first matching document
    const sceneDoc = querySnapshot.docs[0];
    const entryData = sceneDoc.data();

    // Replace content in HTML with data from Firestore
    let modifiedData = data
      .replace(/Badvisor.io/g, entryData.title || "Badvisor.io")
      .replace(/___THUMB___/g, entryData.preview || "")
      .replace(/The first all in one web 3D solution for any business/g, entryData.description || "The first all in one web 3D solution for any business");

    res.send(modifiedData);
  } catch (error) {
    console.error("Error:", error);
    res.sendStatus(500);
  }
});
app.use(express.static(path.join(__dirname, "build")));

// Define Google Cloud Function name
exports.webApi = functions.region("europe-west6").https.onRequest(app);
