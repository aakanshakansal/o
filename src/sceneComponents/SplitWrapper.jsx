const SplitWrapper = (props) => {
  if (window.location.search.indexOf("editmode=true") !== -1 || window.location.pathname === "/sandbox") {
    return (
      <div id="sceneContainer" className="editmode">
        {props.children}
      </div>
    );
  } else {
    return <div id="sceneContainer">{props.children}</div>;
  }
};

export default SplitWrapper;
