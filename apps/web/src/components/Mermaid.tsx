import React, { useEffect } from "react";
import mermaid from "mermaid";

export interface MermaidProps {
  chart: string;
}

mermaid.mermaidAPI.initialize({
  startOnLoad: true,
  securityLevel: "loose",
  theme: "forest",
  logLevel: 5
});

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart !== "") {
      mermaid.render('graphDiv', chart).then(result => {
        if (ref.current) {
          ref.current.innerHTML = result.svg;
        }
      });
    } else {
      console.log(`chart is empty: ${chart} or ref is null: ${ref.current}`)
    }
  }, [chart]);

  return <div key="chart" ref={ref} />;
};
