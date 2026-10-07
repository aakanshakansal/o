import useTheme from "@mui/material/styles/useTheme";
import { useEffect, useRef } from "react";

export const RangeInput = (props) => {
  const theme = useTheme();

  const ref = useRef(null);
  useEffect(() => {
    ref.current.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        return ref.current.blur();
      }
    });
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between", ...props.style }}>
      <span style={{ width: "33%", display: "block", marginLeft: "0em" }}>{props.label}</span>
      <div
        style={{
          alignItems: "center",
          width: "66%",
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: theme.palette.background.light,
          padding: "0 0.5em",
          borderRadius: "0.5em",

          height: "1.6em",
          //  border: "solid 1px " + theme.palette.border.main,
        }}
      >
        <input
          id={Math.floor(Math.random() * 9999)}
          min={props.min}
          max={props.max}
          step={props.step}
          value={props.value}
          onChange={props.onChange}
          style={{ width: "100%", display: "block" }}
          type="range"
        ></input>

        <input
          ref={ref}
          style={{ width: "30%", flexShrink: 0, background: "transparent", textAlign: "right" }}
          onChange={props.onChange}
          type="number"
          value={props.value}
        />
      </div>
    </div>
  );
};
