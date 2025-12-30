import styles from './order.module.css';

export default function AmountInput({ amount, onChange }) {
  return (
    <div className={styles.formItem}>
      <div className={styles.labelRow}>数量</div>
      <div className={styles.inputBox}>
        <input
          value={amount}
          onChange={e => onChange(+e.target.value || 0)}
        />
        <span className={styles.unit}>BTC</span>
      </div>
    </div>
  );
}
