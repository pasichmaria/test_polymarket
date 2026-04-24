import type { FeedMode } from '@/types/market.types';
import { atom } from 'jotai';

export const feedModeAtom = atom<FeedMode>('idle');
