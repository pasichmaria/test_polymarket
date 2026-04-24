'use client';

import styles from './search-input.module.scss';
import { SearchIcon } from '@/components/assets/icons';
import { cn } from '@/lib/cn';
import type { InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  className?: string;
  inputClassName?: string;
  compact?: boolean;
};

export function SearchInput({ className, inputClassName, compact = false, ...props }: Props) {
  return (
    <div className={cn(styles.root, compact && styles.compactRoot, className)}>
      <SearchIcon className={styles.icon} />
      <input type="search" className={cn(styles.input, inputClassName)} {...props} />
    </div>
  );
}
