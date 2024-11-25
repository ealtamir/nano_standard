import { useSocketData } from "./SocketManager.tsx";
import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { PriceTrackerData } from "../models.ts";

// Currency metadata including flags and symbols
const CURRENCY_META = {
  USD: { flag: "🇺🇸", name: "US Dollar" },
  EUR: { flag: "🇪🇺", name: "Euro" },
  JPY: { flag: "🇯🇵", name: "Japanese Yen" },
  CHF: { flag: "🇨🇭", name: "Swiss Franc" },
  GBP: { flag: "🇬🇧", name: "British Pound" },
  CNY: { flag: "🇨🇳", name: "Chinese Yuan" },
  ARS: { flag: "🇦🇷", name: "Argentine Peso" },
  BRL: { flag: "🇧🇷", name: "Brazilian Real" },
  ILS: { flag: "🇮🇱", name: "Israeli Shekel" },
  XAU: { flag: "🪙", name: "Gold (oz)" }, // Gold coin emoji
  INR: { flag: "🇮🇳", name: "Indian Rupee" },
} as const;

export function PriceTracker({ onCurrencyClick }: { onCurrencyClick: (currency: string) => void }) {
  const { data, connected } = useSocketData();
  const prices = useSignal<PriceTrackerData>({ topic: '', data: { timestamp: 0, data: {} } });

  useEffect(() => {
    console.log('Data:', data)
    if (data.topic === 'prices' && data.data) {
      prices.value = data.data;
    }
  }, [data]);

  const handleCurrencyClick = (currency: string) => {
    console.log('PriceTracker: Currency clicked:', currency);
    onCurrencyClick(currency.toUpperCase());
  };

  if (!connected) {
    return (
      <div class="flex items-center justify-center p-4 text-gray-600">
        <div class="animate-spin mr-2">⌛</div> 
        Connecting to price feed...
      </div>
    );
  }

  const priceData = prices.value.data;
  return (
    <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
      {Object.entries(priceData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([currency, price]) => {
          const meta = CURRENCY_META[currency.toUpperCase() as keyof typeof CURRENCY_META];
          if (!meta) return null;

          return (
            <div 
              key={currency} 
              class="bg-white rounded-lg shadow p-3 hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleCurrencyClick(currency)}
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xl" role="img" aria-label={`${meta.name} flag`}>
                  {meta.flag}
                </span>
                <span class="text-gray-500 uppercase text-sm font-medium">
                  {currency}
                </span>
              </div>
              <div class="text-xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(price)}
              </div>
              <div class="text-xs text-gray-400 mt-1">
                {meta.name}
              </div>
            </div>
          );
      })}
    </div>
  );
}