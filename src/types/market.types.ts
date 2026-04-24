 /** Normalized shapes used in the UI (Gamma responses vary; we map defensively). */

export type EventCategory = 'all' | string;

export interface NormalizedMarket {
  id: string;
  slug?: string;
  question: string;
  /** Implied probability for Yes outcome, 0..1 */
  yesPrice: number;
  /** Implied probability for No outcome, 0..1 */
  noPrice: number;
  volumeUsd: number;
  /**
   * Outcome token IDs for CLOB WebSocket (Gamma: `clobTokenIds`).
   * Index 0 ≈ Yes, 1 ≈ No for binary markets.
   */
  clobTokenIds: string[];
}

export interface NormalizedEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string | null;
  volumeUsd: number;
  /** Tags from API if present; used for category filtering */
  tags: string[];
  /** Category derived from API tags for the top nav */
  category: string;
  markets: NormalizedMarket[];
}

export type FeedMode = 'idle' | 'connecting' | 'live' | 'simulation' | 'error';
