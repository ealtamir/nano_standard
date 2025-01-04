import { useSocketData } from "./SocketManager.tsx";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { PriceTrackerData } from "../models.ts";
import { JSX } from "preact/jsx-runtime";
import { config } from "../../config_file.ts";

interface InfoItem {
  icon: string;
  label: string;
  value: string | number | JSX.Element | null;
}

export default function InfoBar() {
  const { socketContext, connected, reconnect } = useSocketData();
  const lastUpdateTime = useSignal<number>(0);

  useEffect(() => {
    // Update timestamp to current time
    lastUpdateTime.value = Date.now();
  }, [socketContext]);

  // Format timestamp from prices data
  const lastUpdate = lastUpdateTime.value
    ? new Date(lastUpdateTime.value).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    : "--:--:--";

  // Array of info items - easily extensible
  const infoItems: InfoItem[] = [
    {
      icon: connected ? "🟢" : "🔴",
      label: "Status",
      value: connected ? "Connected" : "Disconnected",
    },
    {
      icon: "🕒",
      label: "Last Update",
      value: lastUpdate,
    },
    // Add more items here as needed, for example:
    // { icon: "📊", label: "Active Pairs", value: 12 },
    // { icon: "📈", label: "24h Volume", value: "$1.2M" },
  ];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg mx-4 mb-5 px-4 py-2">
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        {!connected && (
          <button
            onClick={reconnect}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          >
            Reconnect
          </button>
        )}
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span role="img" aria-label={item.label}>{item.icon}</span>
            <span className="font-medium">{item.label}:</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
