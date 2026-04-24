import { EventCard } from '../cards/EventCard';
import styles from './event-grid.module.scss';
import type { NormalizedEvent } from '@/types/market.types';
import { memo } from 'react';

type Props = {
  events: NormalizedEvent[];
  columns?: 3 | 4;
};

export const EventGrid = memo(function EventGrid({ events, columns = 3 }: Props) {
  const compactCards = columns === 4;

  return (
    <div className={`${styles.grid} ${columns === 4 ? styles.gridFour : ''}`}>
      {events.map((e) => (
        <EventCard key={e.id} event={e} compact={compactCards} />
      ))}
    </div>
  );
});
