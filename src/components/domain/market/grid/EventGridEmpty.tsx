import styles from './event-grid.module.scss';

type Props = {
  text: string;
};

export function EventGridEmpty({ text }: Props) {
  return <p className={styles.empty}>{text}</p>;
}
