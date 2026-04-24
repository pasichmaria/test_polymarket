import type { IconProps } from './Icon.types';

export function ChevronDownIcon({ size = 12, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden="true" {...props}>
      <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
