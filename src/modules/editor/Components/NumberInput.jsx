import useTheme from "@mui/material/styles/useTheme";
import { useEffect, useRef } from "react";

export const NumberInput = (props) => {
  const theme = useTheme();

  const ref = useRef(null);

  useEffect(() => {
    function getFloatCtrl(o) {
      return parseFloat(o.value);
    }

    function mouseCtrl(elem, getCtrl, setCtrl) {
      var ctrl = elem;
      var startpos; // starting mouse position
      var startval; // starting input control value

      // on mousedown start tracking mouse relative position
      ctrl.onmousedown = function (e) {
        startpos = e.clientX;
        startval = getCtrl(ctrl);
        if (isNaN(startval)) startval = 0;
        document.onmousemove = function (e) {
          var delta = e.clientX - startpos;
          setCtrl(ctrl, startval, delta);
        };
        document.onmouseup = function () {
          document.onmousemove = null; // remove mousemove to stop tracking
        };
      };
    }

    function scaledIntCtrl(o, i, x) {
      var incVal = Math.sign(x) * Math.pow(Math.abs(x) / window.numberInputMultiplier || 100, 2);

      var newVal = i + incVal;

      newVal = i + Math.sign(x) * Math.pow(Math.abs(x) / window.numberInputMultiplier || 100, 2);

      if (Math.abs(incVal) > 0.001) {
        const e = { target: { value: newVal } };
        props.onBlur(e);
      } // allow small deadzone
    }
    if (!props.disableDrag) {
      mouseCtrl(ref.current, getFloatCtrl, scaledIntCtrl);
    }
  }, [props, ref]);

  useEffect(() => {
    ref.current.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        return ref.current.blur();
      }
    });
  }, []);

  return (
    <span
      style={{
        display: "flex",
        position: "relative",
        height: "1.6em",
        alignItems: "center",
        width: "100%",
        //   border: "1px solid " + theme.palette.border.main,
        backgroundColor: theme.palette.background.light,

        color: theme.palette.text.main,
        borderRadius: "0.5em",
        overflow: "hidden",
        ...props.style,
      }}
    >
      <span
        style={{
          position: "absolute",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 0.5em",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          color: props.labelColor || "",
        }}
      >
        {props.label}
      </span>
      {!props.disableDrag ? (
        <span
          style={{
            width: (props.value / Math.max(1, Math.pow(10, Math.ceil(Math.log10(Math.abs(props.value) || 1))))) * 100 + "%",
            display: "block",
            height: "100%",
            backgroundColor: "#bada55",
            position: "absolute",
            opacity: 0.5,
            zIndex: 0,
            pointerEvents: "none",
          }}
        ></span>
      ) : null}
      <input
        id={Math.floor(Math.random() * 9999)}
        style={{
          zIndex: 1,
          width: "100%",
          height: "100%",
          textAlign: "right",
          padding: "0 0.5em 0 0",
          background: "none",
          color: theme.palette.text.default,
        }}
        ref={ref}
        type="number"
        defaultValue={props.value}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        onChange={props.onChange}
      ></input>
    </span>
  );
};
