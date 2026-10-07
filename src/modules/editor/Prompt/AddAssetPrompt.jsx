import SearchIcon from "@mui/icons-material/Search";
import { Button, Chip, InputAdornment, MenuItem, Select, Stack, TextField } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import React, { useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { storageUrl } from "../../../Router";
import { useUserOrganizations } from "../../../badProvider/functions";
import { badvisorOrganizationId, textureExtensions } from "../../../constants";
import { getOrganizationAssetsByExtension } from "../../../helpers";
import { ButtonCircleRemove } from "../Components/ButtonCircleRemove";
import { Card } from "../Components/Card";
import Marqueeno from "../Marqueeno";

export function AddAssetPrompt(props) {
  const theme = useTheme();

  const userOrganizations = useUserOrganizations();
  const [organizationId, setOrganizationId] = useState(props.options.organizationId || window.organizationId || badvisorOrganizationId);
  const [selected, setSelected] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [allAssets, setAllAssets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [tags, setTags] = useState([]);
  const [excludedTags, setExcludedTags] = useState([]);
  const [preTags, setPreTags] = useState(props.options.preTags?.split(",") || []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagsToggler, setTagsToggler] = useState(false);

  const [sortBy, setSortBy] = useState("createdAt");

  const sortByChange = (event) => {
    setSortBy(event.target.value);
  };

  const setUserAssets = async () => {
    let userAssets = await getOrganizationAssetsByExtension(organizationId, props.options.extensions);

    if (!userAssets.error) {
      if (props.options.data?.id) {
        const assets = userAssets.filter((a) => a.id === props.options.data.id);
        if (assets.length) {
          setSelected([assets[0]]);
        }
      }

      if (organizationId === badvisorOrganizationId) {
        userAssets = userAssets.filter((a) => {
          if (a.tags && a.tags.split(",") && a.tags.split(",").includes("enabled")) {
            return true;
          }
          return false;
        });

        if (preTags.length) {
          userAssets = userAssets.filter((a) => {
            return preTags.some((preT) => {
              if (a.tags && a.tags.split(",") && a.tags.split(",").includes(preT)) {
                return true;
              }

              return false;
            });
          });
        }
      }
      setLoadingAssets(false);
      setAssets(userAssets);
      setAllAssets(userAssets);
    }
  };

  useEffect(() => {
    setLoadingAssets(true);
    setUserAssets();
  }, [props, organizationId]);

  const search = (e) => {
    setSearchString(e.target.value);
  };

  useEffect(() => {
    let tags = [];

    allAssets.forEach((s) => {
      let aTags = s.tags ? s.tags.split(",") : null;
      if (!aTags) return;
      aTags.forEach((tag) => {
        if (!tags.includes(tag) && !preTags.includes(tag)) {
          if (organizationId === badvisorOrganizationId && tag === "enabled") {
            return;
          }
          tags.push(tag);
        }
      });
    });
    setTags(tags);
  }, [allAssets]);

  useEffect(() => {
    let tempAssets = allAssets.filter((a) => a.name?.toLowerCase().includes(searchString.toLowerCase()));

    let includedAssets = selectedTags.length > 0 ? tempAssets.filter((s) => s?.tags && selectedTags.every((tag) => s.tags.includes(tag))) : tempAssets;

    let excludedAssets =
      excludedTags.length > 0 ? includedAssets.filter((s) => !s?.tags || excludedTags.every((tag) => !s.tags.includes(tag))) : includedAssets;

    setAssets(excludedAssets);
  }, [selectedTags, searchString, excludedTags]);

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  return (
    <div
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
            justifyContent: "space-between",
            width: "100%",

            borderRadius: "0.5em",
          }}
        >
          <div style={{ width: selected.length ? "calc(100% - 280px)" : "100%" }}>
            {!loadingAssets ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "calc(100% - 1em)",
                  margin: "1em",
                  padding: "0.5em 1em 1em 1em",

                  borderRadius: "0.5em ",
                  background: theme.palette.background.default,
                }}
              >
                <div style={{ display: "flex", gap: "0.5em", justifyContent: "space-between", alignItems: "center", margin: "0.5em 0" }}>
                  <span style={{ width: "100%", marginBottom: "0.5em", color: theme.palette.green.main }}>Import From Asset Library</span>

                  <Button
                    style={{
                      width: "200px",
                    }}
                    onClick={() => {
                      window.open("https://admin.badvisor.io/assets", "_blank");
                    }}
                  >
                    <span className="material-symbols-outlined">add</span>
                    <span style={{ fontWeight: "normal" }}>Upload Asset</span>
                  </Button>
                </div>

                <div style={{ display: "flex", gap: "0.5em", marginBottom: "0.5em", justifyContent: "space-between", alignItems: "center" }}>
                  {userOrganizations ? (
                    <>
                      <span style={{ whiteSpace: "nowrap" }}>Organization&apos;s Library:</span>{" "}
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
                    Badvisor&apos;s Library
                  </button>

                  {allAssets.length > 0 ? (
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
                          borderRadius: "0.5em",
                          padding: "0 1em",
                        }}
                        onChange={sortByChange}
                        disableunderline="true"
                      >
                        <MenuItem value={"alphabetically"}>A-Z</MenuItem>
                        <MenuItem value={"createdAt"}>Creation Date</MenuItem>
                        <MenuItem value={"size"}>Size</MenuItem>
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
                  ) : null}
                </div>

                {tagsToggler && tags ? (
                  <Stack
                    direction="row"
                    style={{
                      height: tagsToggler ? "auto" : "0",
                      gap: "0.5em",
                      marginBottom: "1.6em",
                      flexShrink: 0,
                      flexWrap: "wrap",
                      maxHeight: "220px",
                      overflow: "auto",
                    }}
                  >
                    {tags.map((tag, i) => {
                      return (
                        <Chip
                          id={tag}
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

                <div style={{ paddingBottom: "0.5em" }}>Total Assets: {assets && <span>{assets.length}</span>}</div>

                {assets.length > 0 ? (
                  <div className="promptCardContainer">
                    {assets
                      .sort((a, b) => (sortBy === "size" ? a.size - b.size : 0))
                      .sort((a, b) => (sortBy === "alphabetically" ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : 0))
                      .sort((a, b) => (sortBy === "createdAt" ? (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) : 0))
                      .map((a, i) => {
                        a.organizationId = organizationId;
                        return (
                          <Card
                            gradient={true}
                            key={a.id}
                            id={a.id}
                            style={{
                              color: selected.some((item) => item.id === a.id) ? theme.palette.green.default : theme.palette.light.main,
                              outline: selected.some((item) => item.id === a.id) ? "solid" : "",
                            }}
                            onClick={(e) => {
                              if (props.options.single) {
                                setSelected([a]);
                              } else {
                                const copy = [...selected];

                                const index = copy.findIndex((item) => item.id === a.id);
                                if (index !== -1) {
                                  // If item exists, remove it
                                  copy.splice(index, 1);
                                } else {
                                  // If item does not exist, add it
                                  copy.push(a);
                                }

                                setSelected(copy);
                              }
                            }}
                            image={
                              a.thumbnail && typeof a.thumbnail === "string" && a.thumbnail.startsWith("/") ? (
                                <LazyLoadImage
                                  src={storageUrl + a.thumbnail}
                                  alt={a.name}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  placeholder={
                                    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                      <span className="material-symbols-outlined" style={{ fontSize: "1.65em", color: theme.palette.white.main }}>
                                        draft
                                      </span>
                                    </div>
                                  }
                                />
                              ) : textureExtensions.includes(a.type) && (a.customUrl || a.url) ? (
                                <LazyLoadImage
                                  src={a.customUrl || storageUrl + a.url}
                                  alt={a.name}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  placeholder={
                                    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                      <span className="material-symbols-outlined" style={{ fontSize: "1.65em", color: theme.palette.white.main }}>
                                        draft
                                      </span>
                                    </div>
                                  }
                                />
                              ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: "1.65em", color: theme.palette.white.main }}>
                                    draft
                                  </span>
                                </div>
                              )
                            }
                            title={a.name}
                          />
                        );
                      })}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", margin: "1em 0 0.5em 0" }}>No Assets :(</div>
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
            <Button
              id="confirmButton"
              variant="contained"
              disabled={!selected.length}
              style={{ width: "auto" }}
              onClick={() => {
                props.options.callback(selected);
              }}
            >
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
          width: "280px",
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
            padding: "1em 1em",
            textAlign: "center",
          }}
        >
          Selected Assets
        </strong>
        <div style={{ overflow: "auto", height: "100%", padding: "0 1em" }}>
          {selected.map((a, i) => {
            return (
              <div
                key={i}
                style={{
                  borderRadius: "0.5em",
                  overflow: "hidden",
                  marginBottom: "1em",
                  position: "relative",
                  background: theme.palette.background.default,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ButtonCircleRemove
                  onClick={() => setSelected((prevSelected) => prevSelected.filter((item) => item !== a))}
                  style={{
                    position: "absolute",
                    right: ".5em",
                    top: ".5em",
                  }}
                />

                {a.thumbnail && typeof a.thumbnail === "string" && a.thumbnail.startsWith("/") ? (
                  <img src={storageUrl + a.thumbnail} alt={a.name} style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "0.5em" }} />
                ) : textureExtensions.includes(a.type) && a.url ? (
                  <img src={storageUrl + a.url} alt={a.name} style={{ width: "70px", height: "70px", objectFit: "cover" }} />
                ) : (
                  <div
                    style={{
                      width: "70px",
                      height: "70px",

                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: " #111",
                      borderRadius: "0.5em",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "1.65em", color: theme.palette.white.main }}>
                      draft
                    </span>
                  </div>
                )}

                <div style={{ overflow: "hidden", color: theme.palette.light.main, padding: "1em" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      maxWidth: "135px",
                    }}
                  >
                    <Marqueeno text={a.name} />
                  </div>
                  <div>
                    <div>
                      {a.tags ? (
                        <div style={{ display: "flex", gap: "0.3em" }}>
                          <strong>Tags:</strong>

                          <Marqueeno text={a.tags} />
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <strong>Created:</strong> <span>{new Date(a.createdAt)?.toISOString()?.split("T")[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
