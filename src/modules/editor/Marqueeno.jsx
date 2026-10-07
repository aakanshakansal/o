import { useEffect, useRef, useState } from "react";

export default function Marqueeno(props) {
  const [isHovered, setIsHovered] = useState(false);

  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const container = useRef();
  const content = useRef();

  useEffect(() => {
    setContentWidth(content.current.offsetWidth);
    setContainerWidth(container.current.offsetWidth);
  }, []);
  return (
    <div
      style={{ ...props.style }}
      ref={container}
      className="marquee-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && contentWidth > containerWidth ? (
        <span ref={content} className={`marquee-text  active`}>
          {props.text}
        </span>
      ) : (
        <span ref={content}>{props.text}</span>
      )}
    </div>
  );
}
