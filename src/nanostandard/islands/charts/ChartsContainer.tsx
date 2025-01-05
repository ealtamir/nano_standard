import { ComponentChildren, createContext } from "preact";
import { useEffect, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useSocketData } from "../SocketManager.tsx";

interface ChartsContainerProps {
  children: ComponentChildren;
}

export const ViewTypeContext = createContext<{
  viewType: "5m" | "1h" | "1d";
}>({ viewType: "5m" });

export default function ChartsContainer({ children }: ChartsContainerProps) {
  const [plotlyReady, setPlotlyReady] = useState(IS_BROWSER && !!window.Plotly);
  const { connected } = useSocketData() as unknown as {
    connected: boolean;
  };
  const [viewType, setViewType] = useState<"5m" | "1h" | "1d">("5m");
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (IS_BROWSER && !window.Plotly) {
      const script = document.createElement("script");
      script.onload = () => setPlotlyReady(true);
      script.src = "https://cdn.plot.ly/plotly-2.35.2.min.js";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const buttonsElement = document.querySelector(".chart-buttons");
      const containerElement = document.querySelector(".charts-container");
      if (buttonsElement && containerElement) {
        const containerRect = containerElement.getBoundingClientRect();
        setIsSticky(containerRect.top <= 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!plotlyReady || !connected) {
    return (
      <div class="flex items-center justify-center p-4 text-gray-600">
        <div class="animate-spin mr-2">⌛</div>
        Loading charts...
      </div>
    );
  }

  return (
    <ViewTypeContext.Provider value={{ viewType }}>
      <div className="charts-container">
        <div
          className={`flex justify-center gap-2 mb-4 transition-all duration-300 chart-buttons
          ${
            isSticky
              ? "fixed top-4 left-6 z-50 bg-white/95 backdrop-blur-md p-3 rounded-lg shadow-lg border-2 border-gray-800/10 scale-110"
              : ""
          }`}
        >
          {["5m", "1h", "1d"].map((type) => (
            <button
              key={type}
              onClick={() => setViewType(type as "5m" | "1h" | "1d")}
              className={`px-5 py-2.5 rounded-md font-medium transition-colors
                ${
                viewType === type
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 text-amber-700 text-sm max-w-2xl mx-auto">
          <b>Note:</b>{" "}
          Charts only consider fully confirmed SEND blocks, as these are more
          relevant in measuring Nano's adoption as a means of exchange.
        </div>
        {children}
      </div>
    </ViewTypeContext.Provider>
  );
}
