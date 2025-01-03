import { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

interface ChartsContainerProps {
  children: ComponentChildren;
}

export default function ChartsContainer({ children }: ChartsContainerProps) {
  const [plotlyReady, setPlotlyReady] = useState(IS_BROWSER && !!window.Plotly);

  // Load Plotly script with onload handler
  useEffect(() => {
    if (IS_BROWSER && !window.Plotly) {
      const script = document.createElement("script");
      script.onload = () => setPlotlyReady(true);
      script.src = "https://cdn.plot.ly/plotly-2.35.2.min.js";
      document.head.appendChild(script);
    }
  }, []);

  if (!plotlyReady) {
    return (
      <div class="flex items-center justify-center p-4 text-gray-600">
        <div class="mr-2">⌛</div>
        Loading charts...
      </div>
    );
  }

  return <>{children}</>;
}
