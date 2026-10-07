import { Button, Checkbox, InputAdornment, TextField, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useCurrentScene } from "../../../badProvider/functions";

const Collapsabile = (props) => {
  const [toggle, setToggle] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const node = props.node;
  var childNodes = null;

  if (node.getDescendants) {
    childNodes = node.getDescendants(true);
  }

  useEffect(() => {
    setToggle(props.expandAll);
  }, [props.expandAll]);

  useEffect(() => {
    if (props.search) {
      setToggle(true);

      var buono = false;

      if (childNodes && childNodes.length) {
        childNodes.forEach((child) => {
          if (child.displayName && child.displayName.toLowerCase().indexOf(props.search.toLowerCase()) > -1) {
            buono = true;
          }
        });
      }

      if (node.displayName && node.displayName.toLowerCase().indexOf(props.search.toLowerCase()) > -1) {
        buono = true;
      }

      if (!node.displayName) {
        buono = false;
      }

      if (buono) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(true);
    }
  }, [props.search]);

  const MakeTree = (parentNode, nodes) => {
    return Object.entries(nodes).map(([key, node], i) => {
      if (!node) {
        return null;
      }

      return (
        <Collapsabile
          search={props.search}
          expandAll={props.expandAll}
          selected={props.selected}
          setSelected={(e) => props.setSelected(e)}
          options={props.options}
          key={key}
          node={node}
        />
      );
    });
  };

  return isVisible ? (
    <div key={node.name}>
      <div style={{ display: "flex", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
        {childNodes && childNodes.length ? (
          <button
            onClick={() => setToggle(!toggle)}
            style={{ height: "1.6em", display: "flex", alignItems: "center", justifyContent: "center", width: "1.6em" }}
          >
            {toggle ? (
              <span className="material-symbols-outlined" style={{ marginRight: "0.3em" }}>
                expand_more
              </span>
            ) : (
              <span className="material-symbols-outlined" style={{ marginRight: "0.3em" }}>
                chevron_right
              </span>
            )}
          </button>
        ) : null}
        {!childNodes || !childNodes.length ? (
          // single
          <>
            <Checkbox
              sx={{ "& .MuiSvgIcon-root": { fontSize: 16 } }}
              id={"check" + node.name}
              style={{ padding: "0", margin: "0.5em 0.5em 0.5em 0" }}
              type="checkbox"
              checked={props.selected.includes(node.name)}
              onChange={(e) => {
                if (props.selected.includes(node.name)) {
                  // pop
                  props.setSelected((prevSelected) => {
                    const newSelected = prevSelected.filter((item) => item !== node.name);
                    props.options.callback(newSelected);
                    return newSelected;
                  });
                } else {
                  // add
                  props.setSelected((prevSelected) => {
                    const newSelected = prevSelected.includes(node.name) ? prevSelected : [...prevSelected, node.name];
                    props.options.callback(newSelected);
                    return newSelected;
                  });
                }
              }}
            />
            <label htmlFor={"check" + node.name} style={{ display: "flex", alignItems: "center" }}>
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                switch_access
              </span>
              <span style={{ fontWeight: "bold" }}>{node.displayName || node.name}</span>
            </label>
          </>
        ) : (
          // group
          <>
            <Checkbox
              sx={{ "& .MuiSvgIcon-root": { fontSize: 16 } }}
              id={"check" + node.name}
              style={{ padding: "0", margin: "0.5em 0.5em 0.5em 0" }}
              type="checkbox"
              checked={props.selected.includes(node.name)}
              onChange={(e) => {
                if (props.selected.includes(node.name)) {
                  const tempArr = [node.name];
                  node.getDescendants().forEach((child) => {
                    tempArr.push(child.name);
                  });

                  let newSelected = [];
                  props.setSelected((prevSelected) => {
                    newSelected = prevSelected.filter((item) => !tempArr.includes(item));
                    props.options.callback(newSelected);
                    return newSelected;
                  });
                } else {
                  const tempArr = [node.name];

                  node.getDescendants().forEach((child) => {
                    tempArr.push(child.name);
                  });

                  props.setSelected((prevSelected) => {
                    const spreadCopy = [...prevSelected, ...tempArr];
                    props.options.callback(spreadCopy);
                    return spreadCopy;
                  });
                }
              }}
            />
            <label htmlFor={"check" + node.name} style={{ display: "flex", alignItems: "center" }}>
              <span className="material-symbols-outlined" style={{ marginRight: "0.5em" }}>
                folder
              </span>
              <span style={{ fontWeight: "bold" }}>{node.displayName || node.name}</span>
            </label>
          </>
        )}
      </div>
      {childNodes && childNodes.length && toggle ? (
        <div style={{ marginLeft: "0.9em", paddingLeft: "2.4em", borderLeft: "solid 2px #dedede5a", transform: "translateX( -5px )" }}>
          {MakeTree(node, childNodes)}
        </div>
      ) : null}
    </div>
  ) : null;
};

export function MeshesArrayReferencePrompt(props) {
  const theme = useTheme();
  const scene = useCurrentScene();
  const [selected, setSelected] = useState(props.options.values);

  const [expandAll, setExpandAll] = useState(false);

  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const confirm = (e) => {
    scene.openPrompt(null);
    scene.forceUpdate();
    return;
  };

  const MakeTree = (parentNode, nodes, options) => {
    return Object.entries(nodes).map(([key, node], i) => {
      if (!node) {
        return null;
      }

      return (
        <Collapsabile search={search} expandAll={expandAll} selected={selected} setSelected={(e) => setSelected(e)} options={options} key={key} node={node} />
      );
    });
  };
  // return filteredNodes ? <div>{MakeTree(null, filteredNodes)}</div> : null;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div
      className="promptInner node"
      style={{
        background: theme.palette.background.default,
        borderColor: theme.palette.default.main,
        minWidth: "400px",
        width: "auto",
      }}
    >
      <div
        className="nodeHeader"
        style={{
          color: theme.palette.text.primary,
          background: theme.palette.background.default,
          justifyContent: "space-between",
          display: "flex",
          alignItems: "center",
        }}
      >
        <strong className="nodeTitle" style={{ cursor: "unset" }}>
          {props.options.label}
        </strong>

        <strong className="nodeTitle" style={{ justifyContent: "flex-end", cursor: "unset" }}>
          {selected.length ? "Selected " + selected.length : null}
        </strong>
      </div>
      <div style={{ padding: "1em" }}>
        <div className="field">
          <TextField
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              backgroundColor: isFocused ? "#bada55" : "transparent",
              borderRadius: "0.5em",
            }}
            type="text"
            defaultValue={search}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <span className="material-symbols-outlined">search</span>
                </InputAdornment>
              ),
            }}
            onChange={(e) => {
              setSearch(e.target.value.toLowerCase());
            }}
          />
        </div>

        <div className="field " style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "0.5em" }}>
            <Button
              className="FunctionButton"
              style={{ width: "1.6em" }}
              onClick={() => {
                if (expandAll === true) {
                  setExpandAll(1);
                } else {
                  setExpandAll(true);
                }
              }}
            >
              <span className="material-symbols-outlined">expand_content</span>
            </Button>
            <Button
              className="FunctionButton"
              style={{ width: "1.6em" }}
              onClick={() => {
                if (expandAll === false) {
                  setExpandAll(0);
                } else {
                  setExpandAll(false);
                }
              }}
            >
              <span className="material-symbols-outlined">collapse_content</span>
            </Button>
          </div>
          <div style={{ display: "flex", gap: "0.5em" }}>
            <Button
              className="FunctionButton"
              style={{ width: "auto" }}
              onClick={() => {
                const temp = [];

                scene.meshes
                  .filter(
                    (m) =>
                      m.name !== "Mesh_EnvironmentPlane" &&
                      m.name !== "Mesh_Skybox" &&
                      m.name !== "gridHelper" &&
                      m.name !== "axisHelper" &&
                      m.name !== "headTrackHelper"
                  )
                  .forEach((m) => {
                    return temp.push(m.name);
                  });

                scene.transformNodes.forEach((m) => {
                  return temp.push(m.name);
                });
                console.log(temp);
                setSelected(temp);
                props.options.callback(temp);
              }}
            >
              Select All
            </Button>

            <Button
              className="FunctionButton"
              style={{ width: "auto" }}
              onClick={() => {
                setSelected([]);
                props.options.callback([]);
              }}
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>
      <div className="nodeInner" style={{ overflow: "scroll", minHeight: "20em", maxHeight: "80vh" }}>
        {scene.badAssets ? <div>{MakeTree(null, { ...scene.badAssets }, props.options)}</div> : null}
      </div>
      <div className="buttonGroup" style={{ position: "fixed", right: "1em", bottom: "0em" }}>
        <span></span>
        <Button variant="contained" style={{ maxWidth: "none", width: "auto" }} onClick={confirm}>
          Done
        </Button>
      </div>
    </div>
  );
}
