import { useTheme } from "@mui/material";

export const ButtonCircleRemove = (props) => {
  const theme = useTheme();

  return (
    <button
      style={{
        height: "1.2em",
        width: "1.2em",
        flexShrink: "0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.palette.red.main,
        color: "#ffffff",
        borderRadius: "1.2em",
        ...props.style,
      }}
      onClick={props.onClick}
    >
      <span className="material-symbols-outlined">remove</span>
    </button>
  );
};
