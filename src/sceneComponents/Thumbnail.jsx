import React from "react";
import { storageUrl } from "../Router";

const Thumbnail = (props) => {
  const thumbnailContainer = React.useRef(null);
  // console.log(props.data.thumbnail);
  return (
    <div
      ref={thumbnailContainer}
      id="thumbnail"
      style={{
        background: props.data.thumbnailBackground ? "url('" + storageUrl + props.data.thumbnailBackground + "')" : null,
        backgroundSize: props.data.thumbnailBackgroundSize ? props.data.thumbnailBackgroundSize : "cover",
        backgroundColor: props.data.thumbnailBackgroundColor ? props.data.thumbnailBackgroundColor : "#000000",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();

          props.startscene();
        }}
      >
        <button type="submit">
          <img src={props.data.thumbnailButton ? storageUrl + props.data.thumbnailButton : "/assets/play.svg"} alt="play" />
        </button>
      </form>
    </div>
  );
};

export default Thumbnail;

// if (props.data.thumbnail.password) {
//   if (
//     document.getElementById("thumbPass").value ===
//     props.data.thumbnail.password
//   ) {
//     props.startscene();
//   } else {
//     document.getElementById("thumbPassError").innerHTML = "invalid";
//   }
// } else {
//   props.startscene();
// }
