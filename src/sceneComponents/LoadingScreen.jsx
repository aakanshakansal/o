import React from "react";
import { storageUrl } from "../Router";

const LoadingScreen = (props) => {
  return (
    <div
      id="loadingScreen"
      style={{
        background: props.data.loadingScreenBackground ? "url('" + storageUrl + props.data.loadingScreenBackground + "')" : null,
        backgroundSize: "cover",
        backgroundColor: props.data.loadingScreenBackgroundColor ? props.data.loadingScreenBackgroundColor : "#f1f1f1",
      }}
      className={props.loading ? "" : "loaded"}
    >
      <div
        className="beh"
        style={{
          width: "160px",
          pointerEvents: "none",
        }}
      >
        {props.data.loadingScreenLogo ? (
          <img alt="loading" id="loadingLogo" src={storageUrl + props.data.loadingScreenLogo} />
        ) : (
          <>
            <img alt="loading" id="loadingLogo" src={"/assets/logotext.png"} />
            {/* <div className="progressBar left" />
            <div className="progressBar right" /> */}
          </>
        )}
      </div>
      <div id="loadingScreenProgress" style={{ position: "fixed", bottom: "1em", right: "1em", opacity: "0.5" }}>
        {props.text}
      </div>
      <div style={{ position: "fixed", top: 0, left: 0, height: "2px", backgroundColor: "#111111", width: "0%" }} id="loadingScreenProgressBar"></div>
    </div>
  );
};

export default LoadingScreen;
