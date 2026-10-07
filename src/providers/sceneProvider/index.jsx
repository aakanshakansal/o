import { createContext, useReducer } from "react";
import SceneReducer from "./reducer";

export const SceneContext = createContext();

const SceneProvider = ({ children }) => {
  let initialState = {
    currentSceneIsLoading: true,
    loadingScreen: true,
    mainScene: null,
    mainSceneSnapshot: null,
    editorOverlay: null,
    editorState: "elements",
    activeGroups: [],
    editorTheme: "dark",
    viewportSize: "large",
    forceUpdate: true,
  };
  const [state, dispatch] = useReducer(SceneReducer, initialState);
  return <SceneContext.Provider value={{ state, dispatch }}>{children}</SceneContext.Provider>;
};

export default SceneProvider;
