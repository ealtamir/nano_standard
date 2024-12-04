import { useSocketData } from "./SocketManager.tsx";
import { useEffect, useState } from "preact/hooks";
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
  XAU: { flag: "🏅", name: "Gold (oz)" }, // Gold medal emoji
  INR: { flag: "🇮🇳", name: "Indian Rupee" },
} as const;

export function PriceTracker({ onCurrencyClick }: { onCurrencyClick: (currency: string) => void }) {
  const { data, connected } = useSocketData();
  const prices = useSignal<PriceTrackerData>({ topic: '', data: { timestamp: 0, data: {} } });

  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  useEffect(() => {
    if (data.topic === 'prices' && data.data) {
      prices.value = data.data;
      if (!selectedCurrency) {
        setSelectedCurrency('USD');
        onCurrencyClick('USD');
      }
    }
  }, [data]);

  const handleCurrencyClick = (currency: string) => {
    console.debug('PriceTracker: Currency clicked:', currency);
    setSelectedCurrency(currency);
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
    <div>
      <p class="text-gray-500 text-sm px-4 pb-2">
        Current Nano prices across different currencies. Click any price to update the charts.
      </p>
      <div class="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-3 p-4">
        {Object.entries(priceData)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([currency, price]) => {
            const meta = CURRENCY_META[currency.toUpperCase() as keyof typeof CURRENCY_META];
            if (!meta) return null;

            const isSelected = selectedCurrency?.toUpperCase() === currency.toUpperCase();

            return (
              <div 
                key={currency} 
                class={`bg-white rounded-lg shadow p-3 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer ${isSelected ? 'border-2 border-blue-500' : ''}`}
                onClick={() => handleCurrencyClick(currency)}
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-2xl" role="img" aria-label={`${meta.name} flag`}>
                    {meta.flag}
                  </span>
                  <span class="text-gray-500 uppercase text-lg font-light">
                    {currency}
                  </span>
                </div>
                <div class="text-2xl font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'decimal',
                    minimumFractionDigits: currency.toUpperCase() === 'XAU' ? 5 : 2,
                    maximumFractionDigits: currency.toUpperCase() === 'XAU' ? 5 : 2
                  }).format(price as number)}
                </div>
                <div class="text-sm text-gray-400 mt-1">
                  {meta.name}
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
}