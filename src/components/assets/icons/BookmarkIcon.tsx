import type { IconProps } from './Icon.types';

export function BookmarkIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" {...props}>
      <path
        d="M5 2.75h10a.75.75 0 0 1 .75.75v13.2l-5.75-3.4-5.75 3.4V3.5A.75.75 0 0 1 5 2.75Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
