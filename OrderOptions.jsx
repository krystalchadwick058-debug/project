import styles from './order.module.css';

export default function OrderOptions({ reduceOnly, onReduceOnly }) {
  return (
    <div className={styles.options}>
      <label>
        <input
          type="checkbox"
          checked={reduceOnly}
          onChange={e => onReduceOnly(e.target.checked)}
        />
        只减仓
      </label>
      <span className={styles.gtc}>生效时间 GTC</span>
    </div>
  );
}
