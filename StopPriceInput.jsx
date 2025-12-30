import styles from './order.module.css';

export default function StopPriceInput({ value, onChange }) {
  return (
    <div className={styles.formItem}>
      <div className={styles.labelRow}>触发价格</div>
      <div className={styles.inputBox}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <span className={styles.unit}>USDT</span>
      </div>
    </div>
  );
}
