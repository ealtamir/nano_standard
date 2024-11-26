import { useSocketData } from "./SocketManager.tsx";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { PriceTrackerData } from "../models.ts";

interface InfoItem {
  icon: string;
  label: string;
  value: string | number;
}

export default function InfoBar() {
  const { data, connected } = useSocketData();
  const lastUpdateTime = useSignal<number>(0);
  
  useEffect(() => {
    // Only update timestamp when we receive price data
    if (data.topic === 'prices' && data.data) {
      const priceData = data as PriceTrackerData;
      lastUpdateTime.value = priceData.data.timestamp;
    }
  }, [data]);

  // Format timestamp from prices data
  const lastUpdate = lastUpdateTime.value 
    ? new Date(lastUpdateTime.value).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    : '--:--:--';

  // Array of info items - easily extensible
  const infoItems: InfoItem[] = [
    {
      icon: connected ? "🟢" : "🔴",
      label: "Status",
      value: connected ? "Connected" : "Disconnected"
    },
    {
      icon: "🕒",
      label: "Last Update",
      value: lastUpdate
    }
    // Add more items here as needed, for example:
    // { icon: "📊", label: "Active Pairs", value: 12 },
    // { icon: "📈", label: "24h Volume", value: "$1.2M" },
  ];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg mx-4 px-4 py-2">
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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