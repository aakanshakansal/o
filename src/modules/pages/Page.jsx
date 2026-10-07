import InnerHTML from "dangerously-set-html-content";

import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getPage } from "../../helpers";
// import { getPage } from "../../apis/page";

//   <div className="pageInner" dangerouslySetInnerHTML={{ __html: this.state.pageData.html }} />

const Page = (props) => {
  const [pageData, setpageData] = useState();
  const [ready, setReady] = useState(false);
  const initFunc = async () => {
    let pageData = await getPage(props.match.params.userId, props.match.params.pageId);

    setpageData(pageData);

    setTimeout(() => {
      var totalHeight = document.body.scrollHeight - window.innerHeight;
      var isScrolling = false;
      var scrollPos = window.pageYOffset;
      var targetScrollPos = scrollPos;
      if (document.getElementById("frame")) {
        const lerp = (start, end, alpha) => {
          return start * (1 - alpha) + end * alpha;
        };

        const scrollFun = () => {
          scrollPos = lerp(scrollPos, targetScrollPos, 0.1); // Adjust the 0.1 to control the speed

          document.getElementById("frame").contentWindow.postMessage(
            {
              type: "animateOnScroll",
              animateName: "scroll",
              scrollPos: scrollPos,
              totalHeight: totalHeight,
            },
            "*"
          );

          if (Math.abs(targetScrollPos - scrollPos) > 1) {
            requestAnimationFrame(scrollFun);
          } else {
            isScrolling = false;
          }
        };

        if (document.getElementById("frame")) {
          window.addEventListener("message", (e) => {
            if (e && e.data && typeof e.data === "object") {
              if (e.data.type === "sceneHasStarted") {
                setReady(true);
              }
            }
          });

          window.addEventListener("scroll", () => {
            targetScrollPos = window.pageYOffset;
            if (!isScrolling) {
              requestAnimationFrame(scrollFun);
              isScrolling = true;
            }
          });
        }
      } else {
        setReady(true);
      }
    }, 50);
  };
  useEffect(() => {
    initFunc();
  }, []);

  return (
    <div className="page">
      {pageData && pageData.published ? (
        <>
          <Helmet>
            <meta charSet="utf-8" />
            {pageData.name ? <title>{pageData.name}</title> : null}
            <meta name="description" content={pageData.description ? pageData.description : ""} />
            <style type="text/css">{pageData.css}</style>
            {pageData.customCss ? <style type="text/css">{pageData.customCss}</style> : null}
          </Helmet>
          {/* <div className={ready ? "fader hidden" : "fader"}></div> */}
          <InnerHTML className="pageInner" html={pageData.html} />
        </>
      ) : null}
    </div>
  );
};

export default Page;
