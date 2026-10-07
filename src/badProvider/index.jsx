import { createContext, useMemo, useReducer } from "react";
import BadReducer from "./reducer";

export const BadContext = createContext();

const BadProvider = ({ children }) => {
  const [state, dispatch] = useReducer(BadReducer, {
    currentSceneIsLoading: true,
    loadingScreen: true,
    currentScene: null,
    editorOverlay: null,
    editorState: "outliner",
    activeGroups: [],
    editorTheme: "dark",
    viewportSize: "large",
    forceUpdate: true,
    userOrganizations: [window.location.pathname.split("/")[1]],
    openNodes: {},
    highlightedMeshButton: null,
    collapsedNodes: [],
    data: null,
    originaldata: null,
    isMappingActive: false,
    mappingSource: null,
    mappingTarget: null,
    mappingTargetFrame: null,
    mappingFieldTypes: [],
  });

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );

  return <BadContext.Provider value={contextValue}>{children}</BadContext.Provider>;
};

export default BadProvider;
