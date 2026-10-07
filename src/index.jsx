import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import Router from "./Router";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import "./styles/App.scss";

import { Toaster } from "sonner";

import { createRoot } from "react-dom/client";
const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <HelmetProvider>
    <Toaster
      position="top-center"
      toastOptions={{
        className: "",
        style: {
          backgroundColor: "#111111",
          color: "#ffffff",
          borderColor: "#222222",
        },
      }}
    />
    <BrowserRouter basename="/">
      <Router />
    </BrowserRouter>
  </HelmetProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

// if (!window.location.search.indexOf("offline=true") !== -1) {
if (window.location.search.indexOf("cache=true") !== -1) {
  serviceWorkerRegistration.register();
} else {
  serviceWorkerRegistration.unregister();
}
