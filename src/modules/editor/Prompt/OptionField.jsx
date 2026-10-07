import { useTheme } from "@mui/material";
import React from "react";

export default function OptionField(props) {
  let color = props.color;
  const theme = useTheme();
  return (
    <>
      <div
        className="material-symbols-outlined"
        style={{
          flexGrow: 1,
          color,
          fontSize: "2.5em",
          width: "160px",
          height: "160px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "0.25em",
          backgroundColor: theme.palette.grey.main,
        }}
      >
        {props.icon}
      </div>

      <span style={{ width: "50%" }}>
        <h1 style={{ fontWeight: "bolder", marginBottom: "0.5em" }}>{props.title}</h1>
        <p>{props.description}</p>
      </span>
    </>
  );
}
