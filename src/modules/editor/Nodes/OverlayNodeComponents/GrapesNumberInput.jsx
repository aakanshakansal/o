export default function GrapesNumberInput(props) {
  return (
    <div style={{ display: "block" }}>
      <div class="gjs-sm-label" data-sm-label="">
        <span class="gjs-sm-icon " title="">
          {props.label}
        </span>
      </div>
      <div class="gjs-fields" data-sm-fields="">
        <div class="gjs-field gjs-field-integer">
          <span class="gjs-input-holder">
            <input type="number" label="Duration (s)" defaultValue={props.defaultValue} onChange={props.onChange} />
          </span>
          <span class="gjs-field-units"></span>
        </div>
      </div>
    </div>
  );
}
