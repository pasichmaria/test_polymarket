import type { IconProps } from './Icon.types';

export function SlidersIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1="13.25" y1="5.25" x2="16.25" y2="5.25" />
        <line x1="1.75" y1="5.25" x2="8.75" y2="5.25" />
        <line x1="4.75" y1="12.75" x2="1.75" y2="12.75" />
        <line x1="16.25" y1="12.75" x2="9.25" y2="12.75" />
        <circle cx="11" cy="5.25" r="2.25" />
        <circle cx="7" cy="12.75" r="2.25" />
      </g>
    </svg>
  );
}
