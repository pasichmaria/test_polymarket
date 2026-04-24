import type { IconProps } from './Icon.types';

export function RepeatIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" {...props}>
      <path d="M4 6H13L11 4L12.4 2.6L17 7.2L12.4 11.8L11 10.4L13 8.4H4V6ZM16 14H7L9 16L7.6 17.4L3 12.8L7.6 8.2L9 9.6L7 11.6H16V14Z" />
    </svg>
  );
}
