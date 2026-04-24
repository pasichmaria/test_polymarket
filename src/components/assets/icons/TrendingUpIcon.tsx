import type { IconProps } from './Icon.types';

export function TrendingUpIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={size} height={size} fill="none" aria-hidden="true" {...props}>
      <path
        d="M1.75,12.25l3.646-3.646c.195-.195,.512-.195,.707,0l3.293,3.293c.195,.195,.512,.195,.707,0l6.146-6.146"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <polyline
        points="11.25 5.75 16.25 5.75 16.25 10.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
