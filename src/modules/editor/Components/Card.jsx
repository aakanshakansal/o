import { Button } from "@mui/material";
import { useState } from "react";
import Marqueeno from "../Marqueeno";

export const Card = (props) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Button
      id={props.id}
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => (props.hasOwnProperty("onClick") ? props.onClick() : null)}
      className="card"
      style={{
        backgroundColor: "#111111",
        color: "#bada55",
        height: "auto",
        width: "100%",
        aspectRatio: "1 / 1",
        display: "flex",
        flexDirection: "column",
        gap: "1em",
        padding: "0",
        position: "relative",
        justifyContent: "space-between",
        borderRadius: "0.5em",
        textAlign: "left",
        boxSizing: "border-box",
        ...props.style,
      }}
    >
      <strong
        style={{
          zIndex: 1,
          width: "100%",
          paddingBottom: "0.5em",
          marginBottom: "1em",
          backgroundColor: "#11111188",
          padding: "1em",
          borderRadius: "0.5em 0.5em 0 0",
        }}
      >
        <Marqueeno text={props.title} />
      </strong>

      {/* <div style={{ height: "100%" }}></div> */}
      <div style={{ zIndex: 1, padding: "1em" }}>
        <div style={{ fontSize: "0.8em" }}>{props.description}</div>
      </div>
      {props.actions ? (
        <div style={{ zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1em" }}>{props.actions}</div>
      ) : null}
      <div
        style={{
          position: "absolute",
          borderRadius: "0.5em",
          overflow: "hidden",
          height: "100%",
          width: "100%",
          top: 0,
          left: 0,
          opacity: hovered ? 1 : 0.85,
          transition: "0.15s ease-in-out",
        }}
      >
        {props.image}
      </div>

      {/* {props.gradient === true ? (
        <div
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            top: 0,
            left: 0,
            background: "linear-gradient(180deg, rgba(17,17,17,1) 3.3em, rgba(17,17,17,0) 80%)",
          }}
        ></div>
      ) : null} */}
    </Button>
  );
};
