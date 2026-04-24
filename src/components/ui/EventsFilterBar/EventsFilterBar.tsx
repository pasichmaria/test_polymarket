'use client';

import { FilterSelect } from '../FilterSelect/FilterSelect';
import styles from './events-filter-bar.module.scss';
import type { EventSort, EventStatus, EventWindow } from '@/app/content/eventFilters';
import type { ReactNode } from 'react';

export type TrendingHidesState = {
  hideSports: boolean;
  hideCrypto: boolean;
  hideEarnings: boolean;
};

const SORT_OPTIONS: { value: EventSort; label: string }[] = [
  { value: '24h-volume', label: '24h Volume' },
  { value: 'total', label: 'Total' },
  { value: 'liquidity', label: 'Liquidity' },
  { value: 'newest', label: 'Newest' },
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'earn-4', label: 'Earn 4%' },
];

const WINDOW_OPTIONS: { value: EventWindow; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
];

type Props = {
  sort: EventSort;
  onSortChange: (value: EventSort) => void;
  window: EventWindow;
  onWindowChange: (value: EventWindow) => void;
  status: EventStatus;
  onStatusChange: (value: EventStatus) => void;
  onClear: () => void;
  clearLabel?: string;
  sortIcon?: ReactNode;
  trendingHides?: TrendingHidesState;
  onTrendingHidesFieldChange?: (field: keyof TrendingHidesState, value: boolean) => void;
};

export function EventsFilterBar({
  sort,
  onSortChange,
  window: windowValue,
  onWindowChange,
  status,
  onStatusChange,
  onClear,
  clearLabel = 'Clear',
  sortIcon,
  trendingHides,
  onTrendingHidesFieldChange,
}: Props) {
  const showTrendingHides = trendingHides != null && onTrendingHidesFieldChange != null;

  return (
    <div className={styles.root}>
      <FilterSelect
        value={sort}
        onChange={(e) => onSortChange(e.target.value as EventSort)}
        options={SORT_OPTIONS}
        icon={sortIcon}
      />
      <FilterSelect
        value={windowValue}
        onChange={(e) => onWindowChange(e.target.value as EventWindow)}
        options={WINDOW_OPTIONS}
      />
      <FilterSelect
        value={status}
        onChange={(e) => onStatusChange(e.target.value as EventStatus)}
        options={STATUS_OPTIONS}
      />
      {showTrendingHides ? (
        <div className={styles.trendingHideToggles} role="group" aria-label="Hide from feed">
          <label className={styles.trendingHideLabel}>
            <input
              type="checkbox"
              className={styles.trendingHideInput}
              checked={trendingHides.hideSports}
              onChange={(e) => onTrendingHidesFieldChange('hideSports', e.target.checked)}
            />
            <span>Hide sports</span>
          </label>
          <label className={styles.trendingHideLabel}>
            <input
              type="checkbox"
              className={styles.trendingHideInput}
              checked={trendingHides.hideCrypto}
              onChange={(e) => onTrendingHidesFieldChange('hideCrypto', e.target.checked)}
            />
            <span>Hide crypto</span>
          </label>
          <label className={styles.trendingHideLabel}>
            <input
              type="checkbox"
              className={styles.trendingHideInput}
              checked={trendingHides.hideEarnings}
              onChange={(e) => onTrendingHidesFieldChange('hideEarnings', e.target.checked)}
            />
            <span>Hide earnings</span>
          </label>
        </div>
      ) : null}
      <button type="button" className={styles.clearBtn} onClick={onClear}>
        {clearLabel}
      </button>
    </div>
  );
}
