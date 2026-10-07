import useTheme from "@mui/material/styles/useTheme";

export const StringInput = (props) => {
  const theme = useTheme();
  return (
    <span
      style={{
        display: "flex",
        flexDirection: props.multiline ? "column" : "row",
        position: "relative",
        height: props.multiline ? "auto" : "1.6em",
        alignItems: props.multiline ? "flex-start" : "center",
        width: "100%",
        // border: "1px solid " + theme.palette.border.main,
        backgroundColor: theme.palette.background.light,
        color: theme.palette.text.main,
        borderRadius: "0.5em",
        overflow: "hidden",

        ...props.style,
      }}
    >
      <span style={{ height: "100%", display: "flex", alignItems: "center", padding: "0 0.5em", pointerEvents: "none", whiteSpace: "nowrap" }}>
        {props.label}
      </span>
      {props.multiline ? (
        <textarea
          id={Math.floor(Math.random() * 9999)}
          style={{
            width: "100%",
            height: "200px",
            textAlign: "left",
            padding: " 1em",
            background: "none",
            color: theme.palette.text.default,
          }}
          type="text"
          defaultValue={props.value}
          onBlur={props.onChange}
        ></textarea>
      ) : (
        <input
          id={Math.floor(Math.random() * 9999)}
          style={{
            width: "100%",
            height: "100%",
            textAlign: "right",
            padding: "0 0.5em 0 0",
            background: "none",
            color: theme.palette.text.default,
            ...props.inputStyle,
          }}
          type="text"
          placeholder={props.placeholder || ""}
          defaultValue={props.value}
          onBlur={props.onBlur}
          onFocus={props.onFocus}
          onChange={props.onChange}
        ></input>
      )}
    </span>
  );
};
