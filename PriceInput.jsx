import styles from './order.module.css';

export default function PriceInput({ value, onChange }) {
  // ✅ 关键：value 永远是字符串，避免 uncontrolled → controlled 警告
  const displayValue = value == null ? '' : String(value);

  return (
    <div className={styles.formItem}>
      <div className={styles.labelRow}>委托价格</div>
      <div className={styles.inputBox}>
        <input
          type="text"
          value={displayValue}
          onChange={e => onChange(e.target.value)}
          placeholder="请输入价格"
        />
        <span className={styles.unit}>USDT</span>
        <button className={styles.bbo}>BBO</button>
      </div>
    </div>
  );
}