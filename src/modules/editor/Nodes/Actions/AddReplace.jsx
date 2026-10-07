import { Button } from "@mui/material";
import React from "react";
import { useCurrentScene } from "../../../../badProvider/functions";

const AddReplace = (props) => {
  const scene = useCurrentScene();
  const node = props.node;

  return (
    <div>
      <br></br>
      <Button
        onClick={() =>
          scene.openPrompt("addReplace", {
            organizationId: node.settings.organizationId || window.organizationId,
            settings: node.settings,
            callback: (data, dataToMerge) => {
              node.settings = {
                dataToMerge: dataToMerge,
                id: data.id,
                organizationId: data.organizationId,
              };

              node.getClassName = () => "Action";
              scene.openPrompt(null);
            },
            cancel: () => {
              scene.openPrompt(null);
            },
          })
        }
        variant="outlined"
        className="FunctionButton"
      >
        Configure
      </Button>
      <div style={{ display: "flex", alignItems: "center", marginTop: "0.5em" }}>
        <input
          style={{ marginRight: "0.5em" }}
          type="checkbox"
          onChange={(e) => {
            node.enableLoadingScreen = e.target.checked;
          }}
          defaultChecked={node.enableLoadingScreen}
        />{" "}
        Enable Loading Screen
      </div>
    </div>
  );
};

export default AddReplace;
