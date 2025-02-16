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
  //   displayModeBar: false,
  scrollZoom: false,
  displaylogo: false,
  //   modeBarButtonsToAdd: ["pan2d", "zoomIn2d", "zoomOut2d", "resetScale2d"],
  //   modeBarButtonsToRemove: ["autoScale2d"],
  dragmode: "pan",
  //   modeBarOrientation: "h",
  //   showAxisDragHandles: true,
  toImageButtonOptions: {
    format: "png",
    filename: "nano_chart",
  },
};

export const defaultLegendConfig = {
  x: 0,
  y: 1,
  xanchor: "left",
  yanchor: "top",
  orientation: "v",
  bgcolor: "rgba(255, 255, 255, 0.8)",
  bordercolor: "#e2e8f0",
  borderwidth: 1,
};

export function chartRound(val: number | string): number {
  if (val === null || val === undefined) {
    return 0;
  }
  let num = typeof val === "string" ? parseFloat(val) : val;

  if (num > 10) {
    return Math.round(num);
  } else {
    return Number(num.toFixed(2));
  }
}
