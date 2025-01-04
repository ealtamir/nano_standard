export function viewType2MedianRange(viewType: "5m" | "1h" | "1d"): string {
  if (viewType === "5m") {
    return "2h";
  }
  if (viewType === "1h") {
    return "24h";
  }
  return "7d";
}

export const defaultChartConfig = {
  responsive: true,
  displayModeBar: true,
  scrollZoom: false,
  displaylogo: false,
  modeBarButtonsToAdd: ["pan2d", "zoomIn2d", "zoomOut2d", "resetScale2d"],
  modeBarButtonsToRemove: ["autoScale2d"],
  dragmode: "pan",
};

export function chartRound(val: number | string): number {
  let num = typeof val === "string" ? parseFloat(val) : val;

  if (num > 10) {
    return Math.round(num);
  } else {
    return Number(num.toFixed(2));
  }
}
