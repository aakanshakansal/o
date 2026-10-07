import { Button } from "@mui/material";

import { useEffect, useState } from "react";
import LogItem from "./LogItem";

export default function ActionConsole(props) {
  let actionsLog = window.actionsLog || [];
  const [actions, setActions] = useState(actionsLog);

  const handleClean = () => {
    window.actionsLog = [];
  };

  useEffect(() => {
    setInterval(() => {
      setActions(window.actionsLog);
    }, 1000);
  }, []);

  return (
    <div
      style={{
        overflow: "auto",
        height: "300px",
      }}
    >
      <Button className="FunctionButton" onClick={() => handleClean()} style={{ width: "auto" }}>
        <span className="material-symbols-outlined">close</span> <span> Clean Console</span>
      </Button>

      {actionsLog &&
        actionsLog.map((action, i) => (
          <span key={action.firedTime}>
            <LogItem action={action} actionsLog={actions} />
          </span>
        ))}
    </div>
  );
}
