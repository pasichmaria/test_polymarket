'use client';

import styles from './category-page-content.module.scss';

export type LeftFilterItem = {
  id: string;
  label: string;
  count: number;
  kind: 'all' | 'timeframe' | 'tag';
};

export type LeftFilterSection = {
  id: string;
  items: LeftFilterItem[];
  showDividerBefore?: boolean;
};

type Props = {
  sections: LeftFilterSection[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel?: string;
};

export function LeftFiltersColumn({ sections, activeId, onSelect, ariaLabel }: Props) {
  return (
    <div className={styles.leftMenu} aria-label={ariaLabel ?? 'Category filters'}>
      {sections.map((section) => (
        <div key={section.id}>
          {section.showDividerBefore && <div className={styles.leftMenuDivider} aria-hidden="true" />}
          {section.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.leftMenuItem} ${activeId === item.id ? styles.leftMenuItemActive : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <span className={styles.leftMenuLabelWrap}>
                <span>{item.label}</span>
              </span>
              <span className={styles.leftMenuCount}>{item.count}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
