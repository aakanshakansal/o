import { Button } from "@mui/material";
import { useState } from "react";

export const Menu = (props) => {
  const [open, setOpen] = useState(props.open);

  let menuCss = {
    position: "absolute",
    transform: "translateY(-100%) translateX(-50%)",
    zIndex: 1,
  };

  if (props.horizontal === "left" && props.vertical === "top") {
    menuCss.transform = "translateY(-100%) translateX(0)";
    menuCss.left = 0;
    menuCss.top = 0;
  }

  if (props.horizontal === "right" && props.vertical === "top") {
    menuCss.transform = "translateY(-100%) translateX(0%)";
    menuCss.right = 0;
    menuCss.top = 0;
  }

  if (props.horizontal === "center" && props.vertical === "top") {
    menuCss.transform = "translateY(-100%) translateX(-50%)";
    menuCss.left = "50%";
    menuCss.top = 0;
  }

  if (props.horizontal === "left" && props.vertical === "bottom") {
    menuCss.transform = "translateY(100%) translateX(0)";
    menuCss.left = 0;
    menuCss.bottom = 0;
  }

  if (props.horizontal === "right" && props.vertical === "bottom") {
    menuCss.transform = "translateY(100%) translateX(-50%)";
    menuCss.right = 0;
    menuCss.bottom = 0;
  }

  if (props.horizontal === "center" && props.vertical === "bottom") {
    menuCss.transform = "translateY(100%) translateX(-50%)";
    menuCss.left = "50%";
    menuCss.bottom = 0;
  }

  if (props.horizontal === "left" && props.vertical === "center") {
    menuCss.transform = "translateY(-50%) translateX(-100%)";
    menuCss.left = 0;
    menuCss.top = "50%";
  }

  if (props.horizontal === "right" && props.vertical === "center") {
    menuCss.transform = "translateY(-50%) translateX(100%)";
    menuCss.right = 0;
    menuCss.top = "50%";
  }

  return (
    <div style={{ position: "relative" }}>
      <Button style={{ padding: "0 0.5em" }} onClick={() => setOpen(!open)}>
        {props.title}
      </Button>
      {open ? (
        <div onClick={() => setOpen(false)} style={menuCss}>
          {props.children}
        </div>
      ) : null}
    </div>
  );
};
