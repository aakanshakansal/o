# Badvisor Viewer / Editor - Basic Functionalities

This project is a web application for creating, viewing, and presenting interactive 3D scenes built with React and Babylon.js. It supports both viewer and editor workflows, and can load scenes from a backend/content service, render them in a browser, and expose immersive experiences such as AR and VR.

## 1. Application entry and routing

The app is bootstrapped through the main router in `src/Router.jsx`.

- It initializes Firebase services for Firestore and Storage.
- It detects the current route and validates organization/workspace information.
- It supports routes for:
  - `/sandbox` and `/viewer` for testing and quick scene previews
  - `/:projectId` for a project-level scene
  - `/:userId/:projectId/:sceneId` for a specific scene
  - `/:userId/:projectId/:sceneId/ar` for AR mode
  - `/:userId/pages/:pageId` for page-based content
- It also includes a compatibility fallback for newer iOS devices that may have rendering stability issues.

## 2. Scene loading and startup flow

The main app logic in `src/App.jsx` loads scene data before the 3D experience starts.

- It reads dataset information from the URL and fetches the corresponding scene.
- It parses and normalizes raw scene data into the internal scene structure.
- It can show a password gate if the scene is protected.
- It can show a thumbnail preview before the actual scene start.
- It can detect missing or invalid scene data and show a not-found state.
- It supports analytics initialization if a GA4 ID is present.

## 3. 3D scene rendering engine

The core rendering is handled in `src/sceneComponents/Scene.jsx`.

- It creates and manages the Babylon.js engine.
- It chooses between WebGPU and WebGL rendering based on device capabilities.
- It supports custom font loading before scene start.
- It loads the scene into the Babylon.js engine via `initScene()`.
- It handles cleanup of previous scenes before loading a new one.
- It can initialize AR/VR related setup and face-tracking features when enabled.

## 4. Scene setup and generation

The scene logic is organized under `src/sceneFunctions`.

Key responsibilities include:

- initializing the engine and scene graph
- creating scene data and scene elements
- loading external assets and textures
- setting up runtime material controls
- applying scene configuration and state
- handling scene-ready events and post-message communication
- supporting safe expression evaluation inside scene logic

This allows the app to assemble complex 3D compositions from structured scene data instead of hard-coded scenes.

## 5. Editing capabilities

The editor is dynamically loaded when edit mode is requested or in sandbox mode.

- The project includes a modular editor under `src/modules/editor`.
- It provides node/element editing workflows, overlays, dialogs, and effects controls.
- It supports visual scene composition and manipulation of scene objects.
- It includes UI components for interactions like dropping content, confirmation dialogs, and editor overlays.

This makes the application usable not only as a viewer but also as a content-authoring tool.

## 6. Page-based publishing

The `src/modules/pages/Page.jsx` component allows publishing HTML-based pages that can embed or present 3D scenes and custom styling.

- It fetches page configuration from the backend.
- It applies metadata through `Helmet`.
- It renders page HTML and CSS dynamically.
- It listens for scene readiness messages so the page can coordinate with embedded content.

## 7. Firebase and backend integration

The app is connected to Firebase for data and storage access.

- Firestore is used to manage scene/workspace data.
- Storage is used to serve assets and scene resources.
- The app checks organization data and workspace versions.
- It supports both local development and deployed production configurations.

## 8. AR, VR, and device-aware behavior

The code includes device-aware functionality and immersive mode support.

- AR route support via `/ar` path
- VR button and AR button components in the scene UI
- JS-based detection for head tracking and associated face mesh support
- WebGPU/WebGL fallback selection depending on browser and platform
- iOS-specific guard logic to reduce compatibility issues on affected Safari builds

## 9. Supporting utilities and data layer

The app uses a provider pattern and helper utilities to manage shared state.

- `src/badProvider` provides global data/state for the app
- `src/helpers.js` contains utility functions for loading scene data, device checks, and route logic
- `src/constants.js` and other modules store static definitions used by the rendering pipeline

## 10. Overall purpose

In short, this codebase functions as:

- a 3D scene viewer
- a scene builder/editor
- a publishing platform for interactive experiences
- a content system backed by Firebase and structured scene data
- a web app that can work in desktop, mobile, AR, and VR contexts

It is designed for building and presenting immersive 3D experiences in a browser, while also allowing creators to edit the scene structure and assets through an interactive editor.
