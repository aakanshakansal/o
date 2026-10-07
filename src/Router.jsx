import { useEffect, useState } from "react";
import { Route, Switch } from "react-router";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";

// import Editor from "./Editor";

import Page from "./modules/pages/Page";

//import { getAnalytics } from "firebase/analytics";

//import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, doc, getDoc, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import BadProvider from "./badProvider";
import { getOrganizationId, postToParentWindow } from "./helpers";
const isLocalhost = true;
export const storageUrl = isLocalhost ? "http://127.0.0.1:9199/cdn.badvisor.io" : "https://cdn.badvisor.io";

export const functionsUrl = isLocalhost ? "http://127.0.0.1:5001/badvisor/europe-west6" : "https://europe-west6-badvisor.cloudfunctions.net";

export const adminApiUrl = isLocalhost ? "http://localhost:3000/api" : "https://badvisor-makerkit.vercel.app/api";

export const app = initializeApp(
  isLocalhost
    ? {
        apiKey: "AIzaSyAAqU_euGAMtJoXp0sECblAIndifCp0pmE",
        authDomain: "localhost",
        projectId: "badvisor",
        storageBucket: "cdn.badvisor.io",
        messagingSenderId: "692339716163",
        appId: "1:981813564016:web:f13148231721fcd0ee5ab5",
      }
    : {
        apiKey: "AIzaSyDS_n2bp3gAsDwICbmCHjpWweRdrX2E5aU",
        authDomain: "admin.badvisor.io",
        databaseURL: "https://badvisor-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "badvisor",
        storageBucket: "badvisor.appspot.com",
        messagingSenderId: "692339716163",
        appId: "1:692339716163:web:95844f097a8584c318a4f6",
        measurementId: "G-6MCM3C3XYM",
      },
);
// export const analytics = getAnalytics(app);
export const badDB = getFirestore(app);
export const badStorage = getStorage(app);

if (isLocalhost) {
  connectFirestoreEmulator(badDB, "127.0.0.1", 8080);
  connectStorageEmulator(badStorage, "127.0.0.1", 8080);
}

// ─── iOS 26.5+ compatibility gate ────────────────────────────────────────────
// Three WebKit regressions in iOS/iPadOS 26.5 (shader NaN rejection, VRAM cap
// reduction, stricter SOP on navigation) can hard-crash the 3D engine.
// Show a graceful fallback until fixes are fully validated in production.
// To lift the gate for all users: set window.BADVISOR_IOS_FIX_DEPLOYED = true
// before this script executes (e.g. in your embedding HTML).
const _iosVersionMatch = navigator.userAgent.match(/OS (\d+)_(\d+)/);
const _iosMajor = _iosVersionMatch ? parseInt(_iosVersionMatch[1], 10) : 0;
const _iosMinor = _iosVersionMatch ? parseInt(_iosVersionMatch[2], 10) : 0;
export const isAffectedIOS26 = _iosMajor > 26 || (_iosMajor === 26 && _iosMinor >= 5);

const EngineCompatibilityFallback = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f1f1f1",
      fontFamily: "sans-serif",
      gap: "1.2em",
      padding: "2em",
      textAlign: "center",
    }}
  >
    <img src="/assets/logotext.png" alt="logo" style={{ width: "120px", opacity: 0.65 }} />
    <div style={{ fontSize: "0.88em", color: "#555", maxWidth: "300px", lineHeight: 1.65 }}>Optimising your 3D experience for this device&hellip;</div>
    <div
      style={{
        width: "30px",
        height: "30px",
        border: "3px solid #d0d0d0",
        borderTop: "3px solid #555",
        borderRadius: "50%",
        animation: "_bvSpin 1s linear infinite",
      }}
    />
    <style>{`@keyframes _bvSpin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AppRouter = (props) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.location.pathname === "/sandbox" || window.location.pathname === "/viewer") {
      setReady(true);
      window.organizationId = null;
    } else {
      getOrganizationId(window.location.pathname.split("/")[1]).then((organizationId) => {
        if (!organizationId) {
          const wsRef = doc(badDB, "workspaces", window.location.pathname.split("/")[1]);

          getDoc(wsRef).then((doc) => {
            if (doc.data().version === "2") {
              return (window.location.href = "https://badvisor-v2.web.app" + window.location.pathname + window.location.search);
            }
          });
        } else {
          window.organizationId = organizationId;
          setReady(true);
        }
      });
    }
    postToParentWindow({ type: "appHasStarted" });
  }, []);
  const isDevPath = window.location.search.includes("editmode=true") || window.location.pathname === "/sandbox" || window.location.pathname === "/viewer";

  if (isAffectedIOS26 && !window.BADVISOR_IOS_FIX_DEPLOYED && !isDevPath) {
    return <EngineCompatibilityFallback />;
  }

  return ready ? (
    <>
      <BadProvider>
        <Router>
          <Switch>
            <Route
              exact
              path="/:userId/pages/:pageId"
              render={(props) => {
                return <Page {...props} />;
              }}
            />

            <Route
              exact
              path="/sandbox"
              render={(props) => {
                return <App {...props} />;
              }}
            />

            <Route
              exact
              path="/viewer"
              render={(props) => {
                return <App {...props} />;
              }}
            />

            <Route
              exact
              path="/:projectId"
              render={(props) => {
                return <App {...props} />;
              }}
            />
            <Route
              exact
              path="/:userId/:projectId/:sceneId"
              render={(props) => {
                return <App {...props} />;
              }}
            />
            <Route
              exact
              path="/:userId/:projectId/:sceneId/ar"
              render={(props) => {
                return <App {...props} />;
              }}
            />
          </Switch>
        </Router>
      </BadProvider>
    </>
  ) : null;
};

export default AppRouter;
