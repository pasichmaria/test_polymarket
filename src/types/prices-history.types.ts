     export interface PriceHistoryPoint {
  t: number;
  p: number;
}

export interface PricesHistoryParamsDTO {
  market: string;
  interval?: 'max' | 'all' | '1m' | '1h' | '6h' | '1d' | '1w';
  startTs?: number;
  endTs?: number;
  fidelity?: number;
}

export interface PricesHistoryResponseDTO {
  history?: PriceHistoryPoint[];
}
