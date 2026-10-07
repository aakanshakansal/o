import InnerHTML from "dangerously-set-html-content";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useCurrentScene } from "../badProvider/functions";
import { actionsDispatcher } from "../sceneFunctions/actionDispatcher";

export const Overlay = (props) => {
  const scene = useCurrentScene();

  const css = props.overlayData.css || null;
  const html = props.overlayData.html || null;
  const overlay = useRef(null);
  useEffect(() => {
    //  console.log("mounted");
    // let pattern = /\{%([^%]+)%\}/g;
    // let replacedString = html.replace(pattern, function (matched, variable) {
    //   // You can replace the variable with whatever you want here
    //   // For this example, we'll just add " - Replaced" to each variable
    //   let varToReplace = "";
    //   Object.entries(scene.variables).forEach(([k, v]) => {
    //     if (v.displayName === variable) {
    //       varToReplace = v.value;
    //     }
    //   });
    //   console.log(varToReplace);
    //   return varToReplace;
    // });
    // setInterval(() => {
    //   setHtml(replacedString);
    //   console.log("aasd");
    // }, 50);
  }, []);

  const initial = {};
  const animate = {};
  const exit = {};

  const properties = ["opacity", "x", "y", "scale", "rotate"];

  properties.forEach((property) => {
    if (props[property]?.initial !== undefined) {
      initial[property] = parseInt(props[property].initial);
    }

    if (props[property]?.animate !== undefined) {
      animate[property] = parseInt(props[property].animate);
    }

    if (props[property]?.exit !== undefined) {
      exit[property] = parseFloat(props[property].exit);
    }
  });

  const lerp = (start, end, alpha) => {
    return start * (1 - alpha) + end * alpha;
  };

  var isScrolling = false;
  var scrollTop = 0;
  var targetScrollPos = 0;

  const scrollFun = () => {
    const scrollHeight = overlay.current.scrollHeight;

    const height = overlay.current.offsetHeight;

    scrollTop = lerp(scrollTop, targetScrollPos, 0.1);

    actionsDispatcher(scene, scene.actions[props.scrollAnimation], { totalHeight: scrollHeight - height, scrollPos: scrollTop });

    if (Math.abs(targetScrollPos - scrollTop) > 1) {
      requestAnimationFrame(scrollFun);
    } else {
      isScrolling = false;
    }
  };

  return (
    <motion.div
      onScroll={() => {
        if (props.scrollAnimation && scene.actions[props.scrollAnimation]) {
          targetScrollPos = overlay.current.scrollTop;
          if (!isScrolling) {
            requestAnimationFrame(scrollFun);
            isScrolling = true;
          }
        }
      }}
      ref={overlay}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={{
        duration: props.animationDurartion,
        ease: props.animationEase,
        delay: props.animationDelay,
      }}
      style={{ zIndex: props.hasOwnProperty("zIndex") ? props.zIndex : 1 }}
      className={"overlayContainer"}
    >
      <Helmet>
        <style>{css}</style>
      </Helmet>

      <InnerHTML html={html} style={props.style} className="overlay" />
    </motion.div>
  );
};
