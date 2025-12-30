import { useState } from 'react';
import styles from './order.module.css';

export default function OrderHeader({ marginType, leverage, onChange }) {
  const [showMargin, setShowMargin] = useState(false);
  const [showLeverage, setShowLeverage] = useState(false);

  return (
    <div className={styles.orderHeader}>
      {/* 全仓 / 逐仓 */}
      <button onClick={() => setShowMargin(v => !v)}>
        {marginType === 'cross' ? '全仓' : '逐仓'}
      </button>

      {showMargin && (
        <div className={styles.popup}>
          <div
            onClick={() => {
              onChange({ marginType: 'cross' });
              setShowMargin(false);
            }}
          >
            全仓
          </div>
          <div
            onClick={() => {
              onChange({ marginType: 'isolated' });
              setShowMargin(false);
            }}
          >
            逐仓
          </div>
        </div>
      )}

      {/* 杠杆 */}
      <button onClick={() => setShowLeverage(v => !v)}>
        {leverage}x
      </button>

      {showLeverage && (
        <div className={styles.popup}>
          {[5, 10, 20, 50, 100].map(lv => (
            <div
              key={lv}
              onClick={() => {
                onChange({ leverage: lv });
                setShowLeverage(false);
              }}
            >
              {lv}x
            </div>
          ))}
        </div>
      )}

      {/* 模式（占位） */}
      <button>S</button>
    </div>
  );
}
