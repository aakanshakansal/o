import { useCallback, useContext } from "react";
import { BadContext } from ".";
import {
  RESET_MAPPING,
  UPDATE_ACTIVE_GROUPS,
  UPDATE_COLLAPSED_NODES,
  UPDATE_CURRENT_SCENE,
  UPDATE_CURRENT_SCENE_IS_LOADING,
  UPDATE_DATA,
  UPDATE_EDITOR_OVERLAY,
  UPDATE_EDITOR_STATE,
  UPDATE_EDITOR_THEME,
  UPDATE_FORCEUPDATE,
  UPDATE_HIGHLIGHTED_MESH_BUTTON,
  UPDATE_IS_MAPPING_ACTIVE,
  UPDATE_LOADING_SCREEN,
  UPDATE_MAPPING_FIELD_TYPES,
  UPDATE_MAPPING_SOURCE,
  UPDATE_MAPPING_TARGET,
  UPDATE_MAPPING_TARGET_FRAME,
  UPDATE_OPEN_NODES,
  UPDATE_ORIGINAL_DATA,
  UPDATE_USER_ORGANIZATIONS,
  UPDATE_VIEWPORT_SIZE,
} from "../constants";

export const useCurrentSceneIsLoading = () => {
  const { state } = useContext(BadContext);
  return state.currentSceneIsLoading;
};

export const useUpdateCurrentSceneIsLoading = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_CURRENT_SCENE_IS_LOADING,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useLoadingScreen = () => {
  const { state } = useContext(BadContext);
  return state.loadingScreen;
};

export const useUpdateLoadingScreen = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_LOADING_SCREEN,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useCurrentScene = () => {
  const { state } = useContext(BadContext);
  return state.currentScene;
};

export const useUpdateCurrentScene = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_CURRENT_SCENE,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useEditorOverlay = () => {
  const { state } = useContext(BadContext);
  return state.editorOverlay;
};

export const useUpdateEditorOverlay = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_EDITOR_OVERLAY,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useEditorState = () => {
  const { state } = useContext(BadContext);
  return state.editorState;
};

export const useUpdateEditorState = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_EDITOR_STATE,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useActiveGroups = () => {
  const { state } = useContext(BadContext);
  return state.activeGroups;
};

export const useUpdateActiveGroups = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_ACTIVE_GROUPS,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useEditorTheme = () => {
  const { state } = useContext(BadContext);
  return state.editorTheme;
};

export const useUpdateEditorTheme = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_EDITOR_THEME,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useViewportSize = () => {
  const { state } = useContext(BadContext);
  return state.viewportSize;
};

export const useUpdateViewportSize = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_VIEWPORT_SIZE,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

//   export const useForceUpdate = () => {
//     const { state } = useContext(BadContext);
//     return state.editorTheme;
//   };

export const useUpdateForceUpdate = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(() => {
    dispatch({
      type: UPDATE_FORCEUPDATE,
      payload: null,
    });
  }, [dispatch]);

  return update;
};

export const useUserOrganizations = () => {
  const { state } = useContext(BadContext);
  return state.userOrganizations;
};

export const useUpdateUserOrganizations = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_USER_ORGANIZATIONS,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useOpenNodes = () => {
  const { state } = useContext(BadContext);
  return state.openNodes;
};

export const useUpdateOpenNodes = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_OPEN_NODES,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useHighlightedMeshButton = () => {
  const { state } = useContext(BadContext);
  return state.highlightedMeshButton;
};

export const useUpdateHighlightedMeshButton = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_HIGHLIGHTED_MESH_BUTTON,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useCollapsedNodes = () => {
  const { state } = useContext(BadContext);
  return state.collapsedNodes;
};

export const useUpdateCollapsedNodes = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_COLLAPSED_NODES,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useData = () => {
  const { state } = useContext(BadContext);
  return state.data;
};

export const useUpdateData = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_DATA,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useOriginalData = () => {
  const { state } = useContext(BadContext);
  return state.originalData;
};

export const useUpdateOriginalData = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_ORIGINAL_DATA,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useIsMappingActive = () => {
  const { state } = useContext(BadContext);
  return state.isMappingActive;
};

export const useUpdateIsMappingActive = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_IS_MAPPING_ACTIVE,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useMappingSource = () => {
  const { state } = useContext(BadContext);
  return state.mappingSource;
};

export const useUpdateMappingSource = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_MAPPING_SOURCE,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useMappingTarget = () => {
  const { state } = useContext(BadContext);
  return state.mappingTarget;
};

export const useUpdateMappingTarget = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_MAPPING_TARGET,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useMappingTargetFrame = () => {
  const { state } = useContext(BadContext);
  return state.mappingTargetFrame;
};

export const useUpdateMappingTargetFrame = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_MAPPING_TARGET_FRAME,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useMappingFieldTypes = () => {
  const { state } = useContext(BadContext);
  return state.mappingFieldTypes;
};

export const useUpdateMappingFieldTypes = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(
    (payload) => {
      dispatch({
        type: UPDATE_MAPPING_FIELD_TYPES,
        payload,
      });
    },
    [dispatch]
  );

  return update;
};

export const useResetMapping = () => {
  const { dispatch } = useContext(BadContext);

  const update = useCallback(() => {
    dispatch({
      type: RESET_MAPPING,
    });
  }, [dispatch]);

  return update;
};
