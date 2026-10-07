import { Switch } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

export const BooleanInput = (props) => {
  const theme = useTheme();

  return (
    <div
      style={{
        alignItems: "center",
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        backgroundColor: theme.palette.background.light,
        padding: "0 0 0 0.5em",
        borderRadius: "0.5em",
        height: "1.6em",
        //  border: "solid 1px " + theme.palette.border.main,
        ...props.style,
      }}
    >
      <span style={{ display: "flex", alignItems: "center" }}>{props.label}</span>
      <Switch id={Math.floor(Math.random() * 9999)} size="small" type="checkbox" checked={Boolean(props.checked)} onChange={props.onChange} />
    </div>
  );
};
