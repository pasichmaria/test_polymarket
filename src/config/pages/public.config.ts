export const PUBLIC_PAGES = {
  HOME: '/',
  EVENT: (slug: string) => `/event/${slug}`,
} as const;
