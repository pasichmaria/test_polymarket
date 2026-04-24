import styles from './filter-select.module.scss';
import { ChevronDownIcon } from '@/components/assets/icons';
import type { ReactNode, SelectHTMLAttributes } from 'react';

type Option = {
  value: string;
  label: string;
};

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  options: Option[];
  icon?: ReactNode;
};

export function FilterSelect({ options, icon, ...props }: Props) {
  return (
    <label className={styles.root}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <select className={styles.select} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className={styles.chevron} />
    </label>
  );
}
