import React from "react";

import { Button } from "@mui/material";
const IntroSetup = (props) => {
  const intro = document.getElementById("intro");
  props.scene.intro = intro;
  const introContainer = document.getElementById("introContainer");
  props.scene.introContainer = introContainer;

  const hideIntro = () => {
    intro.style.opacity = 0;
    setTimeout(() => {
      props.setstart();
    }, 500);
  };

  if (intro) {
    intro.ontimeupdate = () => {
      if (intro.currentTime >= intro.duration - 1) {
        hideIntro();
      }
    };
  }
  return (
    <div
      id="introContainer"
      style={{
        backgroundColor: props.data.introBackground ? props.data.introBackground : "#000000",
      }}
    >
      <video width="100%" height="100%" id="intro" autoPlay>
        <source src={props.data._intro} type="video/mp4" />
      </video>

      {props.data.introSkippable && !props.loading ? (
        <Button
          color="primary"
          variant="contained"
          id="skipIntro"
          onClick={() => {
            document.getElementById("skipIntro").style.display = "none";
            hideIntro();
          }}
        >
          SKIP
        </Button>
      ) : null}
    </div>
  );
};

export default IntroSetup;
