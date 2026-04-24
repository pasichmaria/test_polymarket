'use client';

import styles from './navbar.module.scss';
import { TrendingUpIcon } from '@/components/ui';
import { setCategory, useCategory } from '@/state/state.service';
import type { EventCategory } from '@/types/market.types';
import { usePathname, useRouter } from 'next/navigation';
import { memo, useCallback } from 'react';

type CategoryItem = { id: EventCategory; label: string };

type Props = {
  items: CategoryItem[];
};

const CATEGORY_ROUTE: Partial<Record<EventCategory, string>> = {
  all: '/',
  crypto: '/crypto',
  sports: '/sports',
  politics: '/politics',
};

export const Navbar = memo(function CategoryNav({ items }: Props) {
  const category = useCategory();
  const pathname = usePathname();
  const router = useRouter();

  const onSelect = useCallback(
    (id: EventCategory) => {
      setCategory(id);
      const target = CATEGORY_ROUTE[id];
      if (target && pathname !== target) {
        router.push(target);
      }
    },
    [pathname, router]
  );

  return (
    <ul className={styles.navigation} aria-label="Event categories">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className={item.id === category ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
            onClick={() => onSelect(item.id)}
          >
            {item.id === 'all' && (
              <span className={styles.trendingIcon} aria-hidden="true">
                <TrendingUpIcon size={18} />
              </span>
            )}
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
});
