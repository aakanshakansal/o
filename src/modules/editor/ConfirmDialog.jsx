import { Button } from "@mui/material";
import { useEffect, useRef } from "react";

export const ConfirmDialog = (props) => {
  const ref = useRef();
  useEffect(() => {
    if (props.open) {
      ref.current.showModal();
    } else {
      ref.current.close();
    }
  }, [props.open]);

  return (
    <dialog ref={ref} className="badDialog" id="confirmDialog">
      <form>
        <div className="text">{props.text}</div>

        <div className="buttons">
          <Button
            color="red"
            onClick={() => {
              props.cancel();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              props.confirm();
            }}
          >
            Confirm
          </Button>
        </div>
      </form>
    </dialog>
  );
};
