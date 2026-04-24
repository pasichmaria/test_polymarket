       import type { NormalizedEvent } from './market.types';

export interface EventsListParamsDTO {
  limit?: number;
  closed?: boolean;
}

export interface EventsListResponseDTO {
  events: NormalizedEvent[];
  source: string;
  error?: string;
}

export interface EventDetailResponseDTO {
  event: NormalizedEvent | null;
  source: string;
  error?: string;
}
