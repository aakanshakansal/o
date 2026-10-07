import { Color3 } from "@babylonjs/core";
import { getDeep, getSceneElementPropsByName, setDeep } from "../helpers";

const RUNTIME_ALLOWED_MATERIALS = new Set(["PBRMaterial", "TransmissionMaterial", "DiamondMaterial"]);
const SUPPORTED_PROP_TYPES = new Set(["Number", "Range", "Color3", "Boolean", "Select"]);

const INPUT_TYPES = new Set(["range", "number", "color", "boolean", "select"]);

function toControlArray(rawConfig) {
    if (!rawConfig) {
        return [];
    }

    if (Array.isArray(rawConfig)) {
        return rawConfig;
    }

    if (rawConfig.enabled === false) {
        return [];
    }

    if (Array.isArray(rawConfig.controls)) {
        return rawConfig.controls;
    }

    if (typeof rawConfig === "object") {
        return Object.entries(rawConfig)
            .filter(([key]) => key !== "enabled")
            .map(([id, value]) => {
                if (value && typeof value === "object") {
                    return {
                        id,
                        ...value,
                    };
                }

                return null;
            })
            .filter(Boolean);
    }

    return [];
}

function getRuntimePanelSettings(rawConfig) {
    if (!rawConfig || typeof rawConfig !== "object") {
        return {
            enabled: true,
            title: "Material Controls",
            collapsedByDefault: false,
            allowReset: true,
        };
    }

    return {
        enabled: rawConfig.enabled !== false,
        title: typeof rawConfig.title === "string" && rawConfig.title.trim().length ? rawConfig.title.trim() : "Material Controls",
        collapsedByDefault: Boolean(rawConfig.collapsedByDefault),
        allowReset: rawConfig.allowReset !== false,
    };
}

function createEmptyResult(settings, hasConfig = false, diagnostics = []) {
    return {
        controls: [],
        settings,
        hasConfig,
        diagnostics,
    };
}

function resolveMaterial(scene, materialName, materialDisplayName) {
    if (!scene || !materialName) {
        return null;
    }

    const byName = scene.getMaterialByName(materialName);
    if (byName) {
        return byName;
    }

    const displayNameToMatch = materialDisplayName || materialName;

    if (!displayNameToMatch || !Array.isArray(scene.materials)) {
        return null;
    }

    return scene.materials.find((material) => material && material.displayName === displayNameToMatch) || null;
}

function toOptions(optionMap) {
    if (!optionMap || typeof optionMap !== "object") {
        return [];
    }

    return Object.entries(optionMap).map(([value, label]) => ({
        value,
        label: String(label),
    }));
}

function inferInputType(propType) {
    if (propType === "Number" || propType === "Range") {
        return "range";
    }

    if (propType === "Color3") {
        return "color";
    }

    if (propType === "Boolean") {
        return "boolean";
    }

    if (propType === "Select") {
        return "select";
    }

    return null;
}

function isAllowedMaterialProperty(materialClass, propKey, propDef) {
    if (!RUNTIME_ALLOWED_MATERIALS.has(materialClass)) {
        return false;
    }

    if (!propDef || !SUPPORTED_PROP_TYPES.has(propDef.type)) {
        return false;
    }

    if (typeof propKey !== "string" || propKey.endsWith("REF")) {
        return false;
    }

    return true;
}

function normalizeColor(value) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    const sixDigit = /^#[0-9A-Fa-f]{6}$/;
    const threeDigit = /^#[0-9A-Fa-f]{3}$/;

    if (sixDigit.test(trimmed)) {
        return trimmed;
    }

    if (threeDigit.test(trimmed)) {
        const r = trimmed[1];
        const g = trimmed[2];
        const b = trimmed[3];
        return `#${r}${r}${g}${g}${b}${b}`;
    }

    return null;
}

function getDisplayValue(node, propKey, propType) {
    const rawValue = getDeep(node, propKey);

    if (rawValue === undefined || rawValue === null) {
        return null;
    }

    if (propType === "Color3") {
        if (typeof rawValue.toGammaSpace === "function" && typeof rawValue.toHexString === "function") {
            return rawValue.toGammaSpace().toHexString();
        }

        if (typeof rawValue.toHexString === "function") {
            return rawValue.toHexString();
        }
    }

    return rawValue;
}

function clampNumber(value, min, max) {
    let result = value;

    if (typeof min === "number") {
        result = Math.max(min, result);
    }

    if (typeof max === "number") {
        result = Math.min(max, result);
    }

    return result;
}

function toNumber(value) {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
}

export function getRuntimeMaterialControls(scene) {
    const defaultSettings = getRuntimePanelSettings(null);

    if (!scene || !scene.mainData || !scene.mainData.data) {
        return createEmptyResult(defaultSettings, false, []);
    }

    const rawConfig = scene.mainData.data.runtimeMaterialControls;
    const panelSettings = getRuntimePanelSettings(rawConfig);
    const hasConfig = rawConfig !== undefined;
    const diagnostics = [];

    if (!panelSettings.enabled) {
        return createEmptyResult(panelSettings, hasConfig, diagnostics);
    }

    const rawControls = toControlArray(rawConfig);

    if (!rawControls.length) {
        return createEmptyResult(panelSettings, hasConfig, diagnostics);
    }

    const controls = rawControls
        .map((control, index) => {
            if (!control || typeof control !== "object") {
                diagnostics.push(`Control at index ${index} is not an object.`);
                return null;
            }

            if (control.enabled === false) {
                return null;
            }

            const materialName = control.materialName || control.nodeName;
            const materialDisplayName = control.materialDisplayName;
            const propKey = control.property || control.prop;

            if (!materialName || !propKey) {
                diagnostics.push(`Control \"${control.id || index}\" is missing materialName/nodeName or property/prop.`);
                return null;
            }

            const material = resolveMaterial(scene, materialName, materialDisplayName);

            if (!material || typeof material.getClassName !== "function") {
                diagnostics.push(`Control \"${control.id || index}\" could not resolve material \"${materialName}\".`);
                return null;
            }

            const materialClass = material.getClassName();

            const props = getSceneElementPropsByName(scene, material.name);
            const propDef = props ? props[propKey] : null;

            if (!isAllowedMaterialProperty(materialClass, propKey, propDef)) {
                diagnostics.push(`Control \"${control.id || index}\" targets unsupported property \"${propKey}\" for ${materialClass}.`);
                return null;
            }

            if (!propDef) {
                diagnostics.push(`Control \"${control.id || index}\" property definition for \"${propKey}\" was not found.`);
                return null;
            }

            const inferredInputType = inferInputType(propDef.type);
            const requestedInputType = control.inputType || control.type;
            const inputType = INPUT_TYPES.has(requestedInputType) ? requestedInputType : inferredInputType;

            if (!inputType) {
                diagnostics.push(`Control \"${control.id || index}\" has unsupported inputType \"${requestedInputType}\".`);
                return null;
            }

            return {
                id: control.id || `${materialName}.${propKey}.${index}`,
                label: control.label || propDef.label || propKey,
                description: control.description || "",
                group: control.group || "Material",
                materialName: material.name,
                propKey,
                materialClass,
                inputType,
                min: typeof control.min === "number" ? control.min : propDef.min,
                max: typeof control.max === "number" ? control.max : propDef.max,
                step: typeof control.step === "number" ? control.step : propDef.step,
                options: Array.isArray(control.options) ? control.options : toOptions(propDef.options),
                defaultValue: control.defaultValue,
                propType: propDef.type,
            };
        })
        .filter(Boolean);

    return {
        controls,
        settings: panelSettings,
        hasConfig,
        diagnostics,
    };
}

export function getRuntimeMaterialControlValue(scene, control) {
    const material = scene && scene.getMaterialByName ? scene.getMaterialByName(control.materialName) : null;

    if (!material) {
        return control.defaultValue !== undefined ? control.defaultValue : null;
    }

    if (material.badChanges && material.badChanges[control.propKey] !== undefined) {
        return material.badChanges[control.propKey];
    }

    const value = getDisplayValue(material, control.propKey, control.propType);

    if (value === null || value === undefined) {
        return control.defaultValue !== undefined ? control.defaultValue : null;
    }

    return value;
}

export function applyRuntimeMaterialControl(scene, control, rawValue) {
    if (!scene || !control) {
        return { applied: false, reason: "missing-scene-or-control" };
    }

    const material = scene.getMaterialByName(control.materialName);

    if (!material) {
        return { applied: false, reason: "material-not-found" };
    }

    const props = getSceneElementPropsByName(scene, control.materialName);
    const propDef = props ? props[control.propKey] : null;

    if (!propDef) {
        return { applied: false, reason: "property-not-found" };
    }

    let value = rawValue;

    if (propDef.type === "Number" || propDef.type === "Range") {
        const parsed = toNumber(value);

        if (parsed === null) {
            return { applied: false, reason: "invalid-number" };
        }

        value = clampNumber(parsed, typeof control.min === "number" ? control.min : propDef.min, typeof control.max === "number" ? control.max : propDef.max);
    }

    if (propDef.type === "Boolean") {
        value = Boolean(value);
    }

    if (propDef.type === "Color3") {
        const normalized = normalizeColor(value);

        if (!normalized) {
            return { applied: false, reason: "invalid-color" };
        }

        value = normalized;
    }

    if (!material.badChanges) {
        material.badChanges = {};
    }

    material.badChanges[control.propKey] = value;

    if (propDef.onSet) {
        propDef.onSet(scene, material, value);
    } else if (propDef.type === "Color3") {
        setDeep(material, control.propKey, Color3.FromHexString(value).toLinearSpace());
    } else {
        setDeep(material, control.propKey, value);
    }

    return { applied: true, value };
}
