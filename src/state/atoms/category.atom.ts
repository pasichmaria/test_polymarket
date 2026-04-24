import type { EventCategory } from '@/types/market.types';
import { atom } from 'jotai';

export const categoryAtom = atom<EventCategory>('all');
