import { Vector3 } from "@babylonjs/core";
import React, { useEffect, useState } from "react";
import { useCurrentScene, useIsMappingActive, useMappingFieldTypes, useUpdateMappingSource } from "../../../badProvider/functions";
import { MeshButton } from "../Buttons/MeshButton";
const Collapsabile = (props) => {
  const [toggle, setToggle] = useState(false);
  useEffect(() => {
    setToggle(props.expandAll);
  }, [props.expandAll]);

  const scene = useCurrentScene();

  const isMappingActive = useIsMappingActive();
  const mappingFieldTypes = useMappingFieldTypes();

  const updateMappingSource = useUpdateMappingSource();

  const node = props.node;
  var childNodes = [];
  if (node.getDescendants) {
    childNodes = node.getDescendants(true);
  }

  // if (node.instances && node.instances.length) {
  //   childNodes = [...childNodes, ...node.instances];
  // }
  const [isVisible, setIsVisible] = useState(true);
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

  const onCLick = () => {
    return setToggle(!toggle);
  };
  const MakeTree = (parentNode, nodes) => {
    return Object.entries(nodes).map(([key, node], i) => {
      if (!node) {
        return null;
      }
      return <Collapsabile expandAll={props.expandAll} search={props.search} key={key} node={node} />;
    });
  };
  return isVisible ? (
    <div style={{ width: "100%" }} key={node.name}>
      <div style={{ display: "flex", width: "100%", justifyContent: "flex-start", alignItems: "center" }}>
        {childNodes && childNodes.length ? (
          <button onClick={onCLick} style={{ height: "1.6em", display: "flex", alignItems: "center", justifyContent: "center", width: "1.6em", flexShrink: 0 }}>
            {toggle ? <span className="material-symbols-outlined">expand_more</span> : <span className="material-symbols-outlined">chevron_right</span>}
          </button>
        ) : null}
        <button
          onClick={() => {
            node.setEnabled(!node.isEnabled(false));
            node.enabled = node.isEnabled(false);
            scene.forceUpdate();

            if (isMappingActive && mappingFieldTypes.includes("boolean")) {
              updateMappingSource({ node: node, value: Boolean(node.isEnabled(false)), valueType: "String", key: "enabled", label: "Enabled" });
            } else {
              if (!node.hasOwnProperty("badChanges")) {
                node.badChanges = {};
              }
              node.badChanges.enabled = node.isEnabled(false);
            }
          }}
          style={{
            height: "1.6em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "1.6em",
            background: isMappingActive && mappingFieldTypes.includes("boolean") ? "#bbda5580" : "",
            flexShrink: 0,
          }}
        >
          {node.isEnabled(false) ? (
            <span className="material-symbols-outlined" style={{ color: "" }}>
              visibility
            </span>
          ) : (
            <span className="material-symbols-outlined" style={{ color: "#f44336" }}>
              visibility_off
            </span>
          )}
        </button>
        <button
          onClick={() => {
            let descendants = node.getDescendants();
            let worldMatrices = descendants.map((descendant) => descendant.computeWorldMatrix(true));
            let minPoint = null;
            let maxPoint = null;

            descendants.forEach((descendant, index) => {
              try {
                let boundingInfo = descendant.getBoundingInfo();
                let boundingBox = boundingInfo.boundingBox;
                let minWorld = boundingBox.minimumWorld;
                let maxWorld = boundingBox.maximumWorld;

                if (!minPoint || !maxPoint) {
                  minPoint = minWorld.clone();
                  maxPoint = maxWorld.clone();
                } else {
                  minPoint = Vector3.Minimize(minPoint, minWorld);
                  maxPoint = Vector3.Maximize(maxPoint, maxWorld);
                }
              } catch (error) {
                console.warn(error);
              }
            });

            // If the node itself is a mesh with geometry, include its bounding box in the calculation
            if (node.getBoundingInfo) {
              let nodeMinWorld = node.getBoundingInfo().boundingBox.minimumWorld;
              let nodeMaxWorld = node.getBoundingInfo().boundingBox.maximumWorld;
              minPoint = minPoint ? Vector3.Minimize(minPoint, nodeMinWorld) : nodeMinWorld.clone();
              maxPoint = maxPoint ? Vector3.Maximize(maxPoint, nodeMaxWorld) : nodeMaxWorld.clone();
            }

            // Now we have minPoint and maxPoint representing the combined bounding box
            // Calculate the center
            let center = minPoint.add(maxPoint).scale(0.5);
            scene.activeCamera.target = center;

            if (scene.activeCamera.getClassName() === "ArcRotateCamera") {
              let size = maxPoint.subtract(minPoint);
              let maxDimension = Math.max(size.x, size.y, size.z);
              scene.activeCamera.radius = maxDimension * 2; // Adjust as needed
            }
          }}
          style={{
            height: "1.6em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "1.6em",

            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined">filter_center_focus</span>
        </button>

        <MeshButton node={node} />
        {/* {node.hasOwnProperty("instances") && node.instances.length
            ? node.instances.map((instance, i) => {
                return <MeshButton node={instance} />;
              })
            : null} */}
      </div>
      {childNodes && childNodes.length ? (
        toggle ? (
          <div style={{ marginLeft: "0.9em", paddingLeft: "0.8em", borderLeft: "solid 1px #dedede5a", transform: "translateX( -2px )", width: "100%" }}>
            {MakeTree(node, childNodes)}
          </div>
        ) : null
      ) : null}
    </div>
  ) : null;
};

export const MeshesList = (props) => {
  const MakeTree = (parentNode, nodes) => {
    return Object.entries(nodes).map(([key, node], i) => {
      if (!node) {
        return null;
      }
      return <Collapsabile expandAll={props.expandAll} search={props.search} key={key} node={node} />;
    });
  };

  return props.nodes ? (
    <div style={{ width: "100%", overflowY: "auto" }}>
      {MakeTree(
        null,
        Object.values(props.nodes).sort(function (a, b) {
          var textA = a.displayName.toLowerCase() || a.name.toLowerCase();
          var textB = b.displayName.toLowerCase() || b.name.toLowerCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        })
      )}
    </div>
  ) : null;
};
