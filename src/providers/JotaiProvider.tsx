'use client';

import { getDefaultStore, Provider } from 'jotai';
import type { PropsWithChildren } from 'react';

const store = getDefaultStore();

export function JotaiProvider({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}
