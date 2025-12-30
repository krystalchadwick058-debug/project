import styles from './order.module.css';

const tabs = [
  { key: 'LIMIT', label: '限价' },
  { key: 'MARKET', label: '市价' },
  { key: 'STOP', label: '限价止盈止损' },
];

export default function OrderTabs({ value, onChange }) {
  return (
    <div className={styles.orderTabs}>
      {tabs.map(t => (
        <div
          key={t.key}
          className={`${styles.tab} ${
            value === t.key ? styles.active : ''
          }`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}
