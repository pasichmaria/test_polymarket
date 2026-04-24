'use client';

import styles from './feed-status.module.scss';
import { cn } from '@/lib/cn';
import { useFeedMode } from '@/state/state.service';
import { memo } from 'react';

const LABEL: Record<string, string> = {
  idle: 'Ready',
  connecting: 'Connecting',
  live: 'Live',
  simulation: 'Simulated',
  error: 'WS fallback',
};

export const FeedStatus = memo(function FeedStatus() {
  const mode = useFeedMode();
  return (
    <div
      className={cn(
        styles.pill,
        mode === 'live' && styles.live,
        mode === 'simulation' && styles.sim,
        mode === 'error' && styles.error,
        mode === 'connecting' && styles.connecting
      )}
      title="WebSocket market feed status"
    >
      <span className={styles.dot} aria-hidden />
      {LABEL[mode] ?? mode}
    </div>
  );
});
