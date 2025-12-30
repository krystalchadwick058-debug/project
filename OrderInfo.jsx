import styles from './order.module.css';

export default function OrderInfo({ availableMargin, maxAmount, liquidationPrice }) {
  return (
    <div className={styles.orderInfo} style={{ padding: '10px', fontSize: '12px', color: '#ccc' }}>
      <div>可用保证金: {availableMargin.toFixed(2)} USDT</div>
      <div>最大数量: {maxAmount > 0 ? maxAmount.toFixed(4) : '0'}</div>
      {liquidationPrice != null && (
        <div>预估强平价: {parseFloat(liquidationPrice).toFixed(2)} USDT</div>
      )}
    </div>
  );
}