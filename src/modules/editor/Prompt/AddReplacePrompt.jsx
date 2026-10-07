import { Button, Checkbox, Chip, InputAdornment, MenuItem, Select, Stack, TextField, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { storageUrl } from "../../../Router";
import { delDeep, getDeep, getOrganizationScenes, getSceneUrlBySceneData, parseSceneData, setDeep } from "../../../helpers";
import { Card } from "../Components/Card";
import Marqueeno from "../Marqueeno";

import SearchIcon from "@mui/icons-material/Search";
import merge from "deepmerge";
import { useCurrentScene, useUserOrganizations } from "../../../badProvider/functions";
import { badvisorOrganizationId } from "../../../constants";
import { createSceneData } from "../../../sceneFunctions/createSceneData";
export function AddReplacePrompt(props) {
  const theme = useTheme();
  const scene = useCurrentScene();
  const userOrganizations = useUserOrganizations();
  const [organizationId, setOrganizationId] = useState(props.options.organizationId || window.organizationId);

  const [selected, setSelected] = useState([]);
  const [tagsToggler, setTagsToggler] = useState(false);

  const [attachmentScenesAccordion, setAttachmentScenesAccordion] = useState([]);

  // switch on the top to toggle libraries

  // total scenes
  const [loadingScenes, setLoadingScenes] = useState(true);
  const [allScenes, setAllScenes] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [tags, setTags] = useState([]);
  const [excludedTags, setExcludedTags] = useState([]);
  const [preTags, setPreTags] = useState(props.options.preTags?.split(",").map((t) => t.trim()) || []);
  const [selectedTags, setSelectedTags] = useState([]);

  const superTags = ["Overlay", "Scene", "Material"];

  const [sortBy, setSortBy] = useState("createdAt");

  const [dataToMerge, setDataToMerge] = useState(props.options?.settings?.dataToMerge || { add: {}, replace: {} });

  function dataBuilder(path, checked, mode) {
    const selectedScene = selected[0];
    const selectedSceneData = JSON.parse(selectedScene.data);

    if (selectedSceneData && path) {
      setDataToMerge((prev) => {
        const updatedAdd = { ...prev.add };
        const updatedReplace = { ...prev.replace };

        if (mode === "add") {
          if (checked) {
            setDeep(updatedAdd, path, getDeep(selectedSceneData, path));
            delDeep(updatedReplace, path);

            const root = path.split(".")[0];

            if (root && updatedReplace[root] !== undefined) {
              delete updatedReplace[root];
            }
          } else {
            delDeep(updatedAdd, path);
          }
        }

        if (mode === "replace") {
          if (checked) {
            setDeep(updatedReplace, path, getDeep(selectedSceneData, path));
            delDeep(updatedAdd, path);

            const root = path.split(".")[0];

            if (root && updatedAdd[root] !== undefined) {
              delete updatedAdd[root];
            }
          } else {
            delDeep(updatedReplace, path);
          }
        }

        // NORMALIZE ADDS
        if (updatedAdd.nodes) delete updatedAdd.nodes;
        if (updatedAdd.assets) {
          updatedAdd.nodes = {};

          if (updatedAdd.materials === undefined) {
            updatedAdd.materials = {};
          }

          if (updatedAdd.textures === undefined) {
            updatedAdd.textures = {};
          }
          Object.entries(updatedAdd.assets).map(([k, v]) => {
            Object.entries(selectedSceneData.nodes).map(([k1, v1]) => {
              if (v1.fromAsset && v1.fromAsset === k) {
                updatedAdd.nodes[k1] = v1;
                if (updatedReplace.nodes?.[k1]) delete updatedReplace.nodes[k1];
              }

              if (k === k1) {
                updatedAdd.nodes[k1] = v1;
                if (updatedReplace.nodes?.[k1]) delete updatedReplace.nodes[k1];
              }
            });

            Object.entries(selectedSceneData.materials).map(([k1, v1]) => {
              if (v1.fromAsset && v1.fromAsset === k) {
                updatedAdd.materials[k1] = v1;
                if (updatedReplace.materials?.[k1]) delete updatedReplace.materials[k1];
              }
            });

            Object.entries(selectedSceneData.textures).map(([k1, v1]) => {
              if (v1.fromAsset && v1.fromAsset === k) {
                updatedAdd.textures[k1] = v1;
                if (updatedReplace.textures?.[k1]) delete updatedReplace.textures[k1];
              }
            });
          });
        }

        if (updatedAdd.nodes) {
          Object.entries(updatedAdd.nodes).map(([k, v]) => {
            if (v.material && selectedSceneData.materials[v.material]) {
              updatedAdd.materials[v.material] = selectedSceneData.materials[v.material];
              if (updatedReplace.materials?.[v.material]) delete updatedReplace.materials[v.material];
            }
          });
        }

        if (updatedAdd.materials) {
          Object.entries(updatedAdd.materials).map(([k, v]) => {
            Object.entries(v).forEach(([k1, v1]) => {
              if (k1.includes("Texture")) {
                if (updatedAdd.textures === undefined) {
                  updatedAdd.textures = {};
                }
                if (updatedReplace?.textures?.[v1]) {
                  delete updatedReplace.textures[v1];
                }
                updatedAdd.textures[v1] = selectedSceneData.textures[v1];
              }
            });
          });
        }

        // NORMALIZE REPLACES
        if (updatedReplace.nodes) delete updatedReplace.nodes;
        if (updatedReplace.assets) {
          updatedReplace.nodes = {};

          if (updatedReplace.materials === undefined) {
            updatedReplace.materials = {};
          }

          if (updatedReplace.textures === undefined) {
            updatedReplace.textures = {};
          }

          Object.entries(updatedReplace.assets).map(([k, v]) => {
            Object.entries(selectedSceneData.nodes).map(([k1, v1]) => {
              if (v1.fromAsset && v1.fromAsset === k) {
                updatedReplace.nodes[k1] = v1;
                if (updatedAdd.nodes?.[k1]) delete updatedAdd.nodes[k1];
              }

              if (k === k1) {
                updatedReplace.nodes[k1] = v1;
                if (updatedAdd.nodes?.[k1]) delete updatedAdd.nodes[k1];
              }
            });

            Object.entries(selectedSceneData.materials).map(([k1, v1]) => {
              if (v1.fromAsset && v1.fromAsset === k) {
                updatedReplace.materials[k1] = v1;
                if (updatedAdd.materials?.[k1]) delete updatedAdd.materials[k1];
              }
            });

            Object.entries(selectedSceneData.textures).map(([k1, v1]) => {
              if (v1.fromAsset && v1.fromAsset === k) {
                updatedReplace.textures[k1] = v1;
                if (updatedAdd.textures?.[k1]) delete updatedAdd.textures[k1];
              }
            });
          });
        }

        if (updatedReplace.nodes) {
          Object.entries(updatedReplace.nodes).map(([k, v]) => {
            if (v.material && selectedSceneData.materials[v.material]) {
              updatedReplace.materials[v.material] = selectedSceneData.materials[v.material];
              if (updatedAdd.materials?.[v.material]) delete updatedAdd.materials[v.material];
            }
          });
        }

        if (updatedReplace.materials) {
          Object.entries(updatedReplace.materials).map(([k, v]) => {
            Object.entries(v).forEach(([k1, v1]) => {
              if (k1.includes("Texture")) {
                if (updatedReplace.textures === undefined) {
                  updatedReplace.textures = {};
                }
                if (updatedAdd?.textures?.[v1]) {
                  delete updatedAdd.textures[v1];
                }
                updatedReplace.textures[v1] = selectedSceneData.textures[v1];
              }
            });
          });
        }

        return {
          ...prev,
          add: updatedAdd,
          replace: updatedReplace,
        };
      });
    }
  }

  const sortByChange = (event) => {
    setSortBy(event.target.value);
  };

  const setUserScenes = async () => {
    let userScenes = await getOrganizationScenes(organizationId);

    if (!userScenes.error) {
      if (props.options.settings?.id) {
        const scenes = userScenes.filter((s) => s.id === props.options.settings.id);
        if (scenes.length) {
          setSelected([scenes[0]]);
        }
      }

      if (organizationId === badvisorOrganizationId) {
        // userScenes = userScenes.filter((s) => {
        //   if (
        //     s.tags &&
        //     s.tags.split(",") &&
        //     s.tags
        //       .split(",")
        //       .map((t) => t.trim())
        //       .includes("enabled")
        //   ) {
        //     return true;
        //   }
        //   return false;
        // });

        userScenes = userScenes.filter((s) => {
          if (s.published) {
            return true;
          }
          return false;
        });

        if (preTags.length) {
          userScenes = userScenes.filter((s) => {
            return preTags.some((preT) => {
              if (
                s.tags &&
                s.tags.split(",") &&
                s.tags
                  .split(",")
                  .map((t) => t.trim())
                  .includes(preT)
              ) {
                return true;
              }
              return false;
            });
          });
        }
      }

      setLoadingScenes(false);
      setScenes(userScenes);
      setAllScenes(userScenes);
    }
  };

  useEffect(() => {
    setSelectedTags([]);
    // setDataToMerge({ add: {}, replace: {} });
    setLoadingScenes(true);
    setUserScenes();
  }, [props, organizationId]);

  useEffect(() => {
    //  setDataToMerge({ add: {}, replace: {} });
  }, [props, selected]);

  const search = (e) => {
    setSearchString(e.target.value);
  };

  useEffect(() => {
    let tags = [];

    allScenes.forEach((s) => {
      let sTags = s.tags ? s.tags.split(",").map((t) => t.trim()) : null;
      if (!sTags) return;
      if (organizationId === badvisorOrganizationId) {
        if (!sTags.includes("enabled")) return;
      }
      sTags.forEach((t) => {
        const tag = t.trim();
        if (!tags.includes(tag) && !preTags.includes(tag)) {
          if (tag === "enabled") return;
          tags.push(tag);
        }
      });
    });

    setTags(tags);
  }, [allScenes]);

  useEffect(() => {
    let tempScenes = allScenes.filter((a) => a.name?.toLowerCase().includes(searchString.toLowerCase()));

    let includedScenes = selectedTags.length > 0 ? tempScenes.filter((s) => s?.tags && selectedTags.every((tag) => s.tags.includes(tag))) : tempScenes;

    let excludedScenes =
      excludedTags.length > 0 ? includedScenes.filter((s) => !s?.tags || excludedTags.every((tag) => !s.tags.includes(tag))) : includedScenes;

    setScenes(excludedScenes);
  }, [selectedTags, excludedTags, searchString]);

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  // useEffect(() => {
  //   if (selected.length && selected[0].project_id && typeof selected[0].project_id === "string") {
  //     let projectId = selected[0].project_id;

  //     getSceneProjectHandle(organizationId, projectId).then((res) => setWorkspaceHandle(res));
  //   }
  // }, [selected]);

  return (
    <div
      onMouseLeave={() => {
        // const handleClick = () => {
        //   scene.openPrompt(null);
        //   document.removeEventListener("click", handleClick);
        // };
        // document.addEventListener("click", handleClick);
      }}
      className="promptInner node"
      style={{
        height: "95vh",
        width: "90vw",
        margin: "0 auto",
        overflow: "hidden",
      }}
    >
      <div className="nodeInner" style={{ height: "100%", padding: 0, width: "100%", background: theme.palette.background.default }}>
        <div
          style={{
            height: "calc(100% - 4em)",
            display: "flex",
            justifyContent: "flex-start",
            width: "100%",

            borderRadius: "0.5em",
          }}
        >
          <div style={{ width: selected.length ? "calc(100% - 360px)" : "100%" }}>
            {!loadingScenes ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "calc(100% - 1em)",
                  margin: "1em",
                  padding: "0.5em 1em 1em 1em",

                  borderRadius: "0.5em",
                  background: theme.palette.background.default,
                }}
              >
                <span style={{ width: "100%", marginBottom: "0.5em", color: theme.palette.green.main }}>Add / Replace from Scene</span>

                <div style={{ display: "flex", gap: "0.5em", marginBottom: "0.5em", justifyContent: "space-between", alignItems: "center" }}>
                  {userOrganizations ? (
                    <>
                      {" "}
                      <span style={{ whiteSpace: "nowrap" }}>Organization's Library:</span>{" "}
                      <Select
                        sx={{ backgroundColor: theme.palette.background.light }}
                        id="orgSelector"
                        value={organizationId}
                        style={{
                          width: "200px",

                          borderRadius: "0.5em",
                          padding: "0 1em",
                        }}
                        onChange={(e) => {
                          setOrganizationId(e.target.value);
                        }}
                        disableunderline="true"
                      >
                        {userOrganizations.map((org) => {
                          return (
                            <MenuItem key={org.id} id={org.id} value={org.id}>
                              {org.name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </>
                  ) : null}

                  <button
                    style={{ minWidth: "160px" }}
                    className={"FunctionButton " + (organizationId === badvisorOrganizationId ? "active" : "")}
                    onClick={() => setOrganizationId(badvisorOrganizationId)}
                  >
                    Badvisor's Library
                  </button>

                  {allScenes.length > 0 && (
                    <>
                      <IconTextField
                        placeholder="Search"
                        className="search"
                        iconStart={<SearchIcon fontSize="small" />}
                        onChange={search}
                        style={{
                          borderRadius: "0.5em",
                        }}
                        InputProps={{
                          style: {
                            backgroundColor: theme.palette.background.light,
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                        }}
                      />

                      <Select
                        sx={{ backgroundColor: theme.palette.background.light }}
                        value={sortBy || "createdAt"}
                        style={{
                          //  width: "120px",

                          borderRadius: "0.5em",
                          padding: "0 1em",
                        }}
                        onChange={sortByChange}
                        disableunderline="true"
                      >
                        <MenuItem value={"alphabetically"}>A-Z</MenuItem>
                        <MenuItem value={"createdAt"}>Creation Date</MenuItem>
                      </Select>

                      {tags.length ? (
                        <Button
                          style={{
                            color: !tagsToggler ? theme.palette.text.primary : theme.palette.black.main,
                            width: "auto",
                            outline: "none",
                            background: tagsToggler ? theme.palette.primary.main : theme.palette.background.light,
                          }}
                          onClick={() => {
                            setTagsToggler(!tagsToggler);
                          }}
                        >
                          <span className="material-symbols-outlined">filter_list</span>
                        </Button>
                      ) : null}
                    </>
                  )}
                </div>

                {organizationId === badvisorOrganizationId ? (
                  <Stack
                    direction="row"
                    style={{
                      gap: "0.5em",
                      marginBottom: "1em",
                      flexShrink: 0,
                      flexWrap: "wrap",
                      maxHeight: "220px",
                      overflow: "auto",
                    }}
                  >
                    {tags
                      .filter((tag) => superTags.includes(tag.trim()))
                      .map((tag, i) => {
                        return (
                          <Chip
                            color={selectedTags.includes(tag) || excludedTags.includes(tag) ? "primary" : "default"}
                            style={{
                              backgroundColor:
                                selectedTags.includes(tag) || excludedTags.includes(tag) ? theme.palette.green.main : theme.palette.background.light,

                              textDecoration: excludedTags.includes(tag) ? "line-through" : "none",

                              padding: "1em",
                              height: "3em",

                              borderRadius: "0.5em",
                            }}
                            key={i}
                            label={tag + "s"}
                            size="small"
                            className={tag ? "active" : ""}
                            onClick={() => {
                              if (!selectedTags.includes(tag) && !excludedTags.includes(tag)) {
                                setSelectedTags((prevSelectedTags) => {
                                  const updatedSelectedTags = [...prevSelectedTags, tag];

                                  return updatedSelectedTags;
                                });
                              } else if (selectedTags.includes(tag)) {
                                setSelectedTags((prevSelectedTags) => prevSelectedTags.filter((t) => t !== tag));
                                setExcludedTags((prevExcludedTags) => {
                                  const updatedExcludedTags = [...prevExcludedTags, tag];
                                  return updatedExcludedTags;
                                });
                              } else if (excludedTags.includes(tag)) {
                                setExcludedTags((prevExcludedTags) => {
                                  const updatedExcludedTags = prevExcludedTags.filter((t) => t !== tag);
                                  return updatedExcludedTags;
                                });
                              }
                            }}
                          />
                        );
                      })}
                  </Stack>
                ) : null}

                {tagsToggler && tags ? (
                  <Stack
                    direction="row"
                    style={{
                      height: tagsToggler ? "auto" : "0",
                      gap: "0.5em",
                      marginBottom: "1em",
                      flexShrink: 0,
                      flexWrap: "wrap",
                      maxHeight: "220px",
                      overflow: "auto",
                    }}
                  >
                    {tags.map((tag, i) => {
                      if (organizationId === badvisorOrganizationId && superTags.includes(tag.trim())) return null;
                      return (
                        <Chip
                          color={selectedTags.includes(tag) || excludedTags.includes(tag) ? "primary" : "default"}
                          style={{
                            backgroundColor:
                              selectedTags.includes(tag) || excludedTags.includes(tag) ? theme.palette.green.main : theme.palette.background.light,

                            textDecoration: excludedTags.includes(tag) ? "line-through" : "none",
                          }}
                          key={i}
                          label={tag}
                          size="small"
                          className={tag ? "active" : ""}
                          onClick={() => {
                            if (!selectedTags.includes(tag) && !excludedTags.includes(tag)) {
                              setSelectedTags((prevSelectedTags) => {
                                const updatedSelectedTags = [...prevSelectedTags, tag];

                                return updatedSelectedTags;
                              });
                            } else if (selectedTags.includes(tag)) {
                              setSelectedTags((prevSelectedTags) => prevSelectedTags.filter((t) => t !== tag));
                              setExcludedTags((prevExcludedTags) => {
                                const updatedExcludedTags = [...prevExcludedTags, tag];
                                return updatedExcludedTags;
                              });
                            } else if (excludedTags.includes(tag)) {
                              setExcludedTags((prevExcludedTags) => {
                                const updatedExcludedTags = prevExcludedTags.filter((t) => t !== tag);
                                return updatedExcludedTags;
                              });
                            }
                          }}
                        />
                      );
                    })}
                  </Stack>
                ) : null}

                <Stack style={{ display: "flex", gap: "0.5em", flexWrap: "wrap", flexDirection: "row", marginBottom: "0.5em" }}>
                  {selectedTags.length
                    ? selectedTags.map((tag, i) => {
                        if (superTags.includes(tag.trim()) && organizationId === badvisorOrganizationId) return null;
                        return (
                          <Chip
                            color={selectedTags.includes(tag) || excludedTags.includes(tag) ? "primary" : "default"}
                            style={{
                              width: "auto",
                              backgroundColor: selectedTags.includes(tag) ? theme.palette.green.main : null,
                            }}
                            key={i}
                            label={tag}
                            size="small"
                            className={tag ? "active" : ""}
                            onClick={() => {
                              let newTags = selectedTags.filter((t) => t !== tag);
                              setSelectedTags(newTags);
                            }}
                          />
                        );
                      })
                    : null}
                  {excludedTags.length
                    ? excludedTags.map((tag, i) => {
                        if (superTags.includes(tag.trim()) && organizationId === badvisorOrganizationId) return null;
                        return (
                          <Chip
                            color={selectedTags.includes(tag) || excludedTags.includes(tag) ? "primary" : "default"}
                            style={{
                              textDecoration: "line-through",
                              width: "auto",
                              backgroundColor: excludedTags.includes(tag) ? theme.palette.green.main : null,
                            }}
                            key={i}
                            label={tag}
                            size="small"
                            className={tag ? "active" : ""}
                            onClick={() => {
                              let newTags = excludedTags.filter((t) => t !== tag);
                              setExcludedTags(newTags);
                            }}
                          />
                        );
                      })
                    : null}
                </Stack>
                <div style={{ paddingBottom: "0.5em" }}>Total Scenes: {scenes && <span>{scenes.length}</span>}</div>
                {scenes.length > 0 ? (
                  <div className="promptCardContainer">
                    {scenes
                      .sort((a, b) => (sortBy === "alphabetically" ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : 0))
                      .sort((a, b) => (sortBy === "createdAt" ? (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) : 0))
                      .map((s, i) => {
                        return (
                          <Card
                            gradient={false}
                            key={i}
                            style={{
                              color: selected.some((item) => item.id === s.id) ? theme.palette.green.default : theme.palette.light.main,
                              outline: selected.some((item) => item.id === s.id) ? "solid" : "",
                            }}
                            onClick={(e) => {
                              if (selected[0] && selected[0].id !== s.id) {
                                // setAttachmentScenesAccordion("");
                                setDataToMerge({ add: {}, replace: {} });
                              }

                              if (s.data && JSON.parse(s.data)) {
                                if (selected.length && selected[0] === s) {
                                  setSelected([]);
                                } else {
                                  setSelected([s]);
                                }
                              }
                            }}
                            image={
                              s.preview && s.preview.startsWith("/") ? (
                                <LazyLoadImage
                                  src={storageUrl + s.preview}
                                  alt={s.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    opacity: selected.length == 0 || selected.some((item) => item.id === s.id) ? 0.9 : 0.3,
                                  }}
                                  placeholder={
                                    <div
                                      style={{
                                        opacity: selected.length == 0 || selected.some((item) => item.id === s.id) ? 0.9 : 0.3,
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        // background: "#bbda55d8",
                                      }}
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: "1.65em", color: theme.palette.white.main }}>
                                        draft
                                      </span>
                                    </div>
                                  }
                                />
                              ) : (
                                <div
                                  style={{
                                    opacity: selected.length == 0 || selected.some((item) => item.id === s.id) ? 0.9 : 0.3,
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    // background: "#bbda55d8",
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: "1.65em", color: theme.palette.white.main }}>
                                    draft
                                  </span>
                                </div>
                              )
                            }
                            title={s.name}
                          />
                        );
                      })}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", margin: "1em 0 0.5em 0" }}>No Scenes :(</div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", marginTop: "16em" }}>Loading...</div>
            )}
          </div>
          {selected.length ? <PromptSidebar /> : null}
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", height: "1.6em", padding: "1.6em 1em" }}>
          <Button
            color="red"
            style={{ width: "auto" }}
            onClick={() => {
              if (props.options.cancel) {
                props.options.cancel();
              }
            }}
          >
            Cancel
          </Button>

          {selected.length ? (
            <Button variant="contained" disabled={!selected.length} style={{ width: "auto" }} onClick={onConfirm()}>
              Confirm
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );

  function PromptSidebar() {
    return (
      <div
        style={{
          width: "360px",
          overflow: "auto",
          margin: "1em 1em 0 0",
          borderRadius: "0.5em",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignContent: "flex-start",
          flexShrink: 0,
          background: theme.palette.background.default,
          boxSizing: "border-box",
        }}
      >
        <strong
          style={{
            width: "100%",
            padding: "1em",
            textAlign: "center",
          }}
        >
          Attachment Details
        </strong>
        <div style={{ overflow: "auto", height: "100%", padding: "0 1em" }}>
          {selected.map((s, i) => {
            return (
              <div
                key={i}
                style={{
                  borderRadius: "0.5em",
                  background: theme.palette.background.default,
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                  padding: "1em",
                  gap: "1em",
                  marginBottom: "1em",
                  position: "relative",
                }}
              >
                {/* <ButtonCircleRemove
                  onClick={() => setSelected((prevSelected) => prevSelected.filter((item) => item !== s))}
                  style={{
                    position: "absolute",
                    right: "1em",
                    top: "1em",
                  }}
                /> */}

                <Button
                  style={{ position: "absolute", width: "auto", top: ".5em", right: ".5em", color: theme.palette.text.primary }}
                  onClick={async () => {
                    const url = await getSceneUrlBySceneData(s);
                    window.open(url, "_blank", "location=yes,height=520,width=520");
                  }}
                >
                  <span className="material-symbols-outlined">open_in_new</span>
                </Button>

                {s.preview && s.preview.startsWith("/") ? (
                  <img src={storageUrl + s.preview} style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "0.5em" }} alt={s.name} />
                ) : (
                  <div
                    style={{
                      width: "70px",
                      height: "70px",
                      display: "flex",
                      objectFit: "cover",
                      borderRadius: "0.5em",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "#111",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "1.65em", color: theme.palette.white.main, padding: "50px" }}>
                      draft
                    </span>
                  </div>
                )}

                <div style={{ width: "100%", color: theme.palette.light.main }}>
                  <Marqueeno style={{ width: "185px" }} text={s.name} />

                  <div>
                    {s.tags ? (
                      <div style={{ display: "flex", gap: "0.3em" }}>
                        <strong>Tags:</strong>

                        <Marqueeno style={{ width: "175px" }} text={s.tags} />
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <strong>Created:</strong> <span>{new Date(s.createdAt)?.toISOString()?.split("T")[0] || "-"}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {props.options.hideSelectors ? null : (
            <div style={{ padding: "1em", borderRadius: "0.5em", overflowY: "scroll", maxHeight: "70vh", backgroundColor: theme.palette.background.default }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    width: "3.5em",
                    marginRight: "1.5em",
                  }}
                >
                  <Button
                    style={{ fontSize: "0.8em" }}
                    onClick={() => {
                      const tmpData = JSON.parse(selected[0].data);

                      try {
                        delete tmpData.nodes.Mesh_EnvironmentPlane;
                        delete tmpData.nodes.Mesh_Skybox;
                      } catch (error) {
                        console.warn(error);
                      }

                      setDataToMerge({
                        add: {
                          ...tmpData,
                        },
                        replace: {},
                      });
                    }}
                  >
                    Add
                  </Button>
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    width: "3.5em",
                  }}
                >
                  <Button
                    style={{ fontSize: "0.8em" }}
                    onClick={() => {
                      const tmpData = JSON.parse(selected[0].data);

                      try {
                        delete tmpData.nodes.Mesh_EnvironmentPlane;
                        delete tmpData.nodes.Mesh_Skybox;
                      } catch (error) {
                        console.warn(error);
                      }

                      setDataToMerge({
                        add: {},

                        replace: { ...tmpData },
                      });
                    }}
                  >
                    Replace
                  </Button>
                </span>
              </div>

              {[
                {
                  title: "Scene Settings",
                  category: "scene",
                  icon: { main: "settings" },
                  color: theme.palette.text.primary,
                  single: true,
                  superTags: ["Scene"],
                },
                { title: "Effects", category: "effects", icon: { main: "settings" }, color: theme.palette.text.primary, single: true, superTags: ["Scene"] },
                { title: "Custom Nodes", category: "customNodes", icon: { main: "settings" }, color: theme.palette.text.primary, superTags: ["Scene"] },
                { title: "Control Nodes", category: "controlNodes", icon: { main: "nest_remote" }, color: theme.palette.text.primary, superTags: ["Scene"] },
                {
                  title: "Cameras",
                  category: "cameras",
                  icon: { main: "videocam", ArcRotateCamera: "360", UniversalCamera: "photo_camera" },
                  color: theme.palette.violet.main,
                  superTags: ["Scene"],
                },
                {
                  title: "Lights",
                  category: "lights",
                  icon: {
                    main: "lightbulb",
                    PointLight: "lightbulb_outline",
                    DirectionalLight: "light_mode",
                    SpotLight: "highlight",
                    HemisphericLight: "language",
                  },
                  color: theme.palette.yellow.main,
                  superTags: ["Scene"],
                },
                { title: "3D Elements", category: "assets", icon: { main: "deployed_code" }, color: theme.palette.turquoise.main, superTags: ["Scene"] },
                {
                  title: "Materials",
                  category: "materials",
                  icon: {
                    main: "gradient",
                    PBRMaterial: "deployed_code",
                    ShadowOnlyMaterial: "ev_shadow",
                    TransmissionMaterial: "sound_detection_glass_break",
                    DiamondMaterial: "sound_detection_glass_break",
                    ShaderMaterial: "star",
                  },
                  color: theme.palette.green.main,
                  superTags: ["Material", "Scene"],
                },
                {
                  title: "Textures",
                  category: "textures",
                  icon: { main: "texture", Texture: "texture", CubeTexture: "deployed_code", HDRCubeTexture: "deployed_code", VideoTexture: "movie" },
                  color: theme.palette.orange.main,
                  superTags: ["Scene", "Texture", "Material"],
                },
                {
                  title: "Actions",
                  category: "actions",
                  icon: {
                    main: "movie",
                    Animate: "directions_run",
                    Condition: "equal",
                    timeline: "schedule",
                    Math: "functions",
                    Sequencer: "chevron_right",
                    Overlay: "web_asset",
                    EnterAR: "view_in_ar",
                    SaveConfig: "save",
                    AddReplace: "move_down",
                    ExternalLink: "link",
                  },

                  color: theme.palette.red.main,
                  superTags: ["Scene", "Overlay"],
                },
                { title: "Variables", category: "variables", icon: { main: "code_blocks" }, color: theme.palette.text.primary, superTags: ["Scene"] },
                { title: "Sounds", category: "sounds", icon: { main: "volume_mute" }, color: theme.palette.blue.main, superTags: ["Scene"] },
                { title: "Overlays", category: "overlays", icon: { main: "web_asset" }, color: theme.palette.text.primary, superTags: ["Scene", "Overlay"] },
              ].map((params) =>
                CheckBoxes(
                  selected,
                  params.title,
                  params.category,
                  params.icon,
                  attachmentScenesAccordion,
                  setAttachmentScenesAccordion,
                  params.color,
                  dataToMerge,
                  dataBuilder,
                  params.single,
                  selectedTags,
                  params.superTags,
                  organizationId
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  function onConfirm() {
    return () => {
      const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;

      const selectedScene = selected[0];

      if (selectedScene) {
        let currentData;

        try {
          // ADD RANDOM NUMBER TO TIMESTAMPS
          /////////////////////////////
          const randNumber = Math.floor(Math.random() * 1985) + 1;
          function replaceTimestamps(inputString) {
            // Regular expression to match Unix timestamps (assuming they are in seconds and consist of 10 digits)
            const timestampRegex = /_(\d{13})/g;

            // Function to add 1 to each matched timestamp
            const incrementTimestamp = (match, p1) => {
              const timestamp = parseInt(p1, 10);
              return `_${(timestamp + randNumber).toString()}`;
            };

            // Replace each timestamp in the string
            const updatedString = inputString.replace(timestampRegex, incrementTimestamp);

            return updatedString;
          }

          dataToMerge.add = JSON.parse(replaceTimestamps(JSON.stringify(dataToMerge.add)));
          dataToMerge.replace = JSON.parse(replaceTimestamps(JSON.stringify(dataToMerge.replace)));

          ////////////////////////////

          // MAKE GOD JSON OF CURRENT SCENE STATE
          const updatedSceneData = createSceneData(scene, scene.sceneData);

          // EXTRACT CURRENT SCENE DATA FROM GOD JSON
          currentData = JSON.parse(JSON.stringify(scene.mainData));
          currentData.data = updatedSceneData;

          const mergedData = merge(currentData.data, dataToMerge.add, { arrayMerge: overwriteMerge });

          Object.entries(dataToMerge.replace).forEach(([k, v]) => {
            mergedData[k] = v;
          });

          currentData.data = mergedData;
          parseSceneData(currentData).then((data) => {
            data.organizationId = organizationId;
            data.id = selectedScene.id;
            dataToMerge.name = selectedScene.name;

            return props.options.callback(data, dataToMerge);
          });
        } catch (error) {
          return console.log(error);
        }
      }
    };
  }
}

const IconTextField = ({ iconStart, iconEnd, InputProps, ...props }) => {
  return (
    <TextField
      {...props}
      InputProps={{
        ...InputProps,
        startAdornment: iconStart ? <InputAdornment position="start">{iconStart}</InputAdornment> : null,
        endAdornment: iconEnd ? <InputAdornment position="end">{iconEnd}</InputAdornment> : null,
      }}
    />
  );
};

const CheckBoxes = (
  selected,
  displayName,
  category,
  icon,
  attachmentScenesAccordion,
  setAttachmentScenesAccordion,
  theme,
  dataToMerge,
  dataBuilder,
  single,
  selectedTags,
  superTags,
  organizationId
) => {
  if (organizationId === badvisorOrganizationId) {
    if (superTags && selected[0].tags && selected[0].tags.split(",").some((t) => superTags.includes(t.trim()))) {
    } else if (!superTags || (selected[0].tags && !selected[0].tags.split(",").some((t) => superTags.includes(t.trim())))) {
      return null;
    } else {
    }
  }

  return selected &&
    selected[0].data &&
    JSON.parse(selected[0].data)[category] &&
    Object.values(JSON.parse(selected[0].data)[category]).filter((v) => !v.fromAsset).length ? (
    <div key={category}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div
          style={{ width: "200px", display: "flex", flexShrink: 0, gap: "0.5em" }}
          onClick={() => {
            if (single) return;
            if (attachmentScenesAccordion.includes(category)) {
              setAttachmentScenesAccordion(attachmentScenesAccordion.filter((a) => a !== category));
            } else {
              setAttachmentScenesAccordion([...attachmentScenesAccordion, category]);
            }
          }}
        >
          <span className="material-symbols-outlined" style={{ color: theme }}>
            {icon.main}
          </span>

          <span
            style={{
              fontWeight: "bold",
              display: "flex",
            }}
          >
            <span>
              {displayName} {!single && <>({Object.values(JSON.parse(selected[0].data)[category]).filter((v) => !v.fromAsset).length})</>}
            </span>
            {!single && <span className="material-symbols-outlined">{attachmentScenesAccordion.includes(category) ? "expand_more" : "chevron_right"}</span>}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "1em", width: "100%" }}>
          <Checkbox
            size="small"
            style={{ borderRadius: "0.5em", width: "1em", height: "1em", marginRight: "1em" }}
            type="checkbox"
            checked={
              dataToMerge.add?.[category] !== undefined &&
              Object.keys(dataToMerge.add?.[category]).length >= Object.values(JSON.parse(selected[0].data)[category]).filter((v) => !v.fromAsset).length
            }
            indeterminate={
              dataToMerge.add?.[category] !== undefined &&
              Object.keys(dataToMerge.add?.[category]).length > 0 &&
              Object.keys(dataToMerge.add?.[category]).length < Object.values(JSON.parse(selected[0].data)[category]).filter((v) => !v.fromAsset).length
            }
            onChange={(e) => {
              dataBuilder(category, e.target.checked, "add");
            }}
          />

          <Checkbox
            size="small"
            style={{ borderRadius: "0.5em", width: "1em", height: "1em", marginRight: "1em" }}
            type="checkbox"
            checked={
              dataToMerge.replace?.[category] !== undefined &&
              Object.keys(dataToMerge.replace?.[category]).length >= Object.values(JSON.parse(selected[0].data)[category]).filter((v) => !v.fromAsset).length
            }
            indeterminate={
              dataToMerge.replace?.[category] !== undefined &&
              Object.keys(dataToMerge.replace?.[category]).length > 0 &&
              Object.keys(dataToMerge.replace?.[category]).length < Object.values(JSON.parse(selected[0].data)[category]).filter((v) => !v.fromAsset).length
            }
            onChange={(e) => {
              dataBuilder(category, e.target.checked, "replace");
            }}
          />
        </div>
      </div>

      {attachmentScenesAccordion.includes(category) && (
        <span>
          {Object.entries(JSON.parse(selected[0].data)[category])
            .filter(([k, v]) => !v.fromAsset)
            .map(([k, v]) => {
              return (
                <div style={{ display: "flex", alignItems: "space-between", width: "100%" }} key={k}>
                  <div style={{ display: "flex", width: "200px", flexShrink: 0, gap: "0.5em" }}>
                    <span className="material-symbols-outlined" style={{ color: theme, marginLeft: ".5em" }}>
                      {Object.keys(icon)
                        .filter((key) => key === v.type)
                        .map((filteredKey) => icon[filteredKey])[0] || icon.main}
                    </span>

                    <Marqueeno text={v.displayName || v.name || k} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Checkbox
                      size="small"
                      style={{ borderRadius: "0.5em", width: "1em", height: "1em", marginRight: "1em" }}
                      type="checkbox"
                      checked={dataToMerge.add?.[category]?.[k] !== undefined}
                      onChange={(e) => {
                        dataBuilder("" + category + "." + k, e.target.checked, "add");
                      }}
                    />

                    <Checkbox
                      size="small"
                      style={{ borderRadius: "0.5em", width: "1em", height: "1em", marginRight: "1em" }}
                      type="checkbox"
                      checked={dataToMerge.replace?.[category]?.[k] !== undefined}
                      onChange={(e) => {
                        dataBuilder("" + category + "." + k, e.target.checked, "replace");
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </span>
      )}
    </div>
  ) : null;
};
