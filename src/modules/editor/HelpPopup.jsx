import { Button, Tooltip, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";

import "swiper/css";
// import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HelpPopup(props) {
  const [currentAccordion, setCurrentAccordion] = useState("guides");

  const theme = useTheme();

  const [toggleHelpPopup, setToggleHelpPopup] = useState(false);

  useEffect(() => {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setToggleHelpPopup(false);
      }
    });
  }, []);

  return (
    <>
      <div className="collapseButton" key={"help"} style={{ background: theme.palette.background.dark }}>
        <Button onClick={() => setToggleHelpPopup(true)} style={{ color: theme.palette.text.primary }}>
          <span className="material-symbols-outlined" style={{ marginRight: "0.5em", color: theme.palette.text.default }}>
            help
          </span>
          <span> Help</span>
        </Button>
      </div>
      {toggleHelpPopup ? (
        <div className="promptContainer" style={{ background: "rgba(100, 100, 100, 0.5)" }}>
          <div
            className="prompt"
            style={{
              width: "100%",
              maxWidth: "768px",
              maxHeight: "90vh",
            }}
          >
            <div
              className="promptInner node"
              style={{
                width: "100%",

                background: theme.palette.background.default,
                borderColor: theme.palette.default.main,
              }}
            >
              <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
                <strong className="nodeTitle" style={{ cursor: "unset", paddingLeft: "1em" }}>
                  <span className="material-symbols-outlined" style={{ color: theme.palette.text.primary, marginRight: "0.5em" }}>
                    help
                  </span>
                  Help
                </strong>
                <div className="nodeActions">
                  <Tooltip title="Close" arrow placement="top">
                    <button onClick={() => setToggleHelpPopup(false)} className="nodeHeaderAction">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </Tooltip>
                </div>
              </div>

              <div className="nodeInner" style={{ display: "flex", flexDirection: "column" }}>
                <Accordion disableGutters style={{ margin: "1em 0" }} expanded={currentAccordion === "guides"}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    onClick={() => {
                      setCurrentAccordion(currentAccordion === "guides" ? "" : "guides");
                    }}
                  >
                    Guides
                  </AccordionSummary>
                  <AccordionDetails>
                    <iframe
                      style={{
                        borderRadius: "0.5em",
                      }}
                      width="100%"
                      height="300"
                      src="https://www.youtube.com/embed/videoseries?si=UlLN-lt7Jfg4IvcN&amp;list=PLCt0SwPWx9zAjtZfULqJDbr_Dny2JEvCJ"
                      title="Badvisor 4.0 - Tutorials"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowfullscreen
                    />

                    {/* <Swiper
                      spaceBetween={10}
                      grabCursor={true}
                      loop={false}
                      slidesPerView={2.5}
                      pagination={{ clickable: true }}
                      modules={[Pagination]}
                      style={{
                        "--swiper-pagination-color": "#dedede",
                        "--swiper-pagination-bullet-inactive-color": "#dedede",
                        "--swiper-pagination-bullet-inactive-opacity": ".25",
                        "--swiper-pagination-bullet-size": "8px",
                      }}
                    >
                      <SwiperSlide>
                        <QuickStartDriver setToggleHelpPopup={setToggleHelpPopup} />
                      </SwiperSlide>
                      <SwiperSlide>
                        <PBRMaterialDriver setToggleHelpPopup={setToggleHelpPopup} />
                      </SwiperSlide>
                      <SwiperSlide>
                        <ShadowOnlyMaterialDriver setToggleHelpPopup={setToggleHelpPopup} />
                      </SwiperSlide>
                      <SwiperSlide>
                        <AnimateTimelineDriver setToggleHelpPopup={setToggleHelpPopup} />
                      </SwiperSlide>
                      <SwiperSlide>
                        <AnimationGroupDriver setToggleHelpPopup={setToggleHelpPopup} />
                      </SwiperSlide>
                    </Swiper> */}
                  </AccordionDetails>
                </Accordion>

                <Accordion disableGutters style={{ margin: "1em 0" }} expanded={currentAccordion === "shortcuts"}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    onClick={() => {
                      setCurrentAccordion(currentAccordion === "shortcuts" ? "" : "shortcuts");
                    }}
                  >
                    Shortcuts
                  </AccordionSummary>
                  <AccordionDetails>
                    <strong>Nodes</strong>
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: "1em" }}>
                      <span>Open asset node: shift + left mouse click </span>
                      <span>Open mesh node: shift + ctrl + left mouse click </span>
                      <span>Open material node: ctrl + alt + left mouse click </span>
                      <span>Move nodes: spacebar + mouse drag </span>
                      <span>Reorganize nodes: alt + 1</span>
                      <span>Close nodes: alt + 3</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: "1em" }}>
                      <strong>Add to scene</strong>
                      <span>Add control node: alt + N </span>
                      <span>Add camera: alt + C</span>
                      <span>Add light: alt + L </span>
                      <span>Add 3D asset: alt + D </span>
                      <span>Add material: alt + M </span>
                      <span>Add texture: alt + T </span>
                      <span>Add action: alt + A </span>
                      <span>Add sounds: alt + S </span>
                      <span>Add overlays: alt + O </span>
                    </div>
                  </AccordionDetails>
                </Accordion>

                <div style={{ display: "flex", flexDirection: "column", marginBottom: "1em", padding: "0 0.5em" }}>
                  <a
                    href="https://doc.badvisor.io/external/manual/user-guide/article/introductaion?p=78590f65c46a27a7dafb88f2e766591eca4c06989263321c944d848427cfafe4"
                    target="_blank"
                    style={{ display: "flex", alignItems: "stretch", fontWeight: "bold" }}
                    rel="noreferrer"
                  >
                    Documentation
                    <span className="material-symbols-outlined">chevron_right</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
