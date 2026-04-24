import { API } from '@/api/api';
import { instance } from '@/api/axios';
import type { EventsListParamsDTO, EventsListResponseDTO } from '@/types/events.types';

export const eventsService = {
  async getList(params?: EventsListParamsDTO): Promise<EventsListResponseDTO> {
    const { data } = await instance.get<EventsListResponseDTO>(API.EVENTS.GET_LIST, {
      params,
    });
    return data;
  },
};
