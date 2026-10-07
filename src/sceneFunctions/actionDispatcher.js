import {
  Animation,
  BounceEase,
  CircleEase,
  Color3,
  CubicEase,
  EasingFunction,
  QuadraticEase,
  QuarticEase,
  QuinticEase,
  SineEase,
  Vector2,
  Vector3,
} from "@babylonjs/core";

import { GLTF2Export } from "@babylonjs/serializers";
import merge from "deepmerge";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  getDeep,
  getDevice,
  getScene,
  getSceneElementByName,
  getSceneElementPropsByName,
  parseSceneData,
  postToParentWindow,
  setDeep,
  takeScreenshot,
} from "../helpers";
import { createSceneData } from "./createSceneData";
import evaluateMathExpression from "./safeExpressionEvaluator";

export const actionsDispatcher = (scene, props, options) => {
  try {
    if (scene.disableActions && options.trigger) return;
    if (!props) return;

    if (options.trackEvent) {
      //
      // window.umami.track("actionHasBeenTriggered", {
      //   eventName: "actionHasBeenTriggered",
      //   sceneId: scene.badId,
      //   sceneUrl: window.location.href,
      //   actionName: props.displayName || props.name,
      //   actionType: props.type,
      // });

      if (scene.mainData.ga4Id) {
        window.gtag("event", "actionHasBeenTriggered", {
          eventName: "actionHasBeenTriggered",
          sceneId: scene.badId,
          sceneUrl: window.location.href,
          actionName: props.displayName || props.name,
          actionType: props.type,
          send_to: scene.mainData.ga4Id,
        });
      }
      // window.dataLayer.push({
      //   event: "actionHasBeenTriggered",
      //   name: props.displayName || props.name,
      // });
    }

    postToParentWindow({ type: "actionHasBeenTriggered", data: { name: props.displayName || props.name, type: props.type } });

    if (window.location.search.indexOf("editmode=true") !== -1 || window.location.pathname === "/sandbox") {
      console.log(
        "%c" + props.type + " %c" + props.displayName + " %chas been fired",
        "color: #f44336; font-weight: bold",
        "color: #bada55; font-weight: bold",
        "color: unset; font-weight: normal"
      );
    }

    if (props.type === "ChangeScene" || props.type === "AddReplace") {
      if (options && !options.preventLog) {
        const newProps = { ...props };
        newProps.firedTime = Date.now() - scene.startTime;
        scene.updateActionsLog(newProps);
      }

      if (props.settings) {
        getScene(props.settings.id).then((selectedScene) => {
          if (selectedScene) {
            const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;

            let currentData;

            try {
              const updatedSceneData = createSceneData(scene, scene.sceneData);
              currentData = JSON.parse(JSON.stringify(scene.mainData));
              currentData.data = updatedSceneData;

              const mergedData = merge(currentData.data, props.settings.dataToMerge.add, { arrayMerge: overwriteMerge });

              Object.entries(props.settings.dataToMerge.replace).forEach(([k, v]) => {
                mergedData[k] = v;
              });

              currentData.data = mergedData;
              parseSceneData(currentData).then((data) => {
                data.organizationId = window.organizationId;

                scene.updateData(data);
                // if (props.endActions !== undefined) {
                //   props.endActions.forEach((endAction) => {
                //     if (scene.actions[endAction]) {
                //       actionsDispatcher(scene, scene.actions[endAction]);
                //     }
                //   });
                // }
              });
            } catch (error) {
              return console.log(error);
            }
          }
        });
      }
    }
    if (props.type === "Math") {
      if (options && !options.preventLog) {
        const newProps = { ...props };
        newProps.firedTime = Date.now() - scene.startTime;
        scene.updateActionsLog(newProps);
      }

      const operation = props.operation;

      if (
        !operation.hasOwnProperty("value1") ||
        !operation.value1.hasOwnProperty("nodeName") ||
        !operation.value1.hasOwnProperty("sourceKey") ||
        !operation.hasOwnProperty("value2")
      ) {
        return;
      }

      let value1;

      value1 = getDeep(getSceneElementByName(scene, operation.value1.nodeName), operation.value1.sourceKey);

      let value2;

      if (typeof operation.value2 === "object") {
        if (
          getSceneElementPropsByName(scene, operation.value1.nodeName) &&
          getSceneElementPropsByName(scene, operation.value1.nodeName)[operation.value1.sourceKey].backConversion &&
          getSceneElementPropsByName(scene, operation.value2.nodeName) &&
          !getSceneElementPropsByName(scene, operation.value2.nodeName)[operation.value2.sourceKey].backConversion
        ) {
          value2 = getSceneElementPropsByName(scene, operation.value1.nodeName)[operation.value1.sourceKey].backConversion(
            getDeep(getSceneElementByName(scene, operation.value2.nodeName), operation.value2.sourceKey)
          );
        } else {
          value2 = getDeep(getSceneElementByName(scene, operation.value2.nodeName), operation.value2.sourceKey);
        }
      } else {
        if (
          getSceneElementPropsByName(scene, operation.value1.nodeName) &&
          getSceneElementPropsByName(scene, operation.value1.nodeName)[operation.value1.sourceKey].backConversion
        ) {
          value2 = getSceneElementPropsByName(scene, operation.value1.nodeName)[operation.value1.sourceKey].backConversion(operation.value2);
        } else {
          value2 = operation.value2;
        }
      }

      const operator = operation.operator;

      switch (operator) {
        case "add":
          setDeep(getSceneElementByName(scene, operation.value1.nodeName), operation.value1.sourceKey, value1 + value2);
          break;
        case "subtract":
          setDeep(getSceneElementByName(scene, operation.value1.nodeName), operation.value1.sourceKey, value1 - value2);
          break;
        case "multiply":
          setDeep(getSceneElementByName(scene, operation.value1.nodeName), operation.value1.sourceKey, value1 * value2);
          break;
        case "divide":
          setDeep(getSceneElementByName(scene, operation.value1.nodeName), operation.value1.sourceKey, value1 / value2);
          break;
        case "set":
          setDeep(getSceneElementByName(scene, operation.value1.nodeName), operation.value1.sourceKey, value2);
          break;
        default:
          break;
      }
      if (props.endActions !== undefined) {
        props.endActions.forEach((endAction) => {
          if (scene.actions[endAction]) {
            actionsDispatcher(scene, scene.actions[endAction]);
          }
        });
      }
      scene.forceUpdate();
    }

    const condArr = [[]];
    if (props.type === "Condition") {
      function evaluateConditions(conditions) {
        // let result = false;
        // let currentGroupResult = false;
        // let previousConditionResult = false;
        // let previousConditionAnd = false;

        for (const conditionId in conditions) {
          const condition = conditions[conditionId];

          if (
            !condition.hasOwnProperty("value") ||
            !condition.value.hasOwnProperty("nodeName") ||
            !condition.value.hasOwnProperty("sourceKey") ||
            !condition.hasOwnProperty("compareValue")
          ) {
            continue;
          }

          let value;

          if (
            getSceneElementPropsByName(scene, condition.value.nodeName) &&
            getSceneElementPropsByName(scene, condition.value.nodeName)[condition.value.sourceKey].frontConversion
          ) {
            value = getSceneElementPropsByName(scene, condition.value.nodeName)[condition.value.sourceKey].frontConversion(
              getDeep(getSceneElementByName(scene, condition.value.nodeName), condition.value.sourceKey)
            );
          } else {
            value = getDeep(getSceneElementByName(scene, condition.value.nodeName), condition.value.sourceKey);
          }

          let compareValue;

          if (typeof condition.compareValue === "object") {
            if (
              getSceneElementPropsByName(scene, condition.compareValue.nodeName) &&
              getSceneElementPropsByName(scene, condition.compareValue.nodeName)[condition.compareValue.sourceKey].frontConversion
            ) {
              compareValue = getSceneElementPropsByName(scene, condition.compareValue.nodeName)[condition.compareValue.sourceKey].frontConversion(
                getDeep(getSceneElementByName(scene, condition.compareValue.nodeName), condition.compareValue.sourceKey)
              );
            } else {
              compareValue = getDeep(getSceneElementByName(scene, condition.compareValue.nodeName), condition.compareValue.sourceKey);
            }
          } else {
            compareValue = condition.compareValue;
          }

          const symbol = condition.symbol;
          const andor = condition.andor;

          // console.log("Evaluating Condition:", conditionId);
          // console.log("Value:", value);
          // console.log("CompareValue:", compareValue);
          // console.log("Symbol:", symbol);
          // console.log("andor:", andor);

          if (andor === "or") {
            condArr.push([]);
          }

          switch (symbol) {
            case "equalTo":
              condArr[condArr.length - 1].unshift(value === compareValue);
              break;
            case "notEqualTo":
              condArr[condArr.length - 1].unshift(value !== compareValue);
              break;
            case "lessThan":
              condArr[condArr.length - 1].unshift(value < compareValue);
              break;
            case "greaterThan":
              condArr[condArr.length - 1].unshift(value > compareValue);
              break;
            default:
              break;
          }
        }
      }

      evaluateConditions(props.conditions);

      condArr.forEach((cond, i) => {
        let isTrue = true;
        cond.forEach((c) => {
          if (c === false) {
            isTrue = false;
          }
        });

        condArr[i] = isTrue;
      });

      let isFinalTrue = false;

      condArr.forEach((c) => {
        if (c) {
          isFinalTrue = true;
        }
      });

      if (isFinalTrue) {
        scene.actions[props.name].trueActions.forEach((action, i) => {
          if (options && !options.preventLog) {
            const newProps = { ...props };
            newProps.subAction = action;
            newProps.firedTime = Date.now() - scene.startTime;

            scene.updateActionsLog(newProps);
          }

          return actionsDispatcher(scene, scene.actions[action], { preventLog: true });
        });
      } else {
        scene.actions[props.name].falseActions.forEach((action, i) => {
          if (options && !options.preventLog) {
            const newProps = { ...props };
            newProps.subAction = action;
            newProps.firedTime = Date.now() - scene.startTime;
            scene.updateActionsLog(newProps);
          }
          return actionsDispatcher(scene, scene.actions[action], { preventLog: true });
        });
      }
      if (props.endActions !== undefined) {
        props.endActions.forEach((endAction) => {
          if (scene.actions[endAction]) {
            actionsDispatcher(scene, scene.actions[endAction]);
          }
        });
      }
    }

    if (props.type === "ExternalLink") {
      if (window.location.href.indexOf("editmode=true") !== -1) {
        return;
      }
      if (options && !options.preventLog) {
        const newProps = { ...props };
        newProps.firedTime = Date.now() - scene.startTime;
        scene.updateActionsLog(newProps);
      }
      if (props.url) {
        if (props.newTab) {
          window.open(props.url, "_blank");
        } else {
          window.open(props.url, "_self");
        }
      }
    }

    if (props.type === "ExportScene") {
      // if (window.location.href.indexOf("editmode=true") !== -1) {
      //   return;
      // }
      let options = {
        shouldExportNode: function (node) {
          return (
            node.isEnabled() &&
            node.getClassName() !== "ArcRotateCamera" &&
            node.getClassName() !== "FreeCamera" &&
            node.getClassName() !== "UniversalCamera" &&
            node.getClassName() !== "PointLight" &&
            node.getClassName() !== "HemisphericLight" &&
            node.getClassName() !== "SpotLight" &&
            node.getClassName() !== "DirectionalLight" &&
            node.name !== "gridHelper" &&
            node.name !== "axisHelper" &&
            node.name !== "headTrackHelper" &&
            !props.excludedMeshes.includes(node.name)
          );
        },
      };

      GLTF2Export.GLBAsync(scene, "scene", options).then((glb) => {
        glb.downloadFiles();

        // if (document.getElementById("curtain")) {
        //   document.getElementById("curtain").style.display = "none";
        //   document.getElementById("curtainProgress").innerHTML = "";
        // }
      });
    }

    if (props.type === "EnterVTO") {
      if (window.location.href.indexOf("editmode=true") !== -1) {
        return;
      }

      if (options && !options.preventLog) {
        const newProps = { ...props };
        newProps.firedTime = Date.now() - scene.startTime;
        scene.updateActionsLog(newProps);
      }

      let path = window.location.href.split("?")[0];

      if (props.mode === "head") {
        if (props.newTab) {
          window.open(path + "?vto=head", "_blank");
        } else {
          window.open(path + "?vto=head", "_self");
        }
      }

      if (props.mode === "exit") {
        if (props.newTab) {
          window.open(path, "_blank");
        } else {
          window.open(path, "_self");
        }
      }
    }

    if (props.type === "Screenshot") {
      takeScreenshot(scene, props.width, props.height, props.quality).then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `screen_${scene.badId}.webp`;
        link.click();
      });
    }

    if (props.type === "Sequencer") {
      if (!scene.hasOwnProperty(props.name + "Step")) {
        scene[props.name + "Step"] = 0;
      }
      if (!props.steps[scene[props.name + "Step"]]) {
        if (scene[props.name + "Step"] + 1 > props.totalSteps) {
          scene[props.name + "Step"] = 0;
        } else {
          scene[props.name + "Step"] = scene[props.name + "Step"] + 1;
        }
        return;
      }
      props.steps[scene[props.name + "Step"]].forEach((id, i) => {
        if (scene.actions.hasOwnProperty(id)) {
          if (options && !options.preventLog) {
            const newProps = { ...props };
            newProps.subAction = id;
            newProps.firedTime = Date.now() - scene.startTime;
            scene.updateActionsLog(newProps);
          }

          return actionsDispatcher(scene, scene.actions[id], { preventLog: true });
        }
      });
      if (scene[props.name + "Step"] + 1 > props.totalSteps) {
        scene[props.name + "Step"] = 0;
      } else {
        scene[props.name + "Step"] = scene[props.name + "Step"] + 1;
      }
    }

    if (props.type === "EnterAR") {
      if (options && !options.preventLog) {
        const newProps = { ...props };
        newProps.firedTime = Date.now() - scene.startTime;
        scene.updateActionsLog(newProps);
      }
      const enterArGlb = () => {
        const anchor = document.createElement("a");

        anchor.setAttribute(
          "href",
          `intent://arvr.google.com/scene-viewer/1.1?file=${props.glb}&mode=ar_only#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`
        );
        anchor.click();
      };
      const enterArUsdz = () => {
        const anchor = document.createElement("a");
        anchor.setAttribute("rel", "ar");
        anchor.appendChild(document.createElement("img"));

        anchor.setAttribute("href", props.usdz);
        anchor.click();
      };
      if (getDevice() === "IOS" && props.usdz) {
        return enterArUsdz();
      }
      if ((getDevice() === "Android" || getDevice() === "WindowsPhone") && props.glb) {
        return enterArGlb();
      }

      if (props.glb || props.usdz) {
        QRCode.toCanvas(document.getElementById("arQrCode"), "https://" + window.location.host + window.location.pathname + "/ar", function (error) {
          if (error) console.error(error);
          //  console.log("success!");
        });
        document.getElementById("arQrText").innerHTML = props.customText
          ? props.customText.replace(/</g, "&lt;")
          : "Scan the QR Code with a supported device to enter the AR experience.";
        return scene.showQr(props);
      }

      return;
    }

    if (props.type === "Overlays") {
      if (options && !options.preventLog) {
        const newProps = { ...props };
        newProps.firedTime = Date.now() - scene.startTime;
        scene.updateActionsLog(newProps);
      }
      let overlaysToEnableArr = props.overlaysToEnable
        ? Array.isArray(props.overlaysToEnable)
          ? props.overlaysToEnable
          : props.overlaysToEnable.split(",")
        : [];
      let overlaysToDisableArr = props.overlaysToDisable
        ? Array.isArray(props.overlaysToDisable)
          ? props.overlaysToDisable
          : props.overlaysToDisable.split(",")
        : [];

      let elementsToShowArr = props.elementsToShow ? (Array.isArray(props.elementsToShow) ? props.elementsToShow : props.elementsToShow.split(",")) : [];
      let elementsToHideArr = props.elementsToHide ? (Array.isArray(props.elementsToHide) ? props.elementsToHide : props.elementsToHide.split(",")) : [];

      // let elementsToShowArr = props.hasOwnProperty("elementsToShow") ? props.elementsToShow.split(",") : [];
      // let elementsToHideArr = props.hasOwnProperty("elementsToHide") ? props.elementsToHide.split(",") : [];

      overlaysToEnableArr.forEach((e) => {
        Object.values(scene.overlays).forEach((o) => {
          if (o.displayName === e || o.name === e) {
            o.enabled = true;
          }
        });
      });
      overlaysToDisableArr.forEach((e) => {
        Object.values(scene.overlays).forEach((o) => {
          if (o.displayName === e || o.name === e) {
            o.enabled = false;
          }
        });
      });
      elementsToShowArr.forEach((e) => {
        if (document.getElementById(e)) {
          document.getElementById(e).style.display = "flex";
        }
      });
      elementsToHideArr.forEach((e) => {
        if (document.getElementById(e)) {
          document.getElementById(e).style.display = "none";
        }
      });

      if (props.overlaysToEnable.length === 0 && props.overlaysToDisable.length > 0) {
        // RE-ENTER VR!!!
        if (!scene.vrActive && scene.VRHelper && scene.VRHelper.baseExperience) {
          const enterVR = async () => {
            const xrOptions = {};
            await scene.VRHelper.baseExperience.enterXRAsync("immersive-vr", "local-floor", undefined, xrOptions);
          };
          enterVR();
        }
      }

      if (props.overlaysToEnable.length > 0) {
        // EXIT VR!!!
        if (scene.vrActive && scene.VRHelper && scene.VRHelper.baseExperience) {
          //  scene.backInVr = true;
          const exitVR = async () => {
            await scene.VRHelper.baseExperience.exitXRAsync();
            window.dispatchEvent(new Event("resize"));
          };
          exitVR();
        }
      }
      if (props.endActions !== undefined) {
        props.endActions.forEach((endAction) => {
          if (scene.actions[endAction]) {
            actionsDispatcher(scene, scene.actions[endAction]);
          }
        });
      }
      scene.forceUpdate();
    }

    if (props.type === "Timeline") {
      //  console.log(scene.actions, props.name);
      if (scene.actions[props.name].actions.length) {
        return scene.actions[props.name].actions.forEach((action, i) => {
          if (scene.actions.hasOwnProperty(action.name)) {
            if (scene.hasOwnProperty(props.name + action.name + i + "AnimationFrame")) {
              scene.unregisterAfterRender(scene[props.name + action.name + i + "AnimationFrame"]);
            }

            // let delta = 0;
            // let hasFired = false;
            // let fpsThen = window.performance.now();

            let constant = 0;
            let hasFired = false;
            let totalElapsed = 0;
            let fpsThen = window.performance.now();

            scene[props.name + action.name + i + "AnimationFrame"] = () => {
              // let fpsNow = window.performance.now();
              // let fps = 1000 / (fpsNow - fpsThen);
              // fpsThen = fpsNow;

              let fpsNow = window.performance.now();
              totalElapsed = totalElapsed + (fpsNow - fpsThen);
              fpsThen = fpsNow;
              const currentFrame = parseInt((totalElapsed / 1000) * 60);

              if (action.start && currentFrame < action.start) {
                return;
              }
              // if (!hasFired) {
              //   actionsDispatcher(scene, scene.actions[action.name]);
              //   hasFired = true;
              // }

              if (!hasFired) {
                if (options && !options.preventLog) {
                  const newProps = { ...props };
                  newProps.firedTime = Date.now() - scene.startTime;
                  newProps.subAction = action.name;
                  scene.updateActionsLog(newProps);
                }
                actionsDispatcher(scene, scene.actions[action.name], { preventLog: true });
                hasFired = true;
              }

              if (currentFrame >= props.duration) {
                if (props.loopMode === "Infinite") {
                  hasFired = false;
                  return (totalElapsed = 0);
                }
                if (props.loopMode === "Constant" && props.loopConstant > 0 && constant < props.loopConstant - 1) {
                  totalElapsed = 0;
                  hasFired = false;
                  return constant++;
                }
                scene.unregisterAfterRender(scene[props.name + action.name + i + "AnimationFrame"]);
              }
            };

            scene.registerAfterRender(scene[props.name + action.name + i + "AnimationFrame"]);
          }
        });
      }
    }

    if (props.type === "PlayAnimationGroup") {
      if (options && !options.preventLog) {
        const newProps = { ...props };
        newProps.firedTime = Date.now() - scene.startTime;
        scene.updateActionsLog(newProps);
      }
      const name = props.animationGroupName;
      if (scene.getAnimationGroupByName(name)) {
        scene.getAnimationGroupByName(name).play();
      }
    }
    if (props.type === "PauseAnimationGroup") {
      if (options && !options.preventLog) {
        const newProps = { ...props };
        newProps.firedTime = Date.now() - scene.startTime;
        scene.updateActionsLog(newProps);
      }
      const name = props.animationGroupName;
      if (scene.getAnimationGroupByName(name)) {
        scene.getAnimationGroupByName(name).pause();
      }
    }
    if (props.type === "StopAnimationGroup") {
      if (options && !options.preventLog) {
        const newProps = { ...props };
        newProps.firedTime = Date.now() - scene.startTime;
        scene.updateActionsLog(newProps);
      }
      const name = props.animationGroupName;
      if (scene.getAnimationGroupByName(name)) {
        scene.getAnimationGroupByName(name).stop();
      }
    }

    if (props.type === "Animate") {
      if (!window.configLog) {
        window.configLog = {};
      }
      if (options && !options.preventLog) {
        const newProps = { ...props };
        newProps.firedTime = Date.now() - scene.startTime;
        scene.updateActionsLog(newProps);
      }

      if (props.endActions !== undefined) {
        let frameElapsed = 0;
        let wasFired = false;

        const endActionsLoop = scene.registerBeforeRender(() => {
          frameElapsed = frameElapsed + 1;
          if (frameElapsed >= props.duration && !wasFired) {
            wasFired = true;
            scene.unregisterBeforeRender(endActionsLoop);
            props.endActions.forEach((endAction) => {
              if (scene.actions[endAction]) {
                actionsDispatcher(scene, scene.actions[endAction]);
              }
            });
          }
        });
      }

      Object.entries(props.nodes).forEach(([n, p]) => {
        const node = getSceneElementByName(scene, n);
        const nodeProps = getSceneElementPropsByName(scene, n);

        if (node && nodeProps) {
          //  let anims = [];
          if (!node.animations) {
            node.animations = [];
          }

          try {
            Object.entries(p.props).forEach(([k, v]) => {
              if (!nodeProps.hasOwnProperty(k)) return;

              // CUSTOM LOOP
              if (
                nodeProps[k].type === "FunctionButton" ||
                nodeProps[k].type === "Boolean" ||
                nodeProps[k].type === "Texture" ||
                nodeProps[k].type === "Select" ||
                nodeProps[k].type === "Material"
              ) {
                if (options && options.hasOwnProperty("goToFrame")) return;
                if (options && options.hasOwnProperty("totalHeight") && options.hasOwnProperty("scrollPos")) return;
                if (scene.hasOwnProperty("AnimationFrame_" + props.name + node.name + k)) {
                  scene.unregisterAfterRender(scene["AnimationFrame_" + props.name + node.name + k]);
                }
                let firedFrames = [];
                let totalElapsed = 0;
                let fpsThen = window.performance.now();
                scene["AnimationFrame_" + props.name + node.name + k] = () => {
                  let fpsNow = window.performance.now();
                  totalElapsed = totalElapsed + (fpsNow - fpsThen);
                  fpsThen = fpsNow;
                  const currentFrame = parseInt((totalElapsed / 1000) * 60);

                  Object.entries(v.keyFrames).forEach(([frame, data]) => {
                    if (currentFrame >= frame && !firedFrames.includes(frame)) {
                      firedFrames.push(frame);
                      if (nodeProps[k].type === "FunctionButton" && nodeProps[k].hasOwnProperty("function")) {
                        return nodeProps[k].function(null, scene, node);
                      }

                      if (nodeProps[k].type === "Boolean") {
                        if (nodeProps[k].hasOwnProperty("onSet")) {
                          return nodeProps[k].onSet(scene, node, Boolean(data.value));
                        } else {
                          return setDeep(node, k, Boolean(data.value));
                        }
                      }

                      if (nodeProps[k].type === "Select") {
                        if (nodeProps[k].hasOwnProperty("onSet")) {
                          return nodeProps[k].onSet(scene, node, data.value);
                        } else {
                          return setDeep(node, k, data.value);
                        }
                      }

                      if (nodeProps[k].type === "Texture") {
                        if (nodeProps[k].hasOwnProperty("onSet")) {
                          return nodeProps[k].onSet(scene, node, data.value);
                        } else {
                          return setDeep(node, k, scene.getTextureByName(data.value));
                        }
                      }

                      if (nodeProps[k].type === "Material") {
                        if (nodeProps[k].hasOwnProperty("onSet")) {
                          return nodeProps[k].onSet(scene, node, data.value);
                        } else {
                          return setDeep(node, k, scene.getMaterialByName(data.value));
                        }
                      }

                      if (frame > Object.keys(v.keyFrames).pop()) {
                        return scene.unregisterAfterRender(scene["AnimationFrame_" + props.name + node.name + k]);
                      }
                    }
                  });
                };

                scene.registerAfterRender(scene["AnimationFrame_" + props.name + node.name + k]);
              }

              // ANIM
              if (
                nodeProps[k].type === "Vector3" ||
                nodeProps[k].type === "Vector2" ||
                nodeProps[k].type === "Color3" ||
                nodeProps[k].type === "Number" ||
                nodeProps[k].type === "Range"
              ) {
                let anim = node.animations.find((a) => a.name === "Animation_" + props.name + node.name + k);
                // if (!anim || (options && options.force)) {

                if (options && options.hasOwnProperty("totalHeight") && options.hasOwnProperty("scrollPos") && anim) {
                  return;
                } else {
                  const keyFrames = [];

                  let dataType;

                  // VECTOR 3
                  if (nodeProps[k].type === "Vector3") {
                    if (!v.keyFrames.hasOwnProperty(0)) {
                      keyFrames.push({ frame: 0, value: getDeep(node, k) });
                    }
                    Object.entries(v.keyFrames).forEach(([f, d]) => {
                      keyFrames.push({ frame: parseInt(f), value: new Vector3(d.value.x, d.value.y, d.value.z) });
                    });
                    dataType = Animation.ANIMATIONTYPE_VECTOR3;
                  }

                  if (nodeProps[k].type === "Vector2") {
                    if (!v.keyFrames.hasOwnProperty(0)) {
                      keyFrames.push({ frame: 0, value: getDeep(node, k) });
                    }
                    Object.entries(v.keyFrames).forEach(([f, d]) => {
                      keyFrames.push({ frame: parseInt(f), value: new Vector2(d.value.x, d.value.y) });
                    });
                    dataType = Animation.ANIMATIONTYPE_VECTOR2;
                  }

                  // COLOR 3
                  if (nodeProps[k].type === "Color3") {
                    if (!v.keyFrames.hasOwnProperty(0)) {
                      keyFrames.push({ frame: 0, value: getDeep(node, k) });
                    }
                    Object.entries(v.keyFrames).forEach(([f, d]) => {
                      keyFrames.push({ frame: parseInt(f), value: Color3.FromHexString(d.value).toLinearSpace() });
                    });
                    dataType = Animation.ANIMATIONTYPE_COLOR3;
                  }

                  // Number / Range
                  if (nodeProps[k].type === "Number" || nodeProps[k].type === "Range") {
                    if (!v.keyFrames.hasOwnProperty(0)) {
                      keyFrames.push({ frame: 0, value: parseFloat(getDeep(node, k)) });
                    }
                    Object.entries(v.keyFrames).forEach(([f, d]) => {
                      keyFrames.push({ frame: parseInt(f), value: parseFloat(d.value) });
                    });
                    dataType = Animation.ANIMATIONTYPE_FLOAT;
                  }
                  //  anim = node.animations.find((a) => a.name === "Animation_" + props.name + node.name + k);
                  anim = node.animations.find((a) => a.name === "Animation_" + props.name + node.name + k);
                  if (!anim) {
                    anim = new Animation("Animation_" + props.name + node.name + k, k, 60, dataType);
                    node.animations.push(anim);
                  }

                  anim.setKeys(keyFrames);

                  let easingFun;

                  if (!v.easingFun) {
                    easingFun = new CircleEase();
                  } else {
                    if (v.easingFun === "CircleEase") {
                      easingFun = new CircleEase();
                    }
                    if (v.easingFun === "CubicEase") {
                      easingFun = new CubicEase();
                    }
                    if (v.easingFun === "QuadraticEase") {
                      easingFun = new QuadraticEase();
                    }
                    if (v.easingFun === "QuarticEase") {
                      easingFun = new QuarticEase();
                    }
                    if (v.easingFun === "QuinticEase") {
                      easingFun = new QuinticEase();
                    }
                    if (v.easingFun === "SineEase") {
                      easingFun = new SineEase();
                    }
                    if (v.easingFun === "BounceEase") {
                      easingFun = new BounceEase();
                    }
                  }

                  if (v.hasOwnProperty("easingMode") && v.easingFun && (v.easingMode !== null || v.easingMode !== "None")) {
                    easingFun.setEasingMode(EasingFunction[v.easingMode]);
                    anim.setEasingFunction(easingFun);
                  } else {
                    anim.setEasingFunction(null);
                  }
                }
              }

              const lastValue = v.keyFrames[Object.keys(v.keyFrames)[Object.keys(v.keyFrames).length - 1]];

              if (props.trackEvent) {
                if (!window.configLog[node.name]) {
                  window.configLog[node.name] = { displayName: node.displayName, className: node.getClassName(), props: {} };
                }

                if (!window.configLog[node.name].props[k]) {
                  window.configLog[node.name].props[k] = {};
                }

                window.configLog[node.name].props[k] = {
                  action: props.displayName || props.name,
                  type: nodeProps[k].type,
                  value: lastValue.value,
                };
              }
            });
          } catch (error) {
            console.warn(error);
          }

          node.animations.forEach((a) => {
            if (a.name.indexOf(props.name) !== -1) {
              let animatable;

              if (scene.vrActive && node.getClassName() === "UniversalCamera") {
                if (a.targetProperty === "position.x") {
                  a._keys[0].value = scene.getCameraByName("webxr").position.x;
                }
                if (a.targetProperty === "position.y") {
                  a._keys[0].value = scene.getCameraByName("webxr").position.y;
                }
                if (a.targetProperty === "position.z") {
                  a._keys[0].value = scene.getCameraByName("webxr").position.z;
                }
                animatable = scene.beginDirectAnimation(scene.getCameraByName("webxr"), [a], 0, parseInt(props.duration));
                scene.beginDirectAnimation(node, [a], 0, parseInt(props.duration));
              } else {
                animatable = scene.beginDirectAnimation(node, [a], 0, parseInt(props.duration));
              }

              if (options && options.hasOwnProperty("totalHeight") && options.hasOwnProperty("scrollPos")) {
                animatable.pause();
                return animatable.goToFrame((props.duration / options.totalHeight) * options.scrollPos);
              } else if (options && options.hasOwnProperty("goToFrame")) {
                animatable.pause();
                return animatable.goToFrame(options.goToFrame);
              } else {
                return;
              }
            } else {
              return;
            }
          });
        }
      });
    }

    if (props.type === "SaveConfig") {
      console.log("SaveConfig", props);
      if (options && !options.preventLog) {
        const newProps = { ...props };
        newProps.firedTime = Date.now() - scene.startTime;
        scene.updateActionsLog(newProps);
      }

      const configSettings = {
        materials: {},
        nodes: {},
        textures: {},
      };

      const humanReadableData = {};

      if (window.configLog) {
        Object.entries(window.configLog).forEach(([k, v]) => {
          if (!humanReadableData[v.displayName]) {
            humanReadableData[v.displayName] = [];
          }

          Object.entries(v.props).forEach(([k2, v2]) => {
            if (!humanReadableData[v.displayName].includes(v2.action)) {
              humanReadableData[v.displayName].push(v2.action);
            }
          });

          if (v.className === "PBRMaterial") {
            if (!configSettings.materials[k]) {
              configSettings.materials[k] = {};
            }

            Object.entries(v.props).forEach(([k2, v2]) => {
              configSettings.materials[k][k2] = v2.value;
            });
          }

          if (v.className === "DynamicTexture") {
            if (!configSettings.textures[k]) {
              configSettings.textures[k] = {};
            }

            Object.entries(v.props).forEach(([k2, v2]) => {
              configSettings.textures[k][k2] = v2.value;
            });
          }

          if (v.className === "Mesh" || v.className === "TransformNode") {
            if (!configSettings.nodes[k]) {
              configSettings.nodes[k] = {};
            }

            Object.entries(v.props).forEach(([k2, v2]) => {
              configSettings.nodes[k][k2] = v2.value;
            });
          }
        });
      }

      const url =
        window.location.origin + window.location.pathname + "?data=" + encodeURIComponent(JSON.stringify(configSettings)) + (props.naked ? "&naked=true" : "");
      console.log(humanReadableData);
      console.log(url);

      navigator.clipboard.writeText(url).then(() => {
        toast.success(props.notification || "The link was copied in your clipboard.");

        postToParentWindow({ type: "configurationData", data: humanReadableData, url: url });
      });
      if (props.endActions !== undefined) {
        props.endActions.forEach((endAction) => {
          if (scene.actions[endAction]) {
            actionsDispatcher(scene, scene.actions[endAction]);
          }
        });
      }
    }

    if (props.type === "Expression") {
      if (scene.expressionsStorage === undefined) {
        scene.expressionsStorage = {};
      }

      function evaluateExpression(scene, expression) {
        if (scene.expressionsStorage[expression] === undefined) {
          scene.expressionsStorage[expression] = {};
          scene.expressionsStorage[expression].nodes = {};
        }

        const [lhs, rhs] = expression.split("=").map((part) => part.trim());

        function replaceProps(match, path) {
          const [nodeName, ...rest] = path.split(".");

          let node = null;

          if (scene.expressionsStorage[expression].nodes[nodeName]) {
            //  console.log("using storage rhs");
            node = scene.expressionsStorage[expression].nodes[nodeName];
          } else {
            //  console.log("need to store");
            node = getSceneElementByName(scene, nodeName);
            scene.expressionsStorage[expression].nodes[nodeName] = node;
          }

          if (!node) {
            throw new Error(`Could not find element: ${nodeName}`);
          }
          return getDeep(node, rest.join("."));
        }

        // Replace property references in RHS and evaluate
        const rhsEvaluated = rhs.replace(/"([^"]+)"|(\w+(?:\.\w+)+)/g, (match, quotedPath, unquotedPath) => {
          const path = quotedPath || unquotedPath;
          try {
            return replaceProps(null, path);
          } catch (error) {
            console.warn(`Error evaluating ${path}: ${error.message}`);
            return match; // Keep the original string if evaluation fails
          }
        });

        let result;
        try {
          // Use safe expression evaluator instead of eval() to prevent code injection
          // result = eval(rhsEvaluated);
          result = evaluateMathExpression(rhsEvaluated);
        } catch (error) {
          console.error(`Error evaluating expression: ${error.message}`);
          return null;
        }

        // Set the result to the LHS property
        const lhsPath = lhs.replace(/^"(.+)"$/, "$1"); // Remove quotes if present
        const [lhsNodeName, ...lhsRest] = lhsPath.split(".");

        let lhsNode = null;

        if (scene.expressionsStorage[expression].nodes[lhsNodeName]) {
          //  console.log("using storage lhs");
          lhsNode = scene.expressionsStorage[expression].nodes[lhsNodeName];
        } else {
          //  console.log("need to store");

          lhsNode = getSceneElementByName(scene, lhsNodeName);
          scene.expressionsStorage[expression].nodes[lhsNodeName] = lhsNode;
        }

        if (!lhsNode) {
          console.error(`Could not find element: ${lhsNodeName}`);
          return null;
        }

        try {
          setDeep(lhsNode, lhsRest.join("."), result);
        } catch (error) {
          console.error(`Error setting property: ${error.message}`);
          return null;
        }

        return result;
      }

      evaluateExpression(scene, props.exp);
      if (props.endActions !== undefined) {
        props.endActions.forEach((endAction) => {
          if (scene.actions[endAction]) {
            actionsDispatcher(scene, scene.actions[endAction]);
          }
        });
      }
    }
  } catch (error) {
    console.warn(error);
  }
};
