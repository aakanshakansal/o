export const ColorInput = (props) => {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input id={Math.floor(Math.random() * 9999)} type="color" value={props.value} onBlur={props.onBlur} onChange={props.onChange} onFocus={props.onFocus} />
      <span className="label" style={{ pointerEvents: "none" }}>
        {props.label}
      </span>
      <span style={{ pointerEvents: "none" }} className="colorValue">
        {props.value}
      </span>
    </div>
  );
};
