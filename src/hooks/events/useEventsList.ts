'use client';

import { eventsService } from '@/api/services/events.service';
import type { EventsListParamsDTO, EventsListResponseDTO } from '@/types/events.types';
import useSWR from 'swr';

export function useEventsList() {
  return useSWR<EventsListResponseDTO, Error, [string, EventsListParamsDTO]>(
    ['events-list', { limit: 36, closed: false }],
    ([, params]) => eventsService.getList(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 20_000,
    }
  );
}
