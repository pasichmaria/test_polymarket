import styles from './button.module.scss';
import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'ghost' | 'primary';
type ButtonSize = 'lg' | 'md' | 'sm';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  className,
  children,
  variant = 'ghost',
  size = 'md',
  leftIcon,
  rightIcon,
  ...props
}: Props) {
  return (
    <button className={cn(styles.button, styles[variant], styles[size], className)} {...props}>
      {leftIcon ? <span className={styles.icon}>{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className={styles.icon}>{rightIcon}</span> : null}
    </button>
  );
}
