'use client';

import styles from './tab-content-layout.module.scss';
import { BookmarkIcon, SearchInput, SlidersIcon } from '@/components/ui';
import { useEffect, useState, type ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  rightTopExtra?: ReactNode;
  leftContent?: ReactNode;
  inlineItems?: string[];
  onInlineItemChange?: (item: string) => void;
  hideLeftColumn?: boolean;
  filterPanel?: ReactNode;
  /** When set, the filter row (sort / checkboxes / Clear) is expanded on first paint. */
  initialFilterOpen?: boolean;
  showSaveAction?: boolean;
};

export function TabContentLayout({
  title,
  children,
  rightTopExtra,
  leftContent,
  inlineItems,
  onInlineItemChange,
  hideLeftColumn = false,
  filterPanel,
  initialFilterOpen = false,
  showSaveAction = false,
}: Props) {
  const [activeInlineItem, setActiveInlineItem] = useState<string | null>(inlineItems?.[0] ?? null);
  const [isFilterOpen, setIsFilterOpen] = useState(initialFilterOpen);

  useEffect(() => {
    setActiveInlineItem(inlineItems?.[0] ?? null);
  }, [inlineItems]);

  return (
    <section className={`${styles.layout} ${hideLeftColumn ? styles.layoutNoLeft : ''}`}>
      {!hideLeftColumn && (
        <aside className={styles.leftPlaceholder} aria-label="Reserved sidebar area">
          {leftContent}
        </aside>
      )}

      <div className={styles.rightContent}>
        <div className={styles.topRow}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            {!!inlineItems?.length && (
              <div className={styles.inlineItems}>
                {inlineItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`${styles.inlineItem} ${activeInlineItem === item ? styles.inlineItemActive : ''}`}
                    onClick={() => {
                      setActiveInlineItem(item);
                      onInlineItemChange?.(item);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={styles.actions}>
            <SearchInput className={styles.search} compact aria-label="Search within tab" placeholder="Search" />
            <button
              type="button"
              className={styles.actionButton}
              aria-label="Toggle filters"
              aria-expanded={isFilterOpen}
              onClick={() => setIsFilterOpen((prev) => !prev)}
            >
              <SlidersIcon className={styles.icon} />
            </button>
            {showSaveAction ? (
              <button type="button" className={styles.actionButton} aria-label="Save filters">
                <BookmarkIcon className={styles.icon} />
              </button>
            ) : null}
          </div>
        </div>
        {isFilterOpen && filterPanel ? <div className={styles.filterPanel}>{filterPanel}</div> : null}

        {rightTopExtra && <div className={styles.topExtra}>{rightTopExtra}</div>}
        <div className={styles.body}>{children}</div>
      </div>
    </section>
  );
}
