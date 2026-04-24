import { API } from '@/api/api';
import { instance } from '@/api/axios';
import type { PricesHistoryParamsDTO, PricesHistoryResponseDTO } from '@/types/prices-history.types';

export const pricesHistoryService = {
  async get(
    params: PricesHistoryParamsDTO,
    options?: { signal?: AbortSignal }
  ): Promise<PricesHistoryResponseDTO> {
    const { data } = await instance.get<PricesHistoryResponseDTO>(API.PRICES_HISTORY.GET_LIST, {
      params,
      signal: options?.signal,
    });
    return data;
  },
};
