import { FC, useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export interface MermaidProps {
  chartDefinition: string;
}

mermaid.mermaidAPI.initialize({
  startOnLoad: true,
  securityLevel: 'loose',
  logLevel: 5,
});

export const Mermaid: FC<MermaidProps> = ({ chartDefinition }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.render('graphDiv', chartDefinition).then((result) => {
      if (ref.current) {
        ref.current.innerHTML = result.svg;
      }
    });
  }, [chartDefinition]);

  setTimeout(() => {
    mermaid.render('graphDiv', chartDefinition).then((result) => {
      if (ref.current) {
        ref.current.innerHTML = result.svg;
      }
    });
  }, 100);

  return <div key="chart" ref={ref} />;
};
