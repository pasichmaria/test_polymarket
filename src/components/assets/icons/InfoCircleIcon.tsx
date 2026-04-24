import type { IconProps } from './Icon.types';

export function InfoCircleIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="8.5" fill="currentColor" />
      <path d="M10 8.25V13" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6" r="1" fill="var(--bg-primary)" />
    </svg>
  );
}
