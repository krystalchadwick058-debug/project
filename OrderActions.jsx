import styles from './order.module.css';

export default function OrderActions({ onBuy, onSell }) {
  return (
    <div className={styles.actions}>
      <button className={styles.buy} onClick={onBuy}>
        买入 / 做多
      </button>
      <button className={styles.sell} onClick={onSell}>
        卖出 / 做空
      </button>
    </div>
  );
}