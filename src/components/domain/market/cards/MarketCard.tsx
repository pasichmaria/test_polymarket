'use client';

import styles from './event-card.module.scss';
import { BookmarkIcon, GiftIcon, RepeatIcon } from '@/components/ui';
import type { NormalizedEvent } from '@/types/market.types';
import Image from 'next/image';
import Link from 'next/link';

type CardFooter = {
  volume: string;
  repeat?: string;
  badge?: string;
};

type CardBase = {
  className?: string;
};

type OutcomeRow = {
  date: string;
  percent: number;
};

type TeamData = {
  name: string;
  score: number;
  percent: number;
};

type OutcomesCardProps = CardBase & {
  variant: 'outcomes';
  event: NormalizedEvent;
  rows: [OutcomeRow, OutcomeRow];
  footer: CardFooter;
};

type BinaryCardProps = CardBase & {
  variant: 'binary';
  event: NormalizedEvent;
  chance: number;
  footer: CardFooter;
};

type VersusCardProps = CardBase & {
  variant: 'versus';
  event: NormalizedEvent;
  leftTeam: TeamData;
  rightTeam: TeamData;
  footer: CardFooter;
};

type EmptyCardProps = CardBase & {
  variant: 'empty';
  event: NormalizedEvent;
  footer: CardFooter;
};

export type MarketCardProps = OutcomesCardProps | BinaryCardProps | VersusCardProps | EmptyCardProps;

function PercentChoiceButton({
  kind,
  percent,
}: {
  kind: 'yes' | 'no';
  percent: number;
}) {
  return (
    <button type="button" className={kind === 'yes' ? styles.yes : styles.no}>
      <span className={styles.buttonDefaultLabel}>{kind === 'yes' ? 'Yes' : 'No'}</span>
      <span className={styles.buttonHoverLabel}>{percent}%</span>
    </button>
  );
}

function Header({ event }: { event: NormalizedEvent }) {
  const fallbackLabel = event.title.slice(0, 1).toUpperCase();

  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        {event.image ? (
          <div className={styles.logoImageWrap}>
            <Image
              src={event.image}
              alt={`${event.title} card icon`}
              fill
              sizes="38px"
              className={styles.logoImage}
            />
          </div>
        ) : (
          <div className={styles.logoFallback}>{fallbackLabel}</div>
        )}
      </div>
      <Link href={`/event/${event.slug}`} className={styles.title}>
        {event.title}
      </Link>
    </div>
  );
}

function Footer({ volume, repeat, badge }: CardFooter) {
  return (
    <div className={styles.footer}>
      <div className={styles.footerLeft}>
        <span className={styles.volume}>{volume}</span>
        {repeat && (
          <span className={styles.repeat}>
            <RepeatIcon className={styles.icon} />
            {repeat}
          </span>
        )}
      </div>
      <div className={styles.footerRight}>
        {badge && <span className={styles.badge}>{badge}</span>}
        <button type="button" className={styles.iconButton} aria-label="Gift">
          <GiftIcon className={styles.icon} />
        </button>
        <button type="button" className={styles.iconButton} aria-label="Save">
          <BookmarkIcon className={styles.icon} />
        </button>
      </div>
    </div>
  );
}

function ChanceIndicator({ value }: { value: number }) {
  const dashOffset = 157 - (157 * value) / 100;

  return (
    <div className={styles.gaugeWrap}>
      <svg viewBox="0 0 120 70" className={styles.gauge} aria-hidden="true">
        <path d="M10 60 A50 50 0 0 1 110 60" className={styles.gaugeTrack} />
        <path
          d="M10 60 A50 50 0 0 1 110 60"
          className={styles.gaugeValue}
          style={{ strokeDasharray: 157, strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className={styles.gaugeText}>
        <div className={styles.gaugeValueMain}>{value}%</div>
        <div className={styles.gaugeValueSub}>chance</div>
      </div>
    </div>
  );
}

export function MarketCard(props: MarketCardProps) {
  const cardClassName = props.className ? `${styles.card} ${props.className}` : styles.card;

  if (props.variant === 'empty') {
    return (
      <article className={cardClassName}>
        <Header event={props.event} />
        <p className={styles.empty}>No markets</p>
        <Footer {...props.footer} />
      </article>
    );
  }

  if (props.variant === 'outcomes') {
    const [firstRow, secondRow] = props.rows;
    return (
      <article className={cardClassName}>
        <Header event={props.event} />
        <div className={styles.outcomeRow}>
          <span className={styles.date}>{firstRow.date}</span>
          <div className={styles.rowRight}>
            <span className={styles.percent}>{firstRow.percent}%</span>
            <PercentChoiceButton kind="yes" percent={firstRow.percent} />
            <PercentChoiceButton kind="no" percent={100 - firstRow.percent} />
          </div>
        </div>
        <div className={styles.outcomeRow}>
          <span className={styles.date}>{secondRow.date}</span>
          <div className={styles.rowRight}>
            <span className={styles.percent}>{secondRow.percent}%</span>
            <PercentChoiceButton kind="yes" percent={secondRow.percent} />
            <PercentChoiceButton kind="no" percent={100 - secondRow.percent} />
          </div>
        </div>
        <Footer {...props.footer} />
      </article>
    );
  }

  if (props.variant === 'binary') {
    return (
      <article className={cardClassName}>
        <div className={styles.binaryTop}>
          <Header event={props.event} />
          <ChanceIndicator value={props.chance} />
        </div>
        <div className={styles.binarySpacer} aria-hidden="true" />
        <div className={styles.yesNo}>
          <PercentChoiceButton kind="yes" percent={props.chance} />
          <PercentChoiceButton kind="no" percent={100 - props.chance} />
        </div>
        <Footer {...props.footer} />
      </article>
    );
  }

  return (
    <article className={cardClassName}>
      <div className={styles.versusTitleRow}>
        <p className={styles.title}>{props.event.title}</p>
        <span className={styles.scoreSummary}>
          {props.leftTeam.score} : {props.rightTeam.score}
        </span>
      </div>

      <div className={styles.versusRow}>
        <div className={styles.teamLeft}>
          <div className={styles.logo}>{props.leftTeam.name.slice(0, 1).toUpperCase()}</div>
          <span className={styles.teamName}>{props.leftTeam.name}</span>
        </div>
        <div className={styles.teamRight}>
          <span className={styles.score}>{props.leftTeam.score}</span>
          <span className={styles.percent}>{props.leftTeam.percent}%</span>
        </div>
      </div>

      <div className={styles.versusRow}>
        <div className={styles.teamLeft}>
          <div className={styles.logo}>{props.rightTeam.name.slice(0, 1).toUpperCase()}</div>
          <span className={styles.teamName}>{props.rightTeam.name}</span>
        </div>
        <div className={styles.teamRight}>
          <span className={styles.score}>{props.rightTeam.score}</span>
          <span className={styles.percent}>{props.rightTeam.percent}%</span>
        </div>
      </div>
      <Footer {...props.footer} />
    </article>
  );
}
