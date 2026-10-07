import { useEffect, useMemo, useRef, useState } from "react";
import { applyRuntimeMaterialControl, getRuntimeMaterialControlValue, getRuntimeMaterialControls } from "../sceneFunctions/runtimeMaterialControls";

function groupControls(controls) {
  return controls.reduce((acc, control) => {
    const group = control.group || "Material";

    if (!acc[group]) {
      acc[group] = [];
    }

    acc[group].push(control);
    return acc;
  }, {});
}

function formatRangeValue(value) {
  if (typeof value !== "number") {
    return value;
  }

  return Number.isInteger(value)
    ? value
    : value
        .toFixed(3)
        .replace(/\.0+$/, "")
        .replace(/(\.\d*?)0+$/, "$1");
}

function normalizeComparableValue(control, value) {
  if (value === undefined || value === null) {
    return value;
  }

  if (control.inputType === "range" || control.inputType === "number") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }

  if (control.inputType === "boolean") {
    return Boolean(value);
  }

  if (control.inputType === "color" && typeof value === "string") {
    return value.toLowerCase();
  }

  return value;
}

function isControlDirty(control, currentValue, baselineValue) {
  return normalizeComparableValue(control, currentValue) !== normalizeComparableValue(control, baselineValue);
}

function toDisplayPropertyName(propKey) {
  if (!propKey || typeof propKey !== "string") {
    return "Unknown";
  }

  return propKey
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();
}

export function RuntimeMaterialControls({ scene }) {
  const [collapsed, setCollapsed] = useState(false);
  const [controls, setControls] = useState([]);
  const [values, setValues] = useState({});
  const rafMapRef = useRef({});
  const initialValuesRef = useRef({});
  const [settings, setSettings] = useState({
    title: "Material Controls",
    collapsedByDefault: false,
    allowReset: true,
  });
  const [hasConfig, setHasConfig] = useState(false);
  const [diagnostics, setDiagnostics] = useState([]);

  useEffect(() => {
    if (!scene) {
      setControls([]);
      setValues({});
      initialValuesRef.current = {};
      setSettings({
        title: "Material Controls",
        collapsedByDefault: false,
        allowReset: true,
      });
      setHasConfig(false);
      setDiagnostics([]);
      return;
    }

    const { controls: nextControls, settings: nextSettings, hasConfig: nextHasConfig, diagnostics: nextDiagnostics } = getRuntimeMaterialControls(scene);
    setSettings(nextSettings);
    setCollapsed(Boolean(nextSettings.collapsedByDefault));
    setControls(nextControls);
    setHasConfig(Boolean(nextHasConfig));
    setDiagnostics(Array.isArray(nextDiagnostics) ? nextDiagnostics : []);

    const nextValues = {};
    let didApplyDefaultValue = false;

    nextControls.forEach((control) => {
      const hasDefault = control.defaultValue !== undefined;
      const nextValue = hasDefault ? control.defaultValue : getRuntimeMaterialControlValue(scene, control);

      nextValues[control.id] = nextValue;

      if (hasDefault) {
        const result = applyRuntimeMaterialControl(scene, control, nextValue);

        if (result.applied) {
          didApplyDefaultValue = true;
        }
      }
    });

    if (didApplyDefaultValue && typeof scene.forceUpdate === "function") {
      scene.forceUpdate();
    }

    // Keep an immutable snapshot of first-loaded values for reliable resets.
    initialValuesRef.current = nextValues;
    setValues(nextValues);
  }, [scene]);

  const groupedControls = useMemo(() => groupControls(controls), [controls]);

  useEffect(() => {
    return () => {
      Object.values(rafMapRef.current).forEach((id) => {
        if (id) {
          cancelAnimationFrame(id);
        }
      });
      rafMapRef.current = {};
    };
  }, []);

  const shouldShowDebugHint =
    scene &&
    settings.enabled !== false &&
    hasConfig &&
    !controls.length &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (!scene || (!controls.length && !shouldShowDebugHint)) {
    return null;
  }

  const applyControl = (control, nextValue) => {
    const result = applyRuntimeMaterialControl(scene, control, nextValue);

    if (!result.applied) {
      return;
    }

    if (typeof scene.forceUpdate === "function") {
      scene.forceUpdate();
    }
  };

  const onControlChange = (control, nextValue) => {
    setValues((prev) => ({
      ...prev,
      [control.id]: nextValue,
    }));

    if (control.inputType === "range") {
      const existingRafId = rafMapRef.current[control.id];

      if (existingRafId) {
        cancelAnimationFrame(existingRafId);
      }

      const nextRafId = requestAnimationFrame(() => {
        applyControl(control, nextValue);
        rafMapRef.current[control.id] = null;
      });

      rafMapRef.current[control.id] = nextRafId;

      return;
    }

    applyControl(control, nextValue);
  };

  const getResetValueForControl = (control) => {
    const snapshotValue = initialValuesRef.current[control.id];

    if (control.defaultValue !== undefined) {
      return control.defaultValue;
    }

    if (snapshotValue !== undefined) {
      return snapshotValue;
    }

    return getRuntimeMaterialControlValue(scene, control);
  };

  const onResetControl = (control) => {
    const existingRafId = rafMapRef.current[control.id];

    if (existingRafId) {
      cancelAnimationFrame(existingRafId);
      rafMapRef.current[control.id] = null;
    }

    const nextValue = getResetValueForControl(control);

    setValues((prev) => ({
      ...prev,
      [control.id]: nextValue,
    }));

    applyControl(control, nextValue);
  };

  const onReset = () => {
    const resetValues = {};

    Object.values(rafMapRef.current).forEach((id) => {
      if (id) {
        cancelAnimationFrame(id);
      }
    });
    rafMapRef.current = {};

    controls.forEach((control) => {
      const nextValue = getResetValueForControl(control);

      resetValues[control.id] = nextValue;
      applyControl(control, nextValue);
    });

    setValues(resetValues);
  };

  return (
    <div className={`runtime-material-controls ${collapsed ? "collapsed" : ""}`}>
      <button className="runtime-material-controls-toggle" onClick={() => setCollapsed((prev) => !prev)} type="button">
        <span className="material-symbols-outlined">tune</span>
        <span>{collapsed ? `Show ${settings.title}` : settings.title}</span>
      </button>

      {!collapsed ? (
        <div className="runtime-material-controls-body">
          {shouldShowDebugHint ? (
            <div className="runtime-material-controls-debug">
              <strong>No valid runtime controls found in scene config.</strong>
              <div>Check material names and property keys in runtimeMaterialControls.</div>
              {diagnostics.length ? (
                <ul>
                  {diagnostics.slice(0, 6).map((message, index) => (
                    <li key={`diag.${index}`}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {!controls.length ? null : (
            <>
              {settings.allowReset ? (
                <div className="runtime-material-controls-actions">
                  <button
                    className="runtime-material-controls-reset"
                    type="button"
                    onClick={onReset}
                    title="Reset all controls"
                    aria-label="Reset all controls"
                  >
                    <span className="material-symbols-outlined">refresh</span>
                  </button>
                </div>
              ) : null}

              {Object.entries(groupedControls).map(([groupName, groupItems]) => {
                return (
                  <section key={groupName} className="runtime-material-controls-group">
                    <h4>{groupName}</h4>

                    {groupItems.map((control) => {
                      const value = values[control.id] ?? "";
                      const baselineValue = getResetValueForControl(control);
                      const dirty = isControlDirty(control, value, baselineValue);

                      return (
                        <label key={control.id} className="runtime-material-control-field">
                          <div className="runtime-material-control-header">
                            <span className="runtime-material-control-title-wrap">
                              <span>{control.label}</span>
                              {dirty ? <span className="runtime-material-control-dirty-dot" title="Modified" aria-label="Modified" /> : null}
                            </span>
                            <span className="runtime-material-control-header-actions">
                              {control.inputType === "range" ? <span>{formatRangeValue(value)}</span> : null}
                              {settings.allowReset ? (
                                <button
                                  type="button"
                                  className="runtime-material-control-reset"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    onResetControl(control);
                                  }}
                                  title={`Reset ${control.label}`}
                                  aria-label={`Reset ${control.label}`}
                                >
                                  <span className="material-symbols-outlined">refresh</span>
                                </button>
                              ) : null}
                            </span>
                          </div>

                          <div className="runtime-material-control-meta" title={`${toDisplayPropertyName(control.propKey)} • ${control.materialName}`}>
                            {toDisplayPropertyName(control.propKey)} • {control.materialName}
                          </div>

                          {control.inputType === "range" || control.inputType === "number" ? (
                            <input
                              type={control.inputType === "range" ? "range" : "number"}
                              min={control.min}
                              max={control.max}
                              step={control.step || 0.01}
                              value={value}
                              onChange={(event) => onControlChange(control, event.target.value)}
                            />
                          ) : null}

                          {control.inputType === "color" ? (
                            <input type="color" value={value || "#ffffff"} onChange={(event) => onControlChange(control, event.target.value)} />
                          ) : null}

                          {control.inputType === "boolean" ? (
                            <input type="checkbox" checked={Boolean(value)} onChange={(event) => onControlChange(control, event.target.checked)} />
                          ) : null}

                          {control.inputType === "select" ? (
                            <select value={value} onChange={(event) => onControlChange(control, event.target.value)}>
                              {control.options.map((option, index) => {
                                const optionValue = option && option.value !== undefined ? option.value : option;
                                const optionLabel = option && option.label !== undefined ? option.label : option;

                                return (
                                  <option key={`${control.id}.option.${index}`} value={optionValue}>
                                    {optionLabel}
                                  </option>
                                );
                              })}
                            </select>
                          ) : null}

                          {control.description ? <small>{control.description}</small> : null}
                        </label>
                      );
                    })}
                  </section>
                );
              })}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
