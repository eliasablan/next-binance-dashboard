export const BINANCE_REST_BASE_URL = "https://data-api.binance.vision";
export const BINANCE_WS_BASE_URL = "wss://data-stream.binance.vision";

export function binanceRestUrl(path: string) {
  return `${BINANCE_REST_BASE_URL}${path}`;
}

export function binanceWsUrl(path: string) {
  return `${BINANCE_WS_BASE_URL}${path}`;
}
