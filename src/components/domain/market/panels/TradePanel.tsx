'use client';

import styles from './trade-panel.module.scss';
import { Button, ChevronDownIcon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatProbability } from '@/lib/format';
import { useMarketPrice } from '@/state/state.service';
import type { NormalizedMarket } from '@/types/market.types';
import Image from 'next/image';
import { useEffect, useId, useState } from 'react';

type Side = 'yes' | 'no';
type TradeAction = 'buy' | 'sell';

type Props = {
  market: NormalizedMarket | undefined;
  eventTitle?: string;
  eventImage?: string | null;
  side: Side;
  onSideChange: (side: Side) => void;
};

export function TradePanel({ market, eventTitle, eventImage, side, onSideChange }: Props) {
  const limitPriceInputId = useId();
  const live = useMarketPrice(market?.id ?? 'none');
  const eventPrice = formatProbability(live.yes);
  const yesCents = (live.yes * 100).toFixed(1);
  const noCents = (live.no * 100).toFixed(1);
  const [limitPrice, setLimitPrice] = useState<number>(50);
  const [tradeAction, setTradeAction] = useState<TradeAction>('buy');
  const [amountInput, setAmountInput] = useState<string>('10');
  const MAX_AMOUNT = 1000;

  const entry = side === 'yes' ? live.yes : live.no;
  const amountNumber = Number(amountInput);
  const hasTooManyDecimals = /\.\d{3,}/.test(amountInput);
  const isAmountValid = amountInput !== '' && !Number.isNaN(amountNumber) && amountNumber > 0 && amountNumber <= MAX_AMOUNT && !hasTooManyDecimals;
  const amountError = hasTooManyDecimals
    ? 'Use max 2 decimal places'
    : amountNumber <= 0 || amountInput === ''
      ? 'Amount must be greater than 0'
      : amountNumber > MAX_AMOUNT
        ? `Max amount is $${MAX_AMOUNT}`
        : '';
  const avgPrice = Math.max(0.001, entry);
  const toWin = isAmountValid ? amountNumber * ((1 - avgPrice) / avgPrice) : 0;

  useEffect(() => {
    if (!market) return;
    setLimitPrice(Number((entry * 100).toFixed(1)));
  }, [entry, market, side]);

  if (!market) {
    return (
      <aside className={styles.panel}>
        <p className={styles.empty}>Select an outcome to open trade preview.</p>
      </aside>
    );
  }

  const adjustLimitPrice = (delta: number) => {
    setLimitPrice((prev) => Number(Math.min(100, Math.max(0, prev + delta)).toFixed(1)));
  };

  const setAmountValue = (next: number) => {
    setAmountInput(Number(Math.min(MAX_AMOUNT, Math.max(0, next)).toFixed(2)).toString());
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.marketTop}>
        <div className={styles.eventBadge}>
          {eventImage ? (
            <div className={styles.eventLogoWrap}>
              <Image
                src={eventImage}
                alt={eventTitle ?? 'Event'}
                fill
                className={styles.eventLogo}
                sizes="48px"
                priority
              />
            </div>
          ) : (
            <span className={styles.eventLogoFallback}>{(eventTitle ?? 'E').slice(0, 1).toUpperCase()}</span>
          )}
          <div className={styles.eventMeta}>
            <span className={styles.eventMetaLabel}>Event price</span>
            <strong className={styles.eventMetaValue}>{eventPrice}</strong>
          </div>
        </div>
      </div>

      <h3 className={styles.question}>{market.question}</h3>

      <div className={styles.tabsRow}>
        <div className={styles.tradeTabs}>
          <button
            type="button"
            className={cn(
              styles.tabBtn,
              tradeAction === 'buy' ? styles.tabBtnBuyActive : styles.tabBtnInactive,
              tradeAction === 'buy' && styles.tabBtnActive
            )}
            onClick={() => setTradeAction('buy')}
          >
            Buy
          </button>
          <button
            type="button"
            className={cn(
              styles.tabBtn,
              tradeAction === 'sell' ? styles.tabBtnSellActive : styles.tabBtnInactive,
              tradeAction === 'sell' && styles.tabBtnActive
            )}
            onClick={() => setTradeAction('sell')}
          >
            Sell
          </button>
        </div>
        <label className={styles.limitDropdown}>
          <select className={styles.limitSelect} defaultValue="limit" aria-label="Order type">
            <option value="limit">Limit</option>
            <option value="market">Market</option>
          </select>
          <ChevronDownIcon className={styles.limitChevron} />
        </label>
      </div>

      <div className={styles.sideRow}>
        <Button
          type="button"
          className={cn(styles.sideBtn, side === 'yes' ? styles.sideBtnActiveYes : styles.sideBtnInactive)}
          onClick={() => onSideChange('yes')}
        >
          {`Yes ${yesCents}¢`}
        </Button>
        <Button
          type="button"
          className={cn(styles.sideBtn, side === 'no' ? styles.sideBtnActiveNo : styles.sideBtnInactive)}
          onClick={() => onSideChange('no')}
        >
          {`No ${noCents}¢`}
        </Button>
      </div>

      <div className={styles.amountBlock}>
        <label className={styles.amountLabel} htmlFor="trade-amount-input">Amount</label>
        <input
          id="trade-amount-input"
          type="text"
          inputMode="decimal"
          className={styles.amountInput}
          value={amountInput ? `$${amountInput}` : ''}
          onChange={(event) => {
            const nextRaw = event.target.value.replace(/\$/g, '').replace(/[^\d.]/g, '');
            const [intPart = '', ...rest] = nextRaw.split('.');
            const normalized = rest.length > 0 ? `${intPart}.${rest.join('')}` : intPart;
            setAmountInput(normalized);
          }}
        />
        {amountError ? <p className={styles.amountError}>{amountError}</p> : null}
        <div className={styles.amountChips}>
          <button type="button" className={styles.amountChip} onClick={() => setAmountValue(10)}>$10</button>
          <button type="button" className={styles.amountChip} onClick={() => setAmountValue((Number.isNaN(amountNumber) ? 0 : amountNumber) + 1)}>+$1</button>
          <button type="button" className={styles.amountChip} onClick={() => setAmountValue((Number.isNaN(amountNumber) ? 0 : amountNumber) + 5)}>+$5</button>
          <button type="button" className={styles.amountChip} onClick={() => setAmountValue((Number.isNaN(amountNumber) ? 0 : amountNumber) + 10)}>+$10</button>
          <button type="button" className={styles.amountChip} onClick={() => setAmountValue((Number.isNaN(amountNumber) ? 0 : amountNumber) + 100)}>+$100</button>
          <button type="button" className={styles.amountChip} onClick={() => setAmountValue(MAX_AMOUNT)}>Max</button>
        </div>
      </div>

      <div className={styles.limitPriceRow}>
        <label className={styles.limitPriceLabel} htmlFor={limitPriceInputId}>
          Limit price
        </label>
        <div className={styles.limitControls}>
          <button type="button" className={styles.limitControlBtn} onClick={() => adjustLimitPrice(-0.1)}>
            -
          </button>
          <input
            id={limitPriceInputId}
            type="number"
            className={styles.limitPriceInput}
            value={limitPrice}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isNaN(next)) return;
              setLimitPrice(Number(Math.min(100, Math.max(0, next)).toFixed(1)));
            }}
            step="0.1"
            min="0"
            max="100"
          />
          <button type="button" className={styles.limitControlBtn} onClick={() => adjustLimitPrice(0.1)}>
            +
          </button>
        </div>
      </div>

      <div className={styles.toWinBlock}>
        <div className={cn(styles.metric, styles.toWinRow)}>
          <span className={styles.toWinLabel}>To win</span>
          <strong className={styles.toWinValue}>
            ${toWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
        <div className={styles.metric}>
          <span>Avg. Price {(entry * 100).toFixed(1)}¢</span>
        </div>
      </div>

      <Button variant='primary' size="lg" type="button" disabled={!isAmountValid}>
        Trade
      </Button>
    </aside>
  );
}
