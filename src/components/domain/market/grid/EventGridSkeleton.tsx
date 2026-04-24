import styles from './event-grid.module.scss';

type Props = {
  count?: number;
};

export function EventGridSkeleton({ count = 8 }: Props) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeleton} />
      ))}
    </div>
  );
}
