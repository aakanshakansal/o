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

const BadReducer = (state, action) => {
  const { payload, type } = action;
  switch (type) {
    case UPDATE_CURRENT_SCENE_IS_LOADING:
      return {
        ...state,
        currentSceneIsLoading: payload,
      };

    case UPDATE_LOADING_SCREEN:
      return {
        ...state,
        loadingScreen: payload,
      };
    case UPDATE_CURRENT_SCENE:
      return {
        ...state,
        currentScene: payload,
      };

    case UPDATE_EDITOR_OVERLAY:
      return {
        ...state,
        editorOverlay: payload,
      };

    case UPDATE_EDITOR_STATE:
      return {
        ...state,
        editorState: payload,
      };

    case UPDATE_VIEWPORT_SIZE:
      return {
        ...state,
        viewportSize: payload,
      };

    case UPDATE_ACTIVE_GROUPS:
      return {
        ...state,
        activeGroups: payload,
      };

    case UPDATE_EDITOR_THEME:
      return {
        ...state,
        editorTheme: payload,
      };

    case UPDATE_FORCEUPDATE:
      return {
        ...state,
        forceUpdate: !state.forceUpdate,
      };

    case UPDATE_OPEN_NODES:
      return {
        ...state,
        openNodes: payload,
      };
    case UPDATE_HIGHLIGHTED_MESH_BUTTON:
      return {
        ...state,
        highlightedMeshButton: payload,
      };

    case UPDATE_USER_ORGANIZATIONS:
      return {
        ...state,
        userOrganizations: payload,
      };
    case UPDATE_COLLAPSED_NODES:
      return {
        ...state,
        collapsedNodes: payload,
      };

    case UPDATE_DATA:
      return {
        ...state,
        data: payload,
      };

    case UPDATE_ORIGINAL_DATA:
      return {
        ...state,
        data: payload,
      };

    case UPDATE_IS_MAPPING_ACTIVE:
      return {
        ...state,
        isMappingActive: payload,
      };
    case UPDATE_MAPPING_SOURCE:
      return {
        ...state,
        mappingSource: payload,
      };
    case UPDATE_MAPPING_TARGET:
      return {
        ...state,
        mappingTarget: payload,
      };
    case UPDATE_MAPPING_TARGET_FRAME:
      return {
        ...state,
        mappingTargetFrame: payload,
      };

    case UPDATE_MAPPING_FIELD_TYPES:
      return {
        ...state,
        mappingFieldTypes: payload,
      };

    case RESET_MAPPING:
      return {
        ...state,
        isMappingActive: false,
        mappingSource: null,
        mappingTarget: null,
        mappingFieldTypes: [],
      };

    default:
      return state;
  }
};

export default BadReducer;
