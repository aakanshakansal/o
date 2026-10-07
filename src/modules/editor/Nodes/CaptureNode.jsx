import React, { useRef, useState } from "react";

import { Button, MenuItem, Select, Tooltip } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";

import { toast } from "sonner";
import { useCurrentScene } from "../../../badProvider/functions";
import { takeScreenshot } from "../../../helpers";
import { actionsDispatcher } from "../../../sceneFunctions/actionDispatcher";
import { BooleanInput } from "../Components/BooleanInput";
import { NumberInput } from "../Components/NumberInput";

export function CaptureNode(props) {
  const theme = useTheme();

  const scene = useCurrentScene();
  const node = props.data.node;

  const [recording, setRecording] = useState(false);
  const [timelineCapture, setTimelineCapture] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [delayIn, setDelayIn] = useState(0.5);
  const [delayOut, setDelayOut] = useState(1);
  const [bitsPerSecond, setVideoBitsPerSecond] = useState(8000);

  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  const initializeRecording = (canvas) => {
    const stream = canvas.captureStream(60); // Capture stream at 60fps

    // Initialize the MediaRecorder with desired settings
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
      // mimeType: "video/webm; codecs=vp8",
      videoBitsPerSecond: bitsPerSecond * 1000,
    });

    // Store video chunks as they become available
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.current.push(event.data);
    };

    // Start recording
    mediaRecorderRef.current.start();
    setRecording(true);

    // When stopping, prepare the video URL for downloading
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: mediaRecorderRef.current.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rec_${scene.badId}.webm`;
      link.click();
      URL.revokeObjectURL(url); // Optional: Free up memory by releasing object URL
      scene.closeNode(node.name);
    };
  };

  const handleRecording = (timeline = false) => {
    const canvas = document.getElementById("renderCanvas");
    if (!canvas) return toast.error("Canvas not found!");

    if (!recording) {
      toast("Recording Started");
      initializeRecording(canvas);

      if (timeline) {
        canvas.style.pointerEvents = "none";

        // First delay
        setTimeout(() => {
          actionsDispatcher(scene, selectedTimeline);

          // Second delay
          setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
              stopRecording();
              toast.success("Recording Ended");
              canvas.style.pointerEvents = "all";
            }
          }, (selectedTimeline.duration / 60) * 1000 + delayOut * 1000); // Adjust the time calculation if necessary
        }, delayIn * 1000);
      }
    } else {
      stopRecording();
      canvas.style.pointerEvents = "all";
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const captureScreenshot = () => {
    takeScreenshot(scene, null, null, 0.8).then((dataUrl) => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `screen_${scene.badId}.webp`;
      link.click();
      toast.success("Done!");
      scene.closeNode(node.name);
    });
  };

  return (
    <div
      className="node"
      style={{
        background: theme.palette.background.default,

        outlineColor: theme.palette.grey.main,
      }}
    >
      <div className="nodeHeader" style={{ color: theme.palette.text.primary, background: theme.palette.background.dark }}>
        <strong className="nodeTitle">
          <span className="material-symbols-outlined" style={{ marginRight: "0.25em", color: theme.palette.text.default }}>
            capture
          </span>
          {node.displayName}
        </strong>

        <div className="nodeActions">
          <Tooltip title="Close" arrow placement="top">
            <button
              className="nodeHeaderAction"
              onClick={() => {
                scene.closeNode(node.name);
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="nodeInner">
        <span>Take Screenshot</span>
        <Button
          variant="outlined"
          style={{ color: "rgb(222, 222, 222)", borderColor: "rgb(222, 222, 222)", margin: ".25em 0" }}
          onClick={() => captureScreenshot(scene)}
        >
          Screenshot
        </Button>
        <span>Screen Recording</span>
        <NumberInput label={"kb/s"} onBlur={(e) => setVideoBitsPerSecond(e.target.value)} value={bitsPerSecond} />

        {!timelineCapture && (
          <Button
            variant="outlined"
            style={{ color: "rgb(222, 222, 222)", borderColor: "rgb(222, 222, 222)", margin: ".25em 0" }}
            className={recording ? "recording" : ""}
            onClick={() => {
              if (!recording) {
                handleRecording();
              } else {
                toast.success("Recording Ended");
                stopRecording();
              }
            }}
          >
            {recording ? "Stop Recording" : "Start Recording"}
          </Button>
        )}

        <div className={"Boolean field "}>
          <BooleanInput
            style={{}}
            checked={timelineCapture}
            onChange={() => {
              setTimelineCapture(!timelineCapture);
              if (recording) {
                toast.success("Recording Ended");
                stopRecording();
              }
            }}
            label={"Timeline"}
          />
        </div>

        {timelineCapture && (
          <div className="field">
            <div className="field Title">Timeline Recording</div>
            {/* <InputLabel id="timeline-label">Timeline Recording</InputLabel> */}
            <Select
              sx={{ backgroundColor: theme.palette.background.light }}
              value={selectedTimeline || "Timeline Recording"}
              style={{ width: "100%" }}
              onChange={(e) => setSelectedTimeline(e.target.value)}
            >
              <MenuItem key={"default"} value={"Timeline Recording"} disabled selected>
                Timeline Recording
              </MenuItem>

              {Object.values(scene.actions)
                .filter((a) => a.type === "Timeline")
                .map((a) => (
                  <MenuItem key={a.name} value={a}>
                    {a.displayName}
                  </MenuItem>
                ))}
            </Select>
          </div>
        )}

        {timelineCapture && selectedTimeline && (
          <>
            <Button
              style={{ color: "rgb(222, 222, 222)", borderColor: "rgb(222, 222, 222)", margin: ".25em 0" }}
              variant="outlined"
              onClick={() => {
                if (!recording) {
                  handleRecording(true);
                } else {
                  toast.success("Recording Ended");
                  stopRecording();
                }
              }}
              className={recording ? "recording" : ""}
            >
              {recording ? "Stop Recording" : "Start Recording"}
            </Button>

            <div className="field Title">Delay</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1em" }}>
              <NumberInput label={"In (s)"} onBlur={(e) => setDelayIn(e.target.value)} value={delayIn} />
              <NumberInput label={"Out (s)"} onBlur={(e) => setDelayOut(e.target.value)} value={delayOut} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
